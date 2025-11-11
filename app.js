(() => {
  const previewBox = document.getElementById("previewBox");
  const video = document.getElementById("video");
  const canvas = document.getElementById("photoCanvas");
  const ctx = canvas.getContext("2d");

  const playBtn = document.getElementById("play");
  const pauseBtn = document.getElementById("pause");
  const exportSelectedBtn = document.getElementById("exportSelected");
  const exportBatchBtn = document.getElementById("exportBatch");
  const statusEl = document.getElementById("status");
  const progressBar = document.getElementById("progressBar");
  const download = document.getElementById("download");
  const downloadLink = document.getElementById("downloadLink");
  const queueEl = document.getElementById("queue");

  const fileInput = document.getElementById("fileInput");
  const desqPreset = document.getElementById("desqPreset");
  const desqCustom = document.getElementById("desqCustom");
  const fpsPreset = document.getElementById("fpsPreset");
  const bitratePreset = document.getElementById("bitratePreset");
  const photoFormat = document.getElementById("photoFormat");
  const uploadUrlEl = document.getElementById("uploadUrl");

  let files = [];
  let currentIndex = -1;
  let currentObjectUrl = null;

  const MAX_FILES = 10;
  const lastHref = {};
  const batchOutputs = []; // { name, href }

  const setStatus = (m) => { statusEl.textContent = m; console.log(m); };
  const getUploadUrl = () => (uploadUrlEl && uploadUrlEl.value ? uploadUrlEl.value : "http://localhost:3001/upload");

  function getFactor(){
    let f = desqPreset.value === "custom" ? parseFloat(desqCustom.value) : parseFloat(desqPreset.value);
    if (!Number.isFinite(f) || f < 1) f = 1;
    return Math.round(f * 100) / 100;
  }

  function applyPreviewDesqueeze(){
    const f = getFactor();
    video.style.setProperty("--d", f);
    if (currentIndex >= 0 && files[currentIndex] && files[currentIndex].type.startsWith("image/")) {
      drawImagePreview(files[currentIndex]);
    }
  }

  function revokeObjectUrl(){
    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }
  }

  function resolveDownloadHref(raw, uploadUrl) {
  if (!raw) return null;
  const base = new URL(uploadUrl).origin;

  // pull just the filename from any form the server sends
  let name = String(raw).trim();
  // absolute URL? strip to filename
  try {
    if (/^https?:\/\//i.test(name)) {
      name = name.split("/").pop();
    }
  } catch {}
  // handles `/downloads/foo.mp4`, `/download/foo.mp4`, `foo.mp4`
  name = name.replace(/^.*\//, ""); // basename

  if (!name) return null;
  // ✅ final canonical URL used everywhere (single download & ZIP fetch)
  return `${base}/download/${name}`;
}

  // UI
  desqPreset.addEventListener("change", () => {
    const show = desqPreset.value === "custom";
    desqCustom.classList.toggle("hidden", !show);
    if (show && (!desqCustom.value || parseFloat(desqCustom.value) < 1)) desqCustom.value = "1.33";
    applyPreviewDesqueeze();
  });
  desqCustom.addEventListener("input", applyPreviewDesqueeze);

  playBtn.addEventListener("click", () => { video.play(); setStatus("Playing"); });
  pauseBtn.addEventListener("click", () => { video.pause(); setStatus("Paused"); });

  fileInput.addEventListener("change", (e) => {
    files = Array.from(e.target.files || [])
      .filter(f => f.type.startsWith("video/") || f.type.startsWith("image/"))
      .slice(0, MAX_FILES);

    batchOutputs.length = 0;
    lastHref.length = 0;

    if (!files.length) { setStatus("No supported files."); exportSelectedBtn.disabled = true; exportBatchBtn.disabled = true; return; }

    currentIndex = 0;
    rebuildQueue();
    showPreview(files[0]);

    exportSelectedBtn.disabled = false;
    exportBatchBtn.disabled = files.length < 2; // only enable when 2–10 files
  });

  function rebuildQueue(){
    queueEl.innerHTML = "";
    queueEl.classList.toggle("hidden", files.length <= 1);
    files.forEach((f, i) => {
      const row = document.createElement("div");
      row.className = "queue-item";
      row.dataset.index = i;
      row.innerHTML = `
        <div>
          <div class="queue-name">${f.name}</div>
          <div class="queue-status" id="qs-${i}">queued</div>
        </div>
        <progress id="qp-${i}" class="queue-progress" value="0" max="100"></progress>
      `;
      row.addEventListener("click", () => { currentIndex = i; showPreview(files[i]); });
      queueEl.appendChild(row);
    });
  }
  function setRowStatus(i, text){ const el = document.getElementById("qs-" + i); if (el) el.textContent = text; }
  function setRowProgress(i, v){ const el = document.getElementById("qp-" + i); if (el) el.value = Math.max(0, Math.min(100, v)); }

  function showPreview(file){
    download.classList.add("hidden");
    if (!file) return;

    if (file.type.startsWith("video/")){
      canvas.classList.add("hidden");
      video.classList.remove("hidden");
      revokeObjectUrl();
      currentObjectUrl = URL.createObjectURL(file);
      video.src = currentObjectUrl;
      video.onloadedmetadata = () => {
        applyPreviewDesqueeze();
        video.play().catch(()=>{});
        setStatus("Loaded video: " + file.name);
      };
      video.onerror = () => setStatus("❌ Video load error (try H.264 MP4).");
    } else {
      video.classList.add("hidden");
      canvas.classList.remove("hidden");
      drawImagePreview(file);
      setStatus("Loaded photo: " + file.name);
    }
  }

  function drawImagePreview(file){
    const f = getFactor();
    const img = new Image();
    img.onload = () => {
      const W = Math.round(img.width * f), H = img.height;
      canvas.width = W; canvas.height = H;
      ctx.setTransform(f, 0, 0, 1, 0, 0);
      ctx.drawImage(img, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };
    img.onerror = () => setStatus("❌ Failed to load image");
    img.src = URL.createObjectURL(file);
  }

  // Export Selected (single current file)
  exportSelectedBtn.addEventListener("click", async () => {
    if (currentIndex < 0 || !files[currentIndex]) return setStatus("Pick a file first");
    progressBar.classList.remove("hidden");
    progressBar.value = 0;
    await exportOne(files[currentIndex], currentIndex);
    progressBar.classList.add("hidden");
  });

  // Export Batch (2–10 files, build ZIP if >= 2)
  exportBatchBtn.addEventListener("click", async () => {
    if (files.length < 2) return setStatus("Add at least two files for batch export");
    progressBar.classList.remove("hidden");
    progressBar.value = 0;
    batchOutputs.length = 0;

    for (let i = 0; i < files.length; i++) {
      await exportOne(files[i], i);
      progressBar.value = Math.round(((i + 1) / files.length) * 100);
    }

    if (batchOutputs.length >= 2) {
      setStatus("Packing ZIP…");
      try {
        const zipBlob = await buildZip(batchOutputs);
        const zipUrl = URL.createObjectURL(zipBlob);
        downloadLink.href = zipUrl;
        downloadLink.download = `desqueezed_batch_${batchOutputs.length}_${Date.now()}.zip`;
        download.classList.remove("hidden");
        setStatus("✅ Batch complete (ZIP ready)");
      } catch (e) {
        console.error(e);
        setStatus("❌ ZIP create failed (check console)");
      }
    } else {
      setStatus("✅ Batch complete");
    }

    progressBar.classList.add("hidden");
  });

  async function exportOne(file, rowIndex){
    if (!file) return;
    setRowStatus(rowIndex, "exporting…");
    setRowProgress(rowIndex, 0);
    setStatus("Exporting…");
    download.classList.add("hidden");

    // Photo → client
    if (file.type.startsWith("image/")){
      try {
        const blob = await exportPhotoBlob(file);
        const url = URL.createObjectURL(blob);
        lastHref[rowIndex] = url;
        batchOutputs.push({ name: makeOutName(file, true), href: url });
        setRowStatus(rowIndex, "done"); setRowProgress(rowIndex, 100);

        // Also surface the latest in the main Download link
        downloadLink.href = url;
        downloadLink.download = makeOutName(file, true);
        download.classList.remove("hidden");
        setStatus("✅ Photo exported");
      } catch (e) {
        console.error(e);
        setRowStatus(rowIndex, "error");
        setStatus("❌ Photo export failed");
      }
      return;
    }

    // Video → server
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("factor", String(getFactor()));
      form.append("fps", fpsPreset.value);
      form.append("bitrate", bitratePreset.value);

      const uploadUrl = getUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", body: form });
      if (!res.ok || !res.body) throw new Error("Upload failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split(/\r?\n/);
        for (let k = 0; k < lines.length - 1; k++) {
          const line = lines[k].trim();
          if (!line) continue;

          if (line.startsWith("progress:")) {
            const pct = parseFloat(line.slice(9) || "0");
            setRowProgress(rowIndex, isFinite(pct) ? pct : 0);
            setStatus("Exporting… " + (isFinite(pct) ? pct : 0) + "%");
          } else if (line.startsWith("download:")) {
            const raw = line.slice(9);
            const href = resolveDownloadHref(raw, uploadUrl);
            if (href) {
              lastHref[rowIndex] = href;
              batchOutputs.push({ name: makeOutName(file, false), href });
              downloadLink.href = href;
              downloadLink.download = makeOutName(file, false);
            }
          } else if (line.startsWith("status:done")) {
            setRowStatus(rowIndex, "done");
            if (lastHref[rowIndex]) download.classList.remove("hidden");
            setStatus("✅ Export complete");
          } else if (line.startsWith("status:error")) {
            setRowStatus(rowIndex, "error");
            setStatus("❌ Export failed");
          }
        }
        buffer = lines[lines.length - 1];
      }
    } catch (err) {
      console.error(err);
      setRowStatus(rowIndex, "error");
      setStatus("❌ Export failed (check server & CORS)");
    }
  }

  function exportPhotoBlob(file){
    return new Promise((resolve, reject) => {
      const fac = getFactor();
      const img = new Image();
      img.onload = () => {
        const W = Math.round(img.width * fac), H = img.height;
        canvas.width = W; canvas.height = H;
        ctx.setTransform(fac, 0, 0, 1, 0, 0);
        ctx.drawImage(img, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const mime = photoFormat.value || "image/jpeg";
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
                      mime, mime.includes("jpeg") ? 0.95 : undefined);
      };
      img.onerror = () => reject(new Error("Image decode failed"));
      img.src = URL.createObjectURL(file);
    });
  }

  function makeOutName(f, isPhoto){
    const base = f.name.replace(/\.[^.]+$/, "");
    if (isPhoto){
      const ext = photoFormat.value.endsWith("png") ? "png" : "jpg";
      return `${base}_desq.${ext}`;
    }
    return `${base}_desq.mp4`;
  }

  async function buildZip(items){
    if (!window.JSZip) throw new Error("JSZip not loaded");
    const zip = new JSZip();
    for (const it of items) {
      const resp = await fetch(it.href);
      const buf = await resp.arrayBuffer();
      zip.file(it.name, buf);
    }
    return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
  }

  // init
  setStatus("Idle");
  applyPreviewDesqueeze();
})();

