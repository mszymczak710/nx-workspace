import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ListResponse } from '../../types/list-response.model';
import { User, UserQueryParams, UserSaveData } from '../../types/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/users';

  getUsers(options?: UserQueryParams): Observable<ListResponse<User>> {
    let params = new HttpParams();

    if (options?.page && options.page > 0) {
      params = params.set('page', options.page.toString());
    }
    if (options?.pageSize && options.pageSize > 0) {
      params = params.set('pageSize', options.pageSize.toString());
    }

    return this.http.get<ListResponse<User>>(this.apiUrl, { params });
  }

  addUser(user: UserSaveData): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(userId: number, user: UserSaveData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, user);
  }

  uploadAvatar(userId: number, avatar: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', avatar);

    return this.http.put<User>(`${this.apiUrl}/${userId}/avatar`, formData);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}
