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
