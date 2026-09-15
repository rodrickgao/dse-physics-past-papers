import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
const base = process.env.QA_URL || 'http://127.0.0.1:5177/';
const out = '../tmp/document-sync-qa';fs.mkdirSync(out,{recursive:true});
const browser = await chromium.launch({headless:true,channel:'chrome'});
const errors=[];
try {
 for(const language of ['eng','chn']) {
  const page=await browser.newPage({viewport:{width:1400,height:950}});
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(lang=>localStorage.setItem('dse-physics-language-v1',lang),language);
  await page.goto(base+'#textbook');
  await page.locator('.book-card').first().waitFor();
  assert.equal(await page.locator('.source-download').getAttribute('href'),`downloads/${language}/knowledge.pdf`);
  let total=0;
  for(let book=0;book<9;book++) {
   await page.locator('.book-card').nth(book).click();
   const labels=await page.locator('.knowledge-point-head>div>span').allTextContents();
   total+=labels.length;
   assert.ok(labels.every(s=>/^E?\d\.\d+\.\d+$/.test(s)));
   assert.equal(labels[0],`${book<5?'':'E'}${book<5?book+1:book-4}.1.1`);
   assert.equal(await page.locator('.knowledge-point-head small').count(),0);
   await page.locator('.back-books').click();
  }
  assert.equal(total,365);
  await page.locator('.knowledge-search-wrap input').fill('E1.1.1');
  assert.ok((await page.locator('.knowledge-point-head>div>span').allTextContents()).includes('E1.1.1'));
  await page.screenshot({path:`${out}/${language}-knowledge.png`,fullPage:true});
  for(const width of [1400,390]) {
   await page.setViewportSize({width,height:950});
   await page.goto(base+'#papers?question=2013%7Cpaper-1a%7C1');
   await page.locator('.question-content').waitFor();
   assert.equal(await page.locator('.source-download').getAttribute('href'),`downloads/${language}/2013-paper-1a.pdf`);
   if (await page.locator('[aria-controls="official-stage"]').getAttribute('aria-expanded') !== 'true') await page.locator('[aria-controls="official-stage"]').click();
   if (await page.locator('[aria-controls="reasoning-stage"]').getAttribute('aria-expanded') !== 'true') await page.locator('[aria-controls="reasoning-stage"]').click();
   await page.locator('.reasoning-content').waitFor();
   const related=await page.locator('.related-panel button span').allTextContents();
   assert.ok(related.every(s=>/^E?\d\.\d+\.\d+$/.test(s)));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`${out}/${language}-paper-${width}.png`,fullPage:true});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);
 for(const f of JSON.parse(fs.readFileSync('downloads/catalog.json','utf8')).files) {
  const response=await fetch(base+f.url);assert.equal(response.status,200,f.url);
  assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),f.sha256);
 }
 console.log('PASS: 730 cards, bilingual navigation and numbering, mobile reading, all 86 PDF downloads match source hashes.');
}finally{await browser.close();}
