import { DefineRules, DefineVal, CacheInput, DefineValidation } from '../decorators';
import { isDate } from '../validations';
import { Form, IgnoreFormConstructor } from './formConstructor';

export interface OwnerListFiltersObj extends IgnoreFormConstructor<OwnerListFilters> {}

export class OwnerListFilters extends Form implements OwnerListFiltersObj {
  @DefineVal()
  @DefineValidation()
  q: string = '';

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
    this.fromDate = this.fromDate;
    this.toDate = this.toDate;
  }
}
