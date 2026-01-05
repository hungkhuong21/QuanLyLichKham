export interface User {
  id?: number;
  username: string;
  email: string;
  role: string;
  status: string;
  address?: string;
  // Thêm các trường từ backend
  loaiNguoiDung?: string; // BenhNhan, BacSi, NhanVien
  maNguoiDung?: number;
  vaiTroID?: number; // 1: Admin, 2: BacSi, 3: BenhNhan
  password?: string;
  ngayTao?: string;
  ngayCapNhat?: string;
} 