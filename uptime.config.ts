import { MaintenanceConfig, MonitorTarget, PageConfig, WorkerConfig } from './types/config'

/**
 * Monitor public hostnames so checks validate the same path an external user
 * takes: DNS/TLS/reverse proxy + application.
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
    '🧰 Infrastructure': [
      'docker',
      'fail2ban',
      'frigate',
      'headplane',
      'headscale',
      'nginx',
      'oauth2',
    ],
    '🤖 AI & Automation': [
      'cliproxy',
      'karakeep',
      'llm',
      'postiz',
    ],
    '📦 Apps & Data': [
      'auth',
      'immich',
      'it-tools',
      'onlyoffice',
      'paperless',
      'pdf',
      'pocketid',
      'seadoc',
      'seafile',
    ],
  },
}

const workerConfig: WorkerConfig = {
  kvWriteCooldownMinutes: 3,
  monitors: [
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
    web('nginx', 'Nginx Proxy Manager', 'https://nginx.novoagatto.com'),
    web('oauth2', 'OAuth2 Proxy', 'https://oauth2.novoagatto.com'),
    web('onlyoffice', 'OnlyOffice', 'https://onlyoffice.novoagatto.com'),
    web('paperless', 'Paperless', 'https://paperless.novoagatto.com'),
    web('pdf', 'Stirling PDF', 'https://pdf.novoagatto.com'),
    web('pocketid', 'Pocket ID', 'https://pocketid.novoagatto.com'),
    web('postiz', 'Postiz', 'https://postiz.novoagatto.com'),
    web('seadoc', 'SeaDoc', 'https://seadoc.novoagatto.com'),
    {
      id: 'seafile',
      name: 'Seafile',
      method: 'GET',
      target: 'https://seafile.novoagatto.com/api2/ping/',
      statusPageLink: 'https://seafile.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'pong',
      timeout: 10000,
    },
  ],
  notification: {
    timeZone: 'America/Sao_Paulo',
    gracePeriod: 2,
    skipErrorChangeNotification: true,
  },
}

const maintenances: MaintenanceConfig[] = []

export { maintenances, pageConfig, workerConfig }
