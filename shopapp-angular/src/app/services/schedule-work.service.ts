import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface ScheduleWork {
  id: number;
  doctorId: number;
  doctorName: string;
  specialty: string;
  workDate: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt?: string;
}

interface BackendScheduleWork {
  MaLich: number;
  MaBacSi: number;
  TenBacSi: string;
  ChuyenKhoa: string;
  NgayLamViec: string;
  GioBatDau: string;
  GioKetThuc: string;
  TrangThai: string;
  NgayTao?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScheduleWorkService {
  private apiUrl = 'http://localhost:3000/api/lichlamviec';

  constructor(private http: HttpClient) { }

  // Map từ backend sang frontend
  private mapToFrontend(backend: BackendScheduleWork): ScheduleWork {
    return {
      id: backend.MaLich,
      doctorId: backend.MaBacSi,
      doctorName: backend.TenBacSi,
      specialty: backend.ChuyenKhoa,
      workDate: backend.NgayLamViec,
      startTime: backend.GioBatDau,
      endTime: backend.GioKetThuc,
      status: backend.TrangThai,
      createdAt: backend.NgayTao
    };
  }

  // Map từ frontend sang backend
  private mapToBackend(schedule: Partial<ScheduleWork>): any {
    return {
      MaBacSi: schedule.doctorId,
      NgayLamViec: schedule.workDate,
      GioBatDau: schedule.startTime,
      GioKetThuc: schedule.endTime,
      TrangThai: schedule.status || 'Hoạt động'
    };
  }

  // Lấy tất cả lịch làm việc, có thể filter
  getAllSchedules(filters?: {
    tenBacSi?: string;
    chuyenKhoa?: string;
    ngay?: string;
  }): Observable<ScheduleWork[]> {
    let params = new HttpParams();
    if (filters?.tenBacSi) {
      params = params.set('tenBacSi', filters.tenBacSi);
    }
    if (filters?.chuyenKhoa) {
      params = params.set('chuyenKhoa', filters.chuyenKhoa);
    }
    if (filters?.ngay) {
      params = params.set('ngay', filters.ngay);
    }

    return this.http.get<BackendScheduleWork[]>(this.apiUrl, { params }).pipe(
      map(schedules => schedules.map(s => this.mapToFrontend(s)))
    );
  }

  // Lấy lịch làm việc theo id
  getScheduleById(id: number): Observable<ScheduleWork> {
    return this.http.get<BackendScheduleWork>(`${this.apiUrl}/${id}`).pipe(
      map(schedule => this.mapToFrontend(schedule))
    );
  }

  // Thêm lịch làm việc mới
  createSchedule(schedule: Partial<ScheduleWork>): Observable<any> {
    const backendData = this.mapToBackend(schedule);
    return this.http.post<any>(this.apiUrl, backendData);
  }

  // Cập nhật lịch làm việc
  updateSchedule(id: number, schedule: Partial<ScheduleWork>): Observable<any> {
    const backendData = this.mapToBackend(schedule);
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendData);
  }

  // Xóa lịch làm việc
  deleteSchedule(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Tìm kiếm lịch làm việc
  searchSchedules(params: {
    doctorName?: string;
    specialty?: string;
    workDate?: string;
    status?: string;
    doctorId?: number;
  }): Observable<ScheduleWork[]> {
    const queryParams: string[] = [];

    if (params.doctorName) {
      queryParams.push(`doctorName=${encodeURIComponent(params.doctorName)}`);
    }
    if (params.specialty) {
      queryParams.push(`specialty=${encodeURIComponent(params.specialty)}`);
    }
    if (params.workDate) {
      queryParams.push(`workDate=${encodeURIComponent(params.workDate)}`);
    }
    if (params.status) {
      queryParams.push(`status=${encodeURIComponent(params.status)}`);
    }
    if (params.doctorId) {
      queryParams.push(`doctorId=${params.doctorId}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const searchUrl = `${this.apiUrl}/search${queryString}`;

    console.log('ScheduleWorkService: Gọi API tìm kiếm:', searchUrl);
    return this.http.get<BackendScheduleWork[]>(searchUrl).pipe(
      tap(response => console.log('ScheduleWorkService: Response tìm kiếm từ backend:', response)),
      map(schedules => schedules.map(s => this.mapToFrontend(s)))
    );
  }
}

