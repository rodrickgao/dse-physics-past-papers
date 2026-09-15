import manifest from '../../downloads/catalog.json';

export function SourceDownload({ language, year, paper }) {
  const file = manifest.files.find(item => item.language === language && (year
    ? item.kind === 'paper' && item.year === Number(year) && item.paper === paper
    : item.kind === 'knowledge'));
  if (!file) return null;
  return <a className="source-download" href={file.url} download={file.name}>
    {language === 'eng' ? (year ? 'Download worked paper PDF' : 'Download knowledge PDF') : (year ? '下載全卷詳解 PDF' : '下載知識點 PDF')}
  </a>;
}
