import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Check, Clipboard, FileQuestion, Search, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { booksFor, pointsByLanguage, questionLabelFromKey, relatedQuestionKeys, searchable } from "../lib/data";
import { SourceDownload } from "../components/SourceDownload";
import { cn } from "../lib/utils";
import { TextbookContent } from "../components/TextbookContent";

const BOOK_TONES = ["#a74050", "#287248", "#906e0e", "#396fd0", "#aa5722", "#576577", "#576577", "#576577", "#576577"];

function PointCard({ point, language, openPaper }) {
  const [copied, setCopied] = useState(false);
  const members = point.members || [point];
  const questionKeys = relatedQuestionKeys(members.filter(member => !member.is_governing_law).map(member => member.sequence));
  const chapters = [...new Set(members.map(member => member.chapter))];
  const books = [...new Set(members.map(member => member.book))];
  const [copyError, setCopyError] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText([...new Set(members.map(member => `${member.number} · ${member.chapter}`)), ...(point.formula_latex || []).map(f => `$$${f}$$`), point.content].join('\n'));
      setCopyError(false); setCopied(true); window.setTimeout(() => setCopied(false), 1000);
    } catch { setCopyError(true); }
  };
  return (
    <Card className="knowledge-point-card" id={`point-${point.sequence}`} data-knowledge-sequences={members.map(member => member.sequence).join(',')} style={{ '--point-border': point.card_style?.border, '--point-tint': point.card_style?.background }}>
      {members.slice(1).map(member => <span key={member.sequence} id={`point-${member.sequence}`} className="knowledge-anchor" aria-hidden="true" />)}
      <div className="knowledge-point-head">
        <div><span>{members.map(member => member.number).join(' · ')}</span><strong>{[...new Set(members.map(member => member.code))].join(' · ')}</strong></div>
        <Button variant="ghost" size="icon" onClick={copy} aria-label={language === 'eng' ? 'Copy knowledge point' : '複製知識點'} title={language === 'eng' ? 'Copy knowledge point' : '複製知識點'}>{copied ? <Check /> : <Clipboard />}</Button>
      </div>
      {copyError && <p role="status">{language === 'eng' ? 'Clipboard unavailable.' : '無法使用剪貼簿。'}</p>}
      <TextbookContent point={point} language={language} />
      <div className="knowledge-meta"><span>{books.length > 1 ? books.join(' / ') : chapters.join(' / ')}</span></div>
      {!!questionKeys.length && <div className="knowledge-questions"><span><FileQuestion /> {language === "eng" ? "Related questions" : "相關真題"} · {questionKeys.length}</span><div>{questionKeys.slice(0, 10).map((key) => <button key={key} onClick={() => openPaper(key)}>{questionLabelFromKey(key)}</button>)}</div>{questionKeys.length > 10 && <details><summary>{language === 'eng' ? `Show ${questionKeys.length - 10} more` : `展開其餘 ${questionKeys.length - 10} 題`}</summary><div>{questionKeys.slice(10).map(key => <button key={key} onClick={() => openPaper(key)}>{questionLabelFromKey(key)}</button>)}</div></details>}</div>}
    </Card>
  );
}

