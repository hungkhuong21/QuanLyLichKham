import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchText: string = '';
  
  // Modal states
  showAddModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  
  // Form data
  userForm: Partial<User> = {
    username: '',
    email: '',
    password: '',
    loaiNguoiDung: 'BenhNhan',
    vaiTroID: 3,
    maNguoiDung: 1,
    status: 'HoatDong'
  };
  
  selectedUser: User | null = null;
  isLoading: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  // Role options
  roles = [
    { id: 1, name: 'Admin', loaiNguoiDung: 'NhanVien' },
    { id: 2, name: 'BacSi', loaiNguoiDung: 'BacSi' },
    { id: 3, name: 'BenhNhan', loaiNguoiDung: 'BenhNhan' }
  ];
  
  statusOptions = [
    { value: 'HoatDong', label: 'Hoạt động' },
    { value: 'Khoa', label: 'Khóa' }
  ];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (users: User[]) => {
      this.users = users;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi tải danh sách tài khoản:', error);
        alert('Lỗi: ' + (error.error?.error || 'Không thể tải danh sách tài khoản'));
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      const searchLower = this.searchText.toLowerCase();
      return (
        (user.username?.toLowerCase().includes(searchLower)) ||
        (user.email?.toLowerCase().includes(searchLower)) ||
        (user.role?.toLowerCase().includes(searchLower))
      );
    });
    this.updatePagination();
  }

  onSearch(): void {
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  openAddModal(): void {
    this.resetForm();
    this.showAddModal = true;
  }

  onUsernameChange(): void {
    // Tự động điền email khi nhập username
    if (this.userForm.username && !this.userForm.email) {
      this.userForm.email = this.userForm.username;
    }
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  openUpdateModal(user: User): void {
    this.selectedUser = user;
    this.userForm = {
      id: user.id,
      username: user.username,
      email: user.email,
      loaiNguoiDung: user.loaiNguoiDung || 'BenhNhan',
      vaiTroID: user.vaiTroID || 3,
      maNguoiDung: user.maNguoiDung || 1, // Giữ lại để gửi backend (không hiển thị)
      status: user.status || 'HoatDong', // Giữ lại để gửi backend (không hiển thị)
      password: '' // Không hiển thị mật khẩu cũ
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.resetForm();
    this.selectedUser = null;
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedUser = null;
  }

  addUser(): void {
    if (!this.userForm.username?.trim()) {
      alert('Vui lòng nhập tên đăng nhập/email.');
      return;
    }
    if (!this.userForm.password?.trim()) {
      alert('Vui lòng nhập mật khẩu.');
      return;
    }

    // Đảm bảo email được set từ username nếu chưa có
    if (!this.userForm.email) {
      this.userForm.email = this.userForm.username;
    }

    // Đặt giá trị mặc định cho backend (không hiển thị trong UI)
    const userData: Partial<User> = {
      ...this.userForm,
      maNguoiDung: this.userForm.maNguoiDung || 1,
      status: this.userForm.status || 'HoatDong'
    };

    this.isLoading = true;
    this.userService.addUser(userData).subscribe({
      next: (response: any) => {
        console.log('Thêm tài khoản thành công:', response);
        this.loadUsers();
        this.closeAddModal();
        alert('Thêm tài khoản thành công!');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi thêm tài khoản:', error);
        alert('Lỗi: ' + (error.error?.error || error.error?.message || 'Không thể thêm tài khoản'));
        this.isLoading = false;
      }
    });
  }

  updateUser(): void {
    if (!this.selectedUser || !this.selectedUser.id) {
      alert('Không tìm thấy tài khoản cần cập nhật.');
      return;
    }
    if (!this.userForm.username?.trim()) {
      alert('Vui lòng nhập tên đăng nhập/email.');
      return;
    }

    this.isLoading = true;
    const userId = this.selectedUser.id;
    
    // Chuẩn bị dữ liệu cập nhật
    const updateData: Partial<User> = {
      username: this.userForm.username,
      email: this.userForm.email || this.userForm.username,
      loaiNguoiDung: this.userForm.loaiNguoiDung,
      vaiTroID: this.userForm.vaiTroID,
      maNguoiDung: this.userForm.maNguoiDung || this.selectedUser.maNguoiDung || 1,
      status: this.userForm.status || this.selectedUser.status || 'HoatDong'
    };
    
    // Chỉ gửi mật khẩu nếu người dùng nhập mật khẩu mới
    if (this.userForm.password?.trim()) {
      updateData.password = this.userForm.password;
    }

    console.log('Updating user with data:', updateData); // Debug log

    this.userService.updateUser(userId, updateData).subscribe({
      next: (response: any) => {
        console.log('Cập nhật tài khoản thành công:', response);
        this.loadUsers();
        this.closeUpdateModal();
        alert('Cập nhật tài khoản thành công!');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi cập nhật tài khoản:', error);
        console.error('Error details:', error.error); // Debug log
        const errorMessage = error.error?.error || error.error?.message || error.message || 'Không thể cập nhật tài khoản';
        alert('Lỗi: ' + errorMessage);
        this.isLoading = false;
      }
    });
  }

  deleteUser(user: User | null): void {
    if (!user || !user.id) {
      alert('Không tìm thấy tài khoản cần xóa.');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${user.username}"?\n\nHành động này không thể hoàn tác.`)) {
      return;
    }

    this.isLoading = true;
    this.userService.deleteUser(user.id).subscribe({
      next: (response: any) => {
        console.log('Xóa tài khoản thành công:', response);
        this.loadUsers();
        if (this.selectedUser?.id === user.id) {
          this.closeUpdateModal();
        }
        alert('Xóa tài khoản thành công!');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Lỗi xóa tài khoản:', error);
        alert('Lỗi: ' + (error.error?.error || error.error?.message || 'Không thể xóa tài khoản'));
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.userForm = {
      username: '',
      email: '',
      password: '',
      loaiNguoiDung: 'BenhNhan',
      vaiTroID: 3,
      maNguoiDung: 1,
      status: 'HoatDong'
    };
    this.selectedUser = null;
  }

  onRoleChange(): void {
    // Tự động cập nhật loaiNguoiDung dựa trên vaiTroID
    const selectedRole = this.roles.find(r => r.id === this.userForm.vaiTroID);
    if (selectedRole) {
      this.userForm.loaiNguoiDung = selectedRole.loaiNguoiDung;
    }
  }

  getStatusLabel(status: string): string {
    const statusOption = this.statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.label : status;
  }

  getStatusClass(status: string): string {
    return status === 'HoatDong' ? 'status-active' : 'status-inactive';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    try {
      // Parse thủ công từ MySQL datetime format: '2025-11-03 09:35:34'
      // Hoặc ISO format: '2025-11-03T09:35:34.000Z'
      
      // Thử parse MySQL datetime format trước (YYYY-MM-DD HH:mm:ss)
      const mysqlPattern = /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/;
      const mysqlMatch = dateString.match(mysqlPattern);
      
      if (mysqlMatch) {
        const [, year, month, day, hours, minutes] = mysqlMatch;
        // Format: dd/MM/yyyy HH:mm
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Nếu không match MySQL format, thử parse bằng Date object
      let date: Date;
      
      // Nếu có space và không có T, thử thay thế để parse
      if (dateString.includes(' ') && !dateString.includes('T')) {
        // Thay space đầu tiên bằng T và thêm Z nếu chưa có timezone
        const normalized = dateString.replace(' ', 'T') + (dateString.includes('Z') ? '' : '');
        date = new Date(normalized);
      } else {
        date = new Date(dateString);
      }
      
      // Kiểm tra nếu date hợp lệ
      if (!isNaN(date.getTime())) {
        // Format: dd/MM/yyyy HH:mm
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Nếu không parse được, trả về nguyên bản
      console.warn('Không thể parse ngày:', dateString);
      return dateString;
    } catch (error) {
      console.error('Lỗi format ngày:', error, dateString);
      return dateString;
    }
  }

  formatDateOnly(dateString: string | undefined): string {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format: dd/MM/yyyy
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Lỗi format ngày:', error);
      return dateString;
    }
  }
}
