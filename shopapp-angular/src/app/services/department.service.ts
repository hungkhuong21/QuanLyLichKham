import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Department {
  id: number;
  name: string;
  description?: string;
}

interface BackendDepartment {
  MaKhoa: number;
  TenKhoa: string;
  MoTa?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:3000/api/khoa';

  constructor(private http: HttpClient) { }

  // Map từ backend sang frontend
  private mapToFrontend(backendDept: BackendDepartment): Department {
    return {
      id: backendDept.MaKhoa,
      name: backendDept.TenKhoa,
      description: backendDept.MoTa || ''
    };
  }

  // Lấy tất cả khoa
  getAllDepartments(): Observable<Department[]> {
    console.log('DepartmentService: Gọi API:', this.apiUrl);
    return this.http.get<BackendDepartment[]>(this.apiUrl).pipe(
      map(departments => {
        console.log('DepartmentService: Response từ backend:', departments);
        return departments.map(d => this.mapToFrontend(d));
      })
    );
  }

  // Lấy khoa theo id
  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<BackendDepartment>(`${this.apiUrl}/${id}`).pipe(
      map(dept => this.mapToFrontend(dept))
    );
  }
}

