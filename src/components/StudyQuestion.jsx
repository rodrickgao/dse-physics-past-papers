import { useEffect, useState } from "react";
import { loadStudyPaper, officialAnswerHtml, STUDY_CSS } from "../lib/study-content";
import { Button } from "./ui/button";

export function StudyQuestion({ year, language, questionKey, question, ScanImages }) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const [stage, setStage] = useState(1);
  const en = language === "eng";
  useEffect(() => {
    let cancelled = false;setRecord(null);setStage(1);setLoading(true);setError(false);
    loadStudyPaper(year.year, language).then((data) => {if (!cancelled) setRecord(data[questionKey] || null);}).catch(() => {if (!cancelled) setError(true);}).finally(() => {if (!cancelled) setLoading(false);});
    return () => {cancelled = true;};
  }, [year.year, language, questionKey, revision]);
  const rich = (value, type) => <div className={`study-content ${type}-content`} dangerouslySetInnerHTML={{ __html: value }} />;
  return <div className="study-flow" data-question={questionKey}>
    <style>{STUDY_CSS}</style>
    {record?.sourceNote && <p className="study-source-note">{record.sourceNote}</p>}
    <section className="study-stage"><h3><span>1</span>{en ? "Question" : "題目"}</h3>
      {loading ? <p role="status">{en ? "Loading text edition…" : "正在載入文字版…"}</p> : record?.question ? rich(record.question, "question") : <><p className="study-source-note">{en ? "Text transcription is awaiting verification. The original question is retained for accuracy." : "文字版尚待逐題核驗，暫保留原題，避免公式及選項誤抄。"}</p><ScanImages yearId={year.id} paths={question.question} label={question.label}/></>}
      {error && <p role="alert">{en ? "Could not load text edition." : "未能載入文字版。"}<Button variant="outline" onClick={() => setRevision(revision + 1)}>{en ? "Retry" : "重新載入"}</Button></p>}
    </section>
    <Button className="stage-toggle" disabled={loading || error} aria-expanded={stage >= 2} aria-controls="official-stage" onClick={() => setStage(stage >= 2 ? 1 : 2)}>{stage >= 2 ? (en ? "Hide answers" : "收起解答") : (en ? "2. Check the HKEAA official answer" : "2. 展開考評局官方解答")}</Button>
    {stage >= 2 && <section className="study-stage" id="official-stage"><h3><span>2</span>{en ? "HKEAA official answer / marking scheme" : "考評局官方解答／評分參考"}</h3>
      {record?.officialScreenshotType === 'typeset' && <p className="study-source-note">{en ? 'Typeset answer screenshot' : '答案排版截圖'}</p>}
      {rich(officialAnswerHtml(record, question, year.id), "official")}
      <Button className="stage-toggle" variant="outline" aria-expanded={stage >= 3} aria-controls="reasoning-stage" onClick={() => setStage(stage >= 3 ? 2 : 3)}>{stage >= 3 ? (en ? "Hide reasoning" : "收起詳細思路") : (en ? "3. Understand the detailed reasoning" : "3. 展開詳細思路解答")}</Button>
    </section>}
    {stage >= 3 && <section className="study-stage" id="reasoning-stage"><h3><span>3</span>{en ? "Detailed reasoning" : "詳細思路解答"}</h3>{record?.reasoning ? rich(record.reasoning, "reasoning") : <p className="study-source-note">{en ? "Detailed reasoning for this question is awaiting verification. No generic explanation is presented as a completed solution." : "本題詳細思路尚待核驗；不以通用知識摘要冒充完整解答。"}</p>}</section>}
  </div>;
}
