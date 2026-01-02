import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService, Patient } from '../../services/patient.service';

@Component({
  selector: 'app-patient-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-management.component.html',
  styleUrl: './patient-management.component.scss'
})
export class PatientManagementComponent implements OnInit {
  showAddModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  selectedPatient: Patient | null = null;
  isLoading: boolean = false;

  // Search and filter
  searchQuery: string = '';
  selectedGender: string = '';

  // Patient list
  patients: Patient[] = [];

  // Form data
  patientForm: Patient = {
    id: 0,
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    idCard: '',
    address: '',
    email: '',
    createdAt: ''
  };

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    // Nếu có search query, gọi API search, nếu không thì gọi getAll
    if (this.searchQuery.trim() || this.selectedGender) {
      this.searchPatients();
      return;
    }
    
    this.patientService.getAllPatients().subscribe({
      next: (patients) => {
        console.log('Loaded patients:', patients);
        patients.forEach(p => {
          console.log(`Patient ${p.fullName} - Email:`, p.email);
        });
        this.patients = patients;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi tải danh sách bệnh nhân:', error);
        alert('Không thể tải danh sách bệnh nhân. Vui lòng thử lại.');
        this.isLoading = false;
      }
    });
  }

  searchPatients(): void {
    this.isLoading = true;
    
    // Tách search query thành các phần (có thể là tên, SĐT, CMND)
    const searchParams: any = {};
    
    if (this.searchQuery.trim()) {
      // Nếu là số, có thể là SĐT hoặc CMND
      if (/^\d+$/.test(this.searchQuery.trim())) {
        // Nếu dài 9-11 chữ số, có thể là SĐT
        if (this.searchQuery.trim().length >= 9 && this.searchQuery.trim().length <= 11) {
          searchParams.phoneNumber = this.searchQuery.trim();
        } else {
          // Ngược lại, có thể là CMND/CCCD
          searchParams.idCard = this.searchQuery.trim();
        }
      } else {
        // Nếu không phải số, tìm theo tên
        searchParams.name = this.searchQuery.trim();
      }
    }
    
    if (this.selectedGender) {
      searchParams.gender = this.selectedGender;
    }
    
    // Nếu không có tham số tìm kiếm, lấy tất cả
    if (Object.keys(searchParams).length === 0) {
      this.patientService.getAllPatients().subscribe({
        next: (patients) => {
          this.patients = patients;
          this.updatePagination();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi tải danh sách bệnh nhân:', error);
          alert('Không thể tải danh sách bệnh nhân. Vui lòng thử lại.');
          this.isLoading = false;
        }
      });
      return;
    }
    
    this.patientService.searchPatients(searchParams).subscribe({
      next: (patients) => {
        console.log('Search results:', patients);
        this.patients = patients;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi tìm kiếm bệnh nhân:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể tìm kiếm bệnh nhân. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
        this.patients = [];
        this.updatePagination();
      }
    });
  }

  get filteredPatients(): Patient[] {
    // Không filter ở client-side nữa, đã filter ở backend
    return [...this.patients];
  }

  get paginatedPatients(): Patient[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPatients.slice(startIndex, endIndex);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPatients.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadPatients(); // Gọi lại API search khi filter thay đổi
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Modal functions
  openAddModal(): void {
    this.patientForm = {
      id: 0,
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      idCard: '',
      address: '',
      email: '',
      createdAt: ''
    };
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.patientForm = {
      id: 0,
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      idCard: '',
      address: '',
      email: '',
      createdAt: ''
    };
  }

  openUpdateModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.patientForm = { ...patient };
    
    // Convert date format from dd/mm/yyyy to yyyy-mm-dd for date input
    if (this.patientForm.dateOfBirth && this.patientForm.dateOfBirth.includes('/')) {
      const parts = this.patientForm.dateOfBirth.split('/');
      if (parts.length === 3) {
        this.patientForm.dateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedPatient = null;
    this.patientForm = {
      id: 0,
      fullName: '',
      dateOfBirth: '',
      gender: '',
      phoneNumber: '',
      idCard: '',
      address: '',
      email: '',
      createdAt: ''
    };
  }

  // CRUD operations
  addPatient(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.patientService.addPatient(this.patientForm).subscribe({
      next: (response) => {
        console.log('Thêm bệnh nhân thành công:', response);
        this.loadPatients(); // Reload danh sách
        this.closeAddModal();
        alert('Thêm bệnh nhân thành công!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi thêm bệnh nhân:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể thêm bệnh nhân. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  updatePatient(): void {
    if (!this.selectedPatient || !this.selectedPatient.id) {
      alert('Không tìm thấy bệnh nhân cần cập nhật. Vui lòng chọn lại từ danh sách.');
      this.closeUpdateModal();
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.patientService.updatePatient(this.selectedPatient.id, this.patientForm).subscribe({
      next: (response) => {
        console.log('Cập nhật bệnh nhân thành công:', response);
        this.loadPatients(); // Reload danh sách
        this.closeUpdateModal();
        alert('Cập nhật bệnh nhân thành công!');
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi cập nhật bệnh nhân:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Không thể cập nhật bệnh nhân. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  deletePatient(patient: Patient): void {
    if (confirm(`Bạn có chắc muốn xóa bệnh nhân ${patient.fullName}?`)) {
      this.isLoading = true;
      this.patientService.deletePatient(patient.id).subscribe({
        next: (response) => {
          console.log('Xóa bệnh nhân thành công:', response);
          this.loadPatients(); // Reload danh sách
          alert('Xóa bệnh nhân thành công!');
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi xóa bệnh nhân:', error);
          const errorMessage = error.error?.error || error.error?.message || 'Không thể xóa bệnh nhân. Vui lòng thử lại.';
          alert('Lỗi: ' + errorMessage);
          this.isLoading = false;
        }
      });
    }
  }

  viewDetails(patient: Patient): void {
    // Gọi API getById để lấy thông tin chi tiết từ backend
    this.isLoading = true;
    this.patientService.getPatientById(patient.id).subscribe({
      next: (patientDetail) => {
        this.selectedPatient = patientDetail;
        this.showDetailModal = true;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi lấy thông tin chi tiết bệnh nhân:', error);
        // Fallback: sử dụng thông tin từ list nếu API fail
        this.selectedPatient = patient;
        this.showDetailModal = true;
        this.isLoading = false;
        const errorMessage = error.error?.error || error.error?.message || 'Không thể tải thông tin chi tiết.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedPatient = null;
  }

  printPatientProfile(): void {
    if (!this.selectedPatient) {
      alert('Không có thông tin bệnh nhân để in');
      return;
    }
    window.print();
  }

  validateForm(): boolean {
    if (!this.patientForm.fullName?.trim()) {
      alert('Vui lòng nhập họ tên');
      return false;
    }
    if (!this.patientForm.dateOfBirth?.trim()) {
      alert('Vui lòng nhập ngày sinh');
      return false;
    }
    if (!this.patientForm.gender) {
      alert('Vui lòng chọn giới tính');
      return false;
    }
    if (!this.patientForm.phoneNumber?.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return false;
    }
    if (!this.patientForm.idCard?.trim()) {
      alert('Vui lòng nhập CMND/CCCD');
      return false;
    }
    if (!this.patientForm.address?.trim()) {
      alert('Vui lòng nhập địa chỉ');
      return false;
    }
    return true;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('vi-VN');
  }
}

