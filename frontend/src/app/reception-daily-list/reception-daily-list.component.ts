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
}