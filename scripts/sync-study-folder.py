"""Copy the user's finished PDFs and record exact Word/PDF source correspondence.

Does not re-import the OCR sibling folders or overwrite canonical reviewed answers.
"""
from pathlib import Path
from collections import Counter
import argparse,hashlib,json,re,shutil
from docx import Document

def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('folder',type=Path);args=ap.parse_args()
 repo=Path(__file__).resolve().parents[1];out=repo/'downloads';out.mkdir(exist_ok=True)
 raw=(repo/'textbook-data.js').read_text(encoding='utf-8');data=json.JSONDecoder().raw_decode(raw[raw.index('{'):])[0]
 files=[]
 for lang,label in [('eng','英文版'),('chn','中文版')]:
  folder=args.folder/label
  knowledge=list(folder.glob('*.docx'));knowledge=[p for p in knowledge if not p.name.startswith('~$')]
  assert len(knowledge)==1,knowledge
  doc=knowledge[0];pdf=doc.with_suffix('.pdf');assert pdf.exists(),pdf
  headings=[p.text for p in Document(doc).paragraphs if p.style.name=='Heading 3']
  counts=Counter();expected=[]
  for point in data['languages'][lang]:
   code=point['code'];m=re.fullmatch(r'(E?)(\d)[AB]?(\d{2})',code);assert m
   counts[(point['book'],code)]+=1
   number=f'{m[1]}{m[2]}.{int(m[3])}.{counts[(point["book"],code)]}'
   expected.append(number);point['number']=number
  assert headings==expected and len(headings)==365
  pairs=[('knowledge',None,None,doc,pdf)]
  papers=[p for p in folder.rglob('*.docx') if 'word版' in p.parts and not p.name.startswith('~$')]
  assert len(papers)==42
  for word in papers:
   m=re.match(r'(20\d{2})_HKDSE_Physics_Paper_(1A|1B|2)_',word.name);assert m
   candidates=[p for p in folder.rglob(word.stem+'.pdf') if 'pdf版' in p.parts];assert len(candidates)==1
   pairs.append(('paper',int(m[1]),{'1A':'paper-1a','1B':'paper-1b','2':'paper-2'}[m[2]],word,candidates[0]))
  for kind,year,paper,word,pdf in pairs:
   target=out/lang/(f'{year}-{paper}.pdf' if year else 'knowledge.pdf');target.parent.mkdir(exist_ok=True)
   shutil.copyfile(pdf,target);assert digest(pdf)==digest(target)
   files.append(dict(kind=kind,language=lang,year=year,paper=paper,name=pdf.name,url=target.relative_to(repo).as_posix(),sha256=digest(pdf),wordSha256=digest(word),source=pdf.relative_to(args.folder).as_posix(),wordSource=word.relative_to(args.folder).as_posix()))
 (out/'catalog.json').write_text(json.dumps(dict(version='2026-09-15',files=files),ensure_ascii=False,indent=2),encoding='utf-8')
 (repo/'textbook-data.js').write_text('window.DSE_TEXTBOOK_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 print('Synced',len(files),'PDFs; 365 matching knowledge numbers per language')
if __name__=='__main__':main()
