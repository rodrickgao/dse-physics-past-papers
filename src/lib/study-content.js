const cache = new Map();
export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function loadStudyPaper(year, language) {
  if (!/^20\d{2}$/.test(String(year)) || !["eng", "chn"].includes(language)) return Promise.reject(new Error("Invalid paper"));
  const id = `${year}-${language}`;
  if (!cache.has(id)) cache.set(id, fetch(`text-papers/${id}.json`, { signal: AbortSignal.timeout(30000) }).then((response) => {
    if (!response.ok) throw new Error("Study content could not be loaded");
    return response.json();
  }).catch((error) => { cache.delete(id); throw error; }));
  return cache.get(id);
}

export const STUDY_CSS = `
 .study-content {font-family:"Times New Roman",SimSun,"Songti SC",serif;font-size:16px;line-height:1.5;color:#000;background:#fff;overflow-wrap:anywhere}
 .study-content p {margin:0 0 8px;white-space:normal;break-inside:avoid}
 .study-content img {max-width:100%;height:auto;object-fit:contain;border:0;background:#fff;display:inline-block;vertical-align:middle}
 .study-content .study-figure {display:block;text-align:center;margin:12px 0;break-inside:avoid}
 .study-content table {width:100%;table-layout:fixed;border-collapse:collapse;margin:8px 0;background:#fff}
 .study-content tr {break-inside:avoid}
 .study-content td {vertical-align:top;padding:6px 10px;border:0;background:#fff;overflow-wrap:anywhere}
 .study-content td p {margin-bottom:5px}
 .study-content .study-table-wrap {max-width:100%}
 .study-content sup,.study-content sub {font-size:.75em;line-height:0;position:relative;vertical-align:baseline}
 .study-content sup {top:-.5em}.study-content sub {bottom:-.25em}
 .study-content math {font-family:"Times New Roman",serif;font-size:1em;max-width:100%}
 .study-content.official-content {color:#f00}
 .study-content.reasoning-content {color:#0000ff}
 .study-source-note {font:13px/1.5 "Times New Roman",SimSun,"Songti SC",serif;color:#595959;margin:10px 0;background:#fff}
`;

export function scanHtml(paths, yearId) {
  return (paths || []).map((path) => `<p class="study-figure"><img src="assets/${escapeHtml(yearId)}/${escapeHtml(path)}" alt="${escapeHtml(path)}"/></p>`).join("");
}

export function printableQuestion(entry, content, { language, mode, spaceMm = 50 }) {
  const en = language === "eng";
  const title = `${entry.year.year} · ${["1A", "1B", "2"][entry.paperIndex]} · ${entry.question.label}`;
  const pending = en ? "Detailed reasoning is awaiting verification. No unverified explanation has been substituted." : "詳細思路尚待核驗；此處不以未核驗內容代替。";
  const question = content?.question || scanHtml(entry.question.question, entry.year.id);
  const official = content?.official || (entry.question.answerText ? `<p>${escapeHtml(entry.question.answerText)}</p>` : scanHtml(entry.question.answer, entry.year.id));
  return `<article class="print-question" data-question="${escapeHtml(entry.key)}"><h2>${escapeHtml(title)}</h2>
    ${content?.sourceNote ? `<p class="study-source-note">${escapeHtml(content.sourceNote)}</p>` : ""}
    <h3>1. ${en ? "Question" : "題目"}</h3><div class="study-content question-content">${question}</div>
    ${!content?.question ? `<p class="study-source-note">${en ? "Original scan retained while text transcription is verified." : "文字轉錄尚待核驗，保留原卷以免誤抄。"}</p>` : ""}
    ${mode === "questions" ? `<div class="working-space" style="height:${Math.min(120, Math.max(20, Number(spaceMm) || 50))}mm"><span>${escapeHtml(title)} — ${en ? "Working space" : "作答區"}</span></div>` : `
      <h3>2. ${en ? "HKEAA official answer / marking scheme" : "考評局官方解答／評分參考"}</h3><div class="study-content official-content">${official || `<p>${en ? "Official source unavailable." : "暫缺官方來源。"}</p>`}</div>
      <h3>3. ${en ? "Detailed reasoning" : "詳細思路解答"}</h3><div class="study-content reasoning-content">${content?.reasoning || `<p>${pending}</p>`}</div>`}
  </article>`;
}

