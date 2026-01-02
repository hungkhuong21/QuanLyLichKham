import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Doctor {
  id: number;
  name: string;
  departmentId: number;
  specialty: string;
  phone: string;
  email: string;
  status: string;
  gender?: string;
  dateOfBirth?: string;
  cccd?: string;
  address?: string;
}

interface BackendDoctor {
  MaBacSi: number;
  HoTen: string;
  GioiTinh?: string;
  NgaySinh?: string;
  MaKhoa: number;
  ChuyenMon?: string;
  SoDienThoai?: string;
  CCCD?: string;
  DiaChi?: string;
  Email?: string;
  TrangThai: string;
}

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = 'http://localhost:3000/api/bacsi';

  constructor(private http: HttpClient) { }

  // Map từ backend sang frontend
  private mapToFrontend(backendDoctor: BackendDoctor): Doctor {
    return {
      id: backendDoctor.MaBacSi,
      name: backendDoctor.HoTen,
      departmentId: backendDoctor.MaKhoa,
      specialty: backendDoctor.ChuyenMon || '',
      phone: backendDoctor.SoDienThoai || '',
      email: backendDoctor.Email || '',
      status: backendDoctor.TrangThai,
      gender: backendDoctor.GioiTinh || '',
      dateOfBirth: backendDoctor.NgaySinh || '',
      cccd: backendDoctor.CCCD || '',
      address: backendDoctor.DiaChi || ''
    };
  }

  // Lấy tất cả bác sĩ
  getAllDoctors(): Observable<Doctor[]> {
    console.log('DoctorService: Gọi API:', this.apiUrl);
    return this.http.get<BackendDoctor[]>(this.apiUrl).pipe(
      map(doctors => {
        console.log('DoctorService: Response từ backend:', doctors);
        return doctors.map(d => this.mapToFrontend(d));
      })
    );
  }

  // Lấy bác sĩ theo id
  getDoctorById(id: number): Observable<Doctor> {
    return this.http.get<BackendDoctor>(`${this.apiUrl}/${id}`).pipe(
      map(doctor => this.mapToFrontend(doctor))
    );
  }

  // Lấy bác sĩ theo khoa
  getDoctorsByDepartment(departmentId: number): Observable<Doctor[]> {
    return this.getAllDoctors().pipe(
      map(doctors => doctors.filter(d => d.departmentId === departmentId))
    );
  }

  // Map từ frontend sang backend
  private mapToBackend(doctor: Partial<Doctor>): any {
    const backendData: any = {
      HoTen: doctor.name,
      MaKhoa: doctor.departmentId,
      ChuyenMon: doctor.specialty || null,
      SoDienThoai: doctor.phone || null,
      Email: doctor.email || null,
      TrangThai: doctor.status || 'Active'
    };

    // Thêm các trường tùy chọn nếu có
    if (doctor.gender) {
      backendData.GioiTinh = doctor.gender;
    }
    if (doctor.dateOfBirth) {
      backendData.NgaySinh = doctor.dateOfBirth;
    }
    if (doctor.cccd) {
      backendData.CCCD = doctor.cccd;
    }
    if (doctor.address) {
      backendData.DiaChi = doctor.address;
    }

    return backendData;
  }

  // Thêm bác sĩ mới
  addDoctor(doctor: Partial<Doctor>): Observable<any> {
    const backendData = this.mapToBackend(doctor);
    return this.http.post<any>(this.apiUrl, backendData);
  }

  // Cập nhật bác sĩ
  updateDoctor(id: number, doctor: Partial<Doctor>): Observable<any> {
    const backendData = this.mapToBackend(doctor);
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendData);
  }

  // Xóa bác sĩ
  deleteDoctor(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Tìm kiếm bác sĩ
  searchDoctors(params: { name?: string; departmentId?: number; specialty?: string }): Observable<Doctor[]> {
    const queryParams: string[] = [];
    
    if (params.name) {
      queryParams.push(`name=${encodeURIComponent(params.name)}`);
    }
    if (params.departmentId) {
      queryParams.push(`departmentId=${params.departmentId}`);
    }
    if (params.specialty) {
      queryParams.push(`specialty=${encodeURIComponent(params.specialty)}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const searchUrl = `${this.apiUrl}/search${queryString}`;
    
    console.log('DoctorService: Gọi API tìm kiếm:', searchUrl);
    return this.http.get<BackendDoctor[]>(searchUrl).pipe(
      map(doctors => {
        console.log('DoctorService: Response tìm kiếm từ backend:', doctors);
        return doctors.map(d => this.mapToFrontend(d));
      })
    );
  }
}

