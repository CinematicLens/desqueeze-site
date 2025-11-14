(() => {
  'use strict';

  // === DOM ===
  const videoEl       = document.getElementById('video');
  const canvasEl      = document.getElementById('photoCanvas');
  const statusEl      = document.getElementById('status');
  const progressBarEl = document.getElementById('progressBar');

  const fileInputEl      = document.getElementById('fileInput');
  const exportSelectedEl = document.getElementById('exportSelected');
  const exportBatchEl    = document.getElementById('exportBatch');
  const queueEl          = document.getElementById('queue');
  const clearAllBtn      = document.getElementById('clearAll'); // ← add this

  const playBtn  = document.getElementById('play');
  const pauseBtn = document.getElementById('pause');

  const desqPresetEl    = document.getElementById('desqPreset');
  const desqCustomEl    = document.getElementById('desqCustom');
  const fpsPresetEl     = document.getElementById('fpsPreset');
  const bitratePresetEl = document.getElementById('bitratePreset');
  const photoFormatEl   = document.getElementById('photoFormat');
  const uploadUrlInput  = document.getElementById('uploadUrl');

  const downloadBoxEl   = document.getElementById('download');
  const downloadLinkEl  = document.getElementById('downloadLink');

  const MAX_ITEMS = 10;

  const state = {
    items: [],            // { id, file, status, progress, downloadUrl }
    selectedId: null,
    currentPreviewId: null,
    busy: false,
    pro: false
  };

  // === UTIL ===

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
    console.log('[status]', msg);
  }

  function makeId() {
    return 'item-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function isImageFile(file) {
    if (!file) return false;
    if (file.type && file.type.startsWith('image/')) return true;
    const name = (file.name || '').toLowerCase();
    return /\.(png|jpe?g|jpg|webp|heic|heif|bmp|tiff?)$/.test(name);
  }

  function isVideoFile(file) {
    if (!file) return false;
    if (file.type && file.type.startsWith('video/')) return true;
    const name = (file.name || '').toLowerCase();
    return /\.(mp4|mov|m4v|avi|mts|m2ts|wmv|mkv)$/.test(name);
  }

  function getUploadUrl() {
    return (uploadUrlInput && uploadUrlInput.value) ||
           'https://api.anamorphic-desqueeze.com/upload';
  }

  // === PRO GATING (only 1x & 2x free) ===

  function initProState() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('pro') === '1') {
        localStorage.setItem('desq_pro', '1');
      }
      state.pro = localStorage.getItem('desq_pro') === '1';
    } catch {
      state.pro = false;
    }
  }

  function applyProGate() {
    if (!desqPresetEl) return;
    if (state.pro) {
      Array.from(desqPresetEl.options).forEach(opt => opt.disabled = false);
      return;
    }
    const allowed = new Set(['1', '2']); // free: none & 2.0x
    Array.from(desqPresetEl.options).forEach(opt => {
      opt.disabled = !allowed.has(opt.value);
    });
    if (!allowed.has(desqPresetEl.value)) {
      desqPresetEl.value = '2';
    }
    if (desqCustomEl) desqCustomEl.classList.add('hidden');
  }

  function readDesqFactor() {
    if (!desqPresetEl) return 1;
    if (desqPresetEl.value === 'custom' && desqCustomEl && state.pro) {
      const v = parseFloat(desqCustomEl.value || '1');
      return Number.isFinite(v) && v >= 1 ? v : 1;
    }
    const v = parseFloat(desqPresetEl.value || '1');
    return Number.isFinite(v) && v >= 1 ? v : 1;
  }

  function readFps() {
    if (!fpsPresetEl) return null;
    const val = fpsPresetEl.value;
    if (val === 'copy') return null;
    const n = parseFloat(val);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function readBitrate() {
    if (!bitratePresetEl) return null;
    const n = parseInt(bitratePresetEl.value, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function readPhotoFormat() {
    return (photoFormatEl && photoFormatEl.value) || 'image/jpeg';
  }

  function disableUiWhileBusy(busy) {
    state.busy = busy;
    if (fileInputEl) fileInputEl.disabled = busy;
    const hasItems = state.items.length > 0;
    if (exportSelectedEl) exportSelectedEl.disabled = busy || !hasItems;
    if (exportBatchEl)    exportBatchEl.disabled    = busy || !hasItems;
  }

  function updateGlobalProgress() {
    if (!progressBarEl) return;
    if (!state.items.length) {
      progressBarEl.classList.add('hidden');
      progressBarEl.value = 0;
      return;
    }
    const total = state.items.length;
    const sum   = state.items.reduce((acc, it) => acc + (it.progress || 0), 0);
    const pct   = Math.round(sum / total);
    if (pct <= 0 || pct >= 100) {
      progressBarEl.classList.add('hidden');
      progressBarEl.value = 0;
    } else {
      progressBarEl.classList.remove('hidden');
      progressBarEl.value = pct;
    }
  }

  function ensureQueueVisible() {
    if (!queueEl) return;
    if (state.items.length) queueEl.classList.remove('hidden');
    else queueEl.classList.add('hidden');
  }

  // === DOWNLOAD HELPERS ===

  async function triggerDownloadFromBlob(blob, filename) {
    try {
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
    } catch (e) {
      console.error('triggerDownloadFromBlob failed', e);
    }
  }

  async function downloadCrossOriginAsBlob(url, filename) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      await triggerDownloadFromBlob(blob, filename);
    } catch (err) {
      console.error('downloadCrossOriginAsBlob', err);
      // Fallback: open URL with download hint
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  function makeOutName(file, isImage) {
    const base = (file.name || 'export').replace(/\.[^.]+$/, '');
    return base + '_desqueezed' + (isImage ? '.jpg' : '.mp4');
  }

  // === DOWNLOAD URL RESOLVER (/downloads/...) ===

  function resolveDownloadHref(raw, uploadUrl) {
    if (!raw) return null;
    let val = String(raw).trim();

    // already absolute?
    try {
      const u = new URL(val);
      return u.href;
    } catch {
      // not absolute
    }

    let origin;
    try {
      origin = new URL(uploadUrl).origin;
    } catch (e) {
      console.error('resolveDownloadHref origin error', e);
      return null;
    }

    // "/downloads/xxx"
    if (val.startsWith('/')) {
      return origin + val;
    }
    // "downloads/xxx"
    if (val.startsWith('downloads/')) {
      return origin + '/' + val;
    }

    // anything else -> /downloads/<encoded>
    return origin + '/downloads/' + encodeURIComponent(val);
  }
  
  function clearAll() {
  // reset state
  state.items = [];
  state.selectedId = null;
  state.currentPreviewId = null;

  // clear queue UI
  if (queueEl) {
    queueEl.innerHTML = '';
    queueEl.classList.add('hidden');
  }

  // reset progress bar
  if (progressBarEl) {
    progressBarEl.value = 0;
    progressBarEl.classList.add('hidden');
  }

  // stop and clear video
  if (videoEl) {
    try { videoEl.pause(); } catch {}
    videoEl.removeAttribute('src');
    videoEl.load();
  }

  // clear canvas
  if (canvasEl) {
    const ctx = canvasEl.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    canvasEl.classList.add('hidden');
  }

  // hide download box
  if (downloadBoxEl) downloadBoxEl.classList.add('hidden');
  if (downloadLinkEl) {
    downloadLinkEl.removeAttribute('href');
    downloadLinkEl.removeAttribute('download');
  }

  // reset file input
  if (fileInputEl) fileInputEl.value = '';

  // buttons & status
  disableUiWhileBusy(false);
  updateGlobalProgress();
  ensureQueueVisible();
  setStatus('Idle');
}

  // === QUEUE RENDERING ===

  function clearQueueDom() {
    if (!queueEl) return;
    queueEl.innerHTML = '';
  }

  function renderQueue() {
    if (!queueEl) return;
    clearQueueDom();

    state.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'queue-item';
      row.dataset.id = item.id;

      const left = document.createElement('div');
      const nameEl = document.createElement('div');
      nameEl.className = 'queue-name';
      nameEl.textContent = item.file.name;

      const statusNode = document.createElement('div');
      statusNode.className = 'queue-status';
      statusNode.textContent = item.status || 'Ready';

      left.appendChild(nameEl);
      left.appendChild(statusNode);

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '6px';

      const prog = document.createElement('progress');
      prog.className = 'queue-progress';
      prog.max = 100;
      prog.value = item.progress || 0;

      const dl = document.createElement('a');
      dl.className = 'queue-download hidden';
      dl.textContent = 'Download';
      dl.target = '_blank';
      dl.rel = 'noopener';

      if (item.downloadUrl) {
        dl.href = item.downloadUrl;
        const isImg = isImageFile(item.file);
        dl.download = makeOutName(item.file, isImg);
        dl.classList.remove('hidden');
      }

      right.appendChild(prog);
      right.appendChild(dl);

      row.appendChild(left);
      row.appendChild(right);

      row.addEventListener('click', () => {
        state.selectedId = item.id;
        highlightSelectedRow();
        previewItemById(item.id);
      });

      queueEl.appendChild(row);
    });

    highlightSelectedRow();
    ensureQueueVisible();
    updateGlobalProgress();
    disableUiWhileBusy(state.busy);
  }

  function highlightSelectedRow() {
    if (!queueEl) return;
    const rows = Array.from(queueEl.querySelectorAll('.queue-item'));
    rows.forEach(row => {
      if (row.dataset.id === state.selectedId) {
        row.style.border = '1px solid rgba(100, 135, 255, 0.9)';
      } else {
        row.style.border = '1px solid transparent';
      }
    });
  }

  function updateItem(id, patch) {
    const item = state.items.find(it => it.id === id);
    if (!item) return;
    Object.assign(item, patch);

    if (!queueEl) return;
    const row = queueEl.querySelector(`.queue-item[data-id="${id}"]`);
    if (!row) return;

    const statusNode = row.querySelector('.queue-status');
    const progNode   = row.querySelector('.queue-progress');
    const dlNode     = row.querySelector('.queue-download');

    if (patch.status != null && statusNode) statusNode.textContent = patch.status;
    if (patch.progress != null && progNode) progNode.value = patch.progress;
    if (patch.downloadUrl && dlNode) {
      dlNode.href = patch.downloadUrl;
      const isImg = isImageFile(item.file);
      dlNode.download = makeOutName(item.file, isImg);
      dlNode.classList.remove('hidden');
    }

    updateGlobalProgress();
  }

  // === PREVIEW ===

  function showVideoPreview() {
    if (!videoEl || !canvasEl) return;
    videoEl.classList.remove('hidden');
    canvasEl.classList.add('hidden');
  }

  function showCanvasPreview() {
    if (!videoEl || !canvasEl) return;
    videoEl.classList.add('hidden');
    canvasEl.classList.remove('hidden');
  }

  function updatePreviewScale() {
    const d = readDesqFactor();
    const previewBox = document.getElementById('previewBox');
    if (!previewBox) return;
    previewBox.style.setProperty('--d', d); // CSS var used to avoid cropping
  }

  function previewItemById(id) {
    const it = state.items.find(x => x.id === id);
    if (!it) return;
    state.currentPreviewId = id;
    previewItem(it);
  }

  function previewItem(item) {
    if (isImageFile(item.file)) previewImage(item.file);
    else previewVideo(item.file);
  }

  function previewImage(file) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const desq = readDesqFactor();
      const inW = img.width;
      const inH = img.height;
      const outW = Math.round(inW * desq);
      const outH = inH;

      canvasEl.width = outW;
      canvasEl.height = outH;

      ctx.save();
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, outW, outH);
      ctx.scale(desq, 1);
      ctx.drawImage(img, 0, 0, inW, inH);
      ctx.restore();

      showCanvasPreview();
      setStatus('Previewing photo with de-squeeze');
    };
    img.onerror = () => setStatus('❌ Could not preview this image');
    img.src = URL.createObjectURL(file);
  }

  function previewVideo(file) {
    if (!videoEl) return;
    const url = URL.createObjectURL(file);
    videoEl.srcObject = null;
    videoEl.src = url;
    videoEl.onloadedmetadata = () => {
      updatePreviewScale();
      setStatus('Previewing video; press play to view.');
    };
    showVideoPreview();
  }

  // === PHOTO EXPORT (LOCAL, NO SERVER) ===

  function exportPhotoBlob(file) {
    return new Promise((resolve, reject) => {
      if (!canvasEl) {
        reject(new Error('No photo canvas'));
        return;
      }
      const ctx = canvasEl.getContext('2d');
      if (!ctx) {
        reject(new Error('No canvas context'));
        return;
      }

      const fac   = readDesqFactor();
      const img   = new Image();
      const tmpUrl = URL.createObjectURL(file);

      img.onload = () => {
        const W = Math.round(img.width * fac);
        const H = img.height;

        canvasEl.width = W;
        canvasEl.height = H;

        ctx.setTransform(fac, 0, 0, 1, 0, 0);
        ctx.drawImage(img, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        URL.revokeObjectURL(tmpUrl);

        const mime = readPhotoFormat() || 'image/jpeg';
        canvasEl.toBlob(
          b => (b ? resolve(b) : reject(new Error('Canvas export failed'))),
          mime,
          mime.includes('jpeg') ? 0.95 : undefined
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(tmpUrl);
        reject(new Error('Image decode failed'));
      };

      img.src = tmpUrl;
    });
  }

  async function exportPhotoItem(item, options = {}) {
    const { autoDownload = true } = options;
    updateItem(item.id, { status: 'Exporting photo…', progress: 0 });

    try {
      const blob = await exportPhotoBlob(item.file);
      const url  = URL.createObjectURL(blob);
      const filename = makeOutName(item.file, true);

      updateItem(item.id, {
        status: '✅ Photo exported',
        progress: 100,
        downloadUrl: url
      });

      if (downloadBoxEl && downloadLinkEl) {
        downloadBoxEl.classList.remove('hidden');
        downloadLinkEl.href = url;
        downloadLinkEl.download = filename;
      }

      if (autoDownload) {
        await triggerDownloadFromBlob(blob, filename);
      }

      return { downloadUrl: url };
    } catch (err) {
      console.error('Photo export failed', err);
      updateItem(item.id, { status: '❌ Photo export failed', progress: 0 });
      throw err;
    }
  }

  // === VIDEO EXPORT (SERVER) ===

  async function uploadVideoToBackend(item, cfg, options = {}) {
    const { autoDownload = true } = options;
    const uploadUrl = getUploadUrl();

    updateItem(item.id, { status: 'Uploading… 0%', progress: 0 });
    if (downloadBoxEl) downloadBoxEl.classList.add('hidden');
    if (downloadLinkEl) {
      downloadLinkEl.removeAttribute('href');
      downloadLinkEl.removeAttribute('download');
    }

    const formData = new FormData();
    const sessionId =
      'sess-' + Date.now() + '-' + Math.random().toString(16).slice(2);

    formData.append('file', item.file, item.file.name);
    formData.append('sessionId', sessionId);
    formData.append('kind', 'video');
    formData.append('factor', String(cfg.desqFactor || 1));
    formData.append('fps', cfg.fps == null ? 'copy' : String(cfg.fps));
    formData.append('bitrate', String(cfg.bitrate || 0));
    formData.append('photoFormat', cfg.photoFormat || 'image/jpeg');
    formData.append('managedS3', 'false');

    let finalHref = null;

    try {
      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
      if (!res.ok) {
        const msg = `HTTP ${res.status} ${res.statusText}`;
        updateItem(item.id, { status: '❌ Server error: ' + msg, progress: 0 });
        throw new Error(msg);
      }

      const reader = res.body && res.body.getReader
        ? res.body.getReader()
        : null;

      // Non-streaming fallback
      if (!reader) {
        const txt = await res.text();
        try {
          const data = JSON.parse(txt);
          if (data && data.download) {
            const href = resolveDownloadHref(data.download, uploadUrl);
            if (href) {
              finalHref = href;
              updateItem(item.id, {
                status: '✅ Done (download ready)',
                progress: 100,
                downloadUrl: href
              });

              if (autoDownload) {
                const filename = makeOutName(item.file, false);
                await downloadCrossOriginAsBlob(href, filename);
              }
            } else {
              updateItem(item.id, {
                status: '❌ Invalid download link',
                progress: 100
              });
            }
          } else {
            updateItem(item.id, {
              status: '✅ Processed (no direct download link)',
              progress: 100
            });
          }
        } catch {
          updateItem(item.id, {
            status: '✅ Processed (non-JSON response)',
            progress: 100
          });
        }
        return { downloadUrl: finalHref };
      }

      // Streaming
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
            const p = Number.isFinite(pct)
              ? Math.max(0, Math.min(100, pct))
              : 0;
            updateItem(item.id, {
              status: `Uploading/processing… ${p}%`,
              progress: p
            });
          } else if (line.startsWith('download:')) {
            const raw = line.slice(9);
            const href = resolveDownloadHref(raw, uploadUrl);
            if (href) {
              finalHref = href;
              updateItem(item.id, {
                status: '✅ Done (download ready)',
                progress: 100,
                downloadUrl: href
              });

              if (autoDownload) {
                const filename = makeOutName(item.file, false);
                await downloadCrossOriginAsBlob(href, filename);
              }
            } else {
              updateItem(item.id, {
                status: '❌ Invalid download link',
                progress: 100
              });
            }
          } else if (line.startsWith('status:done')) {
            if (!finalHref) {
              updateItem(item.id, {
                status: '✅ Server processing complete',
                progress: 100
              });
            }
          } else if (line.startsWith('status:error')) {
            updateItem(item.id, {
              status: '❌ Server reported an error',
              progress: 0
            });
          }
        }

        buffer = lines[lines.length - 1];
      }

      return { downloadUrl: finalHref };
    } catch (err) {
      console.error('Upload failed', err);
      const msg = (err && err.message) || '';
      let uiMsg;
      if (/^HTTP \d+/.test(msg)) {
        uiMsg = '❌ Server error: ' + msg;
      } else if (/Failed to fetch|NetworkError|TypeError: Failed to fetch/i.test(msg)) {
        uiMsg = '❌ Network/CORS error – could not reach backend';
      } else {
        uiMsg = '❌ Upload failed: ' + (msg || 'unknown error');
      }
      updateItem(item.id, { status: uiMsg, progress: 0 });
      throw err;
    }
  }

  // === BATCH ZIP (photos + videos) ===

  async function createBatchZip(downloads) {
    if (typeof JSZip === 'undefined') {
      console.error('JSZip is not available – cannot create batch ZIP');
      return;
    }
    const zip = new JSZip();

    for (const entry of downloads) {
      const { url, item } = entry;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Failed to fetch for ZIP:', url, res.status);
          continue;
        }
        const blob = await res.blob();
        const filename = makeOutName(item.file, isImageFile(item.file));
        zip.file(filename, blob);
      } catch (e) {
        console.error('Error fetching file for ZIP:', url, e);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    await triggerDownloadFromBlob(zipBlob, 'desqueezed_batch.zip');
  }

  async function exportItems(items) {
    if (!items || !items.length) return;

    const isBatch = items.length > 1;
    const batchDownloads = [];

    disableUiWhileBusy(true);
    setStatus(`Exporting ${items.length} file${items.length > 1 ? 's' : ''}…`);

    const cfg = {
      desqFactor: readDesqFactor(),
      fps:        readFps(),
      bitrate:    readBitrate(),
      photoFormat:readPhotoFormat()
    };

    items.forEach(it => updateItem(it.id, { status: 'Queued…', progress: 0 }));
    updateGlobalProgress();

    try {
      for (const item of items) {
        let result;
        if (isImageFile(item.file)) {
          result = await exportPhotoItem(item, { autoDownload: !isBatch });
        } else {
          result = await uploadVideoToBackend(item, cfg, { autoDownload: !isBatch });
        }
        if (isBatch && result && result.downloadUrl) {
          batchDownloads.push({ url: result.downloadUrl, item });
        }
      }

      if (isBatch && batchDownloads.length) {
        setStatus('Creating ZIP…');
        await createBatchZip(batchDownloads);
        setStatus('✅ Batch ZIP downloaded.');
      } else {
        setStatus('✅ Export finished.');
      }
    } catch (err) {
      console.error('Batch export error', err);
      setStatus('❌ Export failed for one or more items.');
    } finally {
      disableUiWhileBusy(false);
      updateGlobalProgress();
    }
  }

  // === FILE INPUT HANDLING ===

  function handleFilesSelected(fileList) {
    if (!fileList || !fileList.length) return;

    const incoming = Array.from(fileList);
    const remainingSlots = MAX_ITEMS - state.items.length;
    const used = remainingSlots <= 0 ? [] : incoming.slice(0, remainingSlots);

    if (!used.length) {
      setStatus(`Queue is full (max ${MAX_ITEMS} items). Remove some before adding more.`);
      return;
    }

    used.forEach(file => {
      const item = {
        id: makeId(),
        file,
        status: 'Ready',
        progress: 0,
        downloadUrl: null
      };
      state.items.push(item);
      if (!state.selectedId) state.selectedId = item.id;
    });

    renderQueue();

    if (!state.currentPreviewId && state.items.length) {
      state.currentPreviewId = state.items[0].id;
      previewItemById(state.currentPreviewId);
    } else if (state.currentPreviewId) {
      previewItemById(state.currentPreviewId);
    }

    setStatus(`Added ${used.length} file${used.length > 1 ? 's' : ''} to queue.`);
  }

  // === BUTTON HANDLERS ===

  function onExportSelected() {
    if (!state.items.length) return;
    const id = state.selectedId || state.items[0].id;
    const item = state.items.find(it => it.id === id);
    if (!item) return;
    exportItems([item]);
  }

  function onExportBatch() {
    if (!state.items.length) return;
    exportItems([...state.items]);
  }

  // === DESQ CUSTOM TOGGLE ===

  function toggleDesqCustomVisibility() {
    if (!desqPresetEl || !desqCustomEl) {
      updatePreviewScale();
      return;
    }
    if (desqPresetEl.value === 'custom' && state.pro) {
      desqCustomEl.classList.remove('hidden');
    } else {
      desqCustomEl.classList.add('hidden');
    }
    updatePreviewScale();

    if (state.currentPreviewId) {
      const current = state.items.find(x => x.id === state.currentPreviewId);
      if (current && isImageFile(current.file)) {
        previewImage(current.file);
      }
    }
  }

  // === INIT ===

  function init() {
    setStatus('Idle');

    initProState();
    applyProGate();
	
	 if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearAll); // ← add this
  }

    if (fileInputEl) {
      fileInputEl.addEventListener('change', e => {
        handleFilesSelected(e.target.files);
      });
    }

    if (exportSelectedEl) exportSelectedEl.addEventListener('click', onExportSelected);
    if (exportBatchEl)    exportBatchEl.addEventListener('click', onExportBatch);

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (!videoEl) return;
        videoEl.play().catch(() => {});
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (!videoEl) return;
        videoEl.pause();
      });
    }

    if (desqPresetEl) {
      desqPresetEl.addEventListener('change', () => {
        applyProGate();
        toggleDesqCustomVisibility();
      });
    }

    if (desqCustomEl) {
      desqCustomEl.addEventListener('input', () => {
        if (!state.pro) return;
        toggleDesqCustomVisibility();
      });
    }

    // queue "Download" clicks -> blob download
    if (queueEl) {
      queueEl.addEventListener('click', e => {
        const link = e.target.closest('.queue-download');
        if (!link) return;
        e.preventDefault();
        const row = link.closest('.queue-item');
        if (!row) return;
        const id = row.dataset.id;
        const item = state.items.find(it => it.id === id);
        if (!item || !item.downloadUrl) return;

        const isImg = isImageFile(item.file);
        const filename = makeOutName(item.file, isImg);

        if (item.downloadUrl.startsWith('blob:') && isImg) {
          const a = document.createElement('a');
          a.href = item.downloadUrl;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          downloadCrossOriginAsBlob(item.downloadUrl, filename);
        }
      });
    }

    toggleDesqCustomVisibility();
    updatePreviewScale();
    ensureQueueVisible();
    disableUiWhileBusy(false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
