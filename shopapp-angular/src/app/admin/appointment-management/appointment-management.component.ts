import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../../services/appointment.service';
import { DoctorService, Doctor } from '../../services/doctor.service';
import { DepartmentService, Department } from '../../services/department.service';
import { PatientService, Patient } from '../../services/patient.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-appointment-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-management.component.html',
  styleUrl: './appointment-management.component.scss'
})
export class AppointmentManagementComponent implements OnInit {
  // Modal states
  showAddModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;

  // Appointment list
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  // Loading state
  isLoading: boolean = false;

  // Filters
  searchText: string = '';
  filterStatus: string = '';
  filterDepartment: string = '';
  filterDoctor: string = '';
  filterDate: string = '';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Form data
  appointmentForm: Partial<Appointment> = {
    patientId: undefined,
    doctorId: undefined,
    appointmentTime: '',
    status: 'Đã đặt',
    note: ''
  };

  selectedAppointment: Appointment | null = null;

  // Options
  departments: Department[] = [];
  doctors: Doctor[] = [];
  patients: Patient[] = [];
  filteredDoctors: Doctor[] = [];

  // Status options
  statusOptions = [
    { value: 'Đã đặt', label: 'Đã đặt' },
    { value: 'Đã hủy', label: 'Đã hủy' },
    { value: 'Hoàn thành', label: 'Hoàn thành' },
    { value: 'Đổi lịch', label: 'Đổi lịch' }
  ];

