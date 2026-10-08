export type DownNotificationDecision = {
  currentTime: number
  incidentStart: number
  notifiedIncidentStart: number | undefined
  gracePeriodMinutes: number | undefined
  monitorStatusChanged: boolean
  skipErrorChangeNotification: boolean | undefined
}

export function allWebhookDeliveriesSucceeded(results: boolean[]): boolean {
  return results.length > 0 && results.every(Boolean)
}

export function shouldSendDownNotification({
  currentTime,
  incidentStart,
  notifiedIncidentStart,
  gracePeriodMinutes,
  monitorStatusChanged,
  skipErrorChangeNotification,
}: DownNotificationDecision): boolean {
  const isFollowupErrorChange = monitorStatusChanged && incidentStart !== currentTime
  if (notifiedIncidentStart === incidentStart) {
    return isFollowupErrorChange && !skipErrorChangeNotification
  }

  const gracePeriodSeconds = (gracePeriodMinutes ?? 0) * 60
  if (currentTime - incidentStart < gracePeriodSeconds) return false

  if (isFollowupErrorChange && skipErrorChangeNotification) return false

  return true
}


export function getBlockingDependency(
  monitorId: string,
  suppressWhenDown: Record<string, string[]> | undefined,
  currentStatus: Record<string, { up: boolean }>
): string | undefined {
  const parents = suppressWhenDown?.[monitorId] ?? []
  return parents.find((parentId) => currentStatus[parentId]?.up === false)
}


export function getHigherPriorityDownMonitor(
  monitorId: string,
  priorityIds: string[] | undefined,
  currentStatus: Record<string, { up: boolean }>
): string | undefined {
  if (!priorityIds?.includes(monitorId)) return undefined

  const monitorPriority = priorityIds.indexOf(monitorId)
  for (let index = 0; index < monitorPriority; index++) {
    const higherPriorityId = priorityIds[index]
    if (currentStatus[higherPriorityId]?.up === false) {
      return higherPriorityId
    }
  }

  return undefined
}
