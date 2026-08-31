import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Atom, BookOpen, ChevronRight, CircleAlert, Command, FileQuestion, Home, Languages, Moon, Search, Sparkles, Sun } from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { cn } from "./lib/utils";
import { entriesByLanguage, statistics } from "./lib/data";
import { PapersView } from "./views/PapersView";
import { TextbookView } from "./views/TextbookView";
import { MistakesView } from "./views/MistakesView";

const MISTAKE_STORAGE_KEY = "dse-physics-mistakes-v1";
const THEME_STORAGE_KEY = "dse-physics-theme-v1";
const NAVIGATION = [
  { id: "home", zh: "主頁", en: "Home", note: "Overview", icon: Home },
  { id: "papers", zh: "真題庫", en: "Past papers", note: "Past papers", icon: FileQuestion },
  { id: "textbook", zh: "課本知識庫", en: "Knowledge", note: "Knowledge", icon: BookOpen },
  { id: "mistakes", zh: "錯題庫", en: "Mistakes", note: "My mistakes", icon: CircleAlert },
];

function Sidebar({ page, navigate, dark, toggleDark, language, mistakeCount }) {
  return <aside className="sidebar">
    <button className="brand" onClick={() => navigate("home")}><span className="brand-mark"><Atom /></span><span><strong>DSE Physics</strong><small>Study Library</small></span></button>
    <nav className="nav-list" aria-label="Main navigation"><p className="nav-eyebrow">{language === "eng" ? "STUDY SPACE" : "學習空間"}</p>{NAVIGATION.map(({ id, zh, en, note, icon: Icon }) => <button key={id} className={cn("nav-item", page === id && "active")} onClick={() => navigate(id)}><Icon /><span><strong>{language === "eng" ? en : zh}</strong><small>{note}</small></span>{id === "mistakes" && mistakeCount > 0 ? <em className="nav-count">{mistakeCount}</em> : page === id && <span className="nav-dot" />}</button>)}</nav>
    <div className="sidebar-footer"><button className="focus-card" onClick={() => navigate("papers")}><span><Sparkles /></span><div><strong>{language === "eng" ? "Daily review" : "今日複習"}</strong><small>{language === "eng" ? "Start with one question" : "從一道真題開始"}</small></div><ChevronRight /></button><Button variant="ghost" className="theme-button" onClick={toggleDark}>{dark ? <Sun /> : <Moon />}{dark ? (language === "eng" ? "Light mode" : "淺色模式") : (language === "eng" ? "Dark mode" : "深色模式")}</Button></div>
  </aside>;
}

function Topbar({ language, setLanguage, submitSearch }) {
  const [query, setQuery] = useState("");
  const submit = (event) => { event.preventDefault(); submitSearch(query); };
  return <header className="topbar"><form className="global-search" onSubmit={submit}><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={language === "eng" ? "Search year, question or concept" : "搜尋年份、題號或知識點"} aria-label="Global search" /><kbd><Command /> K</kbd></form><div className="topbar-actions"><Button variant="ghost" size="icon" onClick={() => setLanguage(language === "eng" ? "chn" : "eng")} aria-label="Switch language"><Languages /></Button><button className="language-pill" onClick={() => setLanguage(language === "eng" ? "chn" : "eng")}>{language === "eng" ? "ENG" : "中文"}</button></div></header>;
}

function HomeView({ language, navigate, mistakeCount, openRandom }) {
  const isEnglish = language === "eng";
  const sections = [
    { id: "papers", index: "01", title: isEnglish ? "Past papers" : "真題庫", description: isEnglish ? "2012–2024 original questions, answers and marking schemes." : "2012–2024 中英文原題、答案與評卷參考。", metric: statistics.summary.uniqueQuestions, metricLabel: isEnglish ? "questions" : "道真題", icon: FileQuestion, tone: "blue" },
    { id: "textbook", index: "02", title: isEnglish ? "Textbook knowledge" : "課本知識庫", description: isEnglish ? "Core concepts across five compulsory and four elective books." : "必修 1–5、選修 1–4，按章節整理核心概念。", metric: statistics.summary.knowledgePointCount, metricLabel: isEnglish ? "knowledge points" : "個知識點", icon: BookOpen, tone: "amber" },
    { id: "mistakes", index: "03", title: isEnglish ? "Mistake review" : "錯題庫", description: isEnglish ? "Save mistakes and reveal the chapters that need attention." : "收藏錯題，自動找出最需要加強的章節。", metric: mistakeCount, metricLabel: isEnglish ? "to review" : "道待複習", icon: CircleAlert, tone: "rose" },
  ];
  return <div className="home-view page-enter"><section className="welcome-row"><div><p className="page-kicker"><span /> DSE PHYSICS WORKSPACE</p><h1>{isEnglish ? "Where would you like to begin?" : "今天想從哪裡開始？"}</h1><p>{isEnglish ? "Past papers, textbook essentials and personal mistakes in one calm study space." : "真題、課本重點和個人錯題，集中在一個安靜、清晰的學習空間。"}</p></div></section><section className="section-grid">{sections.map(({ id, index, title, description, metric, metricLabel, icon: Icon, tone }) => <Card key={id} className={cn("library-card", `tone-${tone}`)} onClick={() => navigate(id)}><CardHeader><div className="library-card-top"><span className="library-icon"><Icon /></span><span className="card-index">{index}</span></div><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent><div className="metric"><strong>{metric}</strong><span>{metricLabel}</span></div><span className="open-link">{isEnglish ? "Start" : "開始溫習"} <ArrowRight /></span></CardContent></Card>)}</section><section className="continue-panel"><div className="continue-copy"><span className="continue-icon"><FileQuestion /></span><div><p>{isEnglish ? "QUICK START" : "快速開始"}</p><h2>{isEnglish ? "Try a random past-paper question" : "隨機挑選一道歷屆真題"}</h2><span>{isEnglish ? "Think it through before revealing the answer." : "在答案揭曉前，先完成一次完整思考。"}</span></div></div><Button size="lg" onClick={openRandom}>{isEnglish ? "Start question" : "開始做題"} <ArrowRight /></Button></section></div>;
}

