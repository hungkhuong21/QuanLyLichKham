import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ReceptionService, ReceptionAppointment } from '../services/reception.service';
import { DepartmentService } from '../services/department.service';

@Component({
  selector: 'app-reception-daily-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink, RouterLinkActive],
  templateUrl: './reception-daily-list.component.html',
  styleUrl: './reception-daily-list.component.scss'
})
export class ReceptionDailyListComponent implements OnInit {
  // Filter options
  selectedDepartment: string = '';
  selectedStatus: string = '';
  searchQuery: string = '';

  // Departments list
  departments: { id: string; name: string }[] = [
    { id: '', name: 'Tất cả khoa' }
  ];

  // Status list
  statuses = [
    { id: '', name: 'Tất cả trạng thái' },
    { id: 'cho-xac-nhan', name: 'Chờ xác nhận' },
    { id: 'da-xac-nhan', name: 'Đã xác nhận' },
    { id: 'dang-kham', name: 'Đang khám' },
    { id: 'hoan-thanh', name: 'Hoàn thành' },
    { id: 'huy', name: 'Hủy' }
  ];

  // Daily appointments list
  dailyAppointments: ReceptionAppointment[] = [];
  allAppointments: ReceptionAppointment[] = [];
  isLoading: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  constructor(
    private receptionService: ReceptionService,
    private departmentService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDailyAppointments();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (depts) => {
        this.departments = [
          { id: '', name: 'Tất cả khoa' },
          ...depts.map(dept => ({ id: dept.id.toString(), name: dept.name }))
        ];
      },
      error: (error) => {
        console.error('Lỗi load danh sách khoa:', error);
      }
    });
  }

  loadDailyAppointments(): void {
    this.isLoading = true;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    this.receptionService.getDailyAppointments(today).subscribe({
      next: (appointments) => {
        this.allAppointments = appointments;
        this.dailyAppointments = appointments;
        this.updatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi load danh sách lịch hẹn:', error);
        alert('Có lỗi xảy ra khi tải danh sách lịch hẹn. Vui lòng thử lại.');
        this.isLoading = false;
      }
    });
  }

  get filteredAppointments(): ReceptionAppointment[] {
    let filtered = [...this.allAppointments];

    // Filter by department
    if (this.selectedDepartment) {
      filtered = filtered.filter(apt => {
        return apt.departmentId && apt.departmentId.toString() === this.selectedDepartment;
      });
    }

    // Filter by status
    if (this.selectedStatus) {
      filtered = filtered.filter(apt => {
        const statusMap: { [key: string]: string } = {
          'cho-xac-nhan': 'Chờ xác nhận',
          'da-xac-nhan': 'Đã xác nhận',
          'dang-kham': 'Đang khám',
          'hoan-thanh': 'Hoàn thành',
          'huy': 'Hủy',
          'da-huy': 'Đã hủy'
        };
        const targetStatus = statusMap[this.selectedStatus];
        return apt.status && apt.status.toLowerCase().includes(targetStatus.toLowerCase());
      });
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(apt =>
        apt.appointmentId.toLowerCase().includes(query) ||
        apt.fullName.toLowerCase().includes(query) ||
        (apt.phoneNumber && apt.phoneNumber.includes(query))
      );
    }

    return filtered;
  }

  get paginatedAppointments(): ReceptionAppointment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredAppointments.slice(startIndex, endIndex);
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  confirmReception(appointment: ReceptionAppointment): void {
    const appointmentId = parseInt(appointment.appointmentId);
    if (isNaN(appointmentId)) {
      alert('Mã lịch hẹn không hợp lệ.');
      return;
    }

    this.receptionService.confirmReception(appointmentId).subscribe({
      next: () => {
        appointment.status = 'Đã xác nhận';
        alert(`Xác nhận tiếp nhận cho ${appointment.fullName} thành công!`);
        // Reload to get updated data
        this.loadDailyAppointments();
      },
      error: (error) => {
        console.error('Lỗi xác nhận tiếp nhận:', error);
        alert('Có lỗi xảy ra khi xác nhận tiếp nhận. Vui lòng thử lại.');
      }
    });
  }

  printSlip(appointment: ReceptionAppointment): void {
    window.print();
    alert(`Đang in phiếu khám cho ${appointment.fullName}...`);
  }

  viewDetails(appointment: ReceptionAppointment): void {
    // Navigate to update profile page with appointment ID
    const appointmentId = parseInt(appointment.appointmentId);
    if (!isNaN(appointmentId)) {
      this.router.navigate(['/reception/update-profile'], {
        queryParams: { appointmentId: appointmentId }
      });
    } else {
      alert('Mã lịch hẹn không hợp lệ.');
    }
  }
}
