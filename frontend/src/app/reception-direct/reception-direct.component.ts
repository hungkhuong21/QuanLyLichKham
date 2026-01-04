import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReceptionService } from '../services/reception.service';
import { DepartmentService } from '../services/department.service';
import { DoctorService } from '../services/doctor.service';
import { AppointmentService } from '../services/appointment.service';

interface PatientForm {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  idCard: string;
  address: string;
  contactPerson: string;
  department: string;
  doctor: string;
  examinationType: string;
  notes: string;
}

@Component({
  selector: 'app-reception-direct',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink, RouterLinkActive],
  templateUrl: './reception-direct.component.html',
  styleUrl: './reception-direct.component.scss'
})
export class ReceptionDirectComponent implements OnInit {
  patientForm: PatientForm = {
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phoneNumber: '',
    idCard: '',
    address: '',
    contactPerson: '',
    department: '',
    doctor: '',
    examinationType: '',
    notes: ''
  };

  specialties: { id: string; name: string }[] = [];
  doctors: { id: number; name: string; departmentId: number }[] = [];
  allDoctors: { id: number; name: string; departmentId: number }[] = [];

  constructor(
    private receptionService: ReceptionService,
    private departmentService: DepartmentService,
    private doctorService: DoctorService,
    private appointmentService: AppointmentService
  ) {}

  get filteredDoctors() {
    if (!this.patientForm.department) {
      return [];
    }
    const deptId = parseInt(this.patientForm.department);
    return this.allDoctors.filter(doctor => doctor.departmentId === deptId);
  }

  ngOnInit(): void {
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
}