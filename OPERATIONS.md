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
- core outage correlation is priority-based: Headscale -> Frigate -> Immich -> Seafile
- those four monitors are checked every minute; when multiple are down, only the highest-priority failing service sends Bark
- Nginx Proxy Manager remains visible on the status page but does not alert because its authenticated/proxied root can respond before the home origin is reached

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


## Correlated outage alert suppression

The previous root-cause design used the Nginx Proxy Manager public root as the parent signal. That is not reliable for outage correlation because a protected/proxied hostname can return an authentication or proxy response even when the home origin is unavailable.

Core home alerts therefore use a priority quorum instead:

```text
1. Headscale
2. Frigate
3. Immich
4. Seafile
```

All four are added to every cron invocation, independent of normal batching. If several are down in the same cycle, only the highest-priority failing service is eligible to notify.

Examples:

- Headscale + Frigate + Immich + Seafile down -> only Headscale alerts.
- Immich + Seafile down, Headscale and Frigate healthy -> only Immich alerts.
- Seafile down alone -> Seafile alerts.

Incidents for suppressed services are still recorded on the status page. If the higher-priority service recovers while a lower-priority service remains down, the remaining service becomes eligible for its own alert on the next check.

Nginx Proxy Manager is informational only for Bark alerting because its public root accepts redirect/authentication responses and is therefore not a trustworthy signal for whether the home origin itself is reachable.
