import {
  Constructor,
  getInitialInputsValue,
  LocalStorage,
  getInputRules,
  getInputsRules,
  getCachedInputs,
  getInputsValidation,
  getInitialInputValidation,
  InputsValidation,
  setInputsValidation,
} from '../';

export type IgnoreFormConstructor<T extends Form> = Omit<T, keyof Form>;

export abstract class Form {
  getPrototype(): object {
    return this.constructor.prototype;
  }

  getConstructorName(): string {
    return this.constructor.name;
  }

  getRule(key: string) {
    return getInputRules(key, this.getPrototype());
  }

  getRules() {
    return getInputsRules(this.getPrototype());
  }

  cachInput(key: keyof this, value: any): void {
    const cachedInputs = getCachedInputs(this.getPrototype());
    const isInputCached = cachedInputs.has(key as string);
    if (isInputCached) {
      const cachedForm = this.getCachedForm();
      const newCachedForm = Object.assign(cachedForm, { [key]: value });
      this.setCacheableFrom(newCachedForm);
    }
  }

  getCachedForm(): this {
    return LocalStorage.getItem(this.getConstructorName()) || {};
  }

  setCacheableFrom(value: this) {
    LocalStorage.setItem(this.getConstructorName(), value);
  }

  clearCachedForm() {
    LocalStorage.removeItem(this.getConstructorName());
  }

  clearCachedInput(key: keyof this) {
    const cachedForm = this.getCachedForm();
    if (cachedForm[key]) delete cachedForm[key];
    this.setCacheableFrom(cachedForm);
  }

  getCachedInput(name: keyof this): any {
    const cachedForm = this.getCachedForm();
    return cachedForm[name] || this[name];
  }

  resetCach<T extends Form>(): T {
    const inputs = getInitialInputsValue(this.getPrototype());
    for (let key in inputs) this[key as keyof this] = inputs[key];
    this.clearCachedForm();
    return new (this.constructor as Constructor)() as T;
  }

  getInputValidation(key: keyof this) {
    return this.getInputsValidation()[key as string];
  }

  getInputsValidation() {
    return getInputsValidation(this.getPrototype());
  }

  setInputsValidation(value: InputsValidation) {
    setInputsValidation(value, this.getPrototype());
  }

  isFormValid() {
    let isFormValid: boolean = true;
    for (const key in this) {
      for (const ruleFn of this.getRule(key)) {
        isFormValid = isFormValid && !!!ruleFn(this[key]);
      }
    }
    return isFormValid;
  }

  resetInputsValidation() {
    const inputsValidation = this.getInputsValidation();
    for (const key in inputsValidation) inputsValidation[key] = getInitialInputValidation();
    this.setInputsValidation(inputsValidation);
  }
}
