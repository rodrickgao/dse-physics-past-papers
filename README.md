# DSE Physics Past Papers

Private source repository for the DSE Physics past-paper study website.

## Open the website

**[Open DSE Physics Study Library on Cloudflare](https://dse-physics-past-papers.rodrickgao.workers.dev/)**

Visitors will be asked for the invite code before entering the study library.

## Publishing flow

Changes pushed to the `main` branch are validated by GitHub Actions and then deployed to Cloudflare Workers. The public site remains protected by the Cloudflare-side invite code.

## Security

The invite code, session-signing key, and Cloudflare API token are stored as encrypted platform secrets. They are never committed to this repository.
