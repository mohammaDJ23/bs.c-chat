import { lazy } from 'react';

interface GetDynamicPathOptions {
  [key: string]: string | number;
}

const Chat = lazy(() => import('../components/Chat'));

export enum Pathes {
  LOGIN = '/auth/login',
  USER = '/bank/users/:id',
  CONVERSATION = '/bank/chat',
}

export const routes = [{ path: Pathes.CONVERSATION, element: <Chat /> }];

export function getDynamicPath(path: Pathes, options: GetDynamicPathOptions): string {
  let dynamicQuery = '';
  let newPath: string | Pathes = path;

  for (const key in options) {
    dynamicQuery = `:${key}`;
    if (path.includes(dynamicQuery)) {
      newPath = newPath.replace(dynamicQuery, options[key].toString());
    } else {
      continue;
    }
  }

  return newPath;
}
