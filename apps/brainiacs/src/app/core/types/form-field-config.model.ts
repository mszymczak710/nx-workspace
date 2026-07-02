import { Field } from '@angular/forms/signals';

export interface FormFieldConfig {
  field?: Field<string>;
  name: string;
  label: string;
  placeholder?: string;
  required: boolean;
  class: string;
  type?: string;
}
