import { MaintenanceConfig, MonitorTarget, PageConfig, WorkerConfig } from './types/config'

const miauLogo = 'data:image/png;base64,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'
const miauFavicon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAABgFBMVEUAAABCd9hAc9NVVao/f78Af/8+cdFEe+F/f/8AAP9Ac9M+cdA+ctA/ctFAc9M0Z8xVqv8A//9Ac9VBdNRVVf8+cNAAf38/f/8/cdFIbdo/bs8+btA7cck/ctFActQ/P78+b89Vf9QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADn9bUOAAAAgHRSTlMA/bkDBAJt/wIBc4z5tNAIAwFVjgMuAgTJBy5PE0wzBIsGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD6QoyAAAAHbSURBVHja7ZZZk4MgDICDooBa8e69x///k8thUadB6U4fdnbMQ/uQ5MsBIQLssssu75ea0qreNKFek3j2u2rCcWUCtyZrbmsEDlKZSGWKKq9ESwrU4y46SI3JHcuBQ2+UhPkIgkLLrE2PECjkSlv6c1D+OSkKcioIyxELDgdCTufUR7D+SkdVkAjJIIGIkANAhhOcP2g7P0B8G8JTH0T18D8LA0hwQASf1OaQLQjK/8v6y1iX6s0gUpfAEticMMWXMAISP0AT2KIK7c+M/xFCACPBdVLdn9FfggPwNcCjCkuY4ks7DdFmBq4K3Ydl/LASYNYHuYwfWIKrQt+b1vZDuoEOKWHWh9b1fwHYzMDlQBbxg3vgCGr81K2U8zcpCgU87kMz5f9SCUoqaMqyWc7VSwBrxgEBJGEA6OohBvh9BujDrk6hDM4AA7xUgieDNwD4nwUM24DBc4xcA0qQan3TxLNatU7CSe8P32q7j88ouhvtX0MKz2q76MnN0yzLeqgx/0uWpmmuxpN8YOs5NimY/UykGLDtbfRmt8Z4f9vxAWH9s0UF15FPWt9Z1fDRllpyOiDas1W2aIHT9Fb06D3Kjnbd+lcUp2vfWbHd83z9oggh1nRi/xje5Z/KDzSWEs6zTCQzAAAAAElFTkSuQmCC'

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
  logo: miauLogo,
  favicon: miauFavicon,
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
      target: 'https://headplane.novoagatto.com/healthz',
      statusPageLink: 'https://headplane.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: '"status":"OK"',
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
      target: 'https://pdf.novoagatto.com/api/v1/info/status',
      statusPageLink: 'https://pdf.novoagatto.com',
      expectedCodes: [200],
      responseKeyword: 'UP',
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
