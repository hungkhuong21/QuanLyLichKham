import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorService, Doctor as ServiceDoctor } from '../../services/doctor.service';
import { DepartmentService, Department } from '../../services/department.service';

interface Doctor {
  id: number | string;
  code?: string;
  fullName: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  degree?: string;
  specialty: string;
  workingHours?: string;
  workingDays?: string;
  certification?: string;
  onCallSchedule?: string;
  status: string;
  profileImage?: string;
  departmentId?: number;
}

@Component({
  selector: 'app-doctor-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-management.component.html',
  styleUrl: './doctor-management.component.scss'
})
export class DoctorManagementComponent implements OnInit {
  showAddModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;

  // Doctor list (load từ backend)
  doctors: Doctor[] = [];

  // Filter/search
  searchName: string = '';
  searchSpecialty: string = '';
  searchStatus: string = '';
  filteredDoctors: Doctor[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 1;

  // Form data for add/update
  doctorForm: Doctor = {
    id: '',
    code: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    degree: '',
    specialty: '',
      workingHours: '',
      workingDays: '',
      certification: '',
      onCallSchedule: '',
      status: 'Active', // Mặc định Active cho backend (không hiển thị trong UI)
      departmentId: undefined
    };

  // Selected doctor for update
  selectedDoctor: Doctor | null = null;

  // Departments list (từ backend)
  departments: Department[] = [];
  
  // Specialties list (lấy từ danh sách ChuyenMon của bác sĩ hoặc tên khoa)
  specialties: string[] = [];
  
  // Map để lưu ChuyenMon theo MaKhoa
  specialtyByDepartment: Map<number, string[]> = new Map();

  isLoading: boolean = false;

  // Degrees list
  degrees = [
    'Bác sĩ',
    'Thạc sĩ',
    'Tiến sĩ',
    'Giáo sư'
  ];

  constructor(
    private doctorService: DoctorService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.loadDepartments();
  }

  loadDoctors(): void {
    this.isLoading = true;
    // Nếu có search params, gọi API search, nếu không thì gọi getAll
    if (this.searchName.trim() || this.searchSpecialty || this.searchStatus) {
      this.searchDoctors();
      return;
    }
    
    this.doctorService.getAllDoctors().subscribe({
      next: (serviceDoctors: ServiceDoctor[]) => {
        // Map từ ServiceDoctor sang Doctor của component
        this.doctors = serviceDoctors.map(d => this.mapServiceDoctorToComponent(d));
        
        // Tạo danh sách specialties từ ChuyenMon của các bác sĩ (unique)
        const uniqueSpecialties = new Set<string>();
        serviceDoctors.forEach(d => {
          if (d.specialty && d.specialty.trim()) {
            uniqueSpecialties.add(d.specialty);
          }
        });
        this.specialties = Array.from(uniqueSpecialties).sort();
        
        // Nếu chưa có specialties, dùng tên khoa
        if (this.specialties.length === 0 && this.departments.length > 0) {
          this.specialties = this.departments.map(d => d.name);
        }
        
        console.log('Danh sách specialties:', this.specialties);
        console.log('Danh sách bác sĩ:', this.doctors.map(d => ({ name: d.fullName, specialty: d.specialty })));
        
        this.filteredDoctors = this.doctors;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi tải danh sách bác sĩ:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể tải danh sách bác sĩ. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  searchDoctors(): void {
    this.isLoading = true;
    
    const searchParams: any = {};
    
    if (this.searchName.trim()) {
      searchParams.name = this.searchName.trim();
    }
    
    if (this.searchSpecialty) {
      searchParams.specialty = this.searchSpecialty;
    }
    
    if (this.searchStatus) {
      searchParams.status = this.searchStatus;
    }
    
    // Nếu không có tham số tìm kiếm, lấy tất cả
    if (Object.keys(searchParams).length === 0) {
      this.doctorService.getAllDoctors().subscribe({
        next: (serviceDoctors: ServiceDoctor[]) => {
          this.doctors = serviceDoctors.map(d => this.mapServiceDoctorToComponent(d));
          this.filteredDoctors = this.doctors;
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Lỗi tải danh sách bác sĩ:', error);
          const errorMessage = error.error?.error || error.error?.message || 'Không thể tải danh sách bác sĩ. Vui lòng thử lại.';
          alert('Lỗi: ' + errorMessage);
          this.isLoading = false;
        }
      });
      return;
    }
    
    this.doctorService.searchDoctors(searchParams).subscribe({
      next: (serviceDoctors: ServiceDoctor[]) => {
        console.log('Search results:', serviceDoctors);
        this.doctors = serviceDoctors.map(d => this.mapServiceDoctorToComponent(d));
        this.filteredDoctors = this.doctors;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi tìm kiếm bác sĩ:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể tìm kiếm bác sĩ. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
        this.doctors = [];
        this.filteredDoctors = [];
        this.updatePagination();
      }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
        // Nếu chưa có specialties từ bác sĩ, dùng tên khoa
        if (this.specialties.length === 0) {
          this.specialties = departments.map(d => d.name);
        }
      },
      error: (error: any) => {
        console.error('Lỗi tải danh sách khoa:', error);
        // Fallback nếu không load được
        if (this.specialties.length === 0) {
          this.specialties = [
            'Khoa tim mạch',
            'Khoa nhi',
            'Khoa da liễu',
            'Khoa ngoại tổng hợp'
          ];
        }
      }
    });
  }

  // Map từ ServiceDoctor (từ service) sang Doctor (component)
  private mapServiceDoctorToComponent(serviceDoctor: ServiceDoctor): Doctor {
    return {
      id: serviceDoctor.id,
      code: '', // Không sử dụng mã bác sĩ
      fullName: serviceDoctor.name,
      gender: serviceDoctor.gender || '',
      dateOfBirth: serviceDoctor.dateOfBirth || '',
      phoneNumber: serviceDoctor.phone || '',
      address: serviceDoctor.address || '',
      degree: '',
      specialty: serviceDoctor.specialty || '',
      workingHours: '',
      workingDays: '',
      certification: serviceDoctor.cccd || '',
      onCallSchedule: '',
      status: serviceDoctor.status || 'Active',
      departmentId: serviceDoctor.departmentId,
      email: serviceDoctor.email || ''
    };
  }

  // Map từ Doctor (component) sang ServiceDoctor (service)
  private mapComponentDoctorToService(doctor: Doctor, isUpdate: boolean = false): Partial<ServiceDoctor> {
    // Tìm MaKhoa từ tên khoa/chuyên khoa
    let departmentId = doctor.departmentId;
    if (!departmentId && doctor.specialty) {
      departmentId = this.getDepartmentIdByName(doctor.specialty);
    }
    
    const mapped: Partial<ServiceDoctor> = {
      name: doctor.fullName,
      departmentId: departmentId || 1, // Default to 1 if not found
      specialty: doctor.specialty || '',
      phone: doctor.phoneNumber || '',
      email: doctor.email || '',
      gender: doctor.gender || '',
      dateOfBirth: doctor.dateOfBirth || '',
      cccd: doctor.certification || '',
      address: doctor.address || ''
    };
    
    // Gửi status - convert từ tiếng Việt sang enum
    if (doctor.status) {
      if (doctor.status === 'Đang làm việc' || doctor.status === 'Active') {
        mapped.status = 'Active';
      } else if (doctor.status === 'Nghỉ phép' || doctor.status === 'Inactive') {
        mapped.status = 'Inactive';
      } else {
        mapped.status = doctor.status; // Giữ nguyên nếu đã là Active/Inactive
      }
    } else if (!isUpdate) {
      mapped.status = 'Active'; // Default khi thêm mới
    }
    
    return mapped;
  }

  // Tìm MaKhoa từ tên khoa
  private getDepartmentIdByName(specialtyName: string): number {
    const dept = this.departments.find(d => d.name === specialtyName);
    return dept ? dept.id : 1; // Default to 1 if not found
  }

  openAddModal(): void {
    this.resetForm();
    this.showAddModal = true;
    this.showUpdateModal = false;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  openUpdateModal(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.doctorForm = { ...doctor };
    
    // Set departmentId from specialty if not already set
    if (!this.doctorForm.departmentId && this.doctorForm.specialty) {
      // Try to find department by specialty name
      const dept = this.departments.find(d => {
        // Try to match by specialty name or department name
        return d.name.toLowerCase().includes(this.doctorForm.specialty.toLowerCase()) ||
               this.doctorForm.specialty.toLowerCase().includes(d.name.toLowerCase());
      });
      if (dept) {
        this.doctorForm.departmentId = dept.id;
      }
    }
    
    console.log('Mở update modal với doctor:', doctor);
    console.log('Doctor form:', this.doctorForm);
    
    this.showUpdateModal = true;
    this.showAddModal = false;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.resetForm();
    this.selectedDoctor = null;
  }

  applyFilters(): void {
    // Không filter ở client-side nữa, đã filter ở backend
    // Chỉ cập nhật pagination
    this.currentPage = 1;
    this.updatePagination();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDoctors(); // Gọi lại API search khi filter thay đổi
  }

  onSearchInputChange(): void {
    // Debounce hoặc gọi search khi người dùng nhập xong
    // Tạm thời không auto search để tránh gọi API quá nhiều
    // Có thể thêm debounce sau nếu cần
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredDoctors.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedDoctors(): Doctor[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDoctors.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      // Scroll to top of list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  addDoctor(): void {
    // Validation
    if (!this.doctorForm.fullName?.trim()) {
      alert('Vui lòng nhập họ và tên bác sĩ.');
      return;
    }
    if (!this.doctorForm.departmentId) {
      alert('Vui lòng chọn khoa.');
      return;
    }

    this.isLoading = true;
    const doctorData = this.mapComponentDoctorToService(this.doctorForm, false);
    
    this.doctorService.addDoctor(doctorData).subscribe({
      next: (response: any) => {
        console.log('Thêm bác sĩ thành công:', response);
        // Reset search để hiển thị lại tất cả
        this.searchName = '';
        this.searchSpecialty = '';
        this.searchStatus = '';
        this.loadDoctors(); // Reload danh sách
        this.closeAddModal();
        alert('Thêm bác sĩ thành công!');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi thêm bác sĩ:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể thêm bác sĩ. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  selectDoctorForUpdate(doctor: Doctor): void {
    this.openUpdateModal(doctor);
  }

  updateDoctor(): void {
    if (!this.selectedDoctor || !this.selectedDoctor.id) {
      alert('Không tìm thấy bác sĩ cần cập nhật. Vui lòng chọn lại từ danh sách.');
      this.closeUpdateModal();
      return;
    }

    // Validation
    if (!this.doctorForm.fullName?.trim()) {
      alert('Vui lòng nhập họ và tên bác sĩ.');
      return;
    }
    if (!this.doctorForm.departmentId) {
      alert('Vui lòng chọn khoa.');
      return;
    }

    this.isLoading = true;
    const doctorId = typeof this.selectedDoctor.id === 'number' ? this.selectedDoctor.id : parseInt(this.selectedDoctor.id);
    const doctorData = this.mapComponentDoctorToService(this.doctorForm, true);

    this.doctorService.updateDoctor(doctorId, doctorData).subscribe({
      next: (response: any) => {
        console.log('Cập nhật bác sĩ thành công:', response);
        this.loadDoctors(); // Reload danh sách với filter hiện tại
        this.closeUpdateModal();
        alert('Cập nhật thông tin bác sĩ thành công!');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi cập nhật bác sĩ:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể cập nhật bác sĩ. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  deleteDoctor(doctor: Doctor | null): void {
    if (!doctor || !doctor.id) {
      alert('Không tìm thấy bác sĩ cần xóa.');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa bác sĩ "${doctor.fullName}"?\n\nHành động này không thể hoàn tác.`)) {
      return;
    }

    this.isLoading = true;
    const doctorId = typeof doctor.id === 'number' ? doctor.id : parseInt(doctor.id);

    // Check if doctor is being edited
    const isCurrentlyEditing = this.selectedDoctor?.id === doctor.id && this.showUpdateModal;

    this.doctorService.deleteDoctor(doctorId).subscribe({
      next: (response: any) => {
        console.log('Xóa bác sĩ thành công:', response);
        this.loadDoctors(); // Reload danh sách với filter hiện tại
        
        // If deleting the doctor being edited, close modal
        if (isCurrentlyEditing) {
          this.closeUpdateModal();
        }
        
        alert('Xóa bác sĩ thành công!');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi xóa bác sĩ:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể xóa bác sĩ. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  toggleDoctorStatus(doctor: Doctor): void {
    if (!doctor || !doctor.id) return;
    const doctorId = typeof doctor.id === 'number' ? doctor.id : parseInt(doctor.id);
    const current = (doctor.status || 'Active');
    const newStatus = current === 'Active' ? 'Inactive' : 'Active';
    if (!confirm(`Bạn có chắc muốn chuyển trạng thái bác sĩ "${doctor.fullName}" sang "${newStatus === 'Active' ? 'Đang làm việc' : 'Nghỉ phép'}"?`)) {
      return;
    }
    this.isLoading = true;
    this.doctorService.updateDoctor(doctorId, { status: newStatus }).subscribe({
      next: () => {
        doctor.status = newStatus;
        // Reload để đồng bộ với backend
        this.loadDoctors();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi cập nhật trạng thái bác sĩ:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể cập nhật trạng thái. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.doctorForm = {
      id: '',
      code: '',
      fullName: '',
      gender: '',
      dateOfBirth: '',
      phoneNumber: '',
      email: '',
      address: '',
      degree: '',
      specialty: '',
      workingHours: '',
      workingDays: '',
      certification: '',
      onCallSchedule: '',
      status: 'Active', // Mặc định Active cho backend (không hiển thị trong UI)
      departmentId: undefined
    };
    this.selectedDoctor = null;
  }

  viewDoctorDetails(doctor: Doctor): void {
    // Gọi API getById để lấy thông tin chi tiết từ backend
    this.isLoading = true;
    const doctorId = typeof doctor.id === 'number' ? doctor.id : parseInt(doctor.id);
    this.doctorService.getDoctorById(doctorId).subscribe({
      next: (doctorDetail) => {
        // Map từ ServiceDoctor sang Doctor của component
        this.selectedDoctor = this.mapServiceDoctorToComponent({
          id: doctorDetail.id,
          name: doctorDetail.name,
          departmentId: doctorDetail.departmentId,
          specialty: doctorDetail.specialty,
          phone: doctorDetail.phone,
          email: doctorDetail.email,
          status: doctorDetail.status,
          gender: doctorDetail.gender,
          dateOfBirth: doctorDetail.dateOfBirth,
          cccd: doctorDetail.cccd,
          address: doctorDetail.address
        } as ServiceDoctor);
        this.showDetailModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi lấy thông tin chi tiết bác sĩ:', error);
        // Fallback: sử dụng thông tin từ list nếu API fail
        this.selectedDoctor = doctor;
        this.showDetailModal = true;
        this.isLoading = false;
        const errorMessage = error.error?.error || error.error?.message || 'Không thể tải thông tin chi tiết.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDoctor = null;
  }
}
