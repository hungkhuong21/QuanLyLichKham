import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService, MedicalResult } from '../../services/patient.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-doctor-create-result',
  templateUrl: './doctor-create-result.component.html',
  styleUrls: ['./doctor-create-result.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class DoctorCreateResultComponent implements OnInit {
  recordId!: number;
  result = '';
  conclusion = '';
  advice = '';

  constructor(private route: ActivatedRoute, private router: Router, private patientService: PatientService) {}

  ngOnInit(): void {
    this.recordId = +this.route.snapshot.paramMap.get('recordId')!;
  }

  createResult() {
    const medicalResult: MedicalResult = {
      recordId: this.recordId,
      result: this.result,
      conclusion: this.conclusion,
      advice: this.advice
    };
    this.patientService.createMedicalResult(medicalResult).subscribe(res => {
      alert('Tạo kết quả khám thành công!');
      this.router.navigate(['/doctor/dashboard']);
    });
  }
}
