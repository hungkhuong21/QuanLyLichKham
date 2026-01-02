import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [HeaderComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {

  TenDangNhap: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (!this.TenDangNhap) {
      alert('Vui lòng nhập tên đăng nhập (email) của bạn.');
      return;
    }

    this.isLoading = true;
    
    this.authService.requestPasswordReset(this.TenDangNhap).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Password reset request:', response);
        
        // Lưu TenDangNhap vào sessionStorage để dùng ở các bước tiếp theo
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('resetPasswordTenDangNhap', this.TenDangNhap);
          // Nếu có OTP trong response (development mode), lưu vào sessionStorage
          if (response.otp) {
            sessionStorage.setItem('devOtp', response.otp);
            alert(`Mã OTP đã được tạo (chế độ phát triển): ${response.otp}. Hết hạn trong ${response.ttlMinutes || 15} phút.`);
          } else {
            alert('Mã xác minh đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
          }
        }
        
    // Navigate to verification page
    this.router.navigate(['/verify-code']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Password reset request failed:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Gửi yêu cầu đặt lại mật khẩu thất bại. Vui lòng thử lại.';
        alert(errorMessage);
      }
    });
  }

}

