# DSE Physics Past Papers

Private source repository for the DSE Physics past-paper study website.

## Publishing flow

Changes pushed to the `main` branch are validated by GitHub Actions and then deployed to Cloudflare Workers. The public site remains protected by the Cloudflare-side invite code.

## Security

The invite code, session-signing key, and Cloudflare API token are stored as encrypted platform secrets. They are never committed to this repository.

