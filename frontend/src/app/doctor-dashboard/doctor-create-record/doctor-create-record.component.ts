import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService, MedicalRecord } from '../../services/patient.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-doctor-create-record',
  templateUrl: './doctor-create-record.component.html',
  styleUrls: ['./doctor-create-record.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class DoctorCreateRecordComponent implements OnInit {
  patientId!: number;
  symptoms = '';
  diagnosis = '';
  note = '';

  constructor(private route: ActivatedRoute, private router: Router, private patientService: PatientService) {}

  ngOnInit(): void {
    this.patientId = +this.route.snapshot.paramMap.get('patientId')!;
  }

  createRecord() {
    const record: MedicalRecord = {
      patientId: this.patientId,
      doctorId: 1, // hoặc lấy từ authService.currentUser
      symptoms: this.symptoms,
      diagnosis: this.diagnosis,
      note: this.note
    };

    this.patientService.createMedicalRecord(record).subscribe(res => {
      alert('Tạo phiếu khám thành công!');
      this.router.navigate(['/doctor/dashboard']); // Quay về dashboard
    });
  }
}
