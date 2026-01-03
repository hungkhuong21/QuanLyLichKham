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