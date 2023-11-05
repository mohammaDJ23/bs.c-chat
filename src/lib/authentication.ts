import { decodeToken } from 'react-jwt';
import { LocalStorage } from './localStorage';
import { getTime } from './date';

export enum UserRoles {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
}

export interface TokenInfo {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoles;
  expiration: number;
}

export function getToken(): string {
  const token = LocalStorage.getItem<string>('access_token');
  const tokenExpiration = LocalStorage.getItem<number>('access_token_expiration');

  if (token && tokenExpiration) if (getTime() < getTime(tokenExpiration)) return token;

  return '';
}

export function getTokenInfo(token: string = '') {
  return decodeToken<TokenInfo>(token || getToken());
}

export function isUserAuthenticated() {
  return !!getToken();
}

export function hasRole(...roles: UserRoles[]): boolean {
  roles = roles || Object.values(UserRoles);

  const userInfo = getTokenInfo();

  if (!userInfo) return false;
  else return roles.some((role) => userInfo.role === role);
}

export function isUser(role?: UserRoles) {
  return role ? role === UserRoles.USER : hasRole(UserRoles.USER);
}

export function isAdmin(role?: UserRoles) {
  return role ? role === UserRoles.ADMIN : hasRole(UserRoles.ADMIN);
}

export function isOwner(role?: UserRoles) {
  return role ? role === UserRoles.OWNER : hasRole(UserRoles.OWNER);
}
