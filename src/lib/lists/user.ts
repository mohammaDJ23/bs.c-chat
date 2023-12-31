import { PaginationList } from './paginationList';
import { UserRoles } from '../authentication';

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

export class UserList<T = UserObj> extends PaginationList.BaseList<T> {
  constructor(arg: Partial<PaginationList.BaseList<T>> = {}) {
    super(arg);
  }
}
