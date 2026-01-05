import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReceptionService, ReceptionAppointment } from '../services/reception.service';

@Component({
  selector: 'app-reception',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink, RouterLinkActive],
  templateUrl: './reception.component.html',
  styleUrl: './reception.component.scss'
})
export class ReceptionComponent implements OnInit {
  // Search form fields
  searchAppointmentId: string = '';
  searchPhoneNumber: string = '';
  searchIdCard: string = '';

  // Found appointment
  foundAppointment: ReceptionAppointment | null = null;
  hasSearched: boolean = false;
  isLoading: boolean = false;

  constructor(private receptionService: ReceptionService) {}

  ngOnInit(): void {
    // Initialize component
  }

  onSearch(): void {
    if (!this.searchAppointmentId && !this.searchPhoneNumber && !this.searchIdCard) {
      alert('Vui lòng nhập ít nhất một thông tin tìm kiếm.');
      return;
    }

    this.hasSearched = true;
    this.isLoading = true;
    this.foundAppointment = null;

    this.receptionService.searchAppointment(
      this.searchAppointmentId || undefined,
      this.searchPhoneNumber || undefined,
      this.searchIdCard || undefined
    ).subscribe({
      next: (appointment) => {
        this.isLoading = false;
        if (appointment) {
          this.foundAppointment = appointment;
        } else {
          alert('Không tìm thấy lịch hẹn với thông tin đã nhập.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Lỗi tìm kiếm lịch hẹn:', error);
        alert('Có lỗi xảy ra khi tìm kiếm lịch hẹn. Vui lòng thử lại.');
      }
    });
  }

  confirmReception(): void {
    if (!this.foundAppointment) return;

    const appointmentId = parseInt(this.foundAppointment.appointmentId);
    if (isNaN(appointmentId)) {
      alert('Mã lịch hẹn không hợp lệ.');
      return;
    }

    // Kiểm tra nếu đã hoàn thành rồi
    if (this.foundAppointment.status === 'Hoàn thành') {
      alert('Lịch hẹn này đã được tiếp nhận hoàn thành.');
      return;
    }

    this.receptionService.confirmReception(appointmentId).subscribe({
      next: () => {
        if (this.foundAppointment) {
          this.foundAppointment.status = 'Hoàn thành';
        }
        alert('Tiếp nhận thành công! Lịch hẹn đã được đánh dấu hoàn thành.');
      },
      error: (error) => {
        console.error('Lỗi xác nhận tiếp nhận:', error);
        const errorMessage = error.error?.error || error.message || 'Có lỗi xảy ra khi tiếp nhận. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }

  printSlip(): void {
    if (this.foundAppointment) {
      window.print();
      alert('Đang in phiếu khám...');
    }
  }
}
