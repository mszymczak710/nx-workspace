import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { email, form, FormField, FormRoot, maxLength, pattern, required } from '@angular/forms/signals';

import { firstValueFrom, Subscription } from 'rxjs';

import { Spinner } from '../../../../core/components/spinner/spinner';
import { UserStore } from '../../../../core/store/user/user.store';
import { FormFieldConfig } from '../../../../core/types/form-field-config.model';
import { mapHttpErrorToSubmitErrors } from '../../../../core/utils/http-error-mapper';

@Component({
  selector: 'brn-user-form-dialog',
  imports: [TranslocoModule, FormField, FormRoot, NgTemplateOutlet, Spinner],
  templateUrl: './user-form-dialog.html',
  styleUrl: './user-form-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormDialog {
  private readonly modal = inject(NgbActiveModal);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translocoService = inject(TranslocoService);
  private readonly userStore = inject(UserStore);
  private readonly http = inject(HttpClient);

  readonly user = this.userStore.selectedUser;

  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  readonly avatarFile = signal<File | null>(null);

  readonly avatarTouched = signal(false);
  readonly avatarSizeInvalid = signal(false);
  readonly avatarPreview = signal<string | null>(null);
  readonly avatarLoading = signal(false);

  readonly userModel = signal({
    firstName: this.user()?.firstName ?? '',
    lastName: this.user()?.lastName ?? '',
    email: this.user()?.email ?? ''
  });

  readonly isUpdate = computed(() => !!this.user());
  readonly avatarInvalid = computed(() => !this.avatarFile() || this.avatarSizeInvalid());

  readonly fields = computed((): FormFieldConfig[] => [
    {
      field: this.userForm.firstName,
      name: 'firstName',
      label: 'users.dialog.fields.firstName.label',
      placeholder: 'users.dialog.fields.firstName.placeholder',
      required: true,
      class: 'col-6'
    },
    {
      field: this.userForm.lastName,
      name: 'lastName',
      label: 'users.dialog.fields.lastName.label',
      placeholder: 'users.dialog.fields.lastName.placeholder',
      required: true,
      class: 'col-6'
    },
    {
      field: this.userForm.email,
      name: 'email',
      label: 'users.dialog.fields.email.label',
      placeholder: 'users.dialog.fields.email.placeholder',
      required: true,
      class: 'col-12',
      type: 'email'
    },
    {
      name: 'avatar',
      label: 'users.dialog.fields.avatar.label',
      required: true,
      class: 'col-12',
      type: 'file'
    }
  ]);

  readonly title = computed(() => {
    const messageKey = this.isUpdate() ? 'users.dialog.update.title' : 'users.dialog.create.title';
    return this.translocoService.translate(messageKey);
  });

  readonly userForm = form(
    this.userModel,
    s => {
      required(s.firstName, { message: 'users.dialog.validation.required' });
      pattern(s.firstName, /^[A-Z][a-z]*$/, { message: 'users.dialog.validation.firstName.pattern' });
      maxLength(s.firstName, 255, { message: 'users.dialog.validation.maxlength' });

      required(s.lastName, { message: 'users.dialog.validation.required' });
      pattern(s.lastName, /^[A-Z][a-z]*$/, { message: 'users.dialog.validation.lastName.pattern' });
      maxLength(s.lastName, 255, { message: 'users.dialog.validation.maxlength' });

      required(s.email, { message: 'users.dialog.validation.required' });
      email(s.email, { message: 'users.dialog.validation.email.email' });
      maxLength(s.email, 255, { message: 'users.dialog.validation.maxlength' });
    },
    {
      submission: {
        action: async field => {
          if (this.avatarInvalid()) {
            return [{ kind: 'general', message: 'users.dialog.validation.avatar.required' }];
          }

          const { firstName, lastName, email } = field().value();
          const avatar = this.avatarFile();
          const user = { firstName, lastName, email };

          try {
            const operation$ = this.isUpdate() ? this.userStore.updateUser(user, avatar) : this.userStore.addUser(user, avatar);

            await firstValueFrom(operation$);

            this.modal.close();
            return null;
          } catch (error) {
            return mapHttpErrorToSubmitErrors(error, field, {
              firstName: field.firstName,
              lastName: field.lastName,
              email: field.email
            });
          }
        },
        onInvalid: field => {
          const firstError = field().errorSummary()[0];
          firstError?.fieldTree().focusBoundControl();
        }
      }
    }
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.userStore.setSelectedUser(null);
      this.setPreview(null);
    });

    effect(onCleanup => {
      const user = this.user();

      if (!user?.avatar) {
        return;
      }

      const subscription = this.setAvatarValue(user.avatar);

      onCleanup(() => subscription.unsubscribe());
    });
  }

  private setAvatarValue(avatar: string): Subscription {
    this.avatarLoading.set(true);
    return this.http.get(avatar, { responseType: 'blob' }).subscribe({
      next: blob => {
        const file = new File([blob], 'avatar.png', { type: blob.type || 'image/png' });

        if (typeof DataTransfer !== 'undefined') {
          const dt = new DataTransfer();
          dt.items.add(file);

          const input = this.fileInputRef()?.nativeElement;
          if (input) {
            input.files = dt.files;
          }
        }

        this.avatarFile.set(file);
        this.setPreview(avatar);
      },
      error: error => {
        console.error('Failed to load avatar:', error);
        this.avatarLoading.set(false);
      },
      complete: () => this.avatarLoading.set(false)
    });
  }

  async onAvatarChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const url = URL.createObjectURL(file);
    const isSquare = await this.isSquareImage(url);

    if (!isSquare) {
      URL.revokeObjectURL(url);
      this.avatarSizeInvalid.set(true);
      input.value = '';
      this.avatarFile.set(null);
      this.setPreview(null);
      return;
    }

    this.avatarSizeInvalid.set(false);
    this.avatarFile.set(file);
    this.setPreview(url);
  }

  private isSquareImage(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img.width === img.height);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  private setPreview(url: string | null): void {
    const current = this.avatarPreview();

    if (current?.startsWith('blob:')) {
      URL.revokeObjectURL(current);
    }

    this.avatarPreview.set(url);
  }

  cancel(): void {
    this.modal.dismiss();
  }
}
