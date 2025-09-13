import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NotificationService } from './notification';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['showError', 'showSuccess']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Validation Methods', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should return false for isLoggedInWithValidToken when no tokens exist', async () => {
      const result = await service.isLoggedInWithValidToken();
      expect(result).toBe(false);
    });

    it('should return false for isAdminWithValidToken when no tokens exist', async () => {
      const result = await service.isAdminWithValidToken();
      expect(result).toBe(false);
    });

    it('should return false for checkAndRefreshToken when no tokens exist', async () => {
      const result = await service.checkAndRefreshToken();
      expect(result).toBe(false);
    });

    it('should validate admin access and redirect when not admin', async () => {
      const result = await service.validateAdminAccess(router, notificationService);
      
      expect(result).toBe(false);
      expect(notificationService.showError).toHaveBeenCalledWith('Phiên đăng nhập đã hết hạn hoặc bạn không có quyền truy cập');
      expect(service.clearTokens).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should validate login access and redirect when not logged in', async () => {
      const result = await service.validateLoginAccess(router, notificationService);
      
      expect(result).toBe(false);
      expect(notificationService.showError).toHaveBeenCalledWith('Vui lòng đăng nhập để truy cập trang này');
      expect(service.clearTokens).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Token Management', () => {
    it('should clear tokens correctly', () => {
      localStorage.setItem('accessToken', 'test-access');
      localStorage.setItem('refreshToken', 'test-refresh');
      localStorage.setItem('userInfo', 'test-user');

      service.clearTokens();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('userInfo')).toBeNull();
    });

    it('should get tokens correctly', () => {
      localStorage.setItem('accessToken', 'test-access');
      localStorage.setItem('refreshToken', 'test-refresh');

      expect(service.getAccessToken()).toBe('test-access');
      expect(service.getRefreshToken()).toBe('test-refresh');
    });
  });

  describe('Login', () => {
    it('should login successfully and store tokens', () => {
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        user: { id: 1, email: 'test@example.com', role: 'ADMIN' }
      };

      service.login({ username: 'test@example.com', password: 'password' }).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('accessToken')).toBe('new-access-token');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
        expect(localStorage.getItem('userInfo')).toBe(JSON.stringify(mockResponse.user));
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('Refresh Token', () => {
    it('should refresh token successfully', () => {
      localStorage.setItem('refreshToken', 'old-refresh-token');
      
      const mockResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      };

      service.refreshToken('old-refresh-token').subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(localStorage.getItem('accessToken')).toBe('new-access-token');
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token');
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/refresh-token');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});
