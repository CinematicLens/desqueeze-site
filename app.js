(() => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const startBtn = document.getElementById('start');
  const stopBtn = document.getElementById('stop');
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
  const modeButtons = Array.from(document.querySelectorAll('.mode-btn'));

  let mode = 'disk'; // disk | live | both
  let managedS3 = false;
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
    } catch (e) {
      console.error(e);
      setStatus('Camera permission denied or unavailable');
    }
  }

  async function handleFile(file){
    const url = URL.createObjectURL(file);
    video.src = url;
    await video.play();
  }

  // ---- NEW: Upload final recording to your /upload backend ----
  async function uploadRecordingToBackend(cfg, blob){
    const uploadUrl = (cfg && cfg.uploadUrl || '').trim();
    if (!uploadUrl){
      setStatus('❌ No upload URL configured');
      return;
    }

    setStatus('Uploading to server…');
    console.log('POST ->', uploadUrl);

    try {
      const form = new FormData();
      // Wrap blob in a File so multer sees a name + type
      const file = new File(
        [blob],
        'recording.webm',
        { type: blob.type || 'video/webm' }
      );

      form.append('file', file);
      form.append('factor', String(cfg.desq));
      // if you want "copy" behaviour, you can skip fps when cfg.fps is 0/null
      if (cfg.fps && Number.isFinite(cfg.fps)) {
        form.append('fps', String(cfg.fps));
      }
      form.append('bitrate', String(cfg.bps));

      const res = await fetch(uploadUrl, { method: 'POST', body: form });
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      // parse streaming text: progress, download, status
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
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

  // resolve "download:" line to an absolute URL
  function resolveDownloadHref(raw, uploadUrl){
    if (!raw) return null;
    // 1) if it's already absolute
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
      console.error('resolveDownloadHref failed:', e, raw);
      return null;
    }
  }

  // ---- (old) chunk uploader: keep for future streaming if needed, but note:
  // your current /upload endpoint expects full file, not chunks. ----
  function uploadChunk(url, blob){
    console.warn('uploadChunk() called – note: /upload does not support chunked ingestion yet');
    return fetch(url + '?session=' + encodeURIComponent(sessionId), {
      method: 'POST',
      headers: { 'Content-Type': blob.type || 'application/octet-stream' },
      body: blob
    }).catch(err => console.error('Chunk upload failed', err));
  }

  async function uploadFinalBlobToManagedS3(blob){
    try {
      const res = await fetch('http://localhost:3000/presign', { method: 'POST' });
      const { url, key } = await res.json();
      if (!url) throw new Error('No presigned URL');
      const put = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': blob.type || 'application/octet-stream' },
        body: blob
      });
      if (!put.ok) throw new Error('PUT to S3 failed');
      setStatus('Uploaded to S3 (' + key + ')');
    } catch (e) {
      console.error(e);
      setStatus('Managed S3 upload failed');
    }
  }

  function start(){
    const desq = Math.max(1, parseFloat(valOrCustom(desqPreset, desqCustom, parseFloat)) || 1.33);
    const fps  = Math.max(1, Math.min(60, parseInt(valOrCustom(fpsPreset, fpsCustom, parseInt) || '30', 10)));
    const bps  = Math.max(1_000_000, parseInt(valOrCustom(bitratePreset, bitrateCustom, parseInt) || '8000000', 10));
    const uploadUrl = uploadUrlInput.value.trim();
    sessionId = 'sess_' + Date.now();

    // keep config so onstop can use it for upload
    currentConfig = { desq, fps, bps, uploadUrl };

    chunks = [];
    download.classList.add('hidden');
    setStatus('Initializing…');

    const ctx = canvas.getContext('2d');
    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const outW = Math.round(vw * desq);
    const outH = vh;
    canvas.width = outW;
    canvas.height = outH;

    const draw = () => {
      ctx.save();
      ctx.clearRect(0, 0, outW, outH);
      ctx.scale(desq, 1);
      ctx.drawImage(video, 0, 0, vw, vh);
      ctx.restore();
      drawLoop = requestAnimationFrame(draw);
    };
    drawLoop = requestAnimationFrame(draw);

    const canvasStream = canvas.captureStream(fps);
    const inStream = streamRef || (video.srcObject instanceof MediaStream ? video.srcObject : null);
    if (inStream) inStream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

    const rec = new MediaRecorder(canvasStream, {
      mimeType: pickMime(),
      bitsPerSecond: bps
    });
    mediaRecorder = rec;

    rec.ondataavailable = (e) => {
      if (!e.data || e.data.size === 0) return;
      if (mode === 'disk' || mode === 'both') chunks.push(e.data);
      // NOTE: we *could* stream chunks to backend here, but your /upload API
      // expects a single file; so streaming is disabled for now.
      if (mode === 'live' || mode === 'both') {
        // uploadChunk(uploadUrl, e.data);
      }
    };

    rec.onstart = () => {
      setStatus(`Recording… (${mode}) • ${desq.toFixed(2)}× • ${fps}fps • ${(bps/1e6).toFixed(1)}Mbps`);
    };

    rec.onerror = (e) => {
      setStatus('Recorder error');
      console.error(e);
    };

    rec.onstop = async () => {
      if (drawLoop) {
        cancelAnimationFrame(drawLoop);
        drawLoop = null;
      }

      // final local blob
      const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' });

      if (mode === 'disk' || mode === 'both') {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'desqueezed_' + Date.now() + '.webm';
        download.classList.remove('hidden');
        setStatus('Saved (disk)');
      } else {
        setStatus('Stopped (live)');
      }

      // Send final recording to backend in live/both modes
      if (mode === 'live' || mode === 'both') {
        await uploadRecordingToBackend(currentConfig, blob);
      }

      if (managedS3) {
        await uploadFinalBlobToManagedS3(blob);
      }
    };

    rec.start(1000); // 1s slices
  }

  function stop(){
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    if (drawLoop) {
      cancelAnimationFrame(drawLoop);
      drawLoop = null;
    }
  }

  // UI wiring
  modeButtons.forEach(btn => {
    const m = btn.dataset.mode;
    if (!m) return;
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.dataset.mode;
    });
  });

  toggleManagedBtn?.addEventListener('click', () => {
    managedS3 = !managedS3;
    toggleManagedBtn.textContent = 'Managed S3: ' + (managedS3 ? 'On' : 'Off');
  });

  startBtn.addEventListener('click', start);
  stopBtn.addEventListener('click', stop);
  pickCameraBtn?.addEventListener('click', pickCamera);
  fileInput?.addEventListener('change', e => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  });

  // Ensure correct visibility of custom fields on load and change
  const map = [
    [desqPreset, desqCustom],
    [fpsPreset, fpsCustom],
    [bitratePreset, bitrateCustom]
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
