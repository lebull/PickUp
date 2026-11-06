export type UserRolesDocLike = {
  roles?: unknown
}

function hasCoordinatorInRoles(roles: unknown): boolean {
  if (Array.isArray(roles)) {
    return roles.includes('coordinator')
  }
  if (roles && typeof roles === 'object') {
    return (roles as Record<string, unknown>).coordinator === true
  }
  return false
}

export function hasCoordinatorRole(claims: unknown): boolean {
  if (!claims || typeof claims !== 'object') return false
  const typed = claims as UserRolesDocLike
  return hasCoordinatorInRoles(typed.roles)
}
