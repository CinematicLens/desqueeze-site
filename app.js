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
  let createdObjectUrls = [];

  const MAX_FILES = 10;
  const lastHref = [];
  const batchOutputs = [];

  const setStatus = (m) => { statusEl.textContent = m; console.log(m); };

  function getApiBase() {
    const v = uploadUrlEl && uploadUrlEl.value ? uploadUrlEl.value.trim() : "";
    if (v) {
      try { return new URL(v, window.location.origin).origin; } catch {}
    }
    return window.location.origin;
  }
  function getUploadUrl() {
    const v = uploadUrlEl && uploadUrlEl.value ? uploadUrlEl.value.trim() : "";
    if (v) {
      try { return new URL(v, window.location.origin).href; } catch {}
    }
    return `${getApiBase()}/upload`;
  }

  function trackUrl(u){ if (u) createdObjectUrls.push(u); }
  function revokeObjectUrl(u){ if (u) URL.revokeObjectURL(u); }
  function revokeAllCreatedObjectUrls(){ for (const u of createdObjectUrls) URL.revokeObjectURL(u); createdObjectUrls = []; }

  function triggerDownloadFromUrl(url, filename){
    const a = document.createElement('a');
    a.href = url;
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function triggerDownloadFromBlob(blob, filename){
    const url = URL.createObjectURL(blob);
    trackUrl(url);
    triggerDownloadFromUrl(url, filename);
  }
  async function downloadCrossOriginAsBlob(url, filename){
    const resp = await fetch(url, { mode: "cors" });
    if (!resp.ok) throw new Error("Failed to fetch output");
    const blob = await resp.blob();
    triggerDownloadFromBlob(blob, filename);
  }

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
  function revokeVideoObjectUrl(){
    if (currentObjectUrl) { URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; }
  }

  // --- CHANGE #1: accept /files/ path from the server as a valid download URL
  function resolveDownloadHref(raw){
    if (!raw) return null;
    const base = getApiBase();
    try {
      let name = String(raw).trim();
      if (!name) return null;

      if (/^https?:\/\//i.test(name)) return name;                 // absolute URL
      if (name.startsWith("/downloads/") || name.startsWith("/files/"))
        return `${base}${name}`;                                   // server path

      name = name.replace(/^.*\//, "");                            // basename
      name = name.split("?")[0].split("#")[0];
      if (!name) return null;
      return `${base}/download/${encodeURIComponent(name)}`;       // legacy
    } catch (e) {
      console.error("resolveDownloadHref failed:", e, raw);
      return null;
    }
  }

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
    revokeVideoObjectUrl();
    revokeAllCreatedObjectUrls();
    download.classList.add("hidden");
    downloadLink.removeAttribute("href");
    downloadLink.removeAttribute("download");

    files = Array.from(e.target.files || [])
      .filter(f => f.type.startsWith("video/") || f.type.startsWith("image/"))
      .slice(0, MAX_FILES);

    batchOutputs.length = 0;
    lastHref.length = 0;

    if (!files.length) {
      setStatus("No supported files.");
      exportSelectedBtn.disabled = true;
      exportBatchBtn.disabled = true;
      if (previewBox) previewBox.classList.add("hidden");
      return;
    }

    currentIndex = 0;
    rebuildQueue();
    showPreview(files[0]);
    if (previewBox) previewBox.classList.remove("hidden");

    exportSelectedBtn.disabled = false;
    exportBatchBtn.disabled = files.length < 2;
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
      revokeVideoObjectUrl();
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
    const tmpUrl = URL.createObjectURL(file);
    img.onload = () => {
      const W = Math.round(img.width * f), H = img.height;
      canvas.width = W; canvas.height = H;
      ctx.setTransform(f, 0, 0, 1, 0, 0);
      ctx.drawImage(img, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      revokeObjectUrl(tmpUrl);
    };
    img.onerror = () => { setStatus("❌ Failed to load image"); revokeObjectUrl(tmpUrl); };
    img.src = tmpUrl;
  }

  exportSelectedBtn.addEventListener("click", async () => {
    if (currentIndex < 0 || !files[currentIndex]) return setStatus("Pick a file first");
    exportSelectedBtn.disabled = true;
    exportBatchBtn.disabled = true;
    progressBar.classList.remove("hidden");
    progressBar.value = 0;

    await exportOne(files[currentIndex], currentIndex);

    progressBar.classList.add("hidden");
    exportSelectedBtn.disabled = false;
    exportBatchBtn.disabled = files.length < 2 ? true : false;
  });

  exportBatchBtn.addEventListener("click", async () => {
    if (files.length < 2) return setStatus("Add at least two files for batch export");
    exportSelectedBtn.disabled = true;
    exportBatchBtn.disabled = true;
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
        trackUrl(zipUrl);
        const zipName = `desqueezed_batch_${batchOutputs.length}_${Date.now()}.zip`;
        downloadLink.href = zipUrl;
        downloadLink.download = zipName;
        download.classList.remove("hidden");
        triggerDownloadFromBlob(zipBlob, zipName);
        setStatus("✅ Batch complete (ZIP ready)");
      } catch (e) {
        console.error(e);
        setStatus("❌ ZIP create failed (check console)");
      }
    } else {
      setStatus("✅ Batch complete");
    }

    progressBar.classList.add("hidden");
    exportSelectedBtn.disabled = false;
    exportBatchBtn.disabled = files.length < 2 ? true : false;
  });

  async function exportOne(file, rowIndex){
    if (!file) return;
    setRowStatus(rowIndex, "exporting…");
    setRowProgress(rowIndex, 0);
    setStatus("Exporting…");
    download.classList.add("hidden");

    if (file.type.startsWith("image/")){
      try {
        const blob = await exportPhotoBlob(file);
        const url = URL.createObjectURL(blob);
        trackUrl(url);
        lastHref[rowIndex] = url;
        const outName = makeOutName(file, true);
        batchOutputs.push({ name: outName, href: url });

        setRowStatus(rowIndex, "done");
        setRowProgress(rowIndex, 100);

        downloadLink.href = url;
        downloadLink.download = outName;
        download.classList.remove("hidden");

        triggerDownloadFromBlob(blob, outName);
        setStatus("✅ Photo exported");
      } catch (e) {
        console.error(e);
        setRowStatus(rowIndex, "error");
        setStatus("❌ Photo export failed");
      }
      return;
    }

     try {
      const form = new FormData();
      form.append("file", file);
      form.append("factor", String(getFactor()));
      // don't send fps=copy; let server keep original FPS
      if (fpsPreset.value !== "copy") {
        form.append("fps", fpsPreset.value);
      }
      form.append("bitrate", bitratePreset.value);

      const uploadUrl = getUploadUrl();
      console.log("Export: POST ->", uploadUrl);

      const res = await fetch(uploadUrl, { method: "POST", body: form });

      // 🔍 If server responded but with an error code, throw HTTP status
      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

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
            const href = resolveDownloadHref(raw);
            if (href) {
              const outName = makeOutName(file, false);
              lastHref[rowIndex] = href;
              batchOutputs.push({ name: outName, href });

              downloadLink.href = href;
              downloadLink.download = outName;
              download.classList.remove("hidden");

              downloadCrossOriginAsBlob(href, outName).catch(console.error);
            }
          } else if (line.startsWith("status:done")) {
            setRowStatus(rowIndex, "done");
            setStatus("✅ Export complete");
          } else if (line.startsWith("status:error")) {
            setRowStatus(rowIndex, "error");
            setStatus("❌ Export failed (server reported error)");
          }
        }

        buffer = lines[lines.length - 1];
      }
    } catch (err) {
      console.error("Export failed:", err);
      setRowStatus(rowIndex, "error");

      const msg = (err && err.message) || "";

      if (/^HTTP \d+/.test(msg)) {
        // ✅ Request reached the server, but server returned error status
        setStatus("❌ Server error: " + msg);
      } else if (/Failed to fetch|NetworkError|TypeError: Failed to fetch/i.test(msg)) {
        // ❌ Browser could not even talk to the backend (CORS / mixed content / offline / wrong URL)
        setStatus("❌ Network/CORS error – browser could not reach the backend");
      } else {
        // generic
        setStatus("❌ Export failed: " + (msg || "unknown error"));
      }
    }
  }


  function exportPhotoBlob(file){
    return new Promise((resolve, reject) => {
      const fac = getFactor();
      const img = new Image();
      const tmpUrl = URL.createObjectURL(file);
      img.onload = () => {
        const W = Math.round(img.width * fac), H = img.height;
        canvas.width = W; canvas.height = H;
        ctx.setTransform(fac, 0, 0, 1, 0, 0);
        ctx.drawImage(img, 0, 0);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        revokeObjectUrl(tmpUrl);

        const mime = photoFormat.value || "image/jpeg";
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
                      mime, mime.includes("jpeg") ? 0.95 : undefined);
      };
      img.onerror = () => { revokeObjectUrl(tmpUrl); reject(new Error("Image decode failed")); };
      img.src = tmpUrl;
    });
  }

  function makeOutName(f, isPhoto){
    const base = f.name.replace(/\.[^.]+$/, "");
    if (isPhoto){
      const ext = (photoFormat.value && /png$/i.test(photoFormat.value)) ? "png" : "jpg";
      return `${base}_desq.${ext}`;
    }
    return `${base}_desq.mp4`;
  }

  async function buildZip(items){
    if (!window.JSZip) throw new Error("JSZip not loaded");
    const zip = new JSZip();
    for (const it of items) {
      const resp = await fetch(it.href, { mode: "cors" });
      if (!resp.ok) throw new Error("Failed to fetch ZIP member");
      const buf = await resp.arrayBuffer();
      zip.file(it.name, buf);
    }
    // already using level 1 (fast) — leaving as-is
    return zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 1 } });
  }

  setStatus("Idle");
  applyPreviewDesqueeze();

  /* ===== CHANGE #3: PRO ENTITLEMENT + GATING (keeps 2.0× free) ===== */
  (function(){
    function hasPro(){ try { return localStorage.getItem("proEntitled")==="1"; } catch { return false; } }
    function grantPro(){ try { localStorage.setItem("proEntitled","1"); } catch {} }
    function consumeProFromUrl(){
      const usp = new URLSearchParams(location.search);
      if (usp.get("pro")==="1"){
        grantPro();
        usp.delete("pro");
        const clean = location.pathname + (usp.toString()?`?${usp}`:"") + location.hash;
        history.replaceState(null,"",clean);
        setStatus("✅ Pro activated");
      }
    }

    const FREE_DESQ = new Set(["2","1"]); // 2.00× and None are free
    const PRO_FPS   = new Set(["24","25","30","50","60"]);
    const PRO_BR    = new Set(["12000000","16000000","25000000"]);
    const PRO_FMT   = new Set(["image/png"]);

    function isProOption(selectEl, val){
      if (selectEl===desqPreset)    return !FREE_DESQ.has(String(val));
      if (selectEl===fpsPreset)     return PRO_FPS.has(String(val));
      if (selectEl===bitratePreset) return PRO_BR.has(String(val));
      if (selectEl===photoFormat)   return PRO_FMT.has(String(val));
      return false;
    }

    function lockNonProOptions(){
      const pro = hasPro();
      [...desqPreset.options].forEach(o => o.disabled = !pro && isProOption(desqPreset,o.value));
      [...fpsPreset.options].forEach(o => o.disabled = !pro && isProOption(fpsPreset,o.value));
      [...bitratePreset.options].forEach(o => o.disabled = !pro && isProOption(bitratePreset,o.value));
      [...photoFormat.options].forEach(o => o.disabled = !pro && isProOption(photoFormat,o.value));

      if (!pro){
        exportBatchBtn.disabled = true;
        exportBatchBtn.setAttribute("data-locked","1");
        exportBatchBtn.title = "Unlock Pro to enable batch export";
      } else {
        exportBatchBtn.disabled = files.length < 2 ? true : false;
        exportBatchBtn.removeAttribute("data-locked");
        exportBatchBtn.title = "";
      }
    }

    function intercept(selectEl){
      let prev = selectEl.value;
      selectEl.addEventListener("change", () => {
        const next = selectEl.value;
        if (!hasPro() && isProOption(selectEl, next)){
          selectEl.value = prev;           // revert immediately
          setStatus("🔒 Pro feature — use Unlock Pro below");
          return;
        }
        prev = next;
      });
    }

    exportBatchBtn.addEventListener("click", (e) => {
      if (!hasPro()){
        e.preventDefault();
        setStatus("🔒 Batch export is a Pro feature — unlock below");
      }
    });

    consumeProFromUrl();
    lockNonProOptions();
    intercept(desqPreset);
    intercept(fpsPreset);
    intercept(bitratePreset);
    intercept(photoFormat);

    if (hasPro()) setStatus("✅ Pro active");
  })();

})();

