import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink, RouterLinkActive, ActivatedRoute, Router } from '@angular/router';
import { ReceptionService, ReceptionAppointment } from '../services/reception.service';
import { DepartmentService } from '../services/department.service';
import { DoctorService } from '../services/doctor.service';


 // MODELS & BASE STATE

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

  // Pagination
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

}
   