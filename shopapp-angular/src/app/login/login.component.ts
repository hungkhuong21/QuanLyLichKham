import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FooterComponent } from "../footer/footer.component";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderComponent, FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  TenDangNhap: string = '';
  MatKhau: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  onLogin(): void {
    if (!this.TenDangNhap || !this.MatKhau) {
      alert('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    this.authService.login({
      TenDangNhap: this.TenDangNhap,
      MatKhau: this.MatKhau
    }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        console.log('Login response.user:', response.user);
        console.log('Login response.user.MaNguoiDung:', response.user?.MaNguoiDung);
        console.log('Login response.user keys:', response.user ? Object.keys(response.user) : 'null');
        console.log('Complete user object:', JSON.stringify(response.user, null, 2));
        alert('Đăng nhập thành công!');

        // Kiểm tra vai trò để điều hướng
        const user = response.user;

        if (user) {
          console.log('[DEBUG] User:', user);

          // ADMIN / NHÂN VIÊN
          if (user.VaiTroID === 1 || user.LoaiNguoiDung === 'NhanVien') {
            this.router.navigate(['/admin']);

            // 👨‍⚕️ BÁC SĨ
          } else if (user.VaiTroID === 2 || user.LoaiNguoiDung === 'BacSi') {
            this.router.navigate(['/doctor/dashboard']);

            // 👤 BỆNH NHÂN
          } else if (user.LoaiNguoiDung === 'BenhNhan') {
            this.router.navigate(['/']);

            // FALLBACK
          } else {
            this.router.navigate(['/']);
          }

        } else {
          this.router.navigate(['/']);
        }

      },
      error: (error) => {
        console.error('Login failed:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
        alert(errorMessage);
      }
    });
  }

  togglePasswordVisibility(fieldId: string): void {
    const input = document.getElementById(fieldId) as HTMLInputElement;
    const icon = input.nextElementSibling as HTMLElement;

    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  }

  onPaste(event: ClipboardEvent): void {
    const target = event.target as HTMLInputElement;
    // Allow the default paste to happen, then fix the background
    setTimeout(() => {
      target.style.backgroundColor = 'transparent';
    }, 0);
  }
}
