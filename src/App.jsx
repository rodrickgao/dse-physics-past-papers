import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Atom, BookOpen, ChevronRight, CircleAlert, FileQuestion, Home, Languages, Moon, Search, Sun } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { cn } from "./lib/utils";
import { entriesByLanguage, statistics } from "./lib/data";
import { PapersView } from "./views/PapersView";
import { TextbookView } from "./views/TextbookView";
import { MistakesView } from "./views/MistakesView";
import { pageHash, readRoute, readSaved, writeSaved } from "./lib/study-state";

const MISTAKE_STORAGE_KEY = "dse-physics-mistakes-v1";
const THEME_STORAGE_KEY = "dse-physics-theme-v1";
const NAVIGATION = [
  { id: "home", zh: "主頁", en: "Home", icon: Home },
  { id: "papers", zh: "真題庫", en: "Past papers", icon: FileQuestion },
  { id: "textbook", zh: "課本知識庫", en: "Knowledge", icon: BookOpen },
  { id: "mistakes", zh: "錯題庫", en: "Mistakes", icon: CircleAlert },
];

function Sidebar({ page, navigate, dark, toggleDark, language, mistakeCount }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => navigate("home")}><span className="brand-mark"><Atom /></span><span><strong>DSE Physics</strong><small>Study Library</small></span></button>
    <nav className="nav-list" aria-label="Main navigation">{NAVIGATION.map(({ id, zh, en, icon: Icon }) => <button key={id} aria-current={page === id ? "page" : undefined} className={cn("nav-item", page === id && "active")} onClick={() => navigate(id)}><Icon /><span><strong>{language === "eng" ? en : zh}</strong></span>{id === "mistakes" && mistakeCount > 0 ? <em className="nav-count">{mistakeCount}</em> : page === id && <span className="nav-dot" />}</button>)}</nav>
    <div className="sidebar-footer"><Button variant="ghost" className="theme-button" onClick={toggleDark}>{dark ? <Sun /> : <Moon />}{dark ? (language === "eng" ? "Light mode" : "淺色模式") : (language === "eng" ? "Dark mode" : "深色模式")}</Button></div>
  </aside>;
}

function Topbar({ language, setLanguage, submitSearch, page }) {
  const [query, setQuery] = useState("");
  const search = useRef(null);
  useEffect(() => {
    const focus = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        (document.getElementById('paper-search') || search.current)?.focus();
      }
    };
    window.addEventListener('keydown', focus);
    return () => window.removeEventListener('keydown', focus);
  }, []);
  const submit = (event) => { event.preventDefault(); submitSearch(query); };
  return <header className="topbar">{page === 'papers' ? <div className="workspace-breadcrumb"><Atom/><span>DSE Physics</span><ChevronRight/><strong>{language === 'eng' ? 'Past papers' : '真題庫'}</strong></div> : <form className="global-search" onSubmit={submit}><Search /><input ref={search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "eng" ? "Search year, question or concept" : "搜尋年份、題號或知識點"} aria-label="Global search" /></form>}<div className="topbar-actions"><Button variant="ghost" size="icon" onClick={() => setLanguage(language === "eng" ? "chn" : "eng")} aria-label="Switch language"><Languages /></Button><button className="language-pill" onClick={() => setLanguage(language === "eng" ? "chn" : "eng")}>{language === "eng" ? "ENG" : "中文"}</button></div></header>;
}

function HomeView({ language, navigate, mistakeCount }) {
  const isEnglish = language === "eng";
  const sections = [
    { id: "papers", index: "01", title: isEnglish ? "Past papers" : "真題庫", metric: entriesByLanguage[language].length, metricLabel: isEnglish ? "questions · 2012–2025" : "道題 · 2012–2025", icon: FileQuestion, tone: "blue" },
    { id: "textbook", index: "02", title: isEnglish ? "Textbook knowledge" : "課本知識庫", metric: statistics.summary.knowledgePointCount, metricLabel: isEnglish ? "knowledge points" : "個知識點", icon: BookOpen, tone: "amber" },
    { id: "mistakes", index: "03", title: isEnglish ? "Mistake review" : "錯題庫", metric: mistakeCount, metricLabel: isEnglish ? "to review" : "道待複習", icon: CircleAlert, tone: "rose" },
  ];
  return <div className="home-view page-enter">
    <section className="welcome-row"><h1>DSE Physics</h1></section>
    <section className="section-grid">{sections.map(({ id, index, title, metric, metricLabel, icon: Icon, tone }) =>
      <Card key={id} className={cn("library-card", `tone-${tone}`)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(id); } }} onClick={() => navigate(id)}>
        <CardHeader><div className="library-card-top"><span className="library-icon"><Icon /></span><span className="card-index">{index}</span></div><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent><div className="metric"><strong>{metric}</strong><span>{metricLabel}</span></div><span className="open-link" aria-hidden="true"><ArrowRight /></span></CardContent>
      </Card>
    )}</section>
  </div>;
}

