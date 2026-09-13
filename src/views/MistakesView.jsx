import { useState } from "react";
import { ArrowRight, BarChart3, BookOpen, CircleAlert, Download, FileQuestion, LoaderCircle, Star, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { entriesByLanguage, imageUrl, pointsMap, questionLabelFromKey } from "../lib/data";
import { openMistakePrint } from "../lib/study-content";

export function MistakesView({ language, mistakes, setMistake, openPaper, browsePapers }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [spaceMm, setSpaceMm] = useState(50);
  const map = new Map(entriesByLanguage[language].map((entry) => [entry.key, entry]));
  const entries = Object.keys(mistakes).map((key) => map.get(key)).filter(Boolean).sort((a, b) => b.year.year - a.year.year);
  const pointRows = new Map();
  const chapterRows = new Map();
  entries.forEach((entry) => entry.network.links?.forEach((link) => {
    const sequence = Number(link.sequence);
    pointRows.set(sequence, (pointRows.get(sequence) || 0) + 1);
    const chapter = language === "eng" ? link.chapterEn : link.chapterZh;
    chapterRows.set(chapter, (chapterRows.get(chapter) || 0) + 1);
  }));
  const chapters = [...chapterRows.entries()].sort((a, b) => b[1] - a[1]);
  const points = [...pointRows.entries()].sort((a, b) => b[1] - a[1]);
  const maxChapter = chapters[0]?.[1] || 1;
  const exportPdf = async (mode) => {
    if (!entries.length || exporting) return;
    setExporting(true); setExportError("");
    try {
      await openMistakePrint(entries, { language, mode, spaceMm });
    } catch (error) {
      setExportError(error.message || (language === "eng" ? "The PDF could not be created. Please try again." : "暫時未能建立 PDF，請稍後再試。"));
    } finally { setExporting(false); }
  };

  return (
    <div className="mistakes-view page-enter">
      <div className="view-heading mistakes-heading"><div><p className="page-kicker"><span /> {language === "eng" ? "MISTAKE REVIEW" : "個人錯題複習"}</p><h1>{language === "eng" ? "Turn mistakes into progress" : "把錯題變成進步路線"}</h1><p>{language === "eng" ? "Return to the original question and see where to focus next." : "回到原題重新思考，並看清最需要加強的章節。"}</p></div><div className="mistake-heading-actions"><Button onClick={browsePapers}>{language === "eng" ? "Browse papers" : "瀏覽真題"} <ArrowRight /></Button></div></div>
      {!!entries.length && <div className="export-controls"><Button variant="outline" disabled={exporting} onClick={() => exportPdf("questions")}>{exporting ? <LoaderCircle className="spin"/> : <Download/>}{language === "eng" ? "Practice PDF" : "原題版 PDF"}</Button><Button disabled={exporting} onClick={() => exportPdf("detailed")}><Download/>{language === "eng" ? "Worked solutions PDF" : "詳解版 PDF"}</Button><label>{language === "eng" ? "Working space per question " : "每題作答留白 "}<select value={spaceMm} onChange={(e) => setSpaceMm(Number(e.target.value))}>{[30, 50, 80, 120].map((n) => <option key={n} value={n}>{n} mm</option>)}</select></label><p className="export-note">{language === "eng" ? "Opens print preview: choose Save as PDF. The worked edition includes official answers and verified reasoning; pending content is labelled. Original scans retain their source colours." : "開啟列印預覽後選擇「另存為 PDF」。詳解版包含官方解答和已核驗思路；待核驗內容會註明，原卷掃描保留原色。"}</p></div>}
      {exportError && <p className="export-error" role="alert">{exportError}</p>}
      <section className="mistake-kpis">
        <Card><span className="kpi-icon rose"><CircleAlert /></span><div><strong>{entries.length}</strong><small>{language === "eng" ? "saved mistakes" : "道錯題"}</small></div></Card>
        <Card><span className="kpi-icon blue"><BookOpen /></span><div><strong>{pointRows.size}</strong><small>{language === "eng" ? "knowledge points" : "個相關知識點"}</small></div></Card>
        <Card><span className="kpi-icon amber"><BarChart3 /></span><div><strong>{chapters[0]?.[0] || "—"}</strong><small>{language === "eng" ? "weakest chapter" : "最弱章節"}</small></div></Card>
      </section>

      {!entries.length ? <Card className="mistake-empty"><span><Star /></span><h2>{language === "eng" ? "Your mistake book is empty" : "錯題庫還是空的"}</h2><p>{language === "eng" ? "Save any question while practising and it will appear here." : "做真題時按下「加入錯題」，原題與相關知識點就會出現在這裡。"}</p><Button onClick={browsePapers}>{language === "eng" ? "Browse past papers" : "開始做真題"}<ArrowRight /></Button></Card>
      : <div className="mistake-dashboard">
        <section className="mistake-question-panel"><div className="panel-title"><div><p>{language === "eng" ? "ORIGINAL QUESTIONS" : "錯題原題"}</p><h2>{language === "eng" ? "Saved questions" : "已收藏題目"}</h2></div><span>{entries.length}</span></div><div className="mistake-list">{entries.map((entry) => <Card key={entry.key} className="mistake-row"><button className="mistake-thumbnail" onClick={() => openPaper(entry.key)}>{entry.question.question?.[0] ? <img src={imageUrl(entry.year.id, entry.question.question[0])} alt="" loading="lazy" /> : <FileQuestion />}</button><div className="mistake-row-copy"><p>{questionLabelFromKey(entry.key)}</p><strong>{entry.paper.title} · {entry.question.label}</strong><small>{entry.chapter || (language === "eng" ? "Past-paper question" : "歷屆試題")}</small><div>{entry.network.links?.slice(0, 3).map((link) => <span key={`${entry.key}-${link.sequence}`}>{link.code}</span>)}</div></div><div className="mistake-row-actions"><Button variant="outline" onClick={() => openPaper(entry.key)}>{language === "eng" ? "Open" : "打開"}<ArrowRight /></Button><Button variant="danger" size="icon" onClick={() => setMistake(entry.key, false)} aria-label="Remove"><Trash2 /></Button></div></Card>)}</div></section>
        <aside className="mistake-analysis"><Card className="analysis-card"><div className="panel-title"><div><p>{language === "eng" ? "WEAK CHAPTERS" : "薄弱章節"}</p><h2>{language === "eng" ? "Mistakes by chapter" : "錯題章節分佈"}</h2></div></div><div className="chapter-bars">{chapters.slice(0, 7).map(([name, count]) => <div key={name}><span><b>{name}</b><strong>{count}</strong></span><i><em style={{ width: `${count / maxChapter * 100}%` }} /></i></div>)}</div></Card><Card className="analysis-card"><div className="panel-title"><div><p>{language === "eng" ? "TOP KNOWLEDGE" : "高頻知識點"}</p><h2>{language === "eng" ? "Review next" : "下一步複習"}</h2></div></div><div className="top-points">{points.slice(0, 6).map(([sequence, count]) => { const point = pointsMap[language].get(sequence); return <div key={sequence}><span><b>{point?.code}</b><small>{point?.chapter}</small></span><strong>{count}</strong></div>; })}</div></Card></aside>
      </div>}
    </div>
  );
}
