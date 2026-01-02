import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment, AppointmentService } from '../services/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DoctorService } from '../services/doctor.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  searchPatientName: string = '';
  searchTime: string = '';
  searchStatus: string = '';
  quickFilter: string = 'all';
  doctorName: string = '';

  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private doctorService: DoctorService
  ) {}

  ngOnInit() {
    this.loadDoctorInfo();
    this.loadAppointments();
  }

  loadDoctorInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const doctorId = currentUser?.MaNguoiDung || currentUser?.MaBacSi;
    
    if (doctorId) {
      this.doctorService.getDoctorById(doctorId).subscribe({
        next: doctor => {
          this.doctorName = doctor.name || '';
          console.log('[Doctor Dashboard] Loaded doctor name:', this.doctorName);
        },
        error: err => {
          console.error('[Doctor Dashboard] Error loading doctor info:', err);
          // Fallback: dùng tên từ currentUser nếu có
          this.doctorName = currentUser?.HoTen || currentUser?.TenDangNhap || '';
        }
      });
    } else {
      // Fallback nếu không có doctorId
      this.doctorName = currentUser?.HoTen || currentUser?.TenDangNhap || '';
    }
  }

  filterAppointments() {
    let filtered = [...this.appointments];
    
    // Lọc bỏ các lịch đã hoàn thành và đã hủy
    filtered = filtered.filter(a => {
      const status = (a.status || '').toLowerCase();
      return status !== 'hoàn thành' && status !== 'đã hủy' && status !== 'hủy';
    });
    
    // Filter theo quick filter (Hôm nay, Tuần này, Tháng này) trên frontend
    if (this.quickFilter === 'today') {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      filtered = filtered.filter(a => {
        if (!a.appointmentTime) return false;
        // So sánh phần ngày (YYYY-MM-DD) không so giờ
        const appDate = a.appointmentTime.split(' ')[0]; // Lấy phần ngày
        return appDate === todayStr;
      });
    } else if (this.quickFilter === 'week') {
      const now = new Date();
      const first = new Date(now);
      first.setDate(now.getDate() - now.getDay());
      first.setHours(0, 0, 0, 0);
      const last = new Date(now);
      last.setDate(now.getDate() - now.getDay() + 6);
      last.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(a => {
        if (!a.appointmentTime) return false;
        const appDate = new Date(a.appointmentTime);
        return appDate >= first && appDate <= last;
      });
    } else if (this.quickFilter === 'month') {
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      filtered = filtered.filter(a => {
        if (!a.appointmentTime) return false;
        const appDate = new Date(a.appointmentTime);
        return appDate >= first && appDate <= last;
      });
    }
    
    // Áp dụng các filter tìm kiếm
    if (this.searchPatientName?.trim()) {
      const query = this.searchPatientName.trim().toLowerCase();
      filtered = filtered.filter(a => (a.patientName || '').toLowerCase().includes(query));
    }
    if (this.searchTime?.trim()) {
      filtered = filtered.filter(a => (a.appointmentTime || '').includes(this.searchTime.trim()));
    }
    if (this.searchStatus?.trim()) {
      filtered = filtered.filter(a => (a.status || '').toLowerCase().includes(this.searchStatus.trim().toLowerCase()));
    }
    
    this.filteredAppointments = filtered;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  loadAppointments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Lấy MaBacSi từ MaNguoiDung (theo SQL: MaNguoiDung = MaBacSi cho tài khoản bác sĩ)
    const doctorId = currentUser?.MaNguoiDung || currentUser?.MaBacSi || currentUser?.MaTK || currentUser?.id;
    
    console.log('[Doctor Dashboard] ========== DEBUG INFO ==========');
    console.log('[Doctor Dashboard] Current User from localStorage:', currentUser);
    console.log('[Doctor Dashboard] MaNguoiDung:', currentUser?.MaNguoiDung);
    console.log('[Doctor Dashboard] MaBacSi:', currentUser?.MaBacSi);
    console.log('[Doctor Dashboard] LoaiNguoiDung:', currentUser?.LoaiNguoiDung);
    console.log('[Doctor Dashboard] Doctor ID used:', doctorId);
    console.log('[Doctor Dashboard] =================================');
    
    if (!doctorId || doctorId === 0) {
      console.error('[Doctor Dashboard] Không tìm thấy MaBacSi/MaNguoiDung trong currentUser!');
      alert('Lỗi: Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.\n\nThông tin user hiện tại: ' + JSON.stringify(currentUser, null, 2));
      return;
    }
    
    // Gọi API - Backend sẽ lấy từ req.user (middleware), nhưng vẫn gửi để debug
    this.appointmentService.getAllAppointments(doctorId, 'BacSi').subscribe({
      next: data => {
        console.log('[Doctor Dashboard] ✅ Loaded appointments:', data);
        console.log('[Doctor Dashboard] ✅ Number of appointments:', data?.length || 0);
        
        // Log chi tiết từng lịch hẹn
        if (data && data.length > 0) {
          console.log('[Doctor Dashboard] ✅ Appointments details:');
          data.forEach((app, index) => {
            console.log(`  [${index + 1}] ID: ${app.id}, Status: ${app.status}, DoctorId: ${app.doctorId}, Patient: ${app.patientName}`);
          });
        } else {
          console.warn('[Doctor Dashboard] ⚠️ No appointments returned from API!');
          console.warn('[Doctor Dashboard] ⚠️ This could mean:');
          console.warn('  1. No appointments exist for this doctor');
          console.warn('  2. MaBacSi mismatch between account and appointments');
          console.warn('  3. Backend filter issue');
        }
        
        this.appointments = data || [];
        this.filterAppointments();
      },
      error: err => {
        console.error('[Doctor Dashboard] ❌ Error loading appointments:', err);
        console.error('[Doctor Dashboard] ❌ Error details:', err.error);
        console.error('[Doctor Dashboard] ❌ Full error object:', JSON.stringify(err, null, 2));
        alert('Lỗi tải lịch hẹn: ' + (err.error?.error || err.message || 'Vui lòng thử lại'));
      }
    });
  }

  searchAppointments() {
    this.filterAppointments();
  }

  // Tự động tìm kiếm khi nhập tên
  onSearchInput() {
    this.filterAppointments();
  }

  viewAppointmentDetail(app: Appointment) {
    this.selectedAppointment = app;
  }

  applyQuickFilter() {
    // Nếu chọn "all", load tất cả và filter trên frontend
    if (this.quickFilter === 'all') {
      this.loadAppointments();
      return;
    }

    // Các filter khác vẫn gọi API
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const doctorId = currentUser?.MaNguoiDung || currentUser?.MaTK || currentUser?.id;
    let params: any = { doctorId };
    const now = new Date();
    
    if (this.quickFilter === 'today') {
      // Lấy ngày hôm nay (local time)
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      params.date = `${yyyy}-${mm}-${dd}`;
    } else if (this.quickFilter === 'week') {
      const first = new Date(now); first.setDate(now.getDate() - now.getDay());
      const last = new Date(now); last.setDate(now.getDate() - now.getDay() + 6);
      params.date = `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-${String(first.getDate()).padStart(2, '0')}`;
      params.toDate = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
    } else if (this.quickFilter === 'month') {
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      params.date = `${yyyy}-${mm}-01`;
      params.toDate = `${yyyy}-${mm}-31`;
    }
    
    this.appointmentService.searchAppointments(params).subscribe({
      next: data => {
        this.appointments = data;
        this.filterAppointments();
      },
      error: err => console.error(err)
    });
  }

  acceptAppointment(app: Appointment) {
    if (!confirm('Xác nhận chấp nhận lịch hẹn này?')) return;
    this.appointmentService.updateAppointment(app.id, { status: 'Đã xác nhận' }).subscribe({
      next: () => {
        alert('Đã chấp nhận lịch hẹn thành công!');
        this.loadAppointments();
      },
      error: err => alert('Lỗi xác nhận lịch: ' + (err.error?.error || err.message))
    });
  }

  completeAppointment(app: Appointment) {
    if (!confirm('Xác nhận hoàn thành lịch hẹn này?')) return;
    this.appointmentService.updateAppointment(app.id, { status: 'Hoàn thành' }).subscribe({
      next: () => {
        alert('Đã cập nhật trạng thái thành công!');
        this.loadAppointments();
      },
      error: err => alert('Lỗi hoàn thành lịch: ' + (err.error?.error || err.message))
    });
  }

  // Helper functions để kiểm tra trạng thái
  canAccept(app: Appointment): boolean {
    const status = (app.status || '').toLowerCase();
    return status === 'đã đặt' || status === 'chờ xác nhận' || status === 'đổi lịch';
  }

  canComplete(app: Appointment): boolean {
    const status = (app.status || '').toLowerCase();
    return status !== 'hoàn thành' && status !== 'đã hủy' && status !== 'hủy';
  }

}

