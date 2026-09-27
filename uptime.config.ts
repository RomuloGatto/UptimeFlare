import { MaintenanceConfig, MonitorTarget, PageConfig, WorkerConfig } from './types/config'

/**
 * Initial monitor set for Romulo's exposed services.
 *
 * We intentionally monitor public hostnames instead of LAN destinations so the
 * checks validate the same path an external user takes: DNS/TLS/reverse proxy +
 * application.
 *
 * Common non-5xx responses are accepted because several services are APIs,
 * auth gateways, or redirect to a login page at "/". A 5xx response, timeout,
 * DNS/TLS failure, or connection failure is still treated as downtime.
 */
const reachableCodes = [
  200, 201, 202, 204,
  301, 302, 303, 307, 308,
  400, 401, 403, 404, 405, 409, 422, 429,
]

const web = (id: string, name: string, target: string, tooltip?: string): MonitorTarget => ({
  id,
  name,
  method: 'GET',
  target,
  statusPageLink: target,
  expectedCodes: reachableCodes,
  timeout: 10000,
  ...(tooltip ? { tooltip } : {}),
})

const pageConfig: PageConfig = {
  title: 'Infrastructure Status',
  links: [],
  group: {
    '🌐 Public & Work': [
      'api-grupomiau',
      'test-novoagatto',
      'wedding',
      'appwrite',
    ],
    '🧰 Infrastructure': [
      'docker',
      'fail2ban',
      'frigate',
      'headplane',
      'headscale',
      'nginx',
      'ntfy',
      'oauth2',
      'seelf',
      'server',
      'sync',
      'uptime',
      'wg',
    ],
    '🤖 AI & Automation': [
      'cliproxy',
      'karakeep',
      'llm',
      'miniflux',
      'n8n',
      'postiz',
      'rss',
    ],
    '📦 Apps & Data': [
      'auth',
      'immich',
      'it-tools',
      'matomo',
      'microbin',
      'nocodb',
      'onlyoffice',
      'paperless',
      'pdf',
      'pocketid',
      'romm',
      'seadoc',
      'seafile',
    ],
  },
}

const workerConfig: WorkerConfig = {
  kvWriteCooldownMinutes: 3,
  monitors: [
    web('api-grupomiau', 'Miau API', 'https://api.grupomiau.co'),
    web('appwrite', 'Appwrite', 'https://appwrite.novoagatto.com'),
    web('auth', 'Auth', 'https://auth.novoagatto.com'),
    web('cliproxy', 'CLI Proxy', 'https://cliproxy.novoagatto.com'),
    web('docker', 'Docker / Dockhand', 'https://docker.novoagatto.com'),
    web('fail2ban', 'Fail2ban', 'https://fail2ban.novoagatto.com'),
    web('frigate', 'Frigate', 'https://frigate.novoagatto.com'),
    web('headplane', 'Headplane', 'https://headplane.novoagatto.com'),
    web('headscale', 'Headscale', 'https://headscale.novoagatto.com'),
    web('immich', 'Immich', 'https://immich.novoagatto.com'),
    web('it-tools', 'IT Tools', 'https://it.novoagatto.com'),
    web('karakeep', 'KaraKeep', 'https://karakeep.novoagatto.com'),
    web('llm', 'LLM', 'https://llm.novoagatto.com'),
    web('matomo', 'Matomo', 'https://matomo.novoagatto.com'),
    web('microbin', 'MicroBin', 'https://microbin.novoagatto.com'),
    web('miniflux', 'Miniflux', 'https://miniflux.novoagatto.com'),
    web('n8n', 'n8n', 'https://n8n.novoagatto.com'),
    web('nginx', 'Nginx Proxy Manager', 'https://nginx.novoagatto.com'),
    web('nocodb', 'NocoDB', 'https://nocodb.novoagatto.com'),
    web('ntfy', 'ntfy', 'https://ntfy.novoagatto.com'),
    web('oauth2', 'OAuth2 Proxy', 'https://oauth2.novoagatto.com'),
    web('onlyoffice', 'OnlyOffice', 'https://onlyoffice.novoagatto.com'),
    web('paperless', 'Paperless', 'https://paperless.novoagatto.com'),
    web('pdf', 'Stirling PDF', 'https://pdf.novoagatto.com'),
    web('pocketid', 'Pocket ID', 'https://pocketid.novoagatto.com'),
    web('postiz', 'Postiz', 'https://postiz.novoagatto.com'),
    web('romm', 'RomM', 'https://romm.novoagatto.com'),
    web('rss', 'RSS', 'https://rss.novoagatto.com'),
    web('seadoc', 'SeaDoc', 'https://seadoc.novoagatto.com'),
    web('seafile', 'Seafile', 'https://seafile.novoagatto.com'),
    web('seelf', 'Seelf', 'https://seelf.novoagatto.com'),
    web('server', 'Server', 'https://server.novoagatto.com'),
    web('sync', 'Sync', 'https://sync.novoagatto.com'),
    web('test-novoagatto', 'Novoa Gatto Test', 'https://test.novoagatto.com'),
    web('uptime', 'Existing Uptime', 'https://uptime.novoagatto.com'),
    web('wedding', 'Wedding', 'https://wedding.novoagatto.com'),
    web('wg', 'WireGuard', 'https://wg.novoagatto.com'),
  ],
  notification: {
    timeZone: 'America/Sao_Paulo',
    gracePeriod: 2,
    skipErrorChangeNotification: true,
  },
}

const maintenances: MaintenanceConfig[] = []

export { maintenances, pageConfig, workerConfig }