  // For add/edit
  selectedPatientId: number | null = null;
  selectedDoctorId: number | null = null;
  selectedDepartmentId: number | null = null;
  appointmentDateTime: string = '';
  isSaving: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private patientService: PatientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.loadDepartments();
    this.loadDoctors();
    this.loadPatients();
  }

  loadAppointments(): void {
    this.isLoading = true;
    
    // Lấy user info từ AuthService
    const currentUser = this.authService.currentUserValue;
    let maNguoiDung: number | undefined;
    let loaiNguoiDung: string | undefined;
    
    if (currentUser) {
      // Lấy LoaiNguoiDung từ user - BẮTBUỘC phải có giá trị
      loaiNguoiDung = currentUser.LoaiNguoiDung ?? currentUser.role ?? 'Admin';
      console.log('[appointment-management] Current user:', { loaiNguoiDung, userKeys: Object.keys(currentUser) });
      
      // Map NhanVien → Admin (backend không hỗ trợ NhanVien)
      if (loaiNguoiDung === 'NhanVien') {
        console.warn('[appointment-management] Mapping NhanVien → Admin');
        loaiNguoiDung = 'Admin';
      }
      
      // Nếu là BenhNhan hoặc BacSi, lấy MaNguoiDung
      if (loaiNguoiDung === 'BenhNhan' || loaiNguoiDung === 'BacSi') {
        maNguoiDung = currentUser.MaNguoiDung ?? currentUser.MaTK ?? currentUser.id;
      }
    } else {
      // Default to Admin nếu không có user
      loaiNguoiDung = 'Admin';
      console.warn('[appointment-management] No user found, defaulting to Admin');
    }
    
    // Nếu có filters, gọi search API
    if (this.hasActiveFilters()) {
      this.searchAppointments();
    } else {
      // Nếu không có filters, lấy tất cả - truyền user info
      this.appointmentService.getAllAppointments(maNguoiDung, loaiNguoiDung).subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.filteredAppointments = appointments;
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi tải danh sách lịch hẹn:', error);
          alert('Lỗi: ' + (error.error?.error || 'Không thể tải danh sách lịch hẹn'));
          this.isLoading = false;
        }
      });
    }
  }

  hasActiveFilters(): boolean {
    return !!(this.searchText?.trim() || 
              this.filterStatus || 
              this.filterDepartment || 
              this.filterDoctor || 
              this.filterDate);
  }

  searchAppointments(): void {
    this.isLoading = true;
    
    const searchParams: any = {};
    
    // Parse searchText để xác định loại tìm kiếm
    if (this.searchText?.trim()) {
      // Ưu tiên tìm theo tên bệnh nhân, sau đó là tên bác sĩ, số điện thoại
      searchParams.patientName = this.searchText.trim();
      // Cũng thử tìm theo số điện thoại nếu searchText là số
      if (/^\d+$/.test(this.searchText.trim())) {
        searchParams.patientPhone = this.searchText.trim();
      }
      // Cũng tìm theo tên bác sĩ
      searchParams.doctorName = this.searchText.trim();
    }
    
    if (this.filterStatus) {
      searchParams.status = this.filterStatus;
    }
    
    if (this.filterDepartment) {
      searchParams.departmentName = this.filterDepartment;
    }
    
    if (this.filterDoctor) {
      searchParams.doctorName = this.filterDoctor;
    }
    
    if (this.filterDate) {
      searchParams.date = this.filterDate;
    }
    
    this.appointmentService.searchAppointments(searchParams).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.filteredAppointments = appointments;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi tìm kiếm lịch hẹn:', error);
        alert('Lỗi: ' + (error.error?.error || 'Không thể tìm kiếm lịch hẹn'));
        this.isLoading = false;
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (error) => {
        console.error('Lỗi tải danh sách khoa:', error);
      }
    });
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (error) => {
        console.error('Lỗi tải danh sách bác sĩ:', error);
      }
    });
  }

  loadPatients(): void {
    this.patientService.getAllPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (error) => {
        console.error('Lỗi tải danh sách bệnh nhân:', error);
      }
    });
  }

  applyFilters(): void {
    // Filtering được xử lý ở backend, chỉ cần cập nhật pagination
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedAppointments(): Appointment[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAppointments.slice(start, end);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAppointments();
  }

  // Modal handlers
  openAddModal(): void {
    this.resetForm();
    this.selectedPatientId = null;
    this.selectedDoctorId = null;
    this.selectedDepartmentId = null;
    this.appointmentDateTime = '';
    this.filteredDoctors = [];
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  openUpdateModal(appointment: Appointment): void {
    this.selectedAppointment = appointment;
    this.appointmentForm = {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      appointmentTime: appointment.appointmentTime,
      status: appointment.status,
      note: appointment.note
    };

    // Set selected values
    this.selectedPatientId = appointment.patientId;
    this.selectedDoctorId = appointment.doctorId;
    this.selectedDepartmentId = appointment.departmentId || null;

    // Format datetime for input - parse manually to avoid timezone issues
    // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually
    const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
    const match = appointment.appointmentTime.match(mysqlDateTimeRegex);
    
    if (match) {
      // Use the exact values from the string (no timezone conversion)
      const year = match[1];
      const month = match[2];
      const day = match[3];
      const hours = match[4];
      const minutes = match[5];
      this.appointmentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    } else {
      // Fallback to Date parsing if format doesn't match
      const date = new Date(appointment.appointmentTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      this.appointmentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    // Filter doctors by department
    this.onDepartmentChange();

    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedAppointment = null;
    this.resetForm();
  }

  viewAppointmentDetails(appointment: Appointment): void {
    if (!appointment.id) {
      alert('Không tìm thấy ID lịch hẹn. Vui lòng thử lại.');
      return;
    }
    
    // Gọi API getById để lấy chi tiết từ backend
    this.appointmentService.getAppointmentById(appointment.id).subscribe({
      next: (detailedAppointment) => {
        this.selectedAppointment = detailedAppointment;
        this.showDetailModal = true;
      },
      error: (error) => {
        console.error('Lỗi lấy chi tiết lịch hẹn:', error);
        // Fallback: sử dụng dữ liệu hiện có
        this.selectedAppointment = appointment;
        this.showDetailModal = true;
        alert('Không thể tải chi tiết từ server. Hiển thị thông tin cơ bản.');
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedAppointment = null;
  }

  // Department change handler
  onDepartmentChange(): void {
    if (this.selectedDepartmentId) {
      const deptId = typeof this.selectedDepartmentId === 'string' 
        ? parseInt(this.selectedDepartmentId) 
        : this.selectedDepartmentId;
      this.filteredDoctors = this.doctors.filter(d => d.departmentId === deptId);
      // Reset doctor selection if current doctor is not in filtered list
      if (this.selectedDoctorId && !this.filteredDoctors.find(d => d.id === this.selectedDoctorId)) {
        this.selectedDoctorId = null;
      }
    } else {
      this.filteredDoctors = [];
      this.selectedDoctorId = null;
    }
  }

  // Add appointment
  addAppointment(): void {
    if (!this.selectedPatientId || !this.selectedDoctorId || !this.appointmentDateTime) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate datetime is not in the past
    const selectedDate = new Date(this.appointmentDateTime);
    const now = new Date();
    if (selectedDate < now) {
      alert('Thời gian khám không được trong quá khứ. Vui lòng chọn thời gian khác.');
      return;
    }

    // Format datetime
    const date = new Date(this.appointmentDateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    this.isSaving = true;

    // Ensure IDs are numbers
    const patientId = typeof this.selectedPatientId === 'string' 
      ? parseInt(this.selectedPatientId) 
      : this.selectedPatientId;
    const doctorId = typeof this.selectedDoctorId === 'string' 
      ? parseInt(this.selectedDoctorId) 
      : this.selectedDoctorId;

    const appointmentData: Partial<Appointment> = {
      patientId: patientId,
      doctorId: doctorId,
      appointmentTime: formattedDateTime,
      status: 'Đã đặt',
      note: this.appointmentForm.note || ''
    };

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        alert('Thêm lịch hẹn thành công!');
        this.closeAddModal();
        this.loadAppointments();
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Lỗi thêm lịch hẹn:', error);
        let errorMessage = 'Không thể thêm lịch hẹn. Vui lòng thử lại.';
        if (error.error?.error) {
          if (error.status === 409) {
            errorMessage = 'Bác sĩ đã có lịch hẹn vào thời gian này. Vui lòng chọn thời gian khác.';
          } else {
            errorMessage = error.error.error;
          }
        }
        alert(errorMessage);
        this.isSaving = false;
      }
    });
  }

  // Update appointment
  updateAppointment(): void {
    if (!this.selectedAppointment) return;

    if (!this.selectedPatientId || !this.selectedDoctorId || !this.appointmentDateTime) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Parse datetime-local thủ công để tránh timezone issues
    // datetime-local format: "YYYY-MM-DDTHH:mm"
    const datetimeLocalRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
    const match = this.appointmentDateTime.match(datetimeLocalRegex);
    
    if (!match) {
      alert('Thời gian không hợp lệ. Vui lòng chọn lại.');
      return;
    }
    
    // Parse thủ công từ datetime-local string
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // Month is 0-indexed
    const day = parseInt(match[3]);
    const hours = parseInt(match[4]);
    const minutes = parseInt(match[5]);
    
    // Tạo Date object từ các giá trị đã parse (local time)
    const appointmentDateTime = new Date(year, month, day, hours, minutes, 0);
    const now = new Date();
    
    // Validate datetime is not in the past
    if (appointmentDateTime < now) {
      alert('Thời gian khám không được trong quá khứ. Vui lòng chọn thời gian khác.');
      return;
    }

    this.isSaving = true;

    // Format datetime (dùng giá trị đã parse, không qua Date conversion)
    const formattedYear = match[1];
    const formattedMonth = match[2];
    const formattedDay = match[3];
    const formattedHours = match[4];
    const formattedMinutes = match[5];
    const formattedDateTime = `${formattedYear}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:00`;

    // Ensure IDs are numbers
    const patientId = typeof this.selectedPatientId === 'string' 
      ? parseInt(this.selectedPatientId) 
      : this.selectedPatientId;
    const doctorId = typeof this.selectedDoctorId === 'string' 
      ? parseInt(this.selectedDoctorId) 
      : this.selectedDoctorId;

    const updateData: Partial<Appointment> = {
      patientId: patientId,
      doctorId: doctorId,
      appointmentTime: formattedDateTime,
      status: this.appointmentForm.status || 'Đã đặt',
      note: this.appointmentForm.note || ''
    };

    this.appointmentService.updateAppointment(this.selectedAppointment.id, updateData).subscribe({
      next: (response) => {
        alert('Cập nhật lịch hẹn thành công!');
        this.closeUpdateModal();
        this.loadAppointments();
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Lỗi cập nhật lịch hẹn:', error);
        let errorMessage = 'Không thể cập nhật lịch hẹn. Vui lòng thử lại.';
        if (error.error?.error) {
          if (error.status === 409) {
            errorMessage = 'Bác sĩ đã có lịch hẹn vào thời gian này. Vui lòng chọn thời gian khác.';
          } else {
            errorMessage = error.error.error;
          }
        }
        alert(errorMessage);
        this.isSaving = false;
      }
    });
  }

  // Cancel appointment
  cancelAppointment(appointment: Appointment): void {
    if (confirm(`Bạn có chắc chắn muốn hủy lịch hẹn này?`)) {
      if (!appointment.id) {
        alert('Không tìm thấy ID lịch hẹn. Vui lòng thử lại.');
        return;
      }
      
      const updateData: Partial<Appointment> = {
        status: 'Đã hủy'
      };

      console.log('Cancelling appointment:', { id: appointment.id, data: updateData });

      this.appointmentService.updateAppointment(appointment.id, updateData).subscribe({
        next: (response) => {
          console.log('Appointment cancelled successfully:', response);
          alert('Đã hủy lịch hẹn thành công!');
          this.loadAppointments();
        },
        error: (error) => {
          console.error('Lỗi hủy lịch hẹn:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.error('Error status:', error.status);
          console.error('Error URL:', error.url);
          let errorMessage = 'Không thể hủy lịch hẹn. Vui lòng thử lại.';
          
          if (error.error?.error) {
            if (error.status === 404) {
              errorMessage = 'Không tìm thấy lịch hẹn để hủy.';
            } else if (error.status === 400) {
              errorMessage = error.error.error || 'Dữ liệu không hợp lệ.';
            } else if (error.status === 500) {
              errorMessage = error.error.error || 'Lỗi server. Vui lòng thử lại sau.';
            } else {
              errorMessage = error.error.error || errorMessage;
            }
          } else if (error.status === 0) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.';
          }
          
          alert(errorMessage);
        }
      });
    }
  }

  // Delete appointment (nếu cần)
  deleteAppointment(appointment: Appointment): void {
    if (confirm(`Bạn có chắc chắn muốn xóa lịch hẹn này?`)) {
      // Note: Backend chưa có API delete, có thể cập nhật status thành "Đã hủy"
      this.cancelAppointment(appointment);
    }
  }

  // Helper methods
  resetForm(): void {
    this.appointmentForm = {
      patientId: undefined,
      doctorId: undefined,
      appointmentTime: '',
      status: 'Đã đặt',
      note: ''
    };
    this.selectedPatientId = null;
    this.selectedDoctorId = null;
    this.selectedDepartmentId = null;
    this.appointmentDateTime = '';
    this.filteredDoctors = [];
    this.isSaving = false;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually to avoid timezone issues
      // Example: "2024-01-15 14:30:00"
      const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
      const match = dateString.match(mysqlDateTimeRegex);
      
      if (match) {
        // Use the exact values from the string (no timezone conversion)
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hours = match[4];
        const minutes = match[5];
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Fallback to Date parsing if format doesn't match
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return '';
    }
  }

  formatDateOnly(dateString: string): string {
    if (!dateString) return '';
    try {
      // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually to avoid timezone issues
      const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})/;
      const match = dateString.match(mysqlDateTimeRegex);
      
      if (match) {
        // Use the exact values from the string (no timezone conversion)
        const year = match[1];
        const month = match[2];
        const day = match[3];
        return `${day}/${month}/${year}`;
      }
      
      // Fallback to Date parsing if format doesn't match
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '';
    }
  }

  getStatusLabel(status: string): string {
    return status || 'Chưa xác định';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Đã đặt':
        return 'status-pending';
      case 'Hoàn thành':
        return 'status-completed';
      case 'Đã hủy':
        return 'status-cancelled';
      case 'Đổi lịch':
        return 'status-changed';
      default:
        return 'status-unknown';
    }
  }

  get minDateTime(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}

