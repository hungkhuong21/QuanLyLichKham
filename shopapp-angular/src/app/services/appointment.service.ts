import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentTime: string;
  status: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  // Thông tin từ backend JOIN
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  departmentId?: number;
  departmentName?: string;
}

// Interface khớp với backend response (sau khi JOIN với alias)
interface BackendAppointment {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentTime: string;
  status: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  departmentId?: number;
  departmentName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:3000/api/lichhen';

  constructor(private http: HttpClient) { }

  // Map từ backend sang frontend (đơn giản vì tên đã khớp)
  private mapToFrontend(backendAppointment: BackendAppointment): Appointment {
    console.log('Mapping appointment:', backendAppointment);
    return {
      id: backendAppointment.id,
      patientId: backendAppointment.patientId,
      doctorId: backendAppointment.doctorId,
      appointmentTime: backendAppointment.appointmentTime,
      status: backendAppointment.status,
      note: backendAppointment.note || '',
      createdAt: backendAppointment.createdAt,
      updatedAt: backendAppointment.updatedAt,
      // Thông tin từ JOIN
      patientName: backendAppointment.patientName,
      patientPhone: backendAppointment.patientPhone,
      doctorName: backendAppointment.doctorName,
      departmentId: backendAppointment.departmentId,
      departmentName: backendAppointment.departmentName
    };
  }

  // Đặt lịch hẹn mới - Yêu cầu đăng nhập
  createAppointment(appointment: Partial<Appointment>, maNguoiDung?: number): Observable<any> {
    // Validation trước khi gửi
    if (maNguoiDung === null || maNguoiDung === undefined) {
      return new Observable(observer => {
        observer.error({ 
          error: { error: 'Vui lòng đăng nhập để đặt lịch hẹn' },
          status: 401
        });
      });
    }

    if (!appointment.doctorId || !appointment.appointmentTime) {
      return new Observable(observer => {
        observer.error({ 
          error: { error: 'Thiếu thông tin bắt buộc: MaBacSi, ThoiGianKham' } 
        });
      });
    }

    const backendData: any = {
      MaBenhNhan : parseInt(String(maNguoiDung)),
      MaBacSi: parseInt(String(appointment.doctorId)),
      ThoiGianKham: appointment.appointmentTime // Format: YYYY-MM-DD HH:mm:ss
    };
    
    // Note là optional
    if (appointment.note && appointment.note.trim()) {
      backendData.Note = appointment.note.trim();
    }
    
    // // Thêm thông tin tên và số điện thoại (nếu có)
    // const appointmentAny = appointment as any;
    // if (appointmentAny.HoTen && appointmentAny.HoTen.trim()) {
    //   backendData.HoTen = appointmentAny.HoTen.trim();
    // }
    // if (appointmentAny.SoDienThoai && appointmentAny.SoDienThoai.trim()) {
    //   backendData.SoDienThoai = appointmentAny.SoDienThoai.trim();
    // }
    
    console.log('AppointmentService: Gửi dữ liệu đến backend:', JSON.stringify(backendData, null, 2));
    
    return this.http.post<any>(`${this.apiUrl}/dat-lich`, backendData);
  }

  // Lấy tất cả lịch hẹn
  getAllAppointments(maNguoiDung?: number, loaiNguoiDung?: string): Observable<Appointment[]> {
    let params = new HttpParams();
    
    console.log('[AppointmentService] getAllAppointments called with:', {
      maNguoiDung,
      loaiNguoiDung,
      type_maNguoiDung: typeof maNguoiDung,
      type_loaiNguoiDung: typeof loaiNguoiDung,
      hasMaNguoiDung: maNguoiDung !== null && maNguoiDung !== undefined,
      hasLoaiNguoiDung: !!loaiNguoiDung
    });
    
    // Nếu có MaNguoiDung, gửi lên backend để lọc theo user
    if (maNguoiDung !== null && maNguoiDung !== undefined) {
      params = params.set('MaNguoiDung', maNguoiDung.toString());
      console.log('[AppointmentService] Added MaNguoiDung to params:', maNguoiDung);
    }
    
    // Gửi LoaiNguoiDung nếu có (Admin/QuanTriVien/NhanVien chỉ cần LoaiNguoiDung)
    // Không phụ thuộc vào MaNguoiDung
    if (loaiNguoiDung) {
      params = params.set('LoaiNguoiDung', loaiNguoiDung);
      console.log('[AppointmentService] Added LoaiNguoiDung to params:', loaiNguoiDung);
    } else {
      console.warn('[AppointmentService] WARNING: loaiNguoiDung is empty - backend will treat as admin');
    }
    
    // Nếu không có params → backend sẽ trả về tất cả (admin)

    console.log('[AppointmentService] Final params string:', params.toString());
    console.log('[AppointmentService] Params keys:', Array.from(params.keys()));

    return this.http.get<BackendAppointment[]>(this.apiUrl, { params }).pipe(
      tap(response => {
        console.log('AppointmentService: Raw response from backend:', response);
        console.log('AppointmentService: Number of appointments:', response?.length || 0);
        if (response && response.length > 0) {
          console.log('AppointmentService: Sample appointment:', response[0]);
        }
      }),
      map(appointments => {
        if (!appointments || appointments.length === 0) {
          console.log('AppointmentService: No appointments found');
          return [];
        }
        const mapped = appointments.map(a => this.mapToFrontend(a));
        console.log('AppointmentService: Mapped appointments:', mapped);
        return mapped;
      })
    );
  }