export function printDocumentHtml(entries, contents, options) {
  const en = options.language === "eng";
  const intro = options.mode === "questions" ? (en ? "Original questions only. Working space follows each question; answers are not included." : "本冊只含原題，每題後預留作答空間，不附答案。") : (en ? "Black: question · Red: official answer · Blue: detailed reasoning. Original diagrams and official scan excerpts retain their source colours." : "黑色：題目｜紅色：官方答案｜藍色：詳細思路。原題圖表及官方掃描摘錄保留原色。");
  const title = en ? `DSE Physics — ${options.mode === "detailed" ? "Worked solutions" : "Practice"} mistake book` : `DSE 物理錯題本 — ${options.mode === "detailed" ? "詳解版" : "原題練習版"}`;
  return `<!doctype html><html lang="${en ? "en" : "zh-Hant"}"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><base href="${escapeHtml(options.baseUrl)}"><style>${STUDY_CSS}
    @page {size:letter;margin:.72in .85in .7in}
    * {box-sizing:border-box}body{margin:0;background:white;color:black;font:11pt/1.18 "Times New Roman",SimSun,"Songti SC",serif}
    h1{font-size:23pt;margin:0 0 12pt}h2{font-size:15.5pt;margin:0 0 10pt;break-after:avoid}h3{font-size:12.5pt;margin:14pt 0 8pt;break-after:avoid}
    .print-question{padding-top:12pt}.print-question+.print-question{break-before:page}
    .study-content{font-size:11pt;line-height:1.18}.reasoning-content,.official-content{font-size:10.5pt}
    .study-content p{margin-bottom:5pt}.study-content img{max-height:7.6in;max-width:100%;object-fit:contain}
    .study-content td img{max-height:1.7in}.study-content td .study-figure{margin:5pt 0}
    .working-space{break-inside:avoid;margin-top:15pt;min-height:20mm}.working-space span{font-size:9pt;color:#777}
    .print-intro{font-size:10pt;margin:0 0 18pt}.print-actions{font-family:system-ui;padding:16px;background:#fff;border-bottom:1px solid #ddd;margin-bottom:20px}.print-actions button{padding:10px;margin-right:10px}
    @media print{.print-actions{display:none}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
    @media screen{body{max-width:8.5in;margin:20px auto;padding:30px}.print-question{border-top:1px solid #ddd;margin-top:30px}}
    </style></head><body><div class="print-actions"><button id="print">${en ? "Print / Save as PDF" : "列印／另存為 PDF"}</button><span>${en ? "Choose Save as PDF; disable browser headers and footers." : "選擇另存為 PDF；關閉瀏覽器頁首頁尾。"}</span></div><h1>${escapeHtml(title)}</h1><p class="print-intro">${intro}</p>${entries.map((entry, i) => printableQuestion(entry, contents[i], options)).join("")}</body></html>`;
}

export async function openMistakePrint(entries, options) {
  // Open synchronously during the click, then prepare all assets before printing.
  const tab = window.open("", "_blank");
  if (!tab) throw new Error(options.language === "eng" ? "Allow the print preview popup and try again." : "請允許開啟列印預覽視窗後再試。");
  tab.opener = null;
  tab.document.body.textContent = options.language === "eng" ? "Preparing print preview…" : "正在準備列印預覽…";
  try {
    const papers = await Promise.all(entries.map((entry) => loadStudyPaper(entry.year.year, options.language)));
    const contents = entries.map((entry, i) => papers[i][entry.key]);
    if (tab.closed) throw new Error(options.language === "eng" ? "Print preview was closed." : "列印預覽已關閉。");
    tab.document.open();tab.document.write(printDocumentHtml(entries, contents, { ...options, baseUrl: new URL(".", window.location.href).href }));tab.document.close();
    tab.document.getElementById("print").onclick = () => tab.print();
    const imageError = options.language === "eng" ? "An image could not be loaded. Please try again before printing." : "部分圖片未能載入，請重試後再列印。";
    await Promise.all([...tab.document.images].map((img) => img.complete ? (img.naturalWidth ? Promise.resolve() : Promise.reject(new Error(imageError))) : new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(imageError)), 30000);
      img.onload = () => {clearTimeout(timer);resolve();};img.onerror = () => {clearTimeout(timer);reject(new Error(imageError));};
    })));
    await tab.document.fonts.ready;
    if (!tab.closed) {tab.focus();tab.print();}
  } catch (error) {if (!tab.closed) tab.close();throw error;}
}
