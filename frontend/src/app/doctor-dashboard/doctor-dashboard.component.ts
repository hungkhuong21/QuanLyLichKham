import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Appointment, AppointmentService } from '../services/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { DoctorService } from '../services/doctor.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss']
})
export class DoctorDashboardComponent implements OnInit {
  // ================= Properties =================
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  selectedAppointment: Appointment | null = null;
  searchPatientName: string = '';
  searchTime: string = '';
  searchStatus: string = '';
  quickFilter: string = 'all';
  doctorName: string = '';

  // ================= Constructor =================
  constructor(
    private router: Router,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private doctorService: DoctorService
  ) {}

  // ================= OnInit =================
  ngOnInit() {
    this.loadDoctorInfo();
    this.loadAppointments();
  }

  // ================= Doctor Info =================
  loadDoctorInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const doctorId = currentUser?.MaNguoiDung || currentUser?.MaBacSi;

    if (doctorId) {
      this.doctorService.getDoctorById(doctorId).subscribe({
        next: doctor => this.setDoctorName(doctor.name || ''),
        error: err => {
          console.error('Error loading doctor info:', err);
          this.setDoctorName(currentUser?.HoTen || currentUser?.TenDangNhap || '');
        }
      });
    } else {
      this.setDoctorName(currentUser?.HoTen || currentUser?.TenDangNhap || '');
    }
  }

  private setDoctorName(name: string) {
    this.doctorName = name;
    console.log('[Doctor Dashboard] Doctor Name:', name);
  }

  // ================= Load Appointments =================
  loadAppointments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const doctorId = currentUser?.MaNguoiDung || currentUser?.MaBacSi || currentUser?.MaTK || currentUser?.id;

    if (!doctorId || doctorId === 0) {
      alert('Lỗi: Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.');
      return;
    }

    this.appointmentService.getAllAppointments(doctorId, 'BacSi').subscribe({
      next: data => this.handleAppointments(data),
      error: err => this.handleLoadError(err)
    });
  }

  private handleAppointments(data: Appointment[]) {
    this.appointments = data || [];
    this.filterAppointments();
    console.log('[Doctor Dashboard] Loaded appointments:', data);
  }

  private handleLoadError(err: any) {
    console.error('[Doctor Dashboard] Error loading appointments:', err);
    alert('Lỗi tải lịch hẹn: ' + (err.error?.error || err.message));
  }

  private getCurrentDoctorId(): number | null {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser?.MaNguoiDung || currentUser?.MaBacSi || currentUser?.MaTK || currentUser?.id || null;
  }
  // ================= Filter & Search =================
  filterAppointments() {
    let filtered = this.appointments.filter(app => this.isActive(app));
    filtered = this.applyQuickFilterToList(filtered);
    filtered = this.applySearchFilters(filtered);
    this.filteredAppointments = filtered;
  }

  private isActive(app: Appointment): boolean {
    const status = (app.status || '').toLowerCase();
    return status !== 'hoàn thành' && status !== 'đã hủy' && status !== 'hủy';
  }

  private applyQuickFilterToList(list: Appointment[]): Appointment[] {
    const now = new Date();
    if (this.quickFilter === 'today') {
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      return list.filter(a => a.appointmentTime?.split(' ')[0] === todayStr);
    } else if (this.quickFilter === 'week') {
      const [first, last] = this.getWeekRange(now);
      return list.filter(a => a.appointmentTime && new Date(a.appointmentTime) >= first && new Date(a.appointmentTime) <= last);
    } else if (this.quickFilter === 'month') {
      const [first, last] = this.getMonthRange(now);
      return list.filter(a => a.appointmentTime && new Date(a.appointmentTime) >= first && new Date(a.appointmentTime) <= last);
    }
    return list;
  }

  private applySearchFilters(list: Appointment[]): Appointment[] {
    return list.filter(a => {
      const matchesName = this.searchPatientName ? (a.patientName || '').toLowerCase().includes(this.searchPatientName.trim().toLowerCase()) : true;
      const matchesTime = this.searchTime ? (a.appointmentTime || '').includes(this.searchTime.trim()) : true;
      const matchesStatus = this.searchStatus ? (a.status || '').toLowerCase().includes(this.searchStatus.trim().toLowerCase()) : true;
      return matchesName && matchesTime && matchesStatus;
    });
  }

  private getWeekRange(d: Date): [Date, Date] {
    const first = new Date(d); first.setDate(d.getDate() - d.getDay()); first.setHours(0,0,0,0);
    const last = new Date(d); last.setDate(d.getDate() - d.getDay() + 6); last.setHours(23,59,59,999);
    return [first, last];
  }

  private getMonthRange(d: Date): [Date, Date] {
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23,59,59,999);
    return [first, last];
  }
applyQuickFilter() {
  if (this.quickFilter === 'all') {
    this.loadAppointments();
    return;
  }
  this.filterAppointments();
}
  searchAppointments() {
    this.filterAppointments();
  }

  onSearchInput() {
    this.filterAppointments();
  }
  // ================= Actions (Accept/Complete/View) =================
  acceptAppointment(app: Appointment) {
    this.updateAppointmentStatus(app, 'Đã xác nhận');
  }

  completeAppointment(app: Appointment) {
    this.updateAppointmentStatus(app, 'Hoàn thành');
  }

  private updateAppointmentStatus(app: Appointment, status: string) {
    if (!confirm(`Xác nhận cập nhật trạng thái: ${status}?`)) return;
    this.appointmentService.updateAppointment(app.id, { status }).subscribe({
      next: () => {
        alert(`Cập nhật trạng thái "${status}" thành công!`);
        this.loadAppointments();
      },
      error: err => alert('Lỗi: ' + (err.error?.error || err.message))
    });
  }

  viewAppointmentDetail(app: Appointment) {
    this.selectedAppointment = app;
  }

  // ================= Logout =================
  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // ================= Helper =================
  canAccept(app: Appointment): boolean {
    const status = (app.status || '').toLowerCase();
    return status === 'đã đặt' || status === 'chờ xác nhận' || status === 'đổi lịch';
  }

  canComplete(app: Appointment): boolean {
    const status = (app.status || '').toLowerCase();
    return status !== 'hoàn thành' && status !== 'đã hủy' && status !== 'hủy';
  }
}
