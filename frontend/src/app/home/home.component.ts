
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

import { RouterLink } from '@angular/router';
import { AppointmentScheduleComponent } from '../appointment-schedule/appointment-schedule.component';

import { AppointmentService } from '../services/appointment.service';
import { DoctorService, Doctor } from '../services/doctor.service';
import { DepartmentService, Department } from '../services/department.service';
import { PatientService, Patient } from '../services/patient.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    RouterLink,
    AppointmentScheduleComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  //  LOAD DATA FOR HOME PAGE (DEPARTMENTS & DOCTORS)
  specialties: Department[] = [];
  doctors: Doctor[] = [];
  isLoadingDepartments: boolean = false;
  isLoadingDoctors: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDoctors();
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.specialties = departments;
        this.isLoadingDepartments = false;
      },
      error: (error) => {
        this.isLoadingDepartments = false;
        alert('Lỗi tải danh sách khoa: ' + (error.message || 'Kiểm tra backend'));
      }
    });
  }

  loadDoctors(): void {
    this.isLoadingDoctors = true;
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.isLoadingDoctors = false;
      },
      error: (error) => {
        this.isLoadingDoctors = false;
        alert('Lỗi tải danh sách bác sĩ: ' + (error.message || 'Kiểm tra backend'));
      }
    });
  }

//  APPOINTMENT FORM – VALIDATION & SUBMISSION
  
  appointmentName: string = '';
  appointmentPhone: string = '';
  appointmentSpecialty: string = '';
  appointmentDoctor: string = '';
  appointmentTime: string = '';
  isSubmittingAppointment: boolean = false;

  onAppointmentSubmit(): void {
    if (this.isSubmittingAppointment) return;

    // Validate name
    if (!this.appointmentName.trim() || this.appointmentName.trim().length < 2) {
      alert('Tên không hợp lệ');
      return;
    }

    // Validate phone
    const phone = this.appointmentPhone.trim().replace(/\s+/g, '');
    if (!/^0\d{9,10}$/.test(phone) || /^0+$/.test(phone)) {
      alert('Số điện thoại không hợp lệ');
      return;
    }
    this.appointmentPhone = phone;

    // Validate required fields
    if (!this.appointmentSpecialty || !this.appointmentDoctor || !this.appointmentTime) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Parse datetime-local
    const match = this.appointmentTime.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!match) {
      alert('Thời gian không hợp lệ');
      return;
    }

    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const day = parseInt(match[3]);
    const hours = parseInt(match[4]);
    const minutes = parseInt(match[5]);

    const appointmentDateTime = new Date(year, month, day, hours, minutes, 0);
    if (appointmentDateTime < new Date()) {
      alert('Không được đặt lịch quá khứ');
      return;
    }

    // Submit appointment
    this.isSubmittingAppointment = true;

    const appointmentData = {
      doctorId: parseInt(this.appointmentDoctor),
      appointmentTime: `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]}:00`,
      note: `Đặt lịch bởi ${this.appointmentName} (${this.appointmentPhone})`,
      HoTen: this.appointmentName.trim(),
      SoDienThoai: this.appointmentPhone.trim()
    };

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: () => {
        this.isSubmittingAppointment = false;
        alert('Đặt lịch thành công!');
        this.resetAppointmentForm();
      },
      error: (error) => {
        this.isSubmittingAppointment = false;
        alert('Lỗi đặt lịch: ' + (error.message || 'Thử lại sau'));
      }
    });
  }

  resetAppointmentForm(): void {
    this.appointmentName = '';
    this.appointmentPhone = '';
    this.appointmentSpecialty = '';
    this.appointmentDoctor = '';
    this.appointmentTime = '';
  }

  onSpecialtyChange(): void {
    this.appointmentDoctor = '';
  }

//  DOCTOR SEARCH FUNCTIONALITY

  doctorName: string = '';
  doctorDepartmentId: string = '';
  searchResults: Doctor[] = [];
  isSearching: boolean = false;
  hasSearched: boolean = false;

  onDoctorSearch(): void {
    this.isSearching = true;
    this.hasSearched = true;

    const searchParams: { name?: string; departmentId?: number } = {};

    if (this.doctorName.trim()) {
      searchParams.name = this.doctorName.trim();
    }

    if (this.doctorDepartmentId.trim()) {
      searchParams.departmentId = parseInt(this.doctorDepartmentId);
    }

    this.doctorService.searchDoctors(searchParams).subscribe({
      next: (doctors) => {
        this.searchResults = doctors;
        this.isSearching = false;
      },
      error: (error) => {
        this.isSearching = false;
        this.searchResults = [];
        alert('Lỗi tìm kiếm: ' + (error.message || 'Thử lại'));
      }
    });
  }
  //  APPOINTMENT SCHEDULE & CONTACT MODALS

  isAppointmentScheduleOpen: boolean = false;
  isContactModalOpen: boolean = false;

  openAppointmentSchedule(): void {
    this.isAppointmentScheduleOpen = true;
  }

  closeAppointmentSchedule(): void {
    this.isAppointmentScheduleOpen = false;
  }

  contactNow(): void {
    this.isContactModalOpen = true;
  }

  closeContactModal(): void {
    this.isContactModalOpen = false;
  }

  openPhoneDialer(): void {
    window.location.href = 'tel:19001234';
  }

  openEmail(): void {
    window.location.href = 'mailto:info@healthcare.com';
  }
  //  SERVICES SECTION & HELPER FUNCTIONS
  services = [
    { title: 'Điều trị nha khoa', description: 'Chăm sóc răng miệng toàn diện.', image: '🦷', icon: 'tooth' },
    { title: 'Điều trị xương khớp', description: 'Chẩn đoán và điều trị xương khớp.', image: '🦴', icon: 'bone' },
    { title: 'Chẩn đoán y khoa', description: 'Chẩn đoán chính xác với công nghệ tiên tiến.', image: '🏥', icon: 'diagnosis' },
    { title: 'Tim mạch', description: 'Khám và điều trị bệnh lý tim mạch.', image: '❤️', icon: 'cardiology' },
    { title: 'Phẫu thuật', description: 'Thực hiện các ca phẫu thuật an toàn.', image: '⚕️', icon: 'surgery' },
    { title: 'Chăm sóc mắt', description: 'Khám và điều trị các vấn đề về mắt.', image: '👁️', icon: 'eye-care' }
  ];

  formatDateTime(datetime: string): string {
    return datetime;
  }

  private formatDateTimeLocal(date: Date): string {
    return '';
  }

  private getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek];
  }

  private getWorkingHoursStart(dayOfWeek: number): number | null {
    return 7;
  }

  private getWorkingHoursEnd(dayOfWeek: number): number | null {
    return 17;
  }

  private isWithinWorkingHours(date: Date): boolean {
    return true;
  }

  private hasEnoughBuffer(date: Date): boolean {
    return true;
  }

  getWorkingHoursDescription(): string {
    return 'Thứ 2-6: 7:00 - 17:00 | Thứ 7: 7:00 - 12:00 | Chủ nhật: Nghỉ';
  }
  get filteredDoctors(): Doctor[] {
  if (!this.appointmentSpecialty) return [];
  const departmentId = Number(this.appointmentSpecialty);
  return this.doctors.filter(d => d.departmentId === departmentId);
}

get minDateTime(): string {
  const now = new Date();
  now.setHours(now.getHours() + 2); 
  return now.toISOString().slice(0, 16);
}
}
