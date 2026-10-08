# UptimeFlare operations notes

This repository deploys the Miau Labs status page and monitoring worker to Cloudflare.

## Cloudflare Access

The custom production hostname `status.novoagatto.com` is managed by Terraform and protected by the `Miau Infrastructure Status` Access application.

Cloudflare Pages hostnames require a separate Pages-native Access setup:

- Production: `uptimeflare-apy.pages.dev` is protected manually in Zero Trust Access.
- Previews: `*.uptimeflare-apy.pages.dev` are protected through Pages -> Settings -> General -> Restrict previews.
- `uptimeflare.pages.dev` is not this deployment and must not be used for validation.

These Pages Access settings are intentionally not represented in `deploy.tf` because account-level Access rejects `pages.dev` as a zone-owned hostname.

## GitHub Actions secrets

Required repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `BARK_DEVICE_KEY`

Optional:

- `CLOUDFLARE_ACCOUNT_ID` (the workflow can discover it when omitted)

Never commit the Bark device key or Cloudflare token.

## Deploy behavior

Production deploys use a single concurrency group:

```yaml
concurrency:
  group: uptimeflare-production
  cancel-in-progress: true
```

A newer commit cancels an older in-progress deployment.

## Alerting

Notifications are delivered through the Cloudflare-hosted Bark service at `bark.novoagatto.com`.

- notification level: `timeSensitive`
- grace period: 2 minutes
- Bark itself is excluded from notifications because it cannot report its own outage
- non-critical/admin services are listed in `skipNotificationIds`
- root-cause suppression uses Nginx Proxy Manager's native public `GET /api` health endpoint
- only the Nginx root-cause monitor is forced into every cron cycle; normal services remain batched
- when Nginx is down, Headscale, Frigate, Immich, and Seafile incidents are recorded but their Bark alerts are suppressed

A dead-man switch is intentionally not used. UptimeFlare and Bark both run outside the home network on Cloudflare; the goal is to detect failures of the home infrastructure without adding another monitoring dependency.

## Health endpoint audit

The public checks are intentionally conservative: use a documented health endpoint when one exists, otherwise use root reachability rather than inventing an unsupported endpoint.

| Service | Check | Reason |
| --- | --- | --- |
| CLI Proxy | `/healthz` | Native unauthenticated health endpoint returning `{"status":"ok"}`. |
| Headplane | `/healthz` | Native health endpoint; also verifies Headscale health and returns 500 when unhealthy. |
| SeaDoc | `/ping` | Native no-auth route returning `pong`. |
| Nginx Proxy Manager | `/` | Upstream healthcheck is the container-local `/usr/bin/check-health` script, not an HTTP route. |
| Paperless-ngx | `/` | Official Docker image healthcheck probes the web root; `/api/status/` requires authentication. |
| Stirling PDF | `/` | `/api/v1/info/status` has had version/auth behavior changes; root reachability is more stable for this external check. |
| IT Tools | `/` | No stable dedicated health endpoint is documented. |
| Fail2ban dashboard | `/` | Deployment-specific UI; no stable public health endpoint is assumed. |

## Alert test

For a full end-to-end notification test, temporarily add a monitor that calls a known-good endpoint but expects an impossible status code, leave it out of `skipNotificationIds`, wait past the grace period, confirm the Bark notification, and then remove the monitor.


## Root-cause alert suppression

Nginx Proxy Manager is the root-cause signal for the home edge, but it must be checked through its **native API health endpoint**, not the UI root.

The monitor uses:

```text
GET https://nginx.novoagatto.com/api/
expected HTTP: 200
required response body: "status":"OK"
```

Nginx Proxy Manager's own container health check calls `/api/` and expects `.status == "OK"`; the API docs expose the health resource at the API root and returns an object containing `status: "OK"`, setup state, and version. This is materially different from checking `/`, where a Cloudflare/authentication/redirect response can look "up" even when the home origin is unavailable.

Only `nginx` is automatically added to every cron invocation. The normal service set remains batched.

Current dependency tree:

```text
Home Edge / Nginx
├── Headscale
├── Frigate
├── Immich
└── Seafile
```

If the edge is down, dependent incidents are still recorded but their Bark DOWN/recovery/error-change notifications are suppressed. If the edge is healthy and a child fails independently, that child alerts normally.
