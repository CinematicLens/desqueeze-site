(() => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('photoCanvas');
  const startBtn = document.getElementById('play');
  const stopBtn = document.getElementById('pause');
  const statusEl = document.getElementById('status');
  const download = document.getElementById('download');
  const downloadLink = document.getElementById('downloadLink');
  const toggleManagedBtn = document.getElementById('toggleManaged');

  const desqPreset = document.getElementById('desqPreset');
  const desqCustom = document.getElementById('desqCustom');
  const fpsPreset = document.getElementById('fpsPreset');
  const fpsCustom = document.getElementById('fpsCustom');
  const bitratePreset = document.getElementById('bitratePreset');
  const bitrateCustom = document.getElementById('bitrateCustom');

  const uploadUrlInput = document.getElementById('uploadUrl');
  const pickCameraBtn = document.getElementById('pickCamera');
  const fileInput = document.getElementById('fileInput');

  let mediaRecorder = null;
  let chunks = [];
  let drawLoop = null;
  let streamRef = null;
  let sessionId = null;

  // config of the current recording (used when uploading to backend)
  let currentConfig = null;

  function setStatus(s){ statusEl.textContent = s; console.log('[status]', s); }

  function pickMime(){
    const list = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    for (const m of list){ if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; }
    return 'video/webm';
  }

  function valOrCustom(sel, custom, parser=parseFloat){
    if (sel.value === 'custom'){
      custom.classList.remove('hidden');
      return parser(custom.value || '');
    }
    custom.classList.add('hidden');
    return parser(sel.value);
  }

  async function pickCamera(){
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      video.srcObject = stream;
      await video.play();
      streamRef = stream;
      setStatus('Camera selected');
    } catch (err) {
      console.error('getUserMedia failed', err);
      setStatus('❌ Could not access camera/mic: ' + (err.message || err.name || 'unknown error'));
    }
  }

  function readConfig(){
    const desqFactor = valOrCustom(desqPreset, desqCustom, parseFloat);
    const fps = valOrCustom(fpsPreset, fpsCustom, parseFloat);
    const bitrate = valOrCustom(bitratePreset, bitrateCustom, parseInt);

    return { desqFactor, fps, bitrate };
  }

  function startDrawing(desqFactor){
    if (!canvas || !video) return;

    const inW = video.videoWidth || 1280;
    const inH = video.videoHeight || 720;
    // For simplicity, keep height same, stretch width by desqFactor
    const outH = inH;
    const outW = Math.round(inW * desqFactor);

    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d');

    function drawFrame(){
      if (!video || video.readyState < 2){
        drawLoop = requestAnimationFrame(drawFrame);
        return;
      }

      ctx.save();

      // Fill black
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, outW, outH);

      // Basic anamorphic "desqueeze" effect: scale X
      ctx.translate(outW / 2, outH / 2);
      ctx.scale(desqFactor, 1);
      ctx.drawImage(
        video,
        -inW / 2,
        -inH / 2,
        inW,
        inH
      );

      ctx.restore();

      drawLoop = requestAnimationFrame(drawFrame);
    }

    if (drawLoop) cancelAnimationFrame(drawLoop);
    drawLoop = requestAnimationFrame(drawFrame);
  }

  function stopDrawing(){
    if (drawLoop) cancelAnimationFrame(drawLoop);
    drawLoop = null;
  }

  function startRecording(stream, config){
    const { fps, bitrate } = config;
    const mimeType = pickMime();

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: bitrate || 3_000_000,
    });

    chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      stopDrawing();
      stream.getTracks().forEach(t => t.stop());
      streamRef = null;
      setStatus('Stopped recording; ready to upload.');

      if (!chunks.length) {
        setStatus('No data recorded.');
        return;
      }

      const blob = new Blob(chunks, { type: mimeType });
      uploadToBackend(blob, config).catch(err => {
        console.error('upload error', err);
      });
    };

    const intervalMs = fps && fps > 0 ? 1000 / fps : 1000 / 30;
    recorder.start(intervalMs);
    mediaRecorder = recorder;
  }

  async function uploadToBackend(blob, config){
    const uploadUrl = (uploadUrlInput && uploadUrlInput.value) || 'https://api.anamorphic-desqueeze.com/upload';

    setStatus('Uploading/processing… 0%');
    download.classList.add('hidden');
    downloadLink.removeAttribute('href');

    const formData = new FormData();

    const newId = 'sess-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    sessionId = newId;

    formData.append('file', blob, 'recorded.webm');
    formData.append('sessionId', newId);

    formData.append('desqFactor', String(config.desqFactor || 1));
    formData.append('fps', String(config.fps || 0));
    formData.append('bitrate', String(config.bitrate || 0));

    // new toggles for managed vs direct S3 or any other flags can be appended here later
    formData.append('managedS3', String(!!config.managedS3));

    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      // We now assume the server may stream back lines "progress:xx", "download:URL", etc.
      const reader = res.body?.getReader();
      if (!reader) {
        // fallback: treat as simple JSON or text if there's no streaming body
        const txt = await res.text();
        try {
          const data = JSON.parse(txt);
          if (data && data.download){
            const href = resolveDownloadHref(data.download, uploadUrl);
            if (href){
              downloadLink.href = href;
              downloadLink.download = 'desqueezed_from_server.mp4';
              download.classList.remove('hidden');
              setStatus('✅ Server export ready');
            } else {
              setStatus('❌ Server returned invalid download link');
            }
          } else {
            setStatus('✅ Server processed (no direct download link given)');
          }
        } catch {
          setStatus('✅ Upload finished (server returned non-JSON text)');
        }
        return;
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);

        for (let k = 0; k < lines.length - 1; k++) {
          const line = lines[k].trim();
          if (!line) continue;

          if (line.startsWith('progress:')) {
            const pct = parseFloat(line.slice(9) || '0');
            const p = Number.isFinite(pct) ? pct : 0;
            setStatus(`Uploading/processing… ${p}%`);
          } else if (line.startsWith('download:')) {
            const raw = line.slice(9);
            const href = resolveDownloadHref(raw, uploadUrl);
            if (href) {
              downloadLink.href = href;
              downloadLink.download = 'desqueezed_from_server.mp4';
              download.classList.remove('hidden');
              setStatus('✅ Server export ready');
            }
          } else if (line.startsWith('status:done')) {
            setStatus('✅ Server processing complete');
          } else if (line.startsWith('status:error')) {
            setStatus('❌ Server reported an error');
          }
        }

        buffer = lines[lines.length - 1];
      }
    } catch (err) {
      console.error('Upload to backend failed:', err);
      const msg = (err && err.message) || '';
      if (/^HTTP \d+/.test(msg)) {
        setStatus('❌ Server error: ' + msg);
      } else if (/Failed to fetch|NetworkError|TypeError: Failed to fetch/i.test(msg)) {
        setStatus('❌ Network/CORS error – browser could not reach the backend');
      } else {
        setStatus('❌ Upload failed: ' + (msg || 'unknown error'));
      }
    }
  }

  function resolveDownloadHref(raw, uploadUrl){
    if (!raw) return null;
    raw = String(raw).trim();

    // If it's a full URL, return as-is (or check if it's same origin).
    try {
      const u = new URL(raw);
      return u.href;
    } catch {}

    // 2) build from backend origin if only path/name
    try {
      const backendOrigin = new URL(uploadUrl).origin;
      // if backend already returns full /downloads/..., just attach to origin
      if (raw.startsWith('/')) {
        return backendOrigin + raw;
      }
      // if it's just a filename, assume legacy /download/ route
      return backendOrigin + '/download/' + encodeURIComponent(raw);
    } catch (e) {
      console.error('resolveDownloadHref failed:', e);
      return null;
    }
  }

  let managedS3 = false;

  async function start(){
    if (!video) {
      setStatus('❌ No video element found.');
      return;
    }

    const cfg = readConfig();
    currentConfig = { ...cfg, managedS3 };
    setStatus('Requesting camera/mic…');

    try {
      const stream = streamRef || await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      video.srcObject = stream;
      await video.play();
      streamRef = stream;

      startDrawing(cfg.desqFactor);
      startRecording(makeCanvasStream(stream, cfg), cfg);
      setStatus('Recording…');
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to start recording: ' + (err.message || err.name || 'unknown error'));
    }
  }

  function makeCanvasStream(inStream, cfg){
    const { fps } = cfg;

    if (!canvas) throw new Error('No canvas element');
    const ctx = canvas.getContext('2d');

    const inW = video.videoWidth || 1280;
    const inH = video.videoHeight || 720;
    const outH = inH;
    const outW = Math.round(inW * cfg.desqFactor);

    canvas.width = outW;
    canvas.height = outH;

    function drawFrame(){
      if (video.readyState >= 2) {
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, outW, outH);

        ctx.translate(outW / 2, outH / 2);
        ctx.scale(cfg.desqFactor, 1);
        ctx.drawImage(video, -inW / 2, -inH / 2, inW, inH);
        ctx.restore();
      }
      requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);

    const canvasStream = canvas.captureStream(fps);
    if (inStream) inStream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

    const rec = new MediaRecorder(canvasStream, {
      mimeType: pickMime(),
      videoBitsPerSecond: cfg.bitrate || 3_000_000,
    });

    chunks = [];

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    rec.onstop = () => {
      canvasStream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder = rec;
    const intervalMs = fps && fps > 0 ? 1000 / fps : 1000 / 30;
    rec.start(intervalMs);

    return canvasStream;
  }

  function stop(){
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    } else {
      setStatus('Not recording.');
    }
  }

  const map = [
    [desqPreset, desqCustom],
    [fpsPreset, fpsCustom],
    [bitratePreset, bitrateCustom],
  ];

  function refreshCustomVisibility(){
    map.forEach(([sel, custom]) => {
      if (sel.value === 'custom') custom.classList.remove('hidden');
      else custom.classList.add('hidden');
    });
  }

  map.forEach(([sel]) => sel.addEventListener('change', refreshCustomVisibility));
  refreshCustomVisibility();

  setStatus('Idle');

  toggleManagedBtn?.addEventListener('click', () => {
    managedS3 = !managedS3;
    toggleManagedBtn.textContent = 'Managed S3: ' + (managedS3 ? 'On' : 'Off');
  });

  startBtn?.addEventListener('click', start);
  stopBtn?.addEventListener('click', stop);
  pickCameraBtn?.addEventListener('click', pickCamera);
  fileInput?.addEventListener('change', e => {
    const f = e.target.files?.[0];
    if (!f) return;
    // If you want to handle file uploads instead of live camera, you can:
    //   - create a blob URL, set it as video.src, then call startDrawing, etc.
    const url = URL.createObjectURL(f);
    video.src = url;
    video.play().then(() => {
      setStatus('Playing selected file');
    });
  });
})();


// === Live desqueeze preview ===
function readDesqueeze() {
  const sel = document.getElementById('desqPreset');
  const custom = document.getElementById('desqCustom');
  if (sel.value === 'custom') {
    const v = parseFloat(custom.value || '1');
    return isFinite(v) && v >= 1 ? v : 1;
  }
  return parseFloat(sel.value) || 1;
}

function updatePreviewScale() {
  const d = readDesqueeze();
  const video = document.getElementById('video');
  if (video) video.style.transform = `scaleX(${d})`;
}

function toggleDesqCustomVisibility() {
  const sel = document.getElementById('desqPreset');
  const custom = document.getElementById('desqCustom');
  if (sel.value === 'custom') custom.classList.remove('hidden');
  else custom.classList.add('hidden');
  updatePreviewScale();
}

document.addEventListener('DOMContentLoaded', () => {
  const desqPreset = document.getElementById('desqPreset');
  const desqCustom = document.getElementById('desqCustom');
  desqPreset.addEventListener('change', toggleDesqCustomVisibility);
  desqCustom.addEventListener('input', updatePreviewScale);
  toggleDesqCustomVisibility();
  updatePreviewScale();
});
