import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/taikhoan';
  private currentUserSubject: BehaviorSubject<any | null>;
  public currentUser: Observable<any | null>;

  constructor(private http: HttpClient) {
    // Load user from localStorage if exists (chỉ trên trình duyệt)
    let savedUser = null;
    if (typeof window !== 'undefined') {
      savedUser = localStorage.getItem('currentUser');
    }
    this.currentUserSubject = new BehaviorSubject<any | null>(savedUser ? JSON.parse(savedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any | null {
    return this.currentUserSubject.value;
  }

  // Cập nhật thông tin user hiện tại (sau khi tạo bệnh nhân mới)
  public updateCurrentUser(updatedUser: any): void {
    if (updatedUser && typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: { TenDangNhap: string, MatKhau: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('[AuthService] Login response:', response);
        // Store user details in localStorage (chỉ trên trình duyệt)
        if (response && response.user && typeof window !== 'undefined') {
          console.log('[AuthService] Saving user to localStorage:', response.user);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          console.log('[AuthService] User saved. currentUserValue is now:', this.currentUserValue);
        } else {
          console.error('[AuthService] ERROR: No response.user in login response!', response);
        }
      })
    );
  }

  logout(): void {
    // Remove user from localStorage (chỉ trên trình duyệt)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Lấy thông tin user hiện tại từ backend
  getProfile(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Cập nhật thông tin user
  updateProfile(id: number, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData).pipe(
      tap(updatedUser => {
        // Cập nhật lại localStorage và BehaviorSubject nếu cần (chỉ trên trình duyệt)
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  // Yêu cầu đặt lại mật khẩu (tạo OTP)
  requestPasswordReset(TenDangNhap: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/password-reset/request`, { TenDangNhap });
  }

  // Xác thực OTP
  verifyOtp(TenDangNhap: string, otp: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/password-reset/verify`, { TenDangNhap, otp });
  }

  // Đặt lại mật khẩu bằng OTP
  resetPassword(TenDangNhap: string, otp: string, MatKhau: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/password-reset/reset`, { TenDangNhap, otp, MatKhau });
  }
}