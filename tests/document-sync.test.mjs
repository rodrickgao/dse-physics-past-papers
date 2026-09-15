import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { numberKnowledgePoints } from '../src/lib/knowledge-numbering.js';

test('all 365 bilingual numbers match the exported documents and preserve IDs', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync('textbook-data.js', 'utf8'), context);
  const langs = context.window.DSE_TEXTBOOK_DATA.languages;
  for (const points of Object.values(langs)) {
    const numbered = numberKnowledgePoints(points);
    assert.equal(numbered.length, 365);
    assert.equal(new Set(numbered.map(p => p.number)).size, 365);
    assert.equal(numbered.filter(p => p.number.startsWith('E')).length, 119);
    numbered.forEach((p, i) => { assert.equal(p.number, points[i].number); assert.equal(p.sequence, points[i].sequence); });
    assert.equal(numbered[0].number, '1.1.1');
    assert.equal(numbered[2].number, '1.2.1');
    assert.equal(numbered.find(p => p.code === '3B04').number, '3.4.1');
  }
  assert.deepEqual(Array.from(langs.eng, p => p.number), Array.from(langs.chn, p => p.number));
});

test('download library has exact bilingual PDF coverage and verified bytes', () => {
  const { files } = JSON.parse(fs.readFileSync('downloads/catalog.json', 'utf8'));
  assert.equal(files.length, 86);
  assert.equal(new Set(files.map(f => f.url)).size, 86);
  for (const lang of ['eng', 'chn']) {
    assert.equal(files.filter(f => f.language === lang && f.kind === 'knowledge').length, 1);
    for (let year = 2012; year <= 2025; year++) for (const paper of ['paper-1a', 'paper-1b', 'paper-2']) {
      assert.equal(files.filter(f => f.language === lang && f.year === year && f.paper === paper).length, 1);
    }
  }
  for (const f of files) {
    const bytes = fs.readFileSync(f.url);
    assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
    assert.equal(createHash('sha256').update(bytes).digest('hex'), f.sha256);
    assert.ok(!/^[A-Z]:|\\\\/i.test(f.source));
  }
});
