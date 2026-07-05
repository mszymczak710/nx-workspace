import { HttpMethod } from '@libs/shared/core/types';

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ListResponse } from '../../types/list-response.model';
import { User, UserSaveData } from '../../types/user.model';
import { UserService } from './user.service';

const API_URL = '/api/users';

const mockUser: User = {
  id: 1,
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan@example.com',
  avatar: ''
};

const mockUserSaveData: UserSaveData = {
  firstName: 'Jan',
  lastName: 'Kowalski',
  email: 'jan@example.com'
};

const mockListResponse: ListResponse<User> = {
  content: [mockUser],
  currentPage: 1,
  totalPages: 1,
  totalElements: 1,
  pageSize: 10
};

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch users with page and pageSize params when both provided', () => {
    service.getUsers({ page: 1, pageSize: 10 }).subscribe(response => {
      expect(response).toEqual(mockListResponse);
    });

    const req = httpMock.expectOne(`${API_URL}?page=1&pageSize=10`);
    expect(req.request.method).toBe(HttpMethod.Get);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockListResponse);
  });

  it('should not set page param when currentPage is 0', () => {
    service.getUsers({ page: 0, pageSize: 10 }).subscribe();

    const req = httpMock.expectOne(`${API_URL}?pageSize=10`);
    expect(req.request.params.has('page')).toBe(false);
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush(mockListResponse);
  });

  it('should not set pageSize param when pageSize is 0', () => {
    service.getUsers({ page: 1, pageSize: 0 }).subscribe();

    const req = httpMock.expectOne(`${API_URL}?page=1`);
    expect(req.request.params.has('pageSize')).toBe(false);
    expect(req.request.params.get('page')).toBe('1');
    req.flush(mockListResponse);
  });

  it('should not set page param when currentPage is negative', () => {
    service.getUsers({ page: -1, pageSize: 10 }).subscribe();

    const req = httpMock.expectOne(`${API_URL}?pageSize=10`);
    expect(req.request.params.has('page')).toBe(false);
    req.flush(mockListResponse);
  });

  it('should not set any params when currentPage and pageSize are undefined', () => {
    service.getUsers().subscribe();

    const req = httpMock.expectOne(API_URL);
    expect(req.request.params.has('page')).toBe(false);
    expect(req.request.params.has('pageSize')).toBe(false);
    req.flush(mockListResponse);
  });

  it('should create user and return created user', () => {
    service.addUser(mockUserSaveData).subscribe(response => {
      expect(response).toEqual(mockUser);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe(HttpMethod.Post);
    expect(req.request.body).toEqual(mockUserSaveData);
    req.flush(mockUser);
  });

  it('should update user and return updated user', () => {
    service.updateUser(1, mockUserSaveData).subscribe(response => {
      expect(response).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe(HttpMethod.Put);
    expect(req.request.body).toEqual(mockUserSaveData);
    req.flush(mockUser);
  });

  it('should upload avatar and return updated user', () => {
    const file = new File(['fake-image'], 'avatar.png', { type: 'image/png' });

    service.uploadAvatar(1, file).subscribe(response => {
      expect(response).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${API_URL}/1/avatar`);
    expect(req.request.method).toBe(HttpMethod.Put);
    expect(req.request.body).toBeInstanceOf(FormData);
    expect(req.request.body.get('file')).toEqual(file);
    req.flush(mockUser);
  });

  it('should delete user by id', () => {
    service.deleteUser(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${API_URL}/1`);
    expect(req.request.method).toBe(HttpMethod.Delete);
    req.flush(null);
  });
});