  // Lấy lịch hẹn theo id
  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<BackendAppointment>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('AppointmentService: getById response:', response)),
      map(appointment => this.mapToFrontend(appointment))
    );
  }

  // Tìm kiếm lịch hẹn
  searchAppointments(params: {
    patientName?: string;
    patientPhone?: string;
    doctorName?: string;
    departmentName?: string;
    departmentId?: number;
    status?: string;
    date?: string;
  }): Observable<Appointment[]> {
    const queryParams: string[] = [];

    if (params.patientName) {
      queryParams.push(`patientName=${encodeURIComponent(params.patientName)}`);
    }
    if (params.patientPhone) {
      queryParams.push(`patientPhone=${encodeURIComponent(params.patientPhone)}`);
    }
    if (params.doctorName) {
      queryParams.push(`doctorName=${encodeURIComponent(params.doctorName)}`);
    }
    if (params.departmentName) {
      queryParams.push(`departmentName=${encodeURIComponent(params.departmentName)}`);
    }
    if (params.departmentId) {
      queryParams.push(`departmentId=${params.departmentId}`);
    }
    if (params.status) {
      queryParams.push(`status=${encodeURIComponent(params.status)}`);
    }
    if (params.date) {
      queryParams.push(`date=${encodeURIComponent(params.date)}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const searchUrl = `${this.apiUrl}/search${queryString}`;

    console.log('AppointmentService: Gọi API tìm kiếm:', searchUrl);
    return this.http.get<BackendAppointment[]>(searchUrl).pipe(
      tap(response => console.log('AppointmentService: Response tìm kiếm từ backend:', response)),
      map(appointments => appointments.map(a => this.mapToFrontend(a)))
    );
  }

  // Cập nhật lịch hẹn
  updateAppointment(id: number, appointment: Partial<Appointment>): Observable<any> {
    // Validation trước khi gửi
    if (!id || isNaN(id)) {
      return new Observable(observer => {
        observer.error({ 
          error: { error: 'Thiếu ID lịch hẹn hoặc ID không hợp lệ' } 
        });
      });
    }

    // Chuẩn bị dữ liệu backend
    const backendData: any = {};
    
    // Nếu có doctorId, thêm MaBacSi
    if (appointment.doctorId !== undefined && appointment.doctorId !== null) {
      backendData.MaBacSi = parseInt(String(appointment.doctorId));
    }
    
    // Nếu có appointmentTime, thêm ThoiGianKham
    if (appointment.appointmentTime !== undefined && appointment.appointmentTime !== null && appointment.appointmentTime !== '') {
      backendData.ThoiGianKham = appointment.appointmentTime; // Format: YYYY-MM-DD HH:mm:ss
    }
    
    // Xử lý status - Backend cần field 'status' để map sang TrangThai
    if (appointment.status !== undefined && appointment.status !== null && appointment.status !== '') {
      backendData.status = appointment.status;
    }
    
    // Nếu có note, thêm Note
    if (appointment.note !== undefined) {
      backendData.Note = appointment.note || null;
    }
    
    // Nếu có patientId, thêm MaBenhNhan
    if (appointment.patientId !== undefined && appointment.patientId !== null) {
      backendData.MaBenhNhan = parseInt(String(appointment.patientId));
    }
    
    console.log('AppointmentService: Cập nhật lịch hẹn:', JSON.stringify({ id, data: backendData }, null, 2));
    console.log('AppointmentService: URL:', `${this.apiUrl}/${id}`);
    
    // Đảm bảo URL không có ký tự lạ
    const cleanId = parseInt(String(id));
    const url = `${this.apiUrl}/${cleanId}`;
    
    return this.http.put<any>(url, backendData);
  }
}
