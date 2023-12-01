import { useMemo } from 'react';
import { Form as FormConstructor, InputsRules } from '../lib';
import { ModalNames } from '../store';
import { useAction } from './useActions';
import { useSelector } from '../hooks';

interface FormInstance extends FormConstructor {}

export type UseFormExportation = ReturnType<typeof useForm>;

export function useForm<T extends FormInstance>(initialForm: Constructor<T>) {
  const { showModal, setForm, onChange: changeInput, resetForm: resettingForm } = useAction();
  const { modals, forms } = useSelector();

  return useMemo(
    function () {
      function getFormName(): string {
        return initialForm.name;
      }

      function getForm(): T {
        return forms[getFormName()] as T;
      }

      function initializeForm(form: T): void {
        setForm<T>(form);
      }

      function onChange(key: keyof T, value: any): void {
        changeInput({ form: initialForm, key, value });
      }

      function resetForm(): void {
        resettingForm(initialForm);
        getForm().resetInputsValidation();
      }

      function getRules(): InputsRules {
        return getForm().getRules();
      }

      function resetCach(): FormConstructor {
        return getForm().resetCach();
      }

      function isFormValid(): boolean {
        return getForm().isFormValid();
      }

      function confirmation(): void {
        if (isFormValid()) showModal(ModalNames.CONFIRMATION);
      }

      function onSubmit(cb: () => Promise<void> | void): void {
        if (isFormValid()) cb.call({});
      }

      function isConfirmationActive(): boolean {
        return !!modals[ModalNames.CONFIRMATION];
      }

      function getInputErrorMessage(key: keyof T): string | undefined {
        return getForm().getInputValidation(key).errorMessage;
      }

      function isInputInValid(key: keyof T): boolean {
        return !!getForm().getInputValidation(key).errorMessage;
      }

      return {
        initializeForm,
        onChange,
        resetForm,
        resetCach,
        getRules,
        confirmation,
        onSubmit,
        isConfirmationActive,
        getForm,
        getInputErrorMessage,
        isInputInValid,
        isFormValid,
      };
    },
    [modals, forms, initialForm, showModal, resettingForm, changeInput, setForm]
  );
}
