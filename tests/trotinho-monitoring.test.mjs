import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const config = readFileSync(resolve(process.cwd(), 'uptime.config.ts'), 'utf8')

test('Trotinho monitors cover two public landings, both locales, app and API', () => {
  for (const [id, path, keyword] of [
    ['trotinho-runner', '/', 'trotinho'],
    ['trotinho-personal-pt', '/personal/', 'Você monta o treino.'],
    ['trotinho-personal-en', '/en/personal/', 'You plan the workout.'],
    ['trotinho-app', '/app/', 'Trotinho'],
    ['trotinho-api', '/api/health', '"status":"ok"']
  ]) {
    assert.ok(config.includes("'"+id+"'"), id)
    assert.ok(config.includes("'"+path+"'"), path)
    assert.ok(config.includes(keyword), keyword)
  }
  assert.match(config, /expectedCodes: \[200\]/)
  assert.match(config, /responseKeyword: keyword/)
  assert.match(config, /'🏃 Trotinho': \[/)
  assert.match(config, /'trotinho-api'/)
})

test('low-value page checks do not trigger duplicate Bark notifications', () => {
  const skip = config.split('skipNotificationIds: [')[1]?.split(']')[0]
  assert.ok(skip)
  for (const id of ['trotinho-runner', 'trotinho-personal-pt', 'trotinho-personal-en']) {
    assert.ok(skip.includes("'"+id+"'"), id)
  }
  assert.doesNotMatch(skip, /'trotinho-app'|'trotinho-api'/)
})


test('Oracle, Umami and GlitchTip checks have strict public endpoints without credentials', () => {
  for (const [id, url] of [
    ['trotinho-backend', '/api/backend-health'],
    ['trotinho-umami', 'https://umami.trotinho.com/script.js'],
    ['trotinho-glitchtip', 'https://glitchtip.trotinho.com/_health/'],
  ]) {
    assert.ok(config.includes("'" + id + "'"), id)
    assert.ok(config.includes(url), url)
  }
  assert.match(config, /expectedCodes: \[200\]/)
  assert.doesNotMatch(config, /CF-Access-Client-Secret|Authorization: Bearer/)
})

test('Oracle and observability checks are visible but never send Bark notifications', () => {
  const skip = config.split('skipNotificationIds: [')[1]?.split(']')[0]
  assert.ok(skip)
  for (const id of ['trotinho-backend','trotinho-umami','trotinho-glitchtip']) {
    assert.ok(skip.includes("'" + id + "'"), id)
  }
})
