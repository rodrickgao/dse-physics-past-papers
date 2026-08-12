# DSE Physics Past Papers

Private source repository for the DSE Physics past-paper study website.

## Open the website

**[Open DSE Physics Study Library on Cloudflare](https://dse-physics-past-papers.rodrickgao.workers.dev/)**

Visitors will be asked for the invite code before entering the study library.

## Publishing flow

Run `部署到GitHub和Cloudflare.cmd` after committing a change. It validates the
website, pushes `main` to the private GitHub repository, and then deploys the
same commit to Cloudflare Workers. The command stops on the first error so the
two destinations cannot silently drift apart.

## Security

The invite code and session-signing key are stored as encrypted Cloudflare
secrets. They are never committed to this repository.
