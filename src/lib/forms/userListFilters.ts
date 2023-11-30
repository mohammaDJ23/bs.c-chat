import { UserRoles } from '..';
import { DefineRules, DefineVal, CacheInput, DefineValidation } from '../decorators';
import { isArrayOfNumber, isDate, isUserRoles } from '../validations';
import { Form, IgnoreFormConstructor } from './formConstructor';

export interface UserListFiltersObj extends IgnoreFormConstructor<UserListFilters> {}

export class UserListFilters extends Form implements UserListFiltersObj {
  @DefineVal()
  @DefineValidation()
  q: string = '';

  @DefineRules([isUserRoles])
  @DefineVal(Object.values(UserRoles))
  @DefineValidation()
  roles: UserRoles[] = Object.values(UserRoles);

  @DefineRules([isArrayOfNumber])
  @DefineVal()
  @DefineValidation()
  ids: number[] = [];

  @DefineRules([isDate])
  @DefineVal()
  @DefineValidation()
  fromDate: number = 0;

  @DefineRules([isDate])
  @DefineVal()
  @CacheInput()
  @DefineValidation()
  toDate: number = 0;

  constructor() {
    super();
    this.q = this.q;
    this.roles = this.roles;
    this.fromDate = this.fromDate;
    this.toDate = this.toDate;
    this.ids = this.ids;
  }
}
