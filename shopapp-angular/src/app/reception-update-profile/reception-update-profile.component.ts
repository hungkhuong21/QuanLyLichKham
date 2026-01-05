import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink, RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { ReceptionService, ReceptionAppointment } from '../services/reception.service';
import { DepartmentService } from '../services/department.service';
import { DoctorService } from '../services/doctor.service';

interface PatientData {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  idCard: string;
  phoneNumber: string;
  email: string;
  address: string;
  ethnicity: string;
  nationality: string;
  receptionCode: string;
  department: string;
  doctor: string;
  appointmentDate: string;
  appointmentTime: string;
  medicalRecordNumber: string;
  reason: string;
  medicalHistory: string;
  drugAllergies: string;
  healthInsurance: string;
  latestHealthStatus: string;
  recordStatus: string;
  recordCreationDate: string;
  creator: string;
}

@Component({
  selector: 'app-reception-update-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink, RouterLinkActive],
  templateUrl: './reception-update-profile.component.html',
  styleUrl: './reception-update-profile.component.scss'
})
export class ReceptionUpdateProfileComponent implements OnInit {
  patientData: PatientData = {
    fullName: '',
    gender: '',
    dateOfBirth: '',
    idCard: '',
    phoneNumber: '',
    email: '',
    address: '',
    ethnicity: 'Kinh',
    nationality: 'Việt Nam',
    receptionCode: '',
    department: '',
    doctor: '',
    appointmentDate: '',
    appointmentTime: '',
    medicalRecordNumber: '',
    reason: '',
    medicalHistory: '',
    drugAllergies: '',
    healthInsurance: '',
    latestHealthStatus: '',
    recordStatus: 'Chờ tiếp nhận',
    recordCreationDate: '',
    creator: ''
  };

  originalPatientData: PatientData | null = null;
  appointmentId: number | null = null;
  patientId: number | null = null;
  appointment: ReceptionAppointment | null = null;

  specialties: { id: string; name: string }[] = [];
  doctors: { id: number; name: string; departmentId: number }[] = [];
  allDoctors: { id: number; name: string; departmentId: number }[] = [];
  isLoading: boolean = false;

  // Pagination (cho form nhiều trang nếu cần)
  currentPage: number = 1;
  totalPages: number = 2;
  pages: number[] = [1, 2];