export function TextbookView({ language, targetSequence, clearTarget, openPaper }) {
  const books = useMemo(() => booksFor(language), [language]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [chapter, setChapter] = useState("all");
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    if (!targetSequence) return;
    const nextBook = books.findIndex((book) => book.points.some((point) => Number(point.sequence) === Number(targetSequence)));
    const point = books[nextBook]?.points.find((item) => Number(item.sequence) === Number(targetSequence));
    if (nextBook >= 0 && point) {
      setSelectedBook(nextBook); setChapter(point.code); setQuery("");
      window.setTimeout(() => document.getElementById(`point-${targetSequence}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    }
    clearTarget?.();
  }, [targetSequence, books, clearTarget]);

  const allPoints = pointsByLanguage[language] || [];
  const normalized = searchable(query);
  const searchResults = normalized ? allPoints.filter((point) => searchable([point.number, point.sequence, point.code, point.chapter, point.content, point.formula, point.formula_notes, point.category_en, point.category_zh].join(" ")).includes(normalized)) : [];
  const activeBook = selectedBook === null ? null : books[selectedBook];
  const chapters = activeBook ? [...new Map(activeBook.points.map((point) => [point.code, point.chapter])).entries()] : [];
  const visiblePoints = activeBook ? activeBook.points.filter((point) => chapter === "all" || point.code === chapter) : [];
  const searchCards = searchResults;
  const visibleCards = visiblePoints;

  return (
    <div className="textbook-view page-enter">
      <div className="view-heading textbook-heading">
        <div><h1>{language === "eng" ? "Textbook knowledge" : "課本知識庫"}</h1></div>
        <SourceDownload language={language} /><div className="textbook-count"><strong>365</strong><span>{language === "eng" ? "knowledge points" : "個知識點"}</span></div>
      </div>
      <div className="knowledge-search-wrap"><Search /><Input ref={searchRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "eng" ? "Search all knowledge points" : "搜尋全部知識點"} />{query && <button onClick={() => setQuery("")}><X /></button>}</div>

      {query ? <section className="knowledge-search-results"><div className="directory-heading"><div><p>{language === "eng" ? "SEARCH RESULTS" : "搜尋結果"}</p><h2>{searchCards.length} {language === "eng" ? "matches" : "個結果"}</h2></div></div><div className="knowledge-card-list">{searchCards.map((point) => <PointCard key={point.sequence} point={point} language={language} openPaper={openPaper} />)}</div></section>
      : selectedBook === null ? <section className="book-directory">
        <div className="directory-heading"><div><p>{language === "eng" ? "TEXTBOOK DIRECTORY" : "課本目錄"}</p><h2>{language === "eng" ? "Choose a book" : "選擇課本"}</h2></div><span>{books.length} BOOKS</span></div>
        <div className="book-grid">{books.map((book, index) => <button key={book.name} className="book-card" style={{ "--book-tone": BOOK_TONES[index] }} onClick={() => { setSelectedBook(index); setChapter("all"); }}><span className="book-number">{String(index + 1).padStart(2, "0")}</span><span className="book-icon"><BookOpen /></span><strong>{book.name}</strong><small>{new Set(book.points.map((point) => point.code)).size} {language === "eng" ? "chapters" : "章"} · {book.points.length} {language === "eng" ? "points" : "個知識點"}</small></button>)}</div>
      </section>
      : <div className="textbook-browser">
        <aside className="chapter-sidebar">
          <Button variant="ghost" className="back-books" onClick={() => setSelectedBook(null)}><ArrowLeft />{language === "eng" ? "All books" : "所有課本"}</Button>
          <div className="active-book-name" style={{ "--book-tone": BOOK_TONES[selectedBook] }}><span><BookOpen /></span><div><strong>{activeBook.name}</strong><small>{activeBook.points.length} {language === "eng" ? "points" : "個知識點"}</small></div></div>
          <p className="chapter-label">{language === "eng" ? "CHAPTERS" : "章節"}</p>
          <div className="chapter-list"><button className={cn(chapter === "all" && "active")} onClick={() => setChapter("all")}><span>{language === "eng" ? "All chapters" : "全部章節"}</span><small>{activeBook.points.length}</small></button>{chapters.map(([code, name]) => <button key={code} className={cn(chapter === code && "active")} onClick={() => setChapter(code)}><span><b>{code}</b>{name}</span><small>{activeBook.points.filter((point) => point.code === code).length}</small></button>)}</div>
        </aside>
        <section className="knowledge-browser-content"><div className="knowledge-browser-heading"><p>{activeBook.name}</p><h2>{chapter === "all" ? (language === "eng" ? "All knowledge points" : "全部知識點") : chapters.find(([code]) => code === chapter)?.[1]}</h2><span>{visibleCards.length} {language === "eng" ? "cards" : "張卡片"}</span></div><div className="knowledge-card-list">{visibleCards.map((point) => <PointCard key={point.sequence} point={point} language={language} openPaper={openPaper} />)}</div></section>
      </div>}
    </div>
  );
}
