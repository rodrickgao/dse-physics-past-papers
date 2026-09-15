import { useEffect, useMemo, useRef, useState } from 'react';
import { Expand, X } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function Equation({ latex, inline = false }) {
  const html = useMemo(() => katex.renderToString(latex, {
    displayMode: !inline, throwOnError: false, trust: false, output: 'htmlAndMathml',
  }), [latex, inline]);
  return inline ? <span dangerouslySetInnerHTML={{ __html: html }} />
    : <div className="knowledge-equation" tabIndex={0} dangerouslySetInnerHTML={{ __html: html }} />;
}

function Notation({ text }) {
  return String(text).split(/([A-Za-z\u0370-\u03ff]+_[A-Za-z0-9]+)/g).map((part, i) => {
    const match = /^([A-Za-z\u0370-\u03ff]+)_([A-Za-z0-9]+)$/.exec(part);
    return match ? <Equation key={i} inline latex={`${match[1]}_{\\mathrm{${match[2]}}}`} /> : part;
  });
}

function SourceImage({ figure, language, onOpen }) {
  return <figure className="textbook-figure">
    <button className="textbook-image-button" onClick={() => onOpen(figure)} title={language === 'eng' ? 'Enlarge original figure' : '放大課本原圖'}>
      <img src={figure.src} width={figure.width} height={figure.height} alt={figure.caption} loading="lazy" />
      <Expand aria-hidden="true" />
    </button>
    <figcaption><Notation text={figure.caption} /><small>{language === 'eng' ? 'English textbook original' : '英文課本原圖'} · {figure.source} · PDF {figure.page}</small></figcaption>
  </figure>;
}

export function TextbookContent({ point, language }) {
  const [expanded, setExpanded] = useState(null);
  const dialog = useRef(null);
  useEffect(() => {
    if (expanded) dialog.current?.showModal();
    else dialog.current?.close();
  }, [expanded]);
  return <>
    {point.formula_latex?.length ? <section className="knowledge-formulas" aria-label={language === 'eng' ? 'Formula and notation' : '公式及符號'}>
      {point.formula_latex.map((latex, i) => <Equation key={i} latex={latex} />)}
      <p className="knowledge-notation"><Notation text={point.formula_notes} /></p>
    </section> : <div className="knowledge-content">{point.content.split('\n').filter(Boolean).map((text, i) => <p key={i}><Notation text={text} /></p>)}</div>}
    {point.figures?.map(figure => <SourceImage key={figure.id} figure={figure} language={language} onOpen={setExpanded} />)}
    {(point.members || [point]).filter(member => member.source_crop).map(member => <details className="knowledge-source" key={member.sequence}>
      <summary>{point.members?.length > 1 && `#${String(member.sequence).padStart(3, '0')} · `}{language === 'eng' ? 'Textbook source excerpt' : '課本原文對照'} · PDF {member.page} · {language === 'eng' ? 'Box' : '重點框'} {member.box}</summary>
      <p>{member.source}</p>
      <button className="textbook-image-button" onClick={() => setExpanded({ ...member.source_crop, caption: `${member.code} · PDF ${member.page} · ${language === 'eng' ? 'Box' : '重點框'} ${member.box}` })} title={language === 'eng' ? 'Enlarge source excerpt' : '放大原文'}>
        <img src={member.source_crop.src} width={member.source_crop.width} height={member.source_crop.height} alt={`${member.code} · PDF ${member.page} · ${language === 'eng' ? 'Box' : '重點框'} ${member.box}`} loading="lazy" />
        <Expand aria-hidden="true" />
      </button>
    </details>)}
    <dialog ref={dialog} className="textbook-image-dialog" onCancel={() => setExpanded(null)} onClick={event => { if (event.target === event.currentTarget) setExpanded(null); }} aria-label={language === 'eng' ? 'Original textbook image' : '課本原圖'}>
      <div className="textbook-dialog-head"><span>{expanded?.source} · PDF {expanded?.page}</span><button onClick={() => setExpanded(null)} aria-label={language === 'eng' ? 'Close image' : '關閉圖片'}><X /></button></div>
      {expanded && <><img src={expanded.src} alt={expanded.caption} /><p><Notation text={expanded.caption} /></p></>}
    </dialog>
  </>;
}
