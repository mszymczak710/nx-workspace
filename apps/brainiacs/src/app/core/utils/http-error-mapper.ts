import { HttpErrorResponse } from '@angular/common/http';
import { FieldTree } from '@angular/forms/signals';

type FieldMap = Record<string, FieldTree<unknown>>;

export type SubmitError = { kind: string; message?: string; fieldTree?: FieldTree<unknown> };

export const mapHttpErrorToSubmitErrors = (error: unknown, rootField: FieldTree<unknown>, fieldMap: FieldMap): SubmitError[] => {
  if (!(error instanceof HttpErrorResponse) || typeof error.error !== 'object' || error.error === null) {
    return [{ kind: 'general', message: 'errors.http.unknown', fieldTree: rootField }];
  }

  const body = error.error;

  if (body.non_field_errors) {
    const message = Array.isArray(body.non_field_errors) ? body.non_field_errors.join('. ') : body.non_field_errors;
    return [{ kind: 'general', message, fieldTree: rootField }];
  }

  return collectFieldErrors(body, fieldMap);
};

export const extractGeneralErrorMessage = (error: unknown): string => {
  if (error instanceof HttpErrorResponse && typeof error.error === 'object' && error.error !== null) {
    const body = error.error;

    if (body.non_field_errors) {
      return Array.isArray(body.non_field_errors) ? body.non_field_errors.join('. ') : body.non_field_errors;
    }
  }

  return 'errors.http.unknown';
};

const collectFieldErrors = (errors: Record<string, unknown>, fieldMap: FieldMap, parentKey = ''): SubmitError[] => {
  const result: SubmitError[] = [];

  Object.keys(errors).forEach(key => {
    const fieldPath = parentKey ? `${parentKey}.${key}` : key;
    const value = errors[key];

    if (Array.isArray(value)) {
      const targetField = fieldMap[fieldPath];
      if (targetField) {
        result.push({
          kind: 'server',
          message: value.join('. '),
          fieldTree: targetField
        });
      }
    } else if (typeof value === 'string') {
      const targetField = fieldMap[fieldPath];
      if (targetField) {
        result.push({
          kind: 'server',
          message: value,
          fieldTree: targetField
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      result.push(...collectFieldErrors(value as Record<string, unknown>, fieldMap, fieldPath));
    }
  });

  return result;
};
