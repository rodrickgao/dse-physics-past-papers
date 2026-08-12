$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

node --check app.js
node --check cloudflare/worker.js
git diff --check

if (git status --porcelain) {
  throw "Working tree has uncommitted changes. Commit them before deploying."
}

git push origin main
if ($LASTEXITCODE -ne 0) { throw "GitHub push failed." }

cmd /c npx wrangler deploy
if ($LASTEXITCODE -ne 0) { throw "Cloudflare deployment failed." }

