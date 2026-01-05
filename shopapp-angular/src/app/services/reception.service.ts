import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Frontend interfaces
export interface ReceptionAppointment {
  appointmentId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber?: string;
  idCard?: string;
  department: string;
  doctor: string;
  appointmentTime: string;
  status: string;
  patientId?: number;
  doctorId?: number;
  departmentId?: number;
}

// Backend interfaces
interface BackendLichHen {
  MaLichHen: number;
  MaBenhNhan: number;
  MaBacSi: number;
  ThoiGianKham: string;
  TrangThai: string;
  Note?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  BenhNhanHoTen?: string;
  BenhNhoaiSoDienThoai?: string;
  BacSiHoTen?: string;
  BacSiMaKhoa?: number;
  KhoaTen?: string;
}

interface BackendBenhNhan {
  MaBenhNhan: number;
  HoTen: string;
  NgaySinh?: string;
  GioiTinh?: string;
  SoDienThoai?: string;
  CMND_CCCD?: string;
  DiaChi?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceptionService {
  private apiUrl = 'http://localhost:3000/api';
  private lichHenUrl = `${this.apiUrl}/lichhen`;
  private benhNhanUrl = `${this.apiUrl}/benhnhan`;

  constructor(private http: HttpClient) { }

  // Tìm lịch hẹn theo mã lịch hẹn, số điện thoại, hoặc CMND
  searchAppointment(searchAppointmentId?: string, phoneNumber?: string, idCard?: string): Observable<ReceptionAppointment | null> {
    let params = new HttpParams();
    
    if (searchAppointmentId) {
      params = params.set('MaLichHen', searchAppointmentId);
    }
    if (phoneNumber) {
      params = params.set('SoDienThoai', phoneNumber);
    }
    if (idCard) {
      params = params.set('CMND_CCCD', idCard);
    }

    // Tìm lịch hẹn theo các tiêu chí qua endpoint search
    return this.http.get<BackendLichHen[]>(`${this.lichHenUrl}/search`, { params }).pipe(
      map(appointments => {
        if (!appointments || appointments.length === 0) {
          return null;
        }
        // Lấy lịch hẹn đầu tiên tìm được
        return this.mapToReceptionAppointment(appointments[0]);
      })
    );
  }

  // Lấy tất cả lịch hẹn trong ngày (cho danh sách hàng ngày)
  getDailyAppointments(date?: string): Observable<ReceptionAppointment[]> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }

    return this.http.get<BackendLichHen[]>(this.lichHenUrl, { params }).pipe(
      map(appointments => {
        // Lọc theo ngày nếu có
        let filtered = appointments;
        if (date) {
          filtered = appointments.filter(apt => {
            const aptDate = apt.ThoiGianKham ? apt.ThoiGianKham.split(' ')[0] : '';
            return aptDate === date;
          });
        }
        return filtered.map(apt => this.mapToReceptionAppointment(apt));
      })
    );
  }

  // Lấy lịch hẹn theo ID
  getAppointmentById(id: number): Observable<ReceptionAppointment> {
    return this.http.get<BackendLichHen>(`${this.lichHenUrl}/${id}`).pipe(
      map(apt => this.mapToReceptionAppointment(apt))
    );
  }

  // Xác nhận tiếp nhận (cập nhật trạng thái lịch hẹn thành "Hoàn thành")
  confirmReception(appointmentId: number): Observable<any> {
    return this.http.put(`${this.lichHenUrl}/${appointmentId}`, {
      TrangThai: 'Hoàn thành'
    });
  }

  // Cập nhật trạng thái lịch hẹn
  updateAppointmentStatus(appointmentId: number, status: string): Observable<any> {
    return this.http.put(`${this.lichHenUrl}/${appointmentId}`, {
      TrangThai: status
    });
  }

  // Cập nhật lịch hẹn với đầy đủ thông tin
  updateAppointment(appointmentId: number, updateData: {
    MaBacSi?: number;
    ThoiGianKham?: string;
    TrangThai?: string;
    Note?: string;
  }): Observable<any> {
    return this.http.put(`${this.lichHenUrl}/${appointmentId}`, updateData);
  }

  // Lấy thông tin bệnh nhân theo ID
  getPatientById(patientId: number): Observable<BackendBenhNhan> {
    return this.http.get<BackendBenhNhan>(`${this.benhNhanUrl}/${patientId}`);
  }

  // Tạo bệnh nhân mới (cho tiếp nhận trực tiếp)
  createPatient(patientData: {
    HoTen: string;
    NgaySinh?: string;
    GioiTinh?: string;
    SoDienThoai?: string;
    CMND_CCCD?: string;
    DiaChi?: string;
  }): Observable<any> {
    return this.http.post(this.benhNhanUrl, patientData);
  }

  // Cập nhật thông tin bệnh nhân
  updatePatient(patientId: number, patientData: Partial<BackendBenhNhan>): Observable<any> {
    return this.http.put(`${this.benhNhanUrl}/${patientId}`, patientData);
  }

  // Map từ backend sang frontend
  private mapToReceptionAppointment(backend: any): ReceptionAppointment {
    // Format ngày sinh
    let dateOfBirth = '';
    if (backend.BenhNhanNgaySinh) {
      const date = new Date(backend.BenhNhanNgaySinh);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      dateOfBirth = `${day}/${month}/${year}`;
    }

    // Format thời gian khám
    let appointmentTime = '';
    if (backend.ThoiGianKham) {
      const dateTime = new Date(backend.ThoiGianKham);
      const hours = dateTime.getHours().toString().padStart(2, '0');
      const minutes = dateTime.getMinutes().toString().padStart(2, '0');
      appointmentTime = `${hours}:${minutes}`;
    }

    return {
      appointmentId: backend.MaLichHen.toString(),
      fullName: backend.BenhNhanHoTen || 'Chưa có thông tin',
      dateOfBirth: dateOfBirth,
      gender: backend.BenhNhanGioiTinh || '',
      phoneNumber: backend.BenhNhanSoDienThoai,
      idCard: backend.BenhNhanCMND_CCCD,
      department: backend.KhoaTen || 'Chưa xác định',
      doctor: backend.BacSiHoTen || 'Chưa xác định',
      appointmentTime: appointmentTime,
      status: backend.TrangThai || 'Chưa xác định',
      patientId: backend.MaBenhNhan,
      doctorId: backend.MaBacSi,
      departmentId: backend.BacSiMaKhoa
    };
  }
}

