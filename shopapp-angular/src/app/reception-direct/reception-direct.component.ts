import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReceptionService } from '../services/reception.service';
import { DepartmentService } from '../services/department.service';
import { DoctorService } from '../services/doctor.service';

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
    private doctorService: DoctorService
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

  onDepartmentChange(): void {
    // Reset doctor selection when department changes
    this.patientForm.doctor = '';
  }

  onSubmit(): void {
    if (!this.patientForm.fullName || !this.patientForm.dateOfBirth || !this.patientForm.gender || 
        !this.patientForm.phoneNumber || !this.patientForm.idCard || !this.patientForm.address ||
        !this.patientForm.department || !this.patientForm.doctor || !this.patientForm.examinationType) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    // Format ngày sinh từ DD/MM/YYYY sang YYYY-MM-DD
    let formattedDateOfBirth = '';
    if (this.patientForm.dateOfBirth) {
      const parts = this.patientForm.dateOfBirth.split('/');
      if (parts.length === 3) {
        formattedDateOfBirth = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        formattedDateOfBirth = this.patientForm.dateOfBirth;
      }
    }

    // Tạo bệnh nhân mới
    const patientData = {
      HoTen: this.patientForm.fullName,
      NgaySinh: formattedDateOfBirth || undefined,
      GioiTinh: this.patientForm.gender,
      SoDienThoai: this.patientForm.phoneNumber,
      CMND_CCCD: this.patientForm.idCard,
      DiaChi: this.patientForm.address
    };

    this.receptionService.createPatient(patientData).subscribe({
      next: (response) => {
        console.log('Tạo bệnh nhân thành công:', response);
        alert('Tạo hồ sơ thành công! Bệnh nhân đã được thêm vào danh sách chờ.');
        
        // Reset form
        this.patientForm = {
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
      },
      error: (error) => {
        console.error('Lỗi tạo bệnh nhân:', error);
        const errorMessage = error.error?.error || error.message || 'Có lỗi xảy ra khi tạo hồ sơ.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }
}