export function App() {
  const [page, setPage] = useState(() => readRoute(location.hash).page);
  const [language, setLanguage] = useState(() => { try { const saved = localStorage.getItem("dse-physics-language-v1"); return ["eng", "chn"].includes(saved) ? saved : "chn"; } catch { return "chn"; } });
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [mistakes, setMistakes] = useState(() => { const saved = readSaved(MISTAKE_STORAGE_KEY, {}); return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}; });
  const lastPaper = useRef(readRoute(location.hash).question || readSaved('dse-physics-last-question-v1', ''));
  const [paperTarget, setPaperTarget] = useState(lastPaper.current);
  const [knowledgeTarget, setKnowledgeTarget] = useState(null);
  const [paperQuery, setPaperQuery] = useState("");
  const dataReady = Boolean(window.DSE_SITE_DATA && window.DSE_TEXTBOOK_DATA && window.DSE_STATISTICS);
  const navigate = useCallback((next) => { setPage(next); if (next !== "papers") setPaperQuery(""); if (next === 'papers') setPaperTarget(lastPaper.current); const hash = pageHash(next, lastPaper.current); if (location.hash !== hash) history.pushState({ page: next }, "", hash); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  useEffect(() => { const handler = () => { const route = readRoute(location.hash); setPage(route.page); if (route.page === 'papers') setPaperTarget(route.question || lastPaper.current); }; addEventListener("popstate", handler); addEventListener('hashchange', handler); return () => { removeEventListener("popstate", handler); removeEventListener('hashchange', handler); }; }, []);
  useEffect(() => { try { localStorage.setItem("dse-physics-language-v1", language); } catch { /* Reading remains available in private browsers. */ } document.documentElement.lang = language === "eng" ? "en" : "zh-Hant"; }, [language]);
  const toggleDark = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); try { localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light"); } catch { /* Session-only preference. */ } };
  const [storageError, setStorageError] = useState(false);
  const setMistake = (key, marked) => { const next = { ...mistakes }; if (marked) next[key] = { markedAt: new Date().toISOString() }; else delete next[key]; setStorageError(!writeSaved(MISTAKE_STORAGE_KEY, next)); setMistakes(next); };
  const openPaper = (key) => { lastPaper.current = key; navigate("papers"); };
  const rememberQuestion = useCallback((key) => { lastPaper.current = key; writeSaved('dse-physics-last-question-v1', key); if (readRoute(location.hash).page === 'papers') history.replaceState({}, '', pageHash('papers', key)); }, []);
  const openKnowledge = (sequence) => { setKnowledgeTarget(Number(sequence)); navigate("textbook"); };
  const submitSearch = (query) => { setPaperQuery(query); navigate("papers"); };
  const clearPaperTarget = useCallback(() => setPaperTarget(""), []);
  const clearKnowledgeTarget = useCallback(() => setKnowledgeTarget(null), []);
  if (!dataReady) return <div className="fatal-state">Study data could not be loaded.</div>;
  return <div className="app-shell"><a className="skip-link" href="#main-content" onClick={(e) => { e.preventDefault(); document.getElementById("main-content")?.focus(); }}>{language === "eng" ? "Skip to content" : "跳至主要內容"}</a><Sidebar page={page} navigate={navigate} dark={dark} toggleDark={toggleDark} language={language} mistakeCount={Object.keys(mistakes).length} /><div className="app-main"><Topbar language={language} setLanguage={setLanguage} submitSearch={submitSearch} page={page} /><main id="main-content" tabIndex={-1} className="content">{storageError && <p className="export-error" role="alert">{language === "eng" ? "Browser storage is unavailable. Changes will last for this session only." : "瀏覽器儲存不可用，這次變更只會保留至本次使用結束。"}</p>}{page === "home" && <HomeView language={language} navigate={navigate} mistakeCount={Object.keys(mistakes).length} />}{page === "papers" && <PapersView language={language} mistakes={mistakes} setMistake={setMistake} targetKey={paperTarget} clearTarget={clearPaperTarget} initialQuery={paperQuery} onQuestionChange={rememberQuestion} openKnowledge={openKnowledge} />}{page === "textbook" && <TextbookView language={language} targetSequence={knowledgeTarget} clearTarget={clearKnowledgeTarget} openPaper={openPaper} />}{page === "mistakes" && <MistakesView language={language} mistakes={mistakes} setMistake={setMistake} openPaper={openPaper} browsePapers={() => navigate("papers")} />}</main></div><nav className="mobile-nav" aria-label="Mobile navigation">{NAVIGATION.map(({ id, zh, en, icon: Icon }) => <button key={id} aria-current={page === id ? "page" : undefined} className={cn(page === id && "active")} onClick={() => navigate(id)}><Icon /><span>{language === "eng" ? en : zh.replace("庫", "")}</span></button>)}</nav></div>;
}
