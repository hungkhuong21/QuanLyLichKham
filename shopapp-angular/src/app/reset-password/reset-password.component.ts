import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [HeaderComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {

  newPassword: string = '';
  confirmPassword: string = '';
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isSuccess: boolean = false;
  TenDangNhap: string = '';
  otp: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Lấy TenDangNhap và OTP từ sessionStorage
    if (typeof window !== 'undefined') {
      this.TenDangNhap = sessionStorage.getItem('resetPasswordTenDangNhap') || '';
      this.otp = sessionStorage.getItem('resetPasswordOtp') || '';
      
      if (!this.TenDangNhap || !this.otp) {
        // Nếu không có thông tin, quay lại trang forgot-password
        alert('Phiên làm việc đã hết hạn. Vui lòng thử lại từ đầu.');
        this.router.navigate(['/forgot-password']);
      }
    }
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    if (!this.newPassword || !this.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (!this.TenDangNhap || !this.otp) {
      alert('Lỗi: Không tìm thấy thông tin xác thực. Vui lòng thử lại từ đầu.');
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.isLoading = true;

    this.authService.resetPassword(this.TenDangNhap, this.otp, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Password reset successful:', response);
        
        // Xóa thông tin trong sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('resetPasswordTenDangNhap');
          sessionStorage.removeItem('resetPasswordOtp');
          sessionStorage.removeItem('devOtp');
        }
    
    // Show success state
    this.isSuccess = true;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password reset failed:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
        alert(errorMessage);
      }
    });
  }

  onContinue(): void {
    // Navigate to login page after success
    this.router.navigate(['/login']);
  }

}

