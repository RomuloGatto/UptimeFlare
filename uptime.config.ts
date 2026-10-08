import { MaintenanceConfig, MonitorTarget, PageConfig, WorkerConfig } from './types/config'

/**
 * Monitor public hostnames so checks validate the same path an external user
 * takes: DNS/TLS/reverse proxy + application.
 */
const reachableCodes = [
  200,
  301, 302, 303, 307, 308,
  401, 403,
]

const fromEasternNorthAmerica = (monitor: MonitorTarget): MonitorTarget => ({
  ...monitor,
  // Cloudflare Durable Object location hint. This pins checks away from the
  // cron Worker's arbitrary execution region (which was showing up in India).
  checkProxy: 'worker://enam',
  checkProxyFallback: true,
})

const web = (
  id: string,
  name: string,
  target: string,
  tooltip?: string,
  hideLatencyChart = false
): MonitorTarget =>
  fromEasternNorthAmerica({
    id,
    name,
    method: 'GET',
    target,
    statusPageLink: target,
    expectedCodes: reachableCodes,
    timeout: 10000,
    ...(tooltip ? { tooltip } : {}),
    ...(hideLatencyChart ? { hideLatencyChart: true } : {}),
  })

const pageConfig: PageConfig = {
  title: 'Miau Labs · Infrastructure Status',
  logo: '/miau-labs.svg',
  favicon: '/miau-labs-mark.svg',
  links: [],
  group: {
    '🌐 Edge & Access': [
      'nginx',
      'bark',
      'headscale',
      'headplane',
      'oauth2',
      'auth',
      'pocketid',
      'fail2ban',
      'docker',
    ],
    '🏠 Core Home Services': [
      'frigate',
      'immich',
      'seafile',
      'paperless',
    ],
    '🤖 AI & Automation': [
      'llm',
      'cliproxy',
      'karakeep',
    ],
    '🧰 Utilities & Docs': [
      'onlyoffice',
      'pdf',
      'seadoc',
      'it-tools',
    ],
  },
}

