# DSE Physics Past Papers

Source repository for the DSE Physics past-paper study website.

## Open the website

**[Open the public DSE Physics Study Library](https://rodrickgao.github.io/dse-physics-past-papers/)**

The GitHub Pages website is public and does not require an invite code.

## Publishing flow

Every push to `main` automatically publishes the current static website to
GitHub Pages. The existing `部署到GitHub和Cloudflare.cmd` helper can still be
used when the private Cloudflare copy also needs to be updated.

## Security

The GitHub Pages copy contains only static website files. The Cloudflare invite
code and session-signing key remain encrypted Cloudflare secrets and are never
committed to this repository.