export function App() {
  const [page, setPage] = useState(() => location.hash.replace("#", "") || "home");
  const [language, setLanguage] = useState(() => localStorage.getItem("dse-physics-language-v1") || "chn");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [mistakes, setMistakes] = useState(() => { try { return JSON.parse(localStorage.getItem(MISTAKE_STORAGE_KEY) || "{}"); } catch { return {}; } });
  const [paperTarget, setPaperTarget] = useState("");
  const [knowledgeTarget, setKnowledgeTarget] = useState(null);
  const [paperQuery, setPaperQuery] = useState("");
  const dataReady = Boolean(window.DSE_SITE_DATA && window.DSE_TEXTBOOK_DATA && window.DSE_STATISTICS);
  const navigate = useCallback((next) => { setPage(next); history.pushState({ page: next }, "", `#${next}`); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  useEffect(() => { const handler = () => setPage(location.hash.replace("#", "") || "home"); addEventListener("popstate", handler); return () => removeEventListener("popstate", handler); }, []);
  useEffect(() => { localStorage.setItem("dse-physics-language-v1", language); document.documentElement.lang = language === "eng" ? "en" : "zh-Hant"; }, [language]);
  const toggleDark = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light"); };
  const setMistake = (key, marked) => { setMistakes((current) => { const next = { ...current }; if (marked) next[key] = { markedAt: new Date().toISOString() }; else delete next[key]; localStorage.setItem(MISTAKE_STORAGE_KEY, JSON.stringify(next)); return next; }); };
  const openPaper = (key) => { setPaperTarget(key); navigate("papers"); };
  const openKnowledge = (sequence) => { setKnowledgeTarget(Number(sequence)); navigate("textbook"); };
  const submitSearch = (query) => { setPaperQuery(query); navigate("papers"); };
  const openRandom = () => { const entries = entriesByLanguage[language]; openPaper(entries[Math.floor(Math.random() * entries.length)].key); };
  const clearPaperTarget = useCallback(() => setPaperTarget(""), []);
  const clearKnowledgeTarget = useCallback(() => setKnowledgeTarget(null), []);
  if (!dataReady) return <div className="fatal-state">Study data could not be loaded.</div>;
  return <div className="app-shell"><Sidebar page={page} navigate={navigate} dark={dark} toggleDark={toggleDark} language={language} mistakeCount={Object.keys(mistakes).length} /><div className="app-main"><Topbar language={language} setLanguage={setLanguage} submitSearch={submitSearch} /><main className="content">{page === "home" && <HomeView language={language} navigate={navigate} mistakeCount={Object.keys(mistakes).length} openRandom={openRandom} />}{page === "papers" && <PapersView language={language} mistakes={mistakes} setMistake={setMistake} targetKey={paperTarget} clearTarget={clearPaperTarget} initialQuery={paperQuery} openKnowledge={openKnowledge} />}{page === "textbook" && <TextbookView language={language} targetSequence={knowledgeTarget} clearTarget={clearKnowledgeTarget} openPaper={openPaper} />}{page === "mistakes" && <MistakesView language={language} mistakes={mistakes} setMistake={setMistake} openPaper={openPaper} browsePapers={() => navigate("papers")} />}</main></div><nav className="mobile-nav" aria-label="Mobile navigation">{NAVIGATION.map(({ id, zh, en, icon: Icon }) => <button key={id} className={cn(page === id && "active")} onClick={() => navigate(id)}><Icon /><span>{language === "eng" ? en : zh.replace("庫", "")}</span></button>)}</nav></div>;
}
