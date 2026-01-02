import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [HeaderComponent, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  TenDangNhap: string = '';
  MatKhau: string = '';
  confirmPassword: string = '';
  HoTen: string = '';
  SoDienThoai: string = '';
  CMND_CCCD: string = '';
  DiaChi: string = '';
  agreeTerms: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  onRegister(): void {
    console.log('=== BẮT ĐẦU ĐĂNG KÝ ===');
    console.log('TenDangNhap:', this.TenDangNhap);
    console.log('MatKhau:', this.MatKhau ? '***' : '(trống)');
    console.log('confirmPassword:', this.confirmPassword ? '***' : '(trống)');
    
    // Chỉ kiểm tra các trường bắt buộc: email (tên đăng nhập) và mật khẩu
    if (!this.TenDangNhap || this.TenDangNhap.trim() === '') {
      alert('Vui lòng nhập tên đăng nhập (email).');
      return;
    }

    if (!this.MatKhau || this.MatKhau.trim() === '') {
      alert('Vui lòng nhập mật khẩu.');
      return;
    }

    if (!this.confirmPassword || this.confirmPassword.trim() === '') {
      alert('Vui lòng nhập lại mật khẩu.');
      return;
    }

    if (this.MatKhau !== this.confirmPassword) {
      alert('Mật khẩu nhập lại không khớp.');
      return;
    }

    console.log('✓ Validation frontend thành công');

    // Đơn giản hóa: Chỉ tạo tài khoản, không cần tạo bệnh nhân trước
    // Mặc định đăng ký là bệnh nhân, MaNguoiDung có thể null hoặc 0
    const userData = {
      TenDangNhap: this.TenDangNhap.trim(),
      MatKhau: this.MatKhau,
      VaiTroID: 3, // BenhNhan (mặc định)
      LoaiNguoiDung: 'BenhNhan', // Mặc định là bệnh nhân
      MaNguoiDung: 0 // Có thể null hoặc 0, sẽ cập nhật sau khi tạo bệnh nhân
    };

    console.log('Tạo tài khoản:', { ...userData, MatKhau: '***' });

    // Chỉ gọi API đăng ký tài khoản
    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Đăng ký thành công:', response);
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Lỗi đăng ký tài khoản:', error);
        console.error('Chi tiết lỗi:', JSON.stringify(error, null, 2));
        const errorMessage = error.error?.message || error.error?.error || error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        alert('Lỗi đăng ký: ' + errorMessage);
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

}
