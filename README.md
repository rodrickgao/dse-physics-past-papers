# DSE Physics Past Papers

Source repository for the DSE Physics past-paper study website.

The interface is built with React, Vite and a local shadcn-style component layer. The original question scans and textbook datasets remain static and are packaged into the production build.

## Text study editions and printing

Questions open first, followed by a separate reveal for the official answer and
then the teaching explanation. Switching questions or languages closes answers.
The mistake book has practice and worked-solution print editions. Print preview
supports Save as PDF, white backgrounds, Times New Roman / SimSun, red official
text and blue reasoning. Original scan excerpts retain their original colours.
Practice editions offer 30–120 mm working space and start each new question on
a new page. Disable browser headers/footers in the print dialog.

Content coverage is recorded in `text-papers/coverage.json`. The 2015–2024
editions are imported from the existing verified English and Traditional Chinese
Word documents, preserving their diagrams, sub/superscripts and source hashes.
This is a transfer of previously verified material, not a fresh independent
verification of every solution. Structured official schemes remain authoritative
scan excerpts where Word has no native text. The 2012–2014 editions use only
manually verified bank text; other transcription and detailed reasoning remain
explicitly pending with original scans available. They are not silently replaced
with unchecked OCR or generic explanations.

`npm test` checks print-mode separation, formatting, assets, question identities
and MC answer consistency. Local import: `python scripts/import-word-papers.py
--workspace PATH` (requires the original desktop Word folders and bank). Browser
QA: `node scripts/browser-study-qa.mjs --pdf` with local Chrome and Vite running;
it writes only QA outputs outside the repository. GitHub builds use committed
static exports and do not require the private source folders.

## Open the website

**[Open the public DSE Physics Study Library](https://rodrickgao.github.io/dse-physics-past-papers/)**

The GitHub Pages website is public and does not require an invite code.

## Publishing flow

Every push to `main` automatically builds and publishes the current website to
GitHub Pages. The existing `部署到GitHub和Cloudflare.cmd` helper can still be
used when the private Cloudflare copy also needs to be updated.

## Security

The GitHub Pages copy contains only static website files. The Cloudflare invite
code and session-signing key remain encrypted Cloudflare secrets and are never
committed to this repository.
