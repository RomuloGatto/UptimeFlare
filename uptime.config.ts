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
  title: 'Miau Labs · Infrastructure Status',
  logo: '/miau-labs.svg',
  favicon: '/miau-labs-mark.svg',
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
    {
      id: 'auth',
      name: 'Auth',
      method: 'GET',
      target: 'https://auth.novoagatto.com/healthz',
      statusPageLink: 'https://auth.novoagatto.com',
      expectedCodes: [204],
      timeout: 10000,
      hideLatencyChart: true,
    },
    web('cliproxy', 'CLI Proxy', 'https://cliproxy.novoagatto.com'),
    {
      id: 'docker',
      name: 'Docker / Dockhand',
      method: 'GET',
      target: 'https://docker.novoagatto.com/api/health',
      statusPageLink: 'https://docker.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: '"status":"ok"',
      timeout: 10000,
    },
    web('fail2ban', 'Fail2ban', 'https://fail2ban.novoagatto.com'),
    {
      id: 'frigate',
      name: 'Frigate',
      method: 'GET',
      target: 'https://frigate.novoagatto.com/api/version',
      statusPageLink: 'https://frigate.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'headplane',
      name: 'Headplane',
      method: 'GET',
      target: 'https://headplane.novoagatto.com',
      statusPageLink: 'https://headplane.novoagatto.com',
      expectedCodes: [200, 301, 302, 303, 307, 308, 401, 403],
      timeout: 10000,
    },
    {
      id: 'headscale',
      name: 'Headscale',
      method: 'GET',
      target: 'https://headscale.novoagatto.com/health',
      statusPageLink: 'https://headscale.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'immich',
      name: 'Immich',
      method: 'GET',
      target: 'https://immich.novoagatto.com/api/server/ping',
      statusPageLink: 'https://immich.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'pong',
      timeout: 10000,
    },
    web('it-tools', 'IT Tools', 'https://it.novoagatto.com'),
    {
      id: 'karakeep',
      name: 'KaraKeep',
      method: 'GET',
      target: 'https://karakeep.novoagatto.com/api/health',
      statusPageLink: 'https://karakeep.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
    },
    {
      id: 'llm',
      name: 'LLM',
      method: 'GET',
      target: 'https://llm.novoagatto.com/health/readiness',
      statusPageLink: 'https://llm.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
    },
    web('nginx', 'Nginx Proxy Manager', 'https://nginx.novoagatto.com'),
    {
      id: 'oauth2',
      name: 'OAuth2 Proxy',
      method: 'GET',
      target: 'https://oauth2.novoagatto.com/ready',
      statusPageLink: 'https://oauth2.novoagatto.com',
      expectedCodes: [200],
      timeout: 10000,
      hideLatencyChart: true,
    },
    {
      id: 'onlyoffice',
      name: 'OnlyOffice',
      method: 'GET',
      target: 'https://onlyoffice.novoagatto.com/healthcheck',
      statusPageLink: 'https://onlyoffice.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'true',
      timeout: 10000,
    },
    web('paperless', 'Paperless', 'https://paperless.novoagatto.com'),
    {
      id: 'pdf',
      name: 'Stirling PDF',
      method: 'GET',
      target: 'https://pdf.novoagatto.com',
      statusPageLink: 'https://pdf.novoagatto.com',
      expectedCodes: [200, 301, 302, 303, 307, 308, 401, 403],
      timeout: 10000,
    },
    {
      id: 'pocketid',
      name: 'Pocket ID',
      method: 'GET',
      target: 'https://pocketid.novoagatto.com/healthz',
      statusPageLink: 'https://pocketid.novoagatto.com',
      expectedCodes: [204],
      timeout: 10000,
      hideLatencyChart: true,
    },
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