  constructor(
    private receptionService: ReceptionService,
    private departmentService: DepartmentService,
    private doctorService: DoctorService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get filteredDoctors() {
    if (!this.patientData.department) {
      return [];
    }
    const deptId = parseInt(this.patientData.department);
    return this.allDoctors.filter(doctor => doctor.departmentId === deptId);
  }

  ngOnInit(): void {
    // Lấy appointment ID từ route params hoặc query params
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.appointmentId = parseInt(params['id']);
        this.loadAppointmentData();
      }
    });

    this.route.queryParams.subscribe(params => {
      if (params['appointmentId']) {
        this.appointmentId = parseInt(params['appointmentId']);
        this.loadAppointmentData();
      }
    });

    this.loadDepartments();
    this.loadDoctors();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (depts) => {
        this.specialties = depts.map(dept => ({
          id: dept.id.toString(),
          name: dept.name
        }));
      },
      error: (error) => {
        console.error('Lỗi load danh sách khoa:', error);
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (docs) => {
        this.allDoctors = docs.map(doc => ({
          id: doc.id,
          name: doc.name,
          departmentId: doc.departmentId || 0
        }));
        this.doctors = this.allDoctors;
      },
      error: (error) => {
        console.error('Lỗi load danh sách bác sĩ:', error);
      }
    });
  }

  loadAppointmentData(): void {
    if (!this.appointmentId) return;

    this.isLoading = true;
    this.receptionService.getAppointmentById(this.appointmentId).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.patientId = appointment.patientId || null;
        
        // Load thông tin bệnh nhân
        if (this.patientId) {
          this.loadPatientData(this.patientId);
        } else {
          // Nếu không có patientId, lấy từ appointment
          this.populateFromAppointment(appointment);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi load lịch hẹn:', error);
        alert('Không thể tải thông tin lịch hẹn. Vui lòng thử lại.');
        this.isLoading = false;
      }
    });
  }

  loadPatientData(patientId: number): void {
    this.receptionService.getPatientById(patientId).subscribe({
      next: (patient: any) => {
        // Format ngày sinh từ YYYY-MM-DD sang DD/MM/YYYY
        let formattedDateOfBirth = '';
        if (patient.NgaySinh) {
          const date = new Date(patient.NgaySinh);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();
          formattedDateOfBirth = `${day}/${month}/${year}`;
        }

        // Format thời gian khám
        let appointmentDate = '';
        let appointmentTime = '';
        if (this.appointment?.appointmentTime) {
          const dateTime = new Date(this.appointment.appointmentTime);
          const day = dateTime.getDate().toString().padStart(2, '0');
          const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
          const year = dateTime.getFullYear();
          appointmentDate = `${day}/${month}/${year}`;
          const hours = dateTime.getHours().toString().padStart(2, '0');
          const minutes = dateTime.getMinutes().toString().padStart(2, '0');
          appointmentTime = `${hours}:${minutes}`;
        }

        this.patientData = {
          fullName: patient.HoTen || '',
          gender: patient.GioiTinh || '',
          dateOfBirth: formattedDateOfBirth,
          idCard: patient.CMND_CCCD || '',
          phoneNumber: patient.SoDienThoai || '',
          email: '',
          address: patient.DiaChi || '',
          ethnicity: 'Kinh',
          nationality: 'Việt Nam',
          receptionCode: this.appointment?.appointmentId || '',
          department: this.appointment?.departmentId?.toString() || '',
          doctor: this.appointment?.doctorId?.toString() || '',
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          medicalRecordNumber: '',
          reason: this.appointment?.status || '',
          medicalHistory: '',
          drugAllergies: '',
          healthInsurance: '',
          latestHealthStatus: '',
          recordStatus: this.appointment?.status || 'Chờ tiếp nhận',
          recordCreationDate: new Date().toLocaleDateString('vi-VN'),
          creator: ''
        };

        // Lưu bản gốc để reset
        this.originalPatientData = { ...this.patientData };
      },
      error: (error) => {
        console.error('Lỗi load thông tin bệnh nhân:', error);
        // Nếu không load được patient, vẫn hiển thị thông tin từ appointment
        if (this.appointment) {
          this.populateFromAppointment(this.appointment);
        }
      }
    });
  }

  populateFromAppointment(appointment: ReceptionAppointment): void {
    // Format thời gian khám
    let appointmentDate = '';
    let appointmentTime = '';
    if (appointment.appointmentTime) {
      const dateTime = new Date(appointment.appointmentTime);
      const day = dateTime.getDate().toString().padStart(2, '0');
      const month = (dateTime.getMonth() + 1).toString().padStart(2, '0');
      const year = dateTime.getFullYear();
      appointmentDate = `${day}/${month}/${year}`;
      appointmentTime = appointment.appointmentTime;
    }

    this.patientData = {
      fullName: appointment.fullName || '',
      gender: appointment.gender || '',
      dateOfBirth: appointment.dateOfBirth || '',
      idCard: appointment.idCard || '',
      phoneNumber: appointment.phoneNumber || '',
      email: '',
      address: '',
      ethnicity: 'Kinh',
      nationality: 'Việt Nam',
      receptionCode: appointment.appointmentId || '',
      department: appointment.departmentId?.toString() || '',
      doctor: appointment.doctorId?.toString() || '',
      appointmentDate: appointmentDate,
      appointmentTime: appointmentTime,
      medicalRecordNumber: '',
      reason: '',
      medicalHistory: '',
      drugAllergies: '',
      healthInsurance: '',
      latestHealthStatus: '',
      recordStatus: appointment.status || 'Chờ tiếp nhận',
      recordCreationDate: new Date().toLocaleDateString('vi-VN'),
      creator: ''
    };
  }

  onDepartmentChange(): void {
    // Reset doctor selection when department changes
    this.patientData.doctor = '';
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // TODO: Load data for the selected page
      console.log('Navigating to page:', page);
    }
  }

  onSubmit(): void {
    if (!this.patientData.fullName || !this.patientData.dateOfBirth || !this.patientData.gender || 
        !this.patientData.idCard || !this.patientData.phoneNumber || !this.patientData.address) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    if (!this.patientId) {
      alert('Không tìm thấy thông tin bệnh nhân. Vui lòng thử lại.');
      return;
    }

    // Format ngày sinh từ DD/MM/YYYY sang YYYY-MM-DD
    let formattedDateOfBirth = '';
    if (this.patientData.dateOfBirth) {
      const parts = this.patientData.dateOfBirth.split('/');
      if (parts.length === 3) {
        formattedDateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        formattedDateOfBirth = this.patientData.dateOfBirth;
      }
    }

    // Cập nhật thông tin bệnh nhân
    const patientUpdateData = {
      HoTen: this.patientData.fullName,
      NgaySinh: formattedDateOfBirth || undefined,
      GioiTinh: this.patientData.gender,
      SoDienThoai: this.patientData.phoneNumber,
      CMND_CCCD: this.patientData.idCard,
      DiaChi: this.patientData.address
    };

    this.isLoading = true;
    this.receptionService.updatePatient(this.patientId, patientUpdateData).subscribe({
      next: () => {
        // Cập nhật lịch hẹn nếu có thay đổi
        if (this.appointmentId) {
          const appointmentUpdate: any = {
            TrangThai: this.patientData.recordStatus || 'Đã tiếp nhận'
          };
          
          if (this.patientData.doctor) {
            appointmentUpdate.MaBacSi = parseInt(this.patientData.doctor);
          }
          if (this.patientData.reason) {
            appointmentUpdate.Note = this.patientData.reason;
          }
          
          this.receptionService.updateAppointment(this.appointmentId, appointmentUpdate).subscribe({
            next: () => {
              this.isLoading = false;
              alert('Cập nhật hồ sơ thành công!');
              this.router.navigate(['/reception/daily-list']);
            },
            error: (error) => {
              console.error('Lỗi cập nhật lịch hẹn:', error);
              this.isLoading = false;
              alert('Cập nhật thông tin bệnh nhân thành công, nhưng có lỗi khi cập nhật lịch hẹn.');
            }
          });
        } else {
          this.isLoading = false;
          alert('Cập nhật hồ sơ thành công!');
          this.router.navigate(['/reception/daily-list']);
        }
      },
      error: (error) => {
        console.error('Lỗi cập nhật bệnh nhân:', error);
        this.isLoading = false;
        const errorMessage = error.error?.error || error.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }

  onCancel(): void {
    if (confirm('Bạn có chắc muốn hủy bỏ các thay đổi?')) {
      if (this.originalPatientData) {
        this.patientData = { ...this.originalPatientData };
      } else {
        this.router.navigate(['/reception/daily-list']);
      }
    }
  }

  onPrint(): void {
    // TODO: Implement print functionality
    window.print();
    alert('Đang in hồ sơ...');
  }
}
