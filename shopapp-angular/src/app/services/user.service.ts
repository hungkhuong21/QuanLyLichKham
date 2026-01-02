import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';

export interface BackendTaiKhoan {
  MaTK: number;
  TenDangNhap: string;
  MatKhau?: string;
  VaiTroID?: number;
  LoaiNguoiDung: string;
  MaNguoiDung: number;
  TrangThai: string;
  NgayTao: string;
  NgayCapNhat?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = 'http://localhost:3000/api/taikhoan';

    constructor(private http: HttpClient) { }

    // Map từ backend sang frontend
    private mapToFrontend(backendUser: BackendTaiKhoan): User {
      return {
        id: backendUser.MaTK,
        username: backendUser.TenDangNhap,
        email: backendUser.TenDangNhap, // TenDangNhap thường là email
        role: this.getRoleName(backendUser.VaiTroID),
        loaiNguoiDung: backendUser.LoaiNguoiDung,
        maNguoiDung: backendUser.MaNguoiDung,
        status: backendUser.TrangThai,
        vaiTroID: backendUser.VaiTroID,
        ngayTao: backendUser.NgayTao,
        ngayCapNhat: backendUser.NgayCapNhat
      };
    }

    // Map từ frontend sang backend
    private mapToBackend(user: Partial<User>, isUpdate: boolean = false): any {
      // Ưu tiên username, nếu không có thì dùng email
      const tenDangNhap = user.username || user.email || '';
      
      const backendData: any = {};

      // Luôn gửi TenDangNhap nếu có
      if (tenDangNhap) {
        backendData.TenDangNhap = tenDangNhap;
      }

      // Gửi các trường khác nếu có
      if (user.loaiNguoiDung) {
        backendData.LoaiNguoiDung = user.loaiNguoiDung;
      }

      if (user.maNguoiDung !== undefined) {
        backendData.MaNguoiDung = user.maNguoiDung;
      }

      if (user.vaiTroID !== undefined) {
        backendData.VaiTroID = user.vaiTroID;
      }

      // Mật khẩu: chỉ gửi khi có giá trị (để cập nhật)
      if (user.password && user.password.trim()) {
        backendData.MatKhau = user.password;
      }

      // Trạng thái
      if (user.status) {
        backendData.TrangThai = user.status;
      }

      return backendData;
    }

    // Lấy tên vai trò từ ID
    private getRoleName(vaiTroID?: number): string {
      switch (vaiTroID) {
        case 1: return 'Admin';
        case 2: return 'BacSi';
        case 3: return 'BenhNhan';
        default: return 'BenhNhan';
      }
    }

    getTotalUsers(): Observable<{ total: number }> {
        return this.getUsers().pipe(
          map(users => ({ total: users.length }))
        );
    }

    getUsers(): Observable<User[]> {
        return this.http.get<BackendTaiKhoan[]>(this.apiUrl).pipe(
          map(users => users.map(u => this.mapToFrontend(u)))
        );
    }

    getUserById(id: number): Observable<User> {
      return this.http.get<BackendTaiKhoan>(`${this.apiUrl}/${id}`).pipe(
        map(user => this.mapToFrontend(user))
      );
    }

    addUser(user: Partial<User>): Observable<any> {
      const backendData = this.mapToBackend(user, false);
      return this.http.post<any>(`${this.apiUrl}/register`, backendData);
  }

    updateUser(id: number, user: Partial<User>): Observable<any> {
      const backendData = this.mapToBackend(user, true);
      console.log('Update user data:', backendData); // Debug log
      return this.http.put<any>(`${this.apiUrl}/${id}`, backendData);
  }

  deleteUser(id: number): Observable<any> {
      return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    // Reset password
    requestPasswordReset(username: string): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/password-reset/request`, { TenDangNhap: username });
    }

    verifyOtp(username: string, otp: string): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/password-reset/verify`, { TenDangNhap: username, otp });
    }

    resetPassword(username: string, otp: string, newPassword: string): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/password-reset/reset`, { 
        TenDangNhap: username, 
        otp, 
        MatKhau: newPassword 
      });
  }
}