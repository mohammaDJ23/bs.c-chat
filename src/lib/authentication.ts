import { decodeToken } from 'react-jwt';
import { getTime } from './date';
import { LocalStorage } from './localStorage';

export interface UserObj {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRoles;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  parent: UserObj;
}

export enum UserRoles {
  OWNER = 'owner',
  ADMIN = 'admin',
  USER = 'user',
}

export interface DecodedToken {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoles;
  expiration: number;
  parentId: number;
}

export interface UserStatusObj extends DecodedToken {
  lastConnection: Date | null;
}

export interface AccessTokenObj {
  accessToken: string;
}

export function getUserRoles() {
  return [
    { value: UserRoles.OWNER, label: UserRoles.OWNER },
    { value: UserRoles.ADMIN, label: UserRoles.ADMIN },
    { value: UserRoles.USER, label: UserRoles.USER },
  ];
}

export function getToken(): string {
  const token = LocalStorage.getItem<string>('access_token');
  const tokenExpiration = LocalStorage.getItem<number>('access_token_expiration');

  if (token && tokenExpiration) if (getTime() < getTime(tokenExpiration)) return token;

  return '';
}

export function getDecodedToken(token: string = ''): DecodedToken | null {
  return decodeToken<DecodedToken>(token || getToken());
}

export function reInitializeToken(token: string): void {
  const decodedToken = getDecodedToken(token);

  if (decodedToken) {
    LocalStorage.removeItem('access_token');
    LocalStorage.removeItem('access_token_expiration');

    const storableData: [string, string | number][] = [
      ['access_token', token],
      ['access_token_expiration', new Date().getTime() + decodedToken.expiration],
    ];

    for (let [key, value] of storableData) LocalStorage.setItem(key, value);
  }
}

export function isUserAuthenticated(): boolean {
  return !!getToken();
}

export function hasRole(...roles: UserRoles[]): boolean {
  roles = roles || Object.values(UserRoles);

  const userInfo = getDecodedToken();

  if (!userInfo) return false;
  else return roles.some(role => userInfo.role === role);
}

export function isCurrentUser(): boolean {
  const userInfo = getDecodedToken()!;
  return userInfo.role === UserRoles.USER;
}

export function isCurrentAdmin(): boolean {
  const userInfo = getDecodedToken()!;
  return userInfo.role === UserRoles.ADMIN;
}

export function isCurrentOwner(): boolean {
  const userInfo = getDecodedToken()!;
  return userInfo.role === UserRoles.OWNER;
}

export function isUser(user: UserObj): boolean {
  return user.role === UserRoles.USER;
}

export function isAdmin(user: UserObj): boolean {
  return user.role === UserRoles.ADMIN;
}

export function isOwner(user: UserObj): boolean {
  return user.role === UserRoles.OWNER;
}

export function isUserEqualToCurrentUser(data: UserObj | number): boolean {
  const userInfo = getDecodedToken()!;
  if (typeof data === 'number') {
    return data === userInfo.id;
  } else {
    return data.id === userInfo.id;
  }
}

export function isUserCreatedByCurrentUser(user: UserObj): boolean {
  const userInfo = getDecodedToken()!;
  return user.parent.id === userInfo.id;
}

export function hasUserRoleAuthroized(user: UserObj): boolean {
  return isUserEqualToCurrentUser(user) && isCurrentUser();
}

export function hasAdminRoleAuthorized(user: UserObj): boolean {
  return isUserEqualToCurrentUser(user) && isCurrentAdmin();
}

export function hasOwnerRoleAuthorized(user: UserObj): boolean {
  return isUserEqualToCurrentUser(user) && isCurrentOwner();
}

export function hasCreatedByOwnerRoleAuthorized(user: UserObj): boolean {
  return isUserCreatedByCurrentUser(user) && !isOwner(user) && isCurrentOwner();
}

export function hasRoleAuthorized(user: UserObj): boolean {
  return (
    hasUserRoleAuthroized(user) ||
    hasAdminRoleAuthorized(user) ||
    hasOwnerRoleAuthorized(user) ||
    hasCreatedByOwnerRoleAuthorized(user)
  );
}
