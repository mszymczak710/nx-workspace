import { TranslocoService } from '@jsverse/transloco';
import { ToastService } from '@libs/shared/core/services';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { removeEntity, setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

import { inject } from '@angular/core';

import { exhaustMap, finalize, Observable, of, pipe, switchMap, tap, throwError } from 'rxjs';

import { UserService } from '../../services/user/user.service';
import { ListResponse } from '../../types/list-response.model';
import { User, UserQueryParams, UserSaveData } from '../../types/user.model';

type UserState = {
  currentPage: number;
  totalElements: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  selectedUser: User | null;
};

const initialState: UserState = {
  currentPage: 1,
  totalElements: 0,
  totalPages: 0,
  pageSize: 10,
  loading: false,
  selectedUser: null
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withEntities<User>(),
  withState(initialState),
  withMethods(store => {
    const userService = inject(UserService);
    const toastService = inject(ToastService);
    const translocoService = inject(TranslocoService);

    const setSelectedUser = (user: User | null): void => {
      patchState(store, { selectedUser: user });
    };

    const changePageSize = (pageSize: number): void => {
      loadUsers({ page: 1, pageSize });
    };

    const loadUsers = rxMethod<Partial<UserQueryParams> | void>(
      pipe(
        exhaustMap(params => {
          const page = params?.page ?? store.currentPage();
          const pageSize = params?.pageSize ?? store.pageSize();

          patchState(store, { currentPage: page, loading: true });

          return userService.getUsers({ page, pageSize }).pipe(
            tapResponse({
              next: (response: ListResponse<User>) => {
                const { content, totalElements, currentPage, totalPages, pageSize } = response;

                patchState(store, setAllEntities(content));
                patchState(store, { totalElements, currentPage, totalPages, pageSize });
              },
              error: () => {
                // Global HTTP error handling (toast) is already covered by the HTTP interceptor.
              }
            }),
            finalize(() => patchState(store, { loading: false }))
          );
        })
      )
    );

    const saveUserWithAvatar = (user: UserSaveData, avatar: File | null, existingUserId?: number): Observable<User> => {
      const save$ = existingUserId ? userService.updateUser(existingUserId, user) : userService.addUser(user);

      return save$.pipe(
        switchMap(savedUser => (avatar ? userService.uploadAvatar(savedUser.id, avatar) : of(savedUser))),
        tap(() => {
          loadUsers();
          const message = translocoService.translate(existingUserId ? 'users.toast.updateSuccess' : 'users.toast.createSuccess');
          toastService.showSuccessMessage(message);
        })
      );
    };
    const addUser = (user: UserSaveData, avatar: File | null): Observable<User> => saveUserWithAvatar(user, avatar);

    const updateUser = (user: UserSaveData, avatar: File | null): Observable<User> => {
      const selectedUser = store.selectedUser();

      if (!selectedUser) {
        return throwError(() => new Error('No user selected for update'));
      }

      return saveUserWithAvatar(user, avatar, selectedUser.id);
    };

    const deleteUser = (): Observable<void> => {
      const selectedUser = store.selectedUser();

      if (!selectedUser) {
        return throwError(() => new Error('No user selected for deletion'));
      }

      const currentPage = store.currentPage();
      const remainingOnPage = store.entities().length - 1;
      const page = remainingOnPage === 0 && currentPage > 1 ? currentPage - 1 : currentPage;

      return userService.deleteUser(selectedUser.id).pipe(
        tap(() => {
          patchState(store, removeEntity(selectedUser.id));
          patchState(store, { selectedUser: null });
          loadUsers({ page });
          const message = translocoService.translate('users.toast.deleteSuccess');
          toastService.showSuccessMessage(message);
        })
      );
    };

    return { loadUsers, setSelectedUser, addUser, updateUser, deleteUser, changePageSize };
  })
);