const workerConfig: WorkerConfig = {
  kvWriteCooldownMinutes: 3,
  monitorBatchSize: 5,
  monitors: [
    fromEasternNorthAmerica({
      id: 'auth',
      name: 'Auth',
      method: 'GET',
      target: 'https://auth.novoagatto.com/healthz',
      statusPageLink: 'https://auth.novoagatto.com',
      expectedCodes: [204],
      timeout: 10000,
      hideLatencyChart: true,
      tooltip: 'Authentication service health check',
    }),
    fromEasternNorthAmerica({
      id: 'cliproxy',
      name: 'CLI Proxy',
      method: 'GET',
      target: 'https://cliproxy.novoagatto.com/healthz',
      statusPageLink: 'https://cliproxy.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: '"status":"ok"',
      timeout: 10000,
      tooltip: 'LLM CLI/API proxy gateway health check',
    }),
    fromEasternNorthAmerica({
      id: 'docker',
      name: 'Docker / Dockhand',
      method: 'GET',
      target: 'https://docker.novoagatto.com/api/health',
      statusPageLink: 'https://docker.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: '"status":"ok"',
      timeout: 10000,
      tooltip: 'Docker host and container management via Dockhand',
    }),
    web('fail2ban', 'Fail2ban', 'https://fail2ban.novoagatto.com', 'Host ban / intrusion protection dashboard', true),
    fromEasternNorthAmerica({
      id: 'frigate',
      name: 'Frigate',
      method: 'GET',
      target: 'https://frigate.novoagatto.com/api/version',
      statusPageLink: 'https://frigate.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
      tooltip: 'Camera NVR and object detection',
    }),
    fromEasternNorthAmerica({
      id: 'headplane',
      name: 'Headplane',
      method: 'GET',
      target: 'https://headplane.novoagatto.com/healthz',
      statusPageLink: 'https://headplane.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: '"status":"OK"',
      timeout: 10000,
      hideLatencyChart: true,
      tooltip: 'Headplane health check including Headscale connectivity',
    }),
    fromEasternNorthAmerica({
      id: 'headscale',
      name: 'Headscale',
      method: 'GET',
      target: 'https://headscale.novoagatto.com/health',
      statusPageLink: 'https://headscale.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
      tooltip: 'Tailscale-compatible private network control plane',
    }),
    fromEasternNorthAmerica({
      id: 'immich',
      name: 'Immich',
      method: 'GET',
      target: 'https://immich.novoagatto.com/api/server/ping',
      statusPageLink: 'https://immich.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'pong',
      timeout: 10000,
      tooltip: 'Photo backup and media library',
    }),
    web('it-tools', 'IT Tools', 'https://it.novoagatto.com', 'Browser-based utility toolbox', true),
    fromEasternNorthAmerica({
      id: 'karakeep',
      name: 'KaraKeep',
      method: 'GET',
      target: 'https://karakeep.novoagatto.com/api/health',
      statusPageLink: 'https://karakeep.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
      tooltip: 'Bookmark and knowledge archive',
    }),
    fromEasternNorthAmerica({
      id: 'llm',
      name: 'LLM',
      method: 'GET',
      target: 'https://llm.novoagatto.com/health/readiness',
      statusPageLink: 'https://llm.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
      tooltip: 'LiteLLM gateway for local and remote models',
    }),
    web(
      'nginx',
      'Home Edge / Nginx',
      'https://nginx.novoagatto.com',
      'Home uplink / primary ingress root-cause monitor; upstream healthcheck is container-internal'
    ),
    fromEasternNorthAmerica({
      id: 'bark',
      name: 'Bark',
      method: 'GET',
      target: 'https://bark.novoagatto.com/ping',
      statusPageLink: 'https://bark.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'pong',
      timeout: 10000,
      hideLatencyChart: true,
      tooltip: 'Cloudflare-hosted Bark push notification server',
    }),
    fromEasternNorthAmerica({
      id: 'oauth2',
      name: 'OAuth2 Proxy',
      method: 'GET',
      target: 'https://oauth2.novoagatto.com/ready',
      statusPageLink: 'https://oauth2.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
      hideLatencyChart: true,
      tooltip: 'SSO authentication gateway',
    }),
    fromEasternNorthAmerica({
      id: 'onlyoffice',
      name: 'OnlyOffice',
      method: 'GET',
      target: 'https://onlyoffice.novoagatto.com/healthcheck',
      statusPageLink: 'https://onlyoffice.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'true',
      timeout: 10000,
      hideLatencyChart: true,
      tooltip: 'Document editing backend',
    }),
    web(
      'paperless',
      'Paperless',
      'https://paperless.novoagatto.com',
      'Document archive and OCR; upstream container healthcheck probes the web root'
    ),
    fromEasternNorthAmerica({
      id: 'pdf',
      name: 'Stirling PDF',
      method: 'GET',
      target: 'https://pdf.novoagatto.com',
      statusPageLink: 'https://pdf.novoagatto.com',
      expectedCodes: [200, 301, 302, 303, 307, 308, 401, 403],
      timeout: 10000,
      tooltip: 'PDF conversion and utility service; root reachability avoids version-dependent status endpoint behavior',
    }),
    fromEasternNorthAmerica({
      id: 'pocketid',
      name: 'Pocket ID',
      method: 'GET',
      target: 'https://pocketid.novoagatto.com/healthz',
      statusPageLink: 'https://pocketid.novoagatto.com',
      expectedCodes: [204],
      timeout: 10000,
      hideLatencyChart: true,
      tooltip: 'Passkey / OIDC identity provider',
    }),
    fromEasternNorthAmerica({
      id: 'seadoc',
      name: 'SeaDoc',
      method: 'GET',
      target: 'https://seadoc.novoagatto.com/ping',
      statusPageLink: 'https://seadoc.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'pong',
      timeout: 10000,
      tooltip: 'Collaborative document service health check',
    }),
    fromEasternNorthAmerica({
      id: 'seafile',
      name: 'Seafile',
      method: 'GET',
      target: 'https://seafile.novoagatto.com/api2/ping/',
      statusPageLink: 'https://seafile.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'pong',
      timeout: 10000,
      tooltip: 'File sync and storage',
    }),
  ],
  notification: {
    webhook: {
      // Cloudflare-hosted Bark stays reachable even when the home connection is down. Redeploy marker: bark-cutover.
      url: 'https://bark.novoagatto.com/push',
      method: 'POST',
      payloadType: 'json',
      payload: {
        device_key: '__BARK_DEVICE_KEY__',
        title: 'UptimeFlare',
        body: '$MSG',
        group: 'UptimeFlare',
        level: 'timeSensitive',
      },
      timeout: 10000,
    },
    timeZone: 'America/Sao_Paulo',
    gracePeriod: 2,
    // Alert only on services that represent the edge or core home functionality.
    // Bark itself is intentionally skipped because it cannot notify about its own outage.
    skipNotificationIds: [
      'auth',
      'bark',
      'cliproxy',
      'docker',
      'fail2ban',
      'headplane',
      'it-tools',
      'karakeep',
      'llm',
      'oauth2',
      'onlyoffice',
      'paperless',
      'pdf',
      'pocketid',
      'seadoc',
    ],
    skipErrorChangeNotification: true,
    // Root-cause suppression: if the home edge is down, child service failures
    // are expected symptoms and should not create an alert storm.
    suppressWhenDown: {
      headscale: ['nginx'],
      frigate: ['nginx'],
      immich: ['nginx'],
      seafile: ['nginx'],
    },
  },
}

const maintenances: MaintenanceConfig[] = []

export { maintenances, pageConfig, workerConfig }
