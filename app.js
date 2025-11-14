(() => {
  'use strict';

  // === DOM LOOKUPS ===
  const videoEl = document.getElementById('video');
  const canvasEl = document.getElementById('photoCanvas');
  const statusEl = document.getElementById('status');
  const progressBarEl = document.getElementById('progressBar');

  const fileInputEl = document.getElementById('fileInput');
  const exportSelectedBtn = document.getElementById('exportSelected');
  const exportBatchBtn = document.getElementById('exportBatch');
  const queueEl = document.getElementById('queue');

  const playBtn = document.getElementById('play');
  const pauseBtn = document.getElementById('pause');

  const desqPresetEl = document.getElementById('desqPreset');
  const desqCustomEl = document.getElementById('desqCustom');
  const fpsPresetEl = document.getElementById('fpsPreset');
  const bitratePresetEl = document.getElementById('bitratePreset');
  const photoFormatEl = document.getElementById('photoFormat');
  const uploadUrlInputEl = document.getElementById('uploadUrl');

  // === STATE ===
  const state = {
    items: [],          // { id, file, type: 'image' | 'video', status, progress, downloadUrl }
    selectedId: null,
    currentPreviewId: null,
    busy: false,
    pro: false
  };

  const MAX_ITEMS = 10;

  // === BASIC HELPERS ===

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
    console.log('[status]', msg);
  }

  function triggerFileDownload(url, suggestedName) {
    try {
      const a = document.createElement('a');
      a.href = url;
      if (suggestedName) a.download = suggestedName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('auto download failed', e);
    }
  }

  // --- Pro gating: only 2.0x free unless ?pro=1 / stored in localStorage ---
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
      // Pro: everything enabled
      Array.from(desqPresetEl.options).forEach(opt => {
        opt.disabled = false;
      });
      return;
    }

    // Free: allow only 1.0x and 2.0x
    const allowedValues = new Set(['1', '2']);
    Array.from(desqPresetEl.options).forEach(opt => {
      if (allowedValues.has(opt.value)) opt.disabled = false;
      else opt.disabled = true;
    });

    if (!allowedValues.has(desqPresetEl.value)) {
      desqPresetEl.value = '2';
    }

    if (desqCustomEl) {
      desqCustomEl.classList.add('hidden');
    }
  }

  function readDesqFactor() {
    if (!desqPresetEl) return 1;
    const selVal = desqPresetEl.value;

    if (selVal === 'custom' && desqCustomEl && state.pro) {
      const v = parseFloat(desqCustomEl.value || '1');
      return Number.isFinite(v) && v >= 1 ? v : 1;
    }

    const v = parseFloat(selVal || '1');
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

  function getUploadUrl() {
    return (
      (uploadUrlInputEl && uploadUrlInputEl.value) ||
      'https://api.anamorphic-desqueeze.com/upload'
    );
  }

  function updateButtonsEnabled() {
    const hasItems = state.items.length > 0;
    if (fileInputEl) fileInputEl.disabled = state.busy;
    if (exportSelectedBtn) {
      exportSelectedBtn.disabled = state.busy || !hasItems;
    }
    if (exportBatchBtn) {
      exportBatchBtn.disabled = state.busy || !hasItems;
    }
  }

  function disableUiWhileBusy(busy) {
    state.busy = busy;
    updateButtonsEnabled();
  }

  function ensureQueueVisible() {
    if (!queueEl) return;
    if (state.items.length) queueEl.classList.remove('hidden');
    else queueEl.classList.add('hidden');
  }

  function updateGlobalProgress() {
    if (!progressBarEl) return;
    if (!state.items.length) {
      progressBarEl.classList.add('hidden');
      progressBarEl.value = 0;
      return;
    }

    const total = state.items.length;
    const sum = state.items.reduce((acc, it) => acc + (it.progress || 0), 0);
    const pct = Math.round(sum / total);

    if (pct <= 0 || pct >= 100) {
      progressBarEl.classList.add('hidden');
      progressBarEl.value = 0;
    } else {
      progressBarEl.classList.remove('hidden');
      progressBarEl.value = pct;
    }
  }

  function makeId() {
    return 'item-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function guessType(file) {
    if (!file || !file.type) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';

    const name = file.name.toLowerCase();
    if (/\.(png|jpe?g|webp|heic|heif)$/.test(name)) return 'image';
    return 'video';
  }

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
    updateButtonsEnabled();
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

  function findItem(id) {
    return state.items.find(it => it.id === id) || null;
  }

  function updateItem(id, patch) {
    const item = findItem(id);
    if (!item) return;
    Object.assign(item, patch);

    if (!queueEl) return;
    const row = queueEl.querySelector(`.queue-item[data-id="${id}"]`);
    if (!row) return;

    const statusNode = row.querySelector('.queue-status');
    const progNode = row.querySelector('.queue-progress');
    const dlNode = row.querySelector('.queue-download');

    if (patch.status != null && statusNode) {
      statusNode.textContent = patch.status;
    }
    if (patch.progress != null && progNode) {
      progNode.value = patch.progress;
    }
    if (patch.downloadUrl && dlNode) {
      dlNode.href = patch.downloadUrl;
      dlNode.classList.remove('hidden');
    }

    updateGlobalProgress();
  }

  // === PREVIEW LOGIC ===

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

  function previewItemById(id) {
    const item = findItem(id);
    if (!item) return;
    state.currentPreviewId = id;
    previewItem(item);
  }

  function previewItem(item) {
    if (!item) return;
    const { type, file } = item;
    if (type === 'image') previewImage(file);
    else previewVideo(file);
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
    img.onerror = () => {
      setStatus('❌ Could not preview this image');
    };
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

  // === DOWNLOAD URL HANDLING ===

  function resolveDownloadHref(raw, uploadUrl) {
    if (!raw) return null;
    let val = String(raw).trim();

    // Already a full URL?
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

    // bare filename -> /downloads/<name>
    return origin + '/downloads/' + encodeURIComponent(val);
  }

  // === BATCH ZIP CREATION ===

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
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        const ext = item.type === 'image' ? '.jpg' : '.mp4';
        const fileName = baseName + '_desqueezed' + ext;

        zip.file(fileName, blob);
      } catch (e) {
        console.error('Error fetching file for ZIP:', url, e);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    triggerFileDownload(zipUrl, 'desqueezed_batch.zip');
  }

  // === EXPORT / UPLOAD LOGIC ===

  async function exportItems(items) {
    if (!items || !items.length) return;

    const isBatch = items.length > 1;
    const batchDownloads = [];

    disableUiWhileBusy(true);
    setStatus(`Exporting ${items.length} file${items.length > 1 ? 's' : ''}…`);

    const desqFactor = readDesqFactor();
    const fps = readFps();
    const bitrate = readBitrate();
    const photoFormat = readPhotoFormat();

    const cfg = { desqFactor, fps, bitrate, photoFormat };

    items.forEach(it => updateItem(it.id, { progress: 0, status: 'Queued…' }));
    updateGlobalProgress();

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const result = await uploadToBackend(item, cfg, { autoDownload: !isBatch });
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

  async function uploadToBackend(item, cfg, options = {}) {
    const { autoDownload = true } = options;
    const uploadUrl = getUploadUrl();
    const file = item.file;

    updateItem(item.id, {
      status: 'Uploading… 0%',
      progress: 0
    });

    const formData = new FormData();

    const sessionId =
      'sess-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    formData.append('file', file, file.name);
    formData.append('sessionId', sessionId);
    formData.append('kind', item.type); // "image" or "video"

    formData.append('desqFactor', String(cfg.desqFactor || 1));
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
                const baseName = item.file.name.replace(/\.[^.]+$/, '');
                const ext = item.type === 'image' ? '.jpg' : '.mp4';
                triggerFileDownload(href, baseName + '_desqueezed' + ext);
              }
              return { downloadUrl: href };
            }
          }
          updateItem(item.id, {
            status: '✅ Processed (no direct download link)',
            progress: 100
          });
        } catch {
          updateItem(item.id, {
            status: '✅ Processed (non-JSON response)',
            progress: 100
          });
        }
        return { downloadUrl: finalHref };
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
                const baseName = item.file.name.replace(/\.[^.]+$/, '');
                const ext = item.type === 'image' ? '.jpg' : '.mp4';
                triggerFileDownload(href, baseName + '_desqueezed' + ext);
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

  // === FILE INPUT HANDLING ===

  function handleFilesSelected(fileList) {
    if (!fileList || !fileList.length) return;

    const incoming = Array.from(fileList);
    const remainingSlots = MAX_ITEMS - state.items.length;
    const used = remainingSlots <= 0
      ? []
      : incoming.slice(0, remainingSlots);

    if (!used.length) {
      setStatus(`Queue is full (max ${MAX_ITEMS} items). Remove some before adding more.`);
      return;
    }

    used.forEach(file => {
      const item = {
        id: makeId(),
        file,
        type: guessType(file),
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
    const item = findItem(id);
    if (!item) return;
    exportItems([item]);
  }

  function onExportBatch() {
    if (!state.items.length) return;
    exportItems([...state.items]);
  }

  // === LIVE DESQUEEZE PREVIEW (VIDEO) ===

  function updatePreviewScale() {
    const d = readDesqFactor();
    if (!videoEl) return;
    videoEl.style.transform = `scaleX(${d})`;
    videoEl.style.transformOrigin = 'center center';
  }

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
      const current = findItem(state.currentPreviewId);
      if (current && current.type === 'image') {
        previewImage(current.file);
      }
    }
  }

  // === INIT ===

  function init() {
    setStatus('Idle');

    initProState();
    applyProGate();

    if (fileInputEl) {
      fileInputEl.addEventListener('change', e => {
        const files = e.target.files;
        handleFilesSelected(files);
      });
    }

    if (exportSelectedBtn) {
      exportSelectedBtn.addEventListener('click', onExportSelected);
    }

    if (exportBatchBtn) {
      exportBatchBtn.addEventListener('click', onExportBatch);
    }

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
        updatePreviewScale();
        if (state.currentPreviewId) {
          const current = findItem(state.currentPreviewId);
          if (current && current.type === 'image') {
            previewImage(current.file);
          }
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
(() => {
  'use strict';

  // === DOM LOOKUPS ===
  const videoEl = document.getElementById('video');
  const canvasEl = document.getElementById('photoCanvas');
  const statusEl = document.getElementById('status');
  const progressBarEl = document.getElementById('progressBar');

  const fileInputEl = document.getElementById('fileInput');
  const exportSelectedBtn = document.getElementById('exportSelected');
  const exportBatchBtn = document.getElementById('exportBatch');
  const queueEl = document.getElementById('queue');

  const playBtn = document.getElementById('play');
  const pauseBtn = document.getElementById('pause');

  const desqPresetEl = document.getElementById('desqPreset');
  const desqCustomEl = document.getElementById('desqCustom');
  const fpsPresetEl = document.getElementById('fpsPreset');
  const bitratePresetEl = document.getElementById('bitratePreset');
  const photoFormatEl = document.getElementById('photoFormat');
  const uploadUrlInputEl = document.getElementById('uploadUrl');

  // === STATE ===
  const state = {
    items: [],          // { id, file, type: 'image' | 'video', status, progress, downloadUrl }
    selectedId: null,
    currentPreviewId: null,
    busy: false,
    pro: false
  };

  const MAX_ITEMS = 10;

  // === BASIC HELPERS ===

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
    console.log('[status]', msg);
  }

  function triggerFileDownload(url, suggestedName) {
    try {
      const a = document.createElement('a');
      a.href = url;
      if (suggestedName) a.download = suggestedName;
      a.target = '_blank';
      a.rel = 'noopener';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('auto download failed', e);
    }
  }

  // --- Pro gating: only 2.0x free unless ?pro=1 / localStorage ---
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
      Array.from(desqPresetEl.options).forEach(opt => {
        opt.disabled = false;
      });
      return;
    }

    // Free: allow only 1.0x and 2.0x
    const allowedValues = new Set(['1', '2']);
    Array.from(desqPresetEl.options).forEach(opt => {
      if (allowedValues.has(opt.value)) opt.disabled = false;
      else opt.disabled = true;
    });

    if (!allowedValues.has(desqPresetEl.value)) {
      desqPresetEl.value = '2';
    }

    if (desqCustomEl) {
      desqCustomEl.classList.add('hidden');
    }
  }

  function readDesqFactor() {
    if (!desqPresetEl) return 1;
    const selVal = desqPresetEl.value;

    if (selVal === 'custom' && desqCustomEl && state.pro) {
      const v = parseFloat(desqCustomEl.value || '1');
      return Number.isFinite(v) && v >= 1 ? v : 1;
    }

    const v = parseFloat(selVal || '1');
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

  function getUploadUrl() {
    return (
      (uploadUrlInputEl && uploadUrlInputEl.value) ||
      'https://api.anamorphic-desqueeze.com/upload'
    );
  }

  function updateButtonsEnabled() {
    const hasItems = state.items.length > 0;
    if (fileInputEl) fileInputEl.disabled = state.busy;
    if (exportSelectedBtn) {
      exportSelectedBtn.disabled = state.busy || !hasItems;
    }
    if (exportBatchBtn) {
      exportBatchBtn.disabled = state.busy || !hasItems;
    }
  }

  function disableUiWhileBusy(busy) {
    state.busy = busy;
    updateButtonsEnabled();
  }

  function ensureQueueVisible() {
    if (!queueEl) return;
    if (state.items.length) queueEl.classList.remove('hidden');
    else queueEl.classList.add('hidden');
  }

  function updateGlobalProgress() {
    if (!progressBarEl) return;
    if (!state.items.length) {
      progressBarEl.classList.add('hidden');
      progressBarEl.value = 0;
      return;
    }

    const total = state.items.length;
    const sum = state.items.reduce((acc, it) => acc + (it.progress || 0), 0);
    const pct = Math.round(sum / total);

    if (pct <= 0 || pct >= 100) {
      progressBarEl.classList.add('hidden');
      progressBarEl.value = 0;
    } else {
      progressBarEl.classList.remove('hidden');
      progressBarEl.value = pct;
    }
  }

  function makeId() {
    return 'item-' + Date.now() + '-' + Math.random().toString(16).slice(2);
  }

  function guessType(file) {
    if (!file || !file.type) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';

    const name = file.name.toLowerCase();
    if (/\.(png|jpe?g|webp|heic|heif)$/.test(name)) return 'image';
    return 'video';
  }

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
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        const ext = item.type === 'image' ? '.jpg' : '.mp4';
        dl.download = baseName + '_desqueezed' + ext;
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
    updateButtonsEnabled();
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

  function findItem(id) {
    return state.items.find(it => it.id === id) || null;
  }

  function updateItem(id, patch) {
    const item = findItem(id);
    if (!item) return;
    Object.assign(item, patch);

    if (!queueEl) return;
    const row = queueEl.querySelector(`.queue-item[data-id="${id}"]`);
    if (!row) return;

    const statusNode = row.querySelector('.queue-status');
    const progNode = row.querySelector('.queue-progress');
    const dlNode = row.querySelector('.queue-download');

    if (patch.status != null && statusNode) {
      statusNode.textContent = patch.status;
    }
    if (patch.progress != null && progNode) {
      progNode.value = patch.progress;
    }
    if (patch.downloadUrl && dlNode) {
      dlNode.href = patch.downloadUrl;
      const baseName = item.file.name.replace(/\.[^.]+$/, '');
      const ext = item.type === 'image' ? '.jpg' : '.mp4';
      dlNode.download = baseName + '_desqueezed' + ext;
      dlNode.classList.remove('hidden');
    }

    updateGlobalProgress();
  }

  // === PREVIEW LOGIC ===

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

  function previewItemById(id) {
    const item = findItem(id);
    if (!item) return;
    state.currentPreviewId = id;
    previewItem(item);
  }

  function previewItem(item) {
    if (!item) return;
    const { type, file } = item;
    if (type === 'image') previewImage(file);
    else previewVideo(file);
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
    img.onerror = () => {
      setStatus('❌ Could not preview this image');
    };
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

  // === DOWNLOAD URL HANDLING ===

  function resolveDownloadHref(raw, uploadUrl) {
    if (!raw) return null;
    let val = String(raw).trim();

    // Already a full URL?
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

    // bare filename -> /downloads/<name>
    return origin + '/downloads/' + encodeURIComponent(val);
  }

  // === BATCH ZIP CREATION ===

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
        const baseName = item.file.name.replace(/\.[^.]+$/, '');
        const ext = item.type === 'image' ? '.jpg' : '.mp4';
        const fileName = baseName + '_desqueezed' + ext;

        zip.file(fileName, blob);
      } catch (e) {
        console.error('Error fetching file for ZIP:', url, e);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);
    triggerFileDownload(zipUrl, 'desqueezed_batch.zip');
  }

  // === EXPORT / UPLOAD LOGIC ===

  async function exportItems(items) {
    if (!items || !items.length) return;

    const isBatch = items.length > 1;
    const batchDownloads = [];

    disableUiWhileBusy(true);
    setStatus(`Exporting ${items.length} file${items.length > 1 ? 's' : ''}…`);

    const desqFactor = readDesqFactor();
    const fps = readFps();
    const bitrate = readBitrate();
    const photoFormat = readPhotoFormat();

    const cfg = { desqFactor, fps, bitrate, photoFormat };

    items.forEach(it => updateItem(it.id, { progress: 0, status: 'Queued…' }));
    updateGlobalProgress();

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const result = await uploadToBackend(item, cfg, { autoDownload: !isBatch });
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

  async function uploadToBackend(item, cfg, options = {}) {
    const { autoDownload = true } = options;
    const uploadUrl = getUploadUrl();
    const file = item.file;

    updateItem(item.id, {
      status: 'Uploading… 0%',
      progress: 0
    });

    const formData = new FormData();

    const sessionId =
      'sess-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    formData.append('file', file, file.name);
    formData.append('sessionId', sessionId);
    formData.append('kind', item.type);

    formData.append('desqFactor', String(cfg.desqFactor || 1));
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

      // Non-streaming
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
                const baseName = item.file.name.replace(/\.[^.]+$/, '');
                const ext = item.type === 'image' ? '.jpg' : '.mp4';
                triggerFileDownload(href, baseName + '_desqueezed' + ext);
              }
              return { downloadUrl: href };
            }
          }
          updateItem(item.id, {
            status: '✅ Processed (no direct download link)',
            progress: 100
          });
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
                const baseName = item.file.name.replace(/\.[^.]+$/, '');
                const ext = item.type === 'image' ? '.jpg' : '.mp4';
                triggerFileDownload(href, baseName + '_desqueezed' + ext);
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

  // === FILE INPUT HANDLING ===

  function handleFilesSelected(fileList) {
    if (!fileList || !fileList.length) return;

    const incoming = Array.from(fileList);
    const remainingSlots = MAX_ITEMS - state.items.length;
    const used = remainingSlots <= 0
      ? []
      : incoming.slice(0, remainingSlots);

    if (!used.length) {
      setStatus(`Queue is full (max ${MAX_ITEMS} items). Remove some before adding more.`);
      return;
    }

    used.forEach(file => {
      const item = {
        id: makeId(),
        file,
        type: guessType(file),
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
    const item = findItem(id);
    if (!item) return;
    exportItems([item]);
  }

  function onExportBatch() {
    if (!state.items.length) return;
    exportItems([...state.items]);
  }

  // === LIVE DESQUEEZE PREVIEW (VIDEO) ===
  // Uses CSS var --d so 2.0× is NOT cropped.

  function updatePreviewScale() {
    const d = readDesqFactor();
    const previewBox = document.getElementById('previewBox');
    if (!previewBox) return;
    previewBox.style.setProperty('--d', d);
  }

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
      const current = findItem(state.currentPreviewId);
      if (current && current.type === 'image') {
        previewImage(current.file);
      }
    }
  }

  // === INIT ===

  function init() {
    setStatus('Idle');

    initProState();
    applyProGate();

    if (fileInputEl) {
      fileInputEl.addEventListener('change', e => {
        const files = e.target.files;
        handleFilesSelected(files);
      });
    }

    if (exportSelectedBtn) {
      exportSelectedBtn.addEventListener('click', onExportSelected);
    }

    if (exportBatchBtn) {
      exportBatchBtn.addEventListener('click', onExportBatch);
    }

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
        updatePreviewScale();
        if (state.currentPreviewId) {
          const current = findItem(state.currentPreviewId);
          if (current && current.type === 'image') {
            previewImage(current.file);
          }
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
