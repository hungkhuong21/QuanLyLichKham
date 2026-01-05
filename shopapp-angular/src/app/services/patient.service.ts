import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Patient {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  idCard: string;
  address: string;
  email?: string;
  createdAt: string;
}

interface BackendPatient {
  MaBenhNhan: number;
  HoTen: string;
  NgaySinh: string | null;
  GioiTinh: 'Nam' | 'Nữ' | 'Khác' | null;
  SoDienThoai: string | null;
  CMND_CCCD: string | null;
  DiaChi: string | null;
  Email?: string | null;
  NgayTao: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:3000/api/benhnhan';

  constructor(private http: HttpClient) { }

  // Map từ backend sang frontend
  private mapToFrontend(backendPatient: BackendPatient): Patient {
    return {
      id: backendPatient.MaBenhNhan,
      fullName: backendPatient.HoTen,
      dateOfBirth: backendPatient.NgaySinh || '',
      gender: backendPatient.GioiTinh || '',
      phoneNumber: backendPatient.SoDienThoai || '',
      idCard: backendPatient.CMND_CCCD || '',
      address: backendPatient.DiaChi || '',
      email: backendPatient.Email || undefined,
      createdAt: backendPatient.NgayTao ? new Date(backendPatient.NgayTao).toLocaleDateString('vi-VN') : ''
    };
  }

  // Map từ frontend sang backend
  private mapToBackend(patient: Partial<Patient>): any {
    const backendData: any = {};
    
    // HoTen là bắt buộc - phải có giá trị
    if (!patient.fullName || !patient.fullName.trim()) {
      console.error('PatientService: HoTen không được để trống');
      throw new Error('Tên bệnh nhân không được để trống');
    }
    backendData.HoTen = patient.fullName.trim();
    
    // SoDienThoai - luôn gửi giá trị (đã được validate ở frontend)
    // Backend yêu cầu field này phải có giá trị hợp lệ
    if (patient.phoneNumber && patient.phoneNumber.trim()) {
      const phone = patient.phoneNumber.trim().replace(/\s+/g, '');
      // Validate lại số điện thoại trước khi gửi
      if (phone.length < 10 || phone.length > 11 || !/^0\d{9,10}$/.test(phone) || /^0+$/.test(phone)) {
        console.error('PatientService: SoDienThoai không hợp lệ:', phone);
        throw new Error('Số điện thoại không hợp lệ. Phải có 10-11 số, bắt đầu bằng 0, không được toàn số 0.');
      }
      backendData.SoDienThoai = phone;
    } else {
      // Nếu không có số điện thoại, throw error (không nên xảy ra vì đã validate ở frontend)
      console.error('PatientService: SoDienThoai không được để trống');
      throw new Error('Số điện thoại không được để trống');
    }
    
    // Các trường tùy chọn khác - chỉ gửi nếu có giá trị
    if (patient.dateOfBirth && patient.dateOfBirth.trim()) {
      backendData.NgaySinh = patient.dateOfBirth.trim();
    }
    
    if (patient.gender && patient.gender.trim()) {
      backendData.GioiTinh = patient.gender.trim();
    }
    
    if (patient.idCard && patient.idCard.trim()) {
      backendData.CMND_CCCD = patient.idCard.trim();
    }
    
    if (patient.address && patient.address.trim()) {
      backendData.DiaChi = patient.address.trim();
    }
    
    // Không gửi Email vì database không có trường này
    
    console.log('PatientService: Dữ liệu đã map:', JSON.stringify(backendData, null, 2));
    return backendData;
  }

  // Lấy tất cả bệnh nhân
  getAllPatients(): Observable<Patient[]> {
    return this.http.get<BackendPatient[]>(this.apiUrl).pipe(
      map(patients => {
        console.log('PatientService: Backend response:', patients);
        return patients.map(p => {
          const mapped = this.mapToFrontend(p);
          console.log('Mapped patient:', mapped);
          return mapped;
        });
      })
    );
  }

  // Lấy bệnh nhân theo id
  getPatientById(id: number): Observable<Patient> {
    return this.http.get<BackendPatient>(`${this.apiUrl}/${id}`).pipe(
      map(patient => this.mapToFrontend(patient))
    );
  }

  // Thêm bệnh nhân mới
  addPatient(patient: Partial<Patient>): Observable<any> {
    // Validation: HoTen là bắt buộc
    if (!patient.fullName || !patient.fullName.trim()) {
      console.error('PatientService: Validation failed - HoTen is required');
      return new Observable(observer => {
        observer.error({ error: { error: 'Tên bệnh nhân không được để trống' } });
      });
    }
    
    try {
      const backendData = this.mapToBackend(patient);
      console.log('PatientService: Gửi dữ liệu tạo bệnh nhân:', JSON.stringify(backendData, null, 2));
      console.log('PatientService: URL:', this.apiUrl);
      console.log('PatientService: HoTen:', backendData.HoTen);
      console.log('PatientService: SoDienThoai:', backendData.SoDienThoai);
      
      return this.http.post<any>(this.apiUrl, backendData);
    } catch (error) {
      console.error('PatientService: Lỗi khi map dữ liệu:', error);
      return new Observable(observer => {
        observer.error({ error: { error: error instanceof Error ? error.message : 'Lỗi không xác định' } });
      });
    }
  }

  // Cập nhật bệnh nhân
  updatePatient(id: number, patient: Patient): Observable<any> {
    const backendData = this.mapToBackend(patient);
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendData);
  }

  // Xóa bệnh nhân
  deletePatient(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Tìm kiếm bệnh nhân
  searchPatients(params: { 
    name?: string; 
    phoneNumber?: string; 
    idCard?: string; 
    gender?: string; 
    address?: string 
  }): Observable<Patient[]> {
    const queryParams: string[] = [];
    
    if (params.name) {
      queryParams.push(`name=${encodeURIComponent(params.name)}`);
    }
    if (params.phoneNumber) {
      queryParams.push(`phoneNumber=${encodeURIComponent(params.phoneNumber)}`);
    }
    if (params.idCard) {
      queryParams.push(`idCard=${encodeURIComponent(params.idCard)}`);
    }
    if (params.gender) {
      queryParams.push(`gender=${encodeURIComponent(params.gender)}`);
    }
    if (params.address) {
      queryParams.push(`address=${encodeURIComponent(params.address)}`);
    }

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const searchUrl = `${this.apiUrl}/search${queryString}`;
    
    console.log('PatientService: Gọi API tìm kiếm:', searchUrl);
    return this.http.get<BackendPatient[]>(searchUrl).pipe(
      map(patients => {
        console.log('PatientService: Response tìm kiếm từ backend:', patients);
        return patients.map(p => this.mapToFrontend(p));
      })
    );
  }
}

