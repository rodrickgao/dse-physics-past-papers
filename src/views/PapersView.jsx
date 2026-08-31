import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Eye, Search, Star, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";
import { imageUrl, networkFor, networkKey, questionIdentity, searchEntries, yearsFor } from "../lib/data";

function titleForPaper(paper, index, language) {
  if (language === "eng") return paper.title;
  return ["卷一甲部", "卷一乙部", "卷二", "考生表現報告"][index] || paper.title;
}

function ScanImages({ yearId, paths, label }) {
  if (!paths?.length) return null;
  return <div className="scan-stack">{paths.map((path, index) => <img key={path} src={imageUrl(yearId, path)} alt={`${label} ${index + 1}`} loading={index ? "lazy" : "eager"} decoding="async" />)}</div>;
}

export function PapersView({ language, mistakes, setMistake, targetKey, clearTarget, initialQuery = "", openKnowledge }) {
  const years = useMemo(() => yearsFor(language), [language]);
  const [yearIndex, setYearIndex] = useState(() => Math.max(0, years.length - 1));
  const [paperIndex, setPaperIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerOpen, setAnswerOpen] = useState(false);
  const [query, setQuery] = useState(initialQuery);
  const searchRef = useRef(null);

  useEffect(() => {
    setYearIndex((current) => Math.min(current, Math.max(0, years.length - 1)));
  }, [years]);
  useEffect(() => { if (initialQuery) setQuery(initialQuery); }, [initialQuery]);
  useEffect(() => {
    if (!targetKey) return;
    const [year, paperId, identity] = targetKey.split("|");
    const nextYear = years.findIndex((item) => String(item.year) === year);
    const nextPaper = ["paper-1a", "paper-1b", "paper-2"].indexOf(paperId);
    const paper = years[nextYear]?.papers[nextPaper];
    const nextQuestion = paper?.questions.findIndex((item, index) => questionIdentity(item, index) === identity) ?? -1;
    if (nextYear >= 0 && nextPaper >= 0 && nextQuestion >= 0) {
      setYearIndex(nextYear); setPaperIndex(nextPaper); setQuestionIndex(nextQuestion); setAnswerOpen(false);
    }
    clearTarget?.();
  }, [targetKey, years, clearTarget]);
  useEffect(() => {
    const handler = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const year = years[yearIndex] || years[0];
  const paper = year?.papers[paperIndex] || year?.papers[0];
  const question = paper?.questions[questionIndex] || paper?.questions[0];
  const key = year && paperIndex < 3 ? networkKey(year.year, paperIndex, questionIdentity(question, questionIndex)) : "";
  const network = year && paperIndex < 3 ? networkFor(year.year, paperIndex, question, questionIndex) : { links: [] };
  const results = useMemo(() => searchEntries(language, query).slice(0, 30), [language, query]);

  const selectYear = (index) => { setYearIndex(index); setPaperIndex(0); setQuestionIndex(0); setAnswerOpen(false); };
  const selectPaper = (index) => { setPaperIndex(index); setQuestionIndex(0); setAnswerOpen(false); };
  const selectQuestion = (index) => { setQuestionIndex(index); setAnswerOpen(false); };
  const openResult = (entry) => {
    setYearIndex(entry.yearIndex); setPaperIndex(entry.paperIndex); setQuestionIndex(entry.questionIndex); setQuery(""); setAnswerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const previous = () => questionIndex > 0 && selectQuestion(questionIndex - 1);
  const next = () => questionIndex < paper.questions.length - 1 && selectQuestion(questionIndex + 1);

  if (!year || !paper || !question) return <div className="empty-state">No paper data is available.</div>;
  return (
    <div className="papers-view page-enter">
      <div className="view-heading">
        <div><p className="page-kicker"><span /> {language === "eng" ? "PAST PAPERS" : "歷屆試題"}</p><h1>{language === "eng" ? "Past-paper workspace" : "真題練習工作台"}</h1><p>{language === "eng" ? "Move from question to answer without losing your place." : "選題、作答、查看答案，保持專注不中斷。"}</p></div>
        <div className="paper-progress"><strong>{questionIndex + 1}</strong><span>/ {paper.questions.length}</span></div>
      </div>

      <div className="paper-search-wrap">
        <Search />
        <Input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "eng" ? "Search year, question or concept" : "搜尋年份、題號或知識點"} />
        {query && <button onClick={() => setQuery("")} aria-label="Clear"><X /></button>}
      </div>
      {query && <Card className="search-results-panel">
        <div className="search-results-heading"><strong>{language === "eng" ? "Search results" : "搜尋結果"}</strong><span>{results.length}</span></div>
        <div className="search-result-list">{results.length ? results.map((entry) => <button key={`${entry.key}-${entry.year.id}`} onClick={() => openResult(entry)}><span><strong>{entry.year.year} · {titleForPaper(entry.paper, entry.paperIndex, language)} · {entry.question.label}</strong><small>{entry.chapter || entry.network.keywords}</small></span><ArrowRight /></button>) : <p>{language === "eng" ? "No matching questions." : "找不到相符題目。"}</p>}</div>
      </Card>}

      <div className="paper-layout">
        <aside className="paper-navigator">
          <div className="navigator-block"><p>{language === "eng" ? "YEAR" : "年份"}</p><div className="year-grid">{years.map((item, index) => <button key={item.id} className={cn(index === yearIndex && "active")} onClick={() => selectYear(index)}>{item.year}</button>)}</div></div>
          <div className="navigator-block"><p>{language === "eng" ? "PAPER" : "試卷"}</p><div className="paper-choice-list">{year.papers.map((item, index) => <button key={`${item.title}-${index}`} className={cn(index === paperIndex && "active")} onClick={() => selectPaper(index)}><span>{titleForPaper(item, index, language)}</span><small>{item.questions.length}</small></button>)}</div></div>
          <div className="navigator-block question-block"><p>{language === "eng" ? "QUESTION / PAGE" : "題目／頁數"}</p><div className="question-chip-grid">{paper.questions.map((item, index) => { const itemKey = paperIndex < 3 ? networkKey(year.year, paperIndex, questionIdentity(item, index)) : ""; return <button key={`${item.label}-${index}`} className={cn(index === questionIndex && "active", mistakes[itemKey] && "mistake")} onClick={() => selectQuestion(index)}>{item.label.replace("Page ", "P")}</button>; })}</div></div>
        </aside>

        <article className="question-card">
          <header className="question-header">
            <div><p>{year.year} · {titleForPaper(paper, paperIndex, language)}</p><h2>{question.label}</h2><span>{paper.description}</span></div>
            <div className="question-header-actions">
              {key && <Button variant={mistakes[key] ? "secondary" : "outline"} onClick={() => setMistake(key, !mistakes[key])}><Star className={cn(mistakes[key] && "fill-current")} />{mistakes[key] ? (language === "eng" ? "Saved" : "已加入錯題") : (language === "eng" ? "Save mistake" : "加入錯題")}</Button>}
              <div className="stepper"><Button variant="outline" size="icon" disabled={questionIndex === 0} onClick={previous} aria-label="Previous"><ArrowLeft /></Button><Button variant="outline" size="icon" disabled={questionIndex === paper.questions.length - 1} onClick={next} aria-label="Next"><ArrowRight /></Button></div>
            </div>
          </header>
          <div className="question-body">
            <ScanImages yearId={year.id} paths={question.question} label={`${year.year} ${question.label}`} />
            {!!network.links?.length && <section className="related-panel"><div><BookOpen /><strong>{language === "eng" ? "Related knowledge" : "相關課本知識"}</strong></div><div>{network.links.map((link) => <button key={`${link.sequence}-${link.type}`} onClick={() => openKnowledge(link.sequence)}><span>{link.code}</span>{language === "eng" ? link.chapterEn : link.chapterZh}</button>)}</div></section>}
            <Button className="answer-reveal-button" size="lg" variant={answerOpen ? "secondary" : "default"} onClick={() => setAnswerOpen(!answerOpen)}><Eye />{answerOpen ? (language === "eng" ? "Hide answer" : "收起答案") : (language === "eng" ? "Show answer" : "查看答案")}</Button>
            {answerOpen && <section className="answer-section page-enter"><div className="answer-title"><CheckCircle2 /><div><strong>{language === "eng" ? "Answer / marking scheme" : "答案／評分參考"}</strong><span>{question.answerText ? `${language === "eng" ? "Correct option" : "正確選項"}: ${question.answerText}` : ""}</span></div></div><ScanImages yearId={year.id} paths={question.answer} label={`${year.year} answer`} />{!question.answer?.length && question.answerText && <div className="mc-answer">{question.answerText}</div>}</section>}
          </div>
        </article>
      </div>
    </div>
  );
}
