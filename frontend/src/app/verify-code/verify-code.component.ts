import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-verify-code',
  standalone: true,
  imports: [HeaderComponent, FormsModule, CommonModule, RouterLink],
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss'
})
export class VerifyCodeComponent implements OnInit, OnDestroy {

  code: string[] = ['', '', '', ''];
  timeLeft: number = 900; // 15 minutes in seconds
  timerSubscription?: Subscription;
  canResend: boolean = false;
  TenDangNhap: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Lấy TenDangNhap từ sessionStorage
    if (typeof window !== 'undefined') {
      this.TenDangNhap = sessionStorage.getItem('resetPasswordTenDangNhap') || '';
      if (!this.TenDangNhap) {
        // Nếu không có TenDangNhap, quay lại trang forgot-password
        this.router.navigate(['/forgot-password']);
        return;
      }
    }
    this.startTimer();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.canResend = true;
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
      }
    });
  }

  onCodeInput(event: any, index: number): void {
    const input = event.target;
    let value = input.value;

    // Chỉ cho phép số
    value = value.replace(/[^0-9]/g, '');
    
    // Chỉ lấy ký tự đầu tiên nếu nhập nhiều hơn 1
    if (value.length > 1) {
      value = value.charAt(0);
    }

    // Cập nhật giá trị vào array
    this.code[index] = value;
    input.value = value;

    // Di chuyển sang input tiếp theo nếu đã nhập và chưa phải input cuối
    if (value && index < 3) {
      setTimeout(() => {
        const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 10);
    }

    // Tự động submit nếu tất cả các trường đã được điền
    if (value && this.code.every(digit => digit !== '')) {
      setTimeout(() => {
        this.onSubmit();
      }, 100);
    }
  }

  onCodeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    
    // Xử lý Backspace
    if (event.key === 'Backspace') {
      if (!this.code[index] || this.code[index] === '') {
        // Nếu input hiện tại trống, chuyển về input trước đó và xóa
        if (index > 0) {
          const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
          if (prevInput) {
            this.code[index - 1] = '';
            prevInput.value = '';
            prevInput.focus();
          }
        }
      } else {
        // Nếu input hiện tại có giá trị, xóa nó
        this.code[index] = '';
        input.value = '';
      }
    }
    
    // Xử lý các phím mũi tên
    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
    
    if (event.key === 'ArrowRight' && index < 3) {
      event.preventDefault();
      const nextInput = document.getElementById(`code-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text').trim() || '';
    
    // Chỉ lấy 4 chữ số đầu tiên
    const digits = pastedData.replace(/[^0-9]/g, '').substring(0, 4);
    
    if (digits.length === 4) {
      this.code = digits.split('');
      
      // Cập nhật giá trị cho tất cả các input
      for (let i = 0; i < 4; i++) {
        const input = document.getElementById(`code-${i}`) as HTMLInputElement;
        if (input) {
          input.value = this.code[i];
        }
      }
      
      // Focus input cuối cùng
      setTimeout(() => {
        const lastInput = document.getElementById('code-3') as HTMLInputElement;
        if (lastInput) {
          lastInput.focus();
        }
      }, 10);
    }
  }

  onSubmit(): void {
    const codeString = this.code.join('');
    
    if (codeString.length !== 4) {
      alert('Vui lòng nhập đầy đủ mã 4 chữ số.');
      return;
    }

    if (!this.TenDangNhap) {
      alert('Lỗi: Không tìm thấy thông tin tài khoản. Vui lòng thử lại.');
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.isLoading = true;

    this.authService.verifyOtp(this.TenDangNhap, codeString).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('OTP verification:', response);
        
        if (response.valid) {
          // Lưu OTP vào sessionStorage để dùng ở bước reset password
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('resetPasswordOtp', codeString);
          }
          alert('Xác thực OTP thành công!');
          // Navigate to new password page
          this.router.navigate(['/reset-password']);
        } else {
          alert('OTP không hợp lệ hoặc đã hết hạn.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('OTP verification failed:', error);
        const errorMessage = error.error?.message || error.error?.error || 'Xác thực OTP thất bại. Vui lòng thử lại.';
        alert(errorMessage);
      }
    });
  }

  onResend(): void {
    if (this.canResend && this.TenDangNhap) {
      this.isLoading = true;
      
      this.authService.requestPasswordReset(this.TenDangNhap).subscribe({
        next: (response) => {
          this.isLoading = false;
          console.log('Resend OTP:', response);
          
          this.timeLeft = 900; // Reset to 15 minutes
          this.canResend = false;
          this.code = ['', '', '', ''];
          this.startTimer();
          
          // Focus first input
          const firstInput = document.getElementById('code-0');
          if (firstInput) {
            firstInput.focus();
          }
          
          if (response.otp) {
            // Development mode
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('devOtp', response.otp);
            }
            alert(`Mã OTP mới đã được tạo (chế độ phát triển): ${response.otp}. Hết hạn trong ${response.ttlMinutes || 15} phút.`);
          } else {
            alert('Mã xác minh đã được gửi lại đến email của bạn.');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Resend OTP failed:', error);
          const errorMessage = error.error?.message || error.error?.error || 'Gửi lại mã OTP thất bại. Vui lòng thử lại.';
          alert(errorMessage);
        }
      });
    }
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get isCodeComplete(): boolean {
    return this.code.every(digit => digit !== '');
  }

}

