export type MonitorBatch<T> = {
  monitors: T[]
  batchIndex: number
  batchCount: number
  batched: boolean
}

/**
 * Select a deterministic round-robin monitor batch for the default
 * every-minute Cron Trigger. Retries keep the same scheduled timestamp and
 * therefore select the same batch without a mutable cursor.
 */
export function selectMonitorBatch<T>(
  monitors: T[],
  configuredBatchSize: number | undefined,
  scheduledTime: number
): MonitorBatch<T> {
  if (
    configuredBatchSize === undefined ||
    !Number.isInteger(configuredBatchSize) ||
    configuredBatchSize <= 0 ||
    configuredBatchSize >= monitors.length
  ) {
    return {
      monitors,
      batchIndex: 0,
      batchCount: 1,
      batched: false,
    }
  }

  const batchSize = configuredBatchSize
  const batchCount = Math.ceil(monitors.length / batchSize)
  const scheduledMinute = Number.isFinite(scheduledTime)
    ? Math.floor(scheduledTime / 60_000)
    : 0
  const batchIndex = ((scheduledMinute % batchCount) + batchCount) % batchCount
  const start = batchIndex * batchSize

  return {
    monitors: monitors.slice(start, start + batchSize),
    batchIndex,
    batchCount,
    batched: true,
  }
}


/**
 * Ensure root-cause/dependency monitors are checked on every cron invocation.
 * Required monitors are placed first so their fresh status is available before
 * dependent notification decisions are processed.
 */
export function includeRequiredMonitors<T extends { id: string }>(
  selection: MonitorBatch<T>,
  allMonitors: T[],
  requiredIds: string[]
): MonitorBatch<T> {
  if (requiredIds.length === 0) return selection

  const requiredIdSet = new Set(requiredIds)
  const required = allMonitors.filter((monitor) => requiredIdSet.has(monitor.id))
  const requiredPresent = new Set(required.map((monitor) => monitor.id))
  const selectedWithoutRequired = selection.monitors.filter(
    (monitor) => !requiredPresent.has(monitor.id)
  )

  return {
    ...selection,
    monitors: [...required, ...selectedWithoutRequired],
  }
}
