import { UserRoles } from '../';

export function isUserRoles(value: UserRoles[]): string | undefined {
  const isRoleValid = Object.values(UserRoles).some((role) => value.includes(role));

  if (!isRoleValid || !value.length) return 'Invalid Role';
}
