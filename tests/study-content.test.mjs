import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {printableQuestion,printDocumentHtml,escapeHtml} from '../src/lib/study-content.js';
const entry={key:'2024|paper-1a|1',year:{year:2024,id:'2024-eng'},paperIndex:0,question:{label:'Q1',question:['p1a/q01.jpg'],answerText:'B'}};
const content={question:'<p>mass / kg <sup>2</sup></p>',official:'<p>OFFICIAL B</p>',reasoning:'<p>REASONING</p>'};
test('practice export excludes answers and reserves bounded writing space',()=>{
 const html=printableQuestion(entry,content,{language:'eng',mode:'questions',spaceMm:80});
 assert.match(html,/height:80mm/);assert.doesNotMatch(html,/OFFICIAL|REASONING/);assert.match(html,/<sup>2<\/sup>/);
 assert.match(printableQuestion(entry,content,{language:'eng',mode:'questions',spaceMm:999}),/height:120mm/);
});
test('worked export preserves all three ordered stages without writing space',()=>{
 const html=printableQuestion(entry,content,{language:'chn',mode:'detailed'});
 assert.ok(html.indexOf('mass')<html.indexOf('OFFICIAL'));assert.ok(html.indexOf('OFFICIAL')<html.indexOf('REASONING'));
 assert.doesNotMatch(html,/working-space/);
});
test('missing transcription remains an explicitly labelled original scan',()=>{
 const html=printableQuestion(entry,null,{language:'chn',mode:'detailed'});
 assert.match(html,/assets\/2024-eng\/p1a\/q01.jpg/);assert.match(html,/尚待核驗/);
});
test('print format matches bilingual Word typography and colours',()=>{
 const html=printDocumentHtml([entry],[content],{language:'chn',mode:'detailed',baseUrl:'https://example.org/papers/'});
 for(const value of ['Times New Roman','SimSun','color:#f00','color:#0000ff','size:letter','break-before:page','border:0'])assert.ok(html.includes(value),value);
 assert.equal(escapeHtml('<script>"&'),'&lt;script&gt;&quot;&amp;');
});
test('published study blocks contain only local assets and no active content',()=>{
 for(const file of fs.readdirSync('text-papers').filter(x=>/^20\d\d-(eng|chn)\.json$/.test(x))){
  const data=JSON.parse(fs.readFileSync(`text-papers/${file}`));
  for(const [key,r] of Object.entries(data)){
   const html=[r.question,r.official,r.reasoning].join('');
   assert.doesNotMatch(html,/<script|\bon\w+\s*=|javascript:|file:\/\/|C:\\/i,`${file} ${key}`);
   for(const [,src]of html.matchAll(/<img[^>]+src="([^"]+)"/g))assert.ok(fs.existsSync(src),src);
   if(Number(file.slice(0,4))>=2015)for(const field of ['question','official','reasoning'])assert.ok(r[field],`${file} ${key} ${field}`);
  }
 }
});
