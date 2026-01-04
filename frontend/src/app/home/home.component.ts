
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



  