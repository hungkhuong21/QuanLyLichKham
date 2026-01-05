import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService, Appointment } from '../services/appointment.service';
import { DoctorService, Doctor } from '../services/doctor.service';
import { DepartmentService, Department } from '../services/department.service';
import { AuthService } from '../services/auth.service';

interface AppointmentDisplay {
  id: number;
  initials: string;
  avatarBg: string;
  avatarColor: string;
  doctorName: string;
  specialty: string;
  specialtyColor: string;
  time: string;
  timeTagBg: string;
  timeTagColor: string;
  status: string;
  appointmentData: Appointment;
}

@Component({
  selector: 'app-appointment-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-schedule.component.html',
  styleUrl: './appointment-schedule.component.scss'
})
export class AppointmentScheduleComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closeModalEvent = new EventEmitter<void>();

  selectedDate: string = 'Tất cả';
  showDateDropdown: boolean = false;
  dateOptions: string[] = ['Tất cả', 'Hôm nay', 'Ngày mai', 'Tuần này', 'Tuần tới', 'Tháng này', 'Tháng tới'];
  
  // Tab selection: 'appointments' (Lịch hẹn) hoặc 'history' (Lịch sử khám)
  activeTab: 'appointments' | 'history' = 'appointments';
  
  // Edit modal
  isEditModalOpen: boolean = false;
  editingAppointment: AppointmentDisplay | null = null;
  editTime: string = '';
  editDoctorId: string = '';
  editSpecialty: string = '';
  isSaving: boolean = false;

  appointments: AppointmentDisplay[] = [];
  allAppointments: Appointment[] = [];
  doctors: Doctor[] = [];
  departments: Department[] = [];
  filteredDoctors: Doctor[] = [];
  isLoading: boolean = false;

  // Giờ làm việc theo ngày (giống như home.component.ts)
  // Thứ 2 - Thứ 6: 7:00 - 17:00
  // Thứ 7: 7:00 - 12:00 (chỉ sáng)
  // Chủ nhật: Không làm việc
  private readonly WEEKDAY_START = 7; // 7:00
  private readonly WEEKDAY_END = 17; // 17:00 (không bao gồm, tức là đến 16:59)
  private readonly SATURDAY_START = 7; // 7:00
  private readonly SATURDAY_END = 12; // 12:00 (không bao gồm, tức là đến 11:59)
  private readonly MIN_BUFFER_HOURS = 2; // Phải đặt trước ít nhất 2 giờ

  // Color schemes for avatars
  private colorSchemes = [
    { bg: '#fce7f3', color: '#be185d' },
    { bg: '#f3e8ff', color: '#7c3aed' },
    { bg: '#e0f2fe', color: '#0369a1' },
    { bg: '#fef3c7', color: '#92400e' },
    { bg: '#d1fae5', color: '#065f46' },
    { bg: '#fce7f3', color: '#831843' }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.loadDepartments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      this.loadAppointments();
    }
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors: Doctor[]) => {
        this.doctors = doctors;
        // Chỉ load appointments nếu modal đang mở VÀ user đã đăng nhập
        if (this.isOpen) {
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            console.log('[DEBUG] loadDoctors: Modal is open and user is logged in, loading appointments');
            this.loadAppointments();
          } else {
            console.log('[DEBUG] loadDoctors: Modal is open but user not logged in yet, skipping appointments');
          }
        }
      },
      error: (error: any) => {
        console.error('Lỗi tải danh sách bác sĩ:', error);
      }
    });
  }

loadAppointments(): void {
  console.log('🔵🔵🔵 loadAppointments STARTED 🔵🔵🔵');
  this.isLoading = true;
  
  // Lấy thông tin user hiện tại từ AuthService
  const currentUser = this.authService.currentUserValue;
  console.log('🔵 Current user from AuthService:', currentUser);
  console.log('🔵 CurrentUser type:', typeof currentUser);
  console.log('🔵 CurrentUser keys:', currentUser ? Object.keys(currentUser) : 'NULL');
  
  if (!currentUser) {
    // Chưa đăng nhập
    console.warn('🔴 No user found, cannot load appointments');
    console.log('🔴 Checking localStorage directly...');
    
    // Fallback: Check localStorage directly
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('currentUser');
      console.log('🔴 localStorage.currentUser:', savedUser);
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('🔴 Parsed user from localStorage:', parsedUser);
          // Try again with parsed user
          // Don't call loadAppointments again to avoid infinite loop
          alert('Vui lòng refresh page để tải lại dữ liệu.');
          this.isLoading = false;
          return;
        } catch (e) {
          console.error('🔴 Error parsing localStorage user:', e);
        }
      }
    }
    
    alert('Vui lòng đăng nhập để xem lịch hẹn.');
    this.isLoading = false;
    this.closeModal();
    return;
  }
  
  console.log('🔵 User found, processing...');
  
  // Lấy LoaiNguoiDung từ user
  const loaiNguoiDung = currentUser.LoaiNguoiDung ?? currentUser.role;
  console.log('🔵 LoaiNguoiDung:', loaiNguoiDung);
  
  // Kiểm tra xem user có quyền xem tất cả lịch hẹn không (Admin, QuanTriVien, NhanVien)
  const canViewAll = currentUser.role === 'admin' || 
                     currentUser.LoaiNguoiDung === 'Admin' || 
                     currentUser.LoaiNguoiDung === 'QuanTriVien' ||
                     currentUser.LoaiNguoiDung === 'NhanVien';
  // Lấy LoaiNguoiDung từ user - BẮTBUỘC phải có giá trị
  let loaiNguoiDung = currentUser.LoaiNguoiDung ?? currentUser.role;
  console.log('🔵 LoaiNguoiDung from user:', loaiNguoiDung);
  console.log('🔵 currentUser.LoaiNguoiDung:', currentUser.LoaiNguoiDung);
  console.log('🔵 currentUser.role:', currentUser.role);
  
  // Nếu vẫn không có, default là Admin (để backend xử lý)
  if (!loaiNguoiDung) {
    console.warn('⚠️ No LoaiNguoiDung found, defaulting to Admin');
    loaiNguoiDung = 'Admin';
  }
  
  // Map NhanVien → Admin (backend không hỗ trợ NhanVien)
  if (loaiNguoiDung === 'NhanVien') {
    console.warn('⚠️ Mapping NhanVien → Admin for backend compatibility');
    loaiNguoiDung = 'Admin';
  }
  
  console.log('🔵 Final LoaiNguoiDung:', loaiNguoiDung);
  
  // Kiểm tra xem user có quyền xem tất cả lịch hẹn không (Admin, QuanTriVien, NhanVien)
  const canViewAll = currentUser.role === 'admin' || 
                     loaiNguoiDung === 'Admin' || 
                     loaiNguoiDung === 'QuanTriVien';
  
  console.log('Loading appointments for user:', {
    canViewAll,
    loaiNguoiDung,
    currentUser
  });
  
  // Chỉ dùng LoaiNguoiDung để xác định quyền truy cập
  // Backend sẽ xử lý dựa trên LoaiNguoiDung:
  // - Admin/QuanTriVien: Trả về tất cả lịch hẹn
  // - NhanVien: Cần sửa backend để hỗ trợ (tạm thời map sang Admin)
  // - BenhNhan/BacSi: Cần MaNguoiDung để lọc (backend vẫn cần MaNguoiDung)
  let maNguoiDungParam: number | undefined;
  let loaiNguoiDungParam: string | undefined;
  let loaiNguoiDungParam: string | undefined = loaiNguoiDung; // Initialize with loaiNguoiDung
  
  console.log('🔵 Initial loaiNguoiDungParam:', loaiNguoiDungParam);
  
  if (canViewAll) {
    // Admin/QuanTriVien/NhanVien: Chỉ gửi LoaiNguoiDung, không cần MaNguoiDung
    // Backend chỉ xử lý LoaiNguoiDung === 'Admin' || 'QuanTriVien'
    // Đối với NhanVien, backend chưa hỗ trợ, nên tạm thời map sang 'Admin'
    // TODO: Sửa backend để hỗ trợ NhanVien trong getAllLichHen
    if (loaiNguoiDung === 'NhanVien') {
      // Tạm thời gửi như Admin để backend xử lý
      maNguoiDungParam = undefined;
      loaiNguoiDungParam = 'Admin';
      console.warn('[WARNING] NhanVien mapped to Admin - Backend needs to support NhanVien');
    } else {
      // Admin/QuanTriVien: Chỉ gửi LoaiNguoiDung
      maNguoiDungParam = undefined;
      loaiNguoiDungParam = loaiNguoiDung;
    }
  } else if (loaiNguoiDung === 'BenhNhan' || loaiNguoiDung === 'BacSi') {
    // BenhNhan hoặc BacSi: Backend vẫn cần MaNguoiDung để lọc theo MaBenhNhan/MaBacSi
    // Lấy MaNguoiDung từ user
    const maNguoiDung = currentUser.MaNguoiDung ?? currentUser.MaTK ?? currentUser.id;
    
    if (maNguoiDung !== null && maNguoiDung !== undefined && maNguoiDung !== '') {
      maNguoiDungParam = Number(maNguoiDung);
      loaiNguoiDungParam = loaiNguoiDung;
    } else {
      console.error('ERROR: BenhNhan/BacSi user but no MaNguoiDung found!', currentUser);
      alert('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      this.isLoading = false;
      return;
    }
  } else {
    // Loại người dùng không được hỗ trợ
    console.error('ERROR: Unsupported user type:', loaiNguoiDung, currentUser);
    alert('Lỗi: Loại người dùng không được hỗ trợ: ' + loaiNguoiDung);
    this.isLoading = false;
    return;
    // Lấy MaNguoiDung từ user - ưu tiên thử tất cả các field có thể chứa ID
    let maNguoiDung = currentUser.MaNguoiDung ?? currentUser.MaTK ?? currentUser.id ?? currentUser.userId;
    
    // Nếu MaNguoiDung = 0 hoặc null, cũng cần gửi lên (backend sẽ xử lý)
    // Chỉ bỏ qua khi thực sự không có giá trị nào
    if (maNguoiDung !== null && maNguoiDung !== undefined && maNguoiDung !== '') {
      maNguoiDungParam = Number(maNguoiDung);
      loaiNguoiDungParam = loaiNguoiDung;
      console.log(`[INFO] ${loaiNguoiDung} user with ID:`, maNguoiDungParam);
    } else {
      console.error('ERROR: BenhNhan/BacSi user but no ID found!', currentUser);
      // Không throw error, let backend handle it
      // Vẫn cố gắng load appointments mà không MaNguoiDung
      loaiNguoiDungParam = loaiNguoiDung;
      maNguoiDungParam = undefined;
      console.warn('[WARNING] Loading appointments without MaNguoiDung - backend may return 401');
    }
  } else {
    // Loại người dùng không được hỗ trợ - default to loaiNguoiDung
    console.warn('WARNING: Unsupported user type, will send as-is to backend:', loaiNguoiDung);
    loaiNguoiDungParam = loaiNguoiDung;
    maNguoiDungParam = undefined;
  }
  
  console.log('🔵 Calling getAllAppointments with params:', {
    maNguoiDungParam,
    loaiNguoiDungParam,
    hasMaNguoiDung: maNguoiDungParam !== undefined,
    canViewAll,
    userType: loaiNguoiDung
  });
  
  this.appointmentService.getAllAppointments(
    maNguoiDungParam,
    loaiNguoiDungParam
  ).subscribe({
    next: (appointments: Appointment[]) => {
      console.log('Loaded', appointments.length, 'appointments');
      this.allAppointments = appointments;
      this.filterAppointments();
      this.isLoading = false;
    },
    error: (error: any) => {
      console.error('Error loading appointments:', error);
      let errorMessage = 'Không thể tải danh sách lịch hẹn. Vui lòng thử lại.';
      
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.status === 401) {
        errorMessage = 'Vui lòng đăng nhập để xem lịch hẹn.';
        errorMessage = 'Lỗi xác thực: Vui lòng đăng nhập lại.';
        console.warn('[401 ERROR] Missing or invalid authentication. CurrentUser:', {
          type: loaiNguoiDung,
          hasMaNguoiDung: maNguoiDungParam !== undefined,
          maNguoiDungParam,
          loaiNguoiDungParam
        });
        this.closeModal();
      } else if (error.status === 403) {
        errorMessage = 'Bạn không có quyền xem danh sách lịch hẹn này.';
      }
      
      alert(errorMessage);
      this.isLoading = false;
    }
  });
}
  mapAppointmentsToDisplay(): void {
    
    this.appointments = this.allAppointments.map((apt, index) => {
      // Ưu tiên sử dụng thông tin từ backend (JOIN), nếu không có thì tìm trong doctors array
      let doctorName = apt.doctorName;
      let specialty = apt.departmentName || 'Chưa xác định';
      
      // Nếu không có thông tin từ backend, tìm trong doctors array
      if (!doctorName) {
      const doctor = this.doctors.find(d => d.id === apt.doctorId);
        doctorName = doctor ? doctor.name : `Bác sĩ #${apt.doctorId}`;
        if (!specialty || specialty === 'Chưa xác định') {
          specialty = doctor ? doctor.specialty : 'Chưa xác định';
        }
      }
      
      const colorScheme = this.colorSchemes[index % this.colorSchemes.length];
      const initials = this.getInitials(doctorName);

      // Format time - parse manually to avoid timezone issues
      let timeString = 'Chưa có thời gian';
      try {
        console.log(`[DEBUG] Parsing appointment time for appointment ${apt.id}:`, apt.appointmentTime);
        
        // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually
        // MySQL có thể trả về với format: "YYYY-MM-DD HH:mm:ss" hoặc "YYYY-MM-DDTHH:mm:ss.000Z"
        const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
        const match = String(apt.appointmentTime).match(mysqlDateTimeRegex);
        
        if (match) {
          // Use the exact values from the string (no timezone conversion)
          const year = match[1];
          const month = match[2];
          const day = match[3];
          const hours = match[4];
          const minutes = match[5];
          timeString = `${hours}:${minutes} - ${day}/${month}/${year}`;
          console.log(`[DEBUG] Parsed time (manual): ${timeString} from input: ${apt.appointmentTime}`);
        } else {
          console.warn(`[DEBUG] Cannot parse datetime with regex, trying Date parsing for: ${apt.appointmentTime}`);
          // Fallback: Try to parse as ISO string or other format
          // Nhưng KHÔNG dùng Date.getHours() vì có thể bị timezone conversion
          // Thay vào đó, cố gắng extract từ string
          const dateStr = String(apt.appointmentTime);
          // Thử extract từ ISO format: "2024-01-15T14:30:00.000Z"
          const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
          if (isoMatch) {
            const year = isoMatch[1];
            const month = isoMatch[2];
            const day = isoMatch[3];
            const hours = isoMatch[4];
            const minutes = isoMatch[5];
            timeString = `${hours}:${minutes} - ${day}/${month}/${year}`;
            console.log(`[DEBUG] Parsed time (ISO): ${timeString}`);
          } else {
            console.error(`[DEBUG] Cannot parse datetime at all: ${apt.appointmentTime}`);
            timeString = 'Thời gian không hợp lệ';
          }
        }
      } catch (e) {
        console.error('Error parsing appointment time:', apt.appointmentTime, e);
      }

      return {
        id: apt.id,
        initials: initials,
        avatarBg: colorScheme.bg,
        avatarColor: colorScheme.color,
        doctorName: doctorName,
        specialty: specialty,
        specialtyColor: colorScheme.color,
        time: timeString,
        timeTagBg: colorScheme.bg,
        timeTagColor: '#1f2937',
        status: apt.status,
        appointmentData: apt
      };
    });
    
    console.log('Mapped appointments:', this.appointments);
  }

  getInitials(name: string): string {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  toggleDateDropdown(): void {
    this.showDateDropdown = !this.showDateDropdown;
  }

  selectDate(date: string): void {
    this.selectedDate = date;
    this.showDateDropdown = false;
    this.filterAppointments();
  }

  // Chuyển đổi tab giữa "Lịch hẹn" và "Lịch sử khám"
  switchTab(tab: 'appointments' | 'history'): void {
    this.activeTab = tab;
    this.selectedDate = 'Tất cả'; // Reset về "Tất cả" khi chuyển tab
    this.filterAppointments();
  }

  filterAppointments(): void {
    // Lọc theo tab: appointments (chưa hoàn thành) hoặc history (đã hoàn thành hoặc đã hủy)
    let filteredByStatus = this.allAppointments;
    
    console.log('[DEBUG] Filtering appointments. Active tab:', this.activeTab);
    console.log('[DEBUG] All appointments before filter:', this.allAppointments.map(apt => ({ id: apt.id, status: apt.status })));
    
    if (this.activeTab === 'appointments') {
      // Chỉ hiển thị lịch hẹn chưa hoàn thành và chưa hủy (loại bỏ "Hoàn thành" và "Đã hủy")
      filteredByStatus = this.allAppointments.filter(apt => {
        const status = (apt.status || '').toLowerCase();
        const shouldInclude = !status.includes('hoàn thành') && !status.includes('đã hủy') && !status.includes('hủy');
        console.log(`[DEBUG] Appointment ${apt.id}: status="${apt.status}", shouldInclude=${shouldInclude}`);
        return shouldInclude;
      });
    } else if (this.activeTab === 'history') {
      // Hiển thị lịch hẹn đã hoàn thành hoặc đã hủy
      filteredByStatus = this.allAppointments.filter(apt => {
        const status = (apt.status || '').toLowerCase();
        const shouldInclude = status.includes('hoàn thành') || status.includes('đã hủy') || status.includes('hủy');
        console.log(`[DEBUG] Appointment ${apt.id}: status="${apt.status}", shouldInclude=${shouldInclude}`);
        return shouldInclude;
      });
    }
    
    console.log('[DEBUG] Filtered appointments:', filteredByStatus.map(apt => ({ id: apt.id, status: apt.status })));
    
    if (this.selectedDate === 'Tất cả') {
      // Hiển thị tất cả lịch hẹn đã lọc theo trạng thái
      this.appointments = filteredByStatus.map((apt, index) => this.mapAppointmentToDisplay(apt, index));
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    let startDate: Date;
    let endDate: Date;

    switch (this.selectedDate) {
      case 'Hôm nay':
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Ngày mai':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() + 1);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Tuần này':
        startDate = new Date(now);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek); // Chủ nhật
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Tuần tới':
        startDate = new Date(now);
        const currentDayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - currentDayOfWeek + 7); // Chủ nhật tuần tới
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Tháng này':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'Tháng tới':
        startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        // Hiển thị tất cả nếu không khớp (đã lọc theo trạng thái ở trên)
        this.appointments = filteredByStatus.map((apt, index) => this.mapAppointmentToDisplay(apt, index));
        return;
    }

    // Lọc lịch hẹn theo khoảng thời gian (đã lọc theo trạng thái ở trên)
    const filtered = filteredByStatus.filter(apt => {
      try {
        // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually
        const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
        const match = apt.appointmentTime.match(mysqlDateTimeRegex);
        
        if (match) {
          // Tạo Date object từ các phần tử đã parse (local time)
          const year = parseInt(match[1]);
          const month = parseInt(match[2]) - 1; // Month is 0-indexed
          const day = parseInt(match[3]);
          const hours = parseInt(match[4]);
          const minutes = parseInt(match[5]);
          const seconds = parseInt(match[6]);
          
          const aptDate = new Date(year, month, day, hours, minutes, seconds);
          return aptDate >= startDate && aptDate <= endDate;
        }
        
        // Fallback to Date parsing if format doesn't match
        const aptDate = new Date(apt.appointmentTime);
        return aptDate >= startDate && aptDate <= endDate;
      } catch (e) {
        console.error('Error filtering appointment:', apt.appointmentTime, e);
        return false;
      }
    });

    this.appointments = filtered.map((apt, index) => this.mapAppointmentToDisplay(apt, index));
  }

  mapAppointmentToDisplay(apt: Appointment, index: number): AppointmentDisplay {
    // Tìm thông tin bác sĩ và khoa
    let doctorName = apt.doctorName || 'Chưa xác định';
    let specialty = apt.departmentName || 'Chưa xác định';
    
    if (!doctorName || doctorName === 'Chưa xác định') {
      const doctor = this.doctors.find(d => d.id === apt.doctorId);
      if (doctor) {
        doctorName = doctor.name;
        specialty = doctor.specialty || specialty;
      }
    }
    
    if (!specialty || specialty === 'Chưa xác định') {
      const doctor = this.doctors.find(d => d.id === apt.doctorId);
      if (doctor) {
        const dept = this.departments.find(d => d.id === doctor.departmentId);
        if (dept) {
          specialty = dept.name;
        }
      }
    }
    
    // Xác định màu cho status
    let timeTagBg = '#e5e7eb';
    let timeTagColor = '#374151';
    let specialtyColor = '#6b7280';
    
    switch (apt.status) {
      case 'Đã đặt':
        timeTagBg = '#dbeafe';
        timeTagColor = '#1e40af';
        break;
      case 'Hoàn thành':
        timeTagBg = '#d1fae5';
        timeTagColor = '#065f46';
        break;
      case 'Đã hủy':
        timeTagBg = '#fee2e2';
        timeTagColor = '#991b1b';
        break;
      case 'Đổi lịch':
        timeTagBg = '#fef3c7';
        timeTagColor = '#92400e';
        break;
    }
    
    const colorScheme = this.colorSchemes[index % this.colorSchemes.length];
    const initials = this.getInitials(doctorName);

    // Format time - parse manually to avoid timezone issues
    let timeString = 'Chưa có thời gian';
    try {
      // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually
      const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
      const match = apt.appointmentTime.match(mysqlDateTimeRegex);
      
      if (match) {
        // Use the exact values from the string (no timezone conversion)
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hours = match[4];
        const minutes = match[5];
        timeString = `${hours}:${minutes} - ${day}/${month}/${year}`;
      } else {
        // Fallback to Date parsing if format doesn't match
        const date = new Date(apt.appointmentTime);
        if (!isNaN(date.getTime())) {
          // Format: "HH:mm - dd/MM/yyyy"
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          timeString = `${hours}:${minutes} - ${day}/${month}/${year}`;
        }
      }
    } catch (e) {
      console.error('Error parsing appointment time:', apt.appointmentTime, e);
    }

    return {
      id: apt.id,
      initials: initials,
      avatarBg: colorScheme.bg,
      avatarColor: colorScheme.color,
      doctorName: doctorName,
      specialty: specialty,
      specialtyColor: specialtyColor,
      time: timeString,
      timeTagBg: timeTagBg,
      timeTagColor: timeTagColor,
      status: apt.status,
      appointmentData: apt
    };
  }

  closeModal(): void {
    this.isOpen = false;
    this.showDateDropdown = false;
    this.closeModalEvent.emit();
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
      },
      error: (error: any) => {
        console.error('Lỗi tải danh sách khoa:', error);
      }
    });
  }

  onChangeAppointment(appointment: AppointmentDisplay): void {
    this.editingAppointment = { ...appointment };
    // Convert appointment time to datetime-local format - parse manually to avoid timezone issues
    console.log('[DEBUG] onChangeAppointment - Original appointment time:', appointment.appointmentData.appointmentTime);
    console.log('[DEBUG] onChangeAppointment - Type:', typeof appointment.appointmentData.appointmentTime);
    
    // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually
    // MySQL có thể trả về với format: "YYYY-MM-DD HH:mm:ss" hoặc "YYYY-MM-DDTHH:mm:ss.000Z"
    const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
    const timeStr = String(appointment.appointmentData.appointmentTime);
    const match = timeStr.match(mysqlDateTimeRegex);
    
    if (match) {
      // Use the exact values from the string (no timezone conversion)
      const year = match[1];
      const month = match[2];
      const day = match[3];
      const hours = match[4];
      const minutes = match[5];
      this.editTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      console.log('[DEBUG] onChangeAppointment - Parsed to datetime-local:', this.editTime);
    } else {
      console.warn('[DEBUG] onChangeAppointment - Cannot parse with regex, trying alternative parsing');
      // Fallback: Try ISO format
      const isoMatch = timeStr.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
      if (isoMatch) {
        const year = isoMatch[1];
        const month = isoMatch[2];
        const day = isoMatch[3];
        const hours = isoMatch[4];
        const minutes = isoMatch[5];
        this.editTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        console.log('[DEBUG] onChangeAppointment - Parsed from ISO to datetime-local:', this.editTime);
      } else {
        console.error('[DEBUG] onChangeAppointment - Cannot parse datetime at all, using fallback');
        // Last resort: Use Date but this might cause timezone issues
        const appointmentDate = new Date(appointment.appointmentData.appointmentTime);
        if (!isNaN(appointmentDate.getTime())) {
          // Format manually từ Date object (có thể bị timezone conversion)
          const year = appointmentDate.getFullYear();
          const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
          const day = String(appointmentDate.getDate()).padStart(2, '0');
          const hours = String(appointmentDate.getHours()).padStart(2, '0');
          const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');
          this.editTime = `${year}-${month}-${day}T${hours}:${minutes}`;
          console.warn('[DEBUG] onChangeAppointment - Used Date parsing (may have timezone issues):', this.editTime);
        } else {
          this.editTime = '';
          console.error('[DEBUG] onChangeAppointment - Invalid datetime, setting empty');
        }
      }
    }
    
    // Set initial values
    this.editDoctorId = String(appointment.appointmentData.doctorId);
    this.editSpecialty = appointment.appointmentData.departmentName || '';
    
    // Filter doctors by department
    this.onDepartmentChange();
    
    this.isEditModalOpen = true;
  }

  onDepartmentChange(): void {
    if (!this.editSpecialty) {
      this.filteredDoctors = [];
      this.editDoctorId = '';
      return;
    }
    
    // Find department by name
    const department = this.departments.find(d => d.name === this.editSpecialty);
    if (department) {
      // Filter doctors by department and status
      const doctorsInDept = this.doctors.filter(d => d.departmentId === department.id);
      const activeDoctors = doctorsInDept.filter(d => d.status === 'Active');

      // If current doctor is inactive but belongs to this department, keep it for editing
      const currentDoctor = doctorsInDept.find(d => String(d.id) === this.editDoctorId);
      if (currentDoctor && currentDoctor.status !== 'Active') {
        const exists = activeDoctors.find(d => d.id === currentDoctor.id);
        this.filteredDoctors = exists ? activeDoctors : [...activeDoctors, currentDoctor];
      } else {
        this.filteredDoctors = activeDoctors;
      }
      
      // Reset doctor selection if current doctor is not in filtered list
      if (this.editDoctorId && !this.filteredDoctors.find(d => String(d.id) === this.editDoctorId)) {
        this.editDoctorId = '';
      }
    } else {
      this.filteredDoctors = [];
      this.editDoctorId = '';
    }
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.editingAppointment = null;
    this.editTime = '';
    this.editDoctorId = '';
    this.editSpecialty = '';
    this.filteredDoctors = [];
    this.isSaving = false;
  }

  onSaveChanges(): void {
    if (!this.editingAppointment) return;

    // Validation
    if (!this.editTime || !this.editTime.trim()) {
      alert('Vui lòng chọn thời gian khám.');
      return;
    }

    if (!this.editDoctorId || !this.editDoctorId.trim()) {
      alert('Vui lòng chọn bác sĩ.');
      return;
    }

    // Parse datetime-local thủ công để tránh timezone issues
    // datetime-local format: "YYYY-MM-DDTHH:mm"
    const datetimeLocalRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
    const match = this.editTime.match(datetimeLocalRegex);
    
    if (!match) {
      alert('Thời gian không hợp lệ. Vui lòng chọn lại.');
      return;
    }
    
    // Parse thủ công từ datetime-local string
    const year = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // Month is 0-indexed
    const day = parseInt(match[3]);
    const hours = parseInt(match[4]);
    const minutes = parseInt(match[5]);
    
    // Tạo Date object từ các giá trị đã parse (local time)
    const appointmentDateTime = new Date(year, month, day, hours, minutes, 0);
    const now = new Date();
    
    if (isNaN(appointmentDateTime.getTime())) {
      alert('Thời gian không hợp lệ.');
      return;
    }
    
    // Validate time is not in the past
    if (appointmentDateTime < now) {
      alert('Không thể đặt lịch hẹn trong quá khứ.');
      return;
    }

    // Kiểm tra ngày trong tuần
    const appointmentDayOfWeek = this.getDayOfWeek(appointmentDateTime);

    // Kiểm tra Chủ nhật (không làm việc)
    if (appointmentDayOfWeek === 0) {
      alert('Chủ nhật bệnh viện không làm việc. Vui lòng chọn ngày khác.');
      return;
    }

    // Kiểm tra giờ làm việc
    if (!this.isWithinWorkingHours(appointmentDateTime)) {
      const dayName = this.getDayName(appointmentDateTime.getDay());
      const workingStart = this.getWorkingHoursStart(appointmentDateTime.getDay());
      const workingEnd = this.getWorkingHoursEnd(appointmentDateTime.getDay());

      if (workingStart === null || workingEnd === null) {
        alert(`${dayName} bệnh viện không làm việc. Vui lòng chọn ngày khác.`);
      } else if (appointmentDateTime.getDay() === 6) {
        alert(`${dayName} bệnh viện chỉ làm việc buổi sáng (${workingStart}:00 - ${workingEnd}:00). Vui lòng chọn thời gian khác.`);
      } else {
        alert(`${dayName} bệnh viện làm việc từ ${workingStart}:00 - ${workingEnd}:00. Vui lòng chọn thời gian trong khoảng này.`);
      }
      return;
    }

    // Kiểm tra nếu đặt lịch hôm nay (cập nhật thành thời gian hôm nay)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const appointmentDate = new Date(year, month, day);
    const isToday = appointmentDate.getTime() === today.getTime();

    if (isToday) {
      // Kiểm tra buffer time (phải đặt trước ít nhất 2 giờ)
      if (!this.hasEnoughBuffer(appointmentDateTime)) {
        const bufferHours = this.MIN_BUFFER_HOURS;
        alert(`Khi đặt lịch hôm nay, bạn phải đặt trước ít nhất ${bufferHours} giờ. Vui lòng chọn thời gian sau ${bufferHours} giờ kể từ bây giờ hoặc chọn ngày khác.`);
        return;
      }
    }

    this.isSaving = true;

    // Format time to YYYY-MM-DD HH:mm:ss (dùng giá trị đã parse, không qua Date conversion)
    const formattedYear = match[1];
    const formattedMonth = match[2];
    const formattedDay = match[3];
    const formattedHours = match[4];
    const formattedMinutes = match[5];
    const formattedDateTime = `${formattedYear}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:00`;

    console.log('[DEBUG] onSaveChanges - Original editTime:', this.editTime);
    console.log('[DEBUG] onSaveChanges - Formatted datetime for backend:', formattedDateTime);

    // Prepare update data
    const updateData: Partial<Appointment> = {
      doctorId: parseInt(this.editDoctorId),
      appointmentTime: formattedDateTime,
      status: 'Đổi lịch' // Set status to "Đổi lịch" when updating
    };

    console.log('[DEBUG] onSaveChanges - Full update data:', JSON.stringify(updateData, null, 2));
    console.log('[DEBUG] onSaveChanges - Appointment ID:', this.editingAppointment.id);

    this.appointmentService.updateAppointment(this.editingAppointment.id, updateData).subscribe({
      next: (response: any) => {
        console.log('Appointment updated successfully:', response);
        alert('Cập nhật lịch hẹn thành công!');
    this.closeEditModal();
        // Reload appointments
        this.loadAppointments();
      },
      error: (error: any) => {
        console.error('Error updating appointment:', error);
        let errorMessage = 'Không thể cập nhật lịch hẹn. Vui lòng thử lại.';
        
        if (error.error?.error) {
          // Hiển thị thông báo lỗi từ backend
          errorMessage = error.error.error;
          
          // Nếu là lỗi về số lịch hẹn đã đủ, message đã rõ ràng từ backend
          if (error.status === 409) {
            // Message từ backend đã rõ ràng (có thể là "Bác sĩ đã có lịch hẹn" hoặc "đã đủ 2 lịch hẹn")
            // Không cần override
          } else if (error.status === 400) {
            errorMessage = error.error.error || 'Dữ liệu không hợp lệ.';
          } else if (error.status === 404) {
            errorMessage = 'Không tìm thấy lịch hẹn để cập nhật.';
          }
        } else if (error.status === 0) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.';
        } else if (error.status >= 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        }
        
        alert(errorMessage);
        this.isSaving = false;
      }
    });
  }

  onCancelAppointment(appointment: AppointmentDisplay): void {
    if (confirm(`Bạn có chắc chắn muốn hủy lịch hẹn với ${appointment.doctorName}?`)) {
      // Lấy ID từ appointmentData để đảm bảo đúng ID
      const appointmentId = appointment.appointmentData?.id || appointment.id;
      
      if (!appointmentId) {
        alert('Không tìm thấy ID lịch hẹn. Vui lòng thử lại.');
        return;
      }
      
      // Update status to "Đã hủy" - chỉ gửi status, không gửi doctorId hoặc appointmentTime
      const updateData: Partial<Appointment> = {
        status: 'Đã hủy'
      };

      console.log('Cancelling appointment:', { 
        id: appointmentId, 
        appointmentId: appointment.id,
        appointmentDataId: appointment.appointmentData?.id,
        data: updateData 
      });

      this.appointmentService.updateAppointment(appointmentId, updateData).subscribe({
        next: (response: any) => {
          console.log('Appointment cancelled successfully:', response);
      alert('Đã hủy lịch hẹn thành công.');
          // Reload appointments
          this.loadAppointments();
        },
        error: (error: any) => {
          console.error('Error cancelling appointment:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          console.error('Error status:', error.status);
          console.error('Error URL:', error.url);
          let errorMessage = 'Không thể hủy lịch hẹn. Vui lòng thử lại.';
          
          if (error.error?.error) {
            if (error.status === 404) {
              errorMessage = 'Không tìm thấy lịch hẹn để hủy.';
            } else if (error.status === 400) {
              errorMessage = error.error.error || 'Dữ liệu không hợp lệ.';
            } else if (error.status === 500) {
              errorMessage = error.error.error || 'Lỗi server. Vui lòng thử lại sau.';
            } else {
              errorMessage = error.error.error || errorMessage;
            }
          } else if (error.status === 0) {
            errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.';
          }
          
          alert(errorMessage);
        }
      });
    }
  }

  get minDateTime(): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayDayOfWeek = this.getDayOfWeek(today);

    // Tính thời gian tối thiểu (hiện tại + buffer)
    const minTime = new Date(now);
    minTime.setHours(minTime.getHours() + this.MIN_BUFFER_HOURS);
    minTime.setMinutes(0); // Làm tròn xuống phút
    minTime.setSeconds(0);

    // Kiểm tra xem minTime có phải hôm nay không
    const minTimeDate = new Date(minTime.getFullYear(), minTime.getMonth(), minTime.getDate());
    const isMinTimeToday = minTimeDate.getTime() === today.getTime();

    if (isMinTimeToday) {
      // Nếu hôm nay là Chủ nhật, chuyển sang Thứ 2
      if (todayDayOfWeek === 0 || today.getDay() === 0) {
        const nextMonday = new Date(today);
        const daysUntilMonday = 1; // Thứ 2 là ngày mai
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
        nextMonday.setHours(this.WEEKDAY_START, 0, 0);
        return this.formatDateTimeLocal(nextMonday);
      }

      const workingEnd = this.getWorkingHoursEnd(todayDayOfWeek);

      // Nếu hôm nay là Chủ nhật (workingEnd = null), đã xử lý ở trên
      if (workingEnd === null) {
        return this.getNextWorkingDayStart(today);
      }

      // Nếu vượt quá giờ làm việc hôm nay, chuyển sang ngày làm việc tiếp theo
      if (minTime.getHours() >= workingEnd) {
        return this.getNextWorkingDayStart(today);
      }

      const workingStart = this.getWorkingHoursStart(todayDayOfWeek);

      // Nếu trước giờ làm việc, đặt là giờ bắt đầu hôm nay
      if (workingStart !== null && minTime.getHours() < workingStart) {
        const todayStart = new Date(today);
        todayStart.setHours(workingStart, 0, 0);
        return this.formatDateTimeLocal(todayStart);
      }

      // Trong giờ làm việc, dùng thời gian tối thiểu (hiện tại + buffer)
      return this.formatDateTimeLocal(minTime);
    }

    // Ngày khác, lấy ngày làm việc tiếp theo
    return this.getNextWorkingDayStart(minTimeDate);
  }

  // Helper methods cho giờ làm việc
  private getDayOfWeek(date: Date): number {
    const day = date.getDay();
    // Chủ nhật = 0, nhưng để dễ xử lý ta dùng 0 cho Chủ nhật
    return day;
  }

  private isWithinWorkingHours(date: Date): boolean {
    const dayOfWeek = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Chủ nhật (dayOfWeek = 0)
    if (dayOfWeek === 0) return false;

    // Thứ 7 (dayOfWeek = 6)
    if (dayOfWeek === 6) {
      if (hours < this.SATURDAY_START) return false;
      if (hours >= this.SATURDAY_END) return false;
      return true;
    }

    // Thứ 2-6 (dayOfWeek = 1-5)
    if (hours < this.WEEKDAY_START) return false;
    if (hours >= this.WEEKDAY_END) return false;
    return true;
  }

  private getWorkingHoursStart(dayOfWeek: number): number | null {
    if (dayOfWeek === 0) return null; // Chủ nhật
    if (dayOfWeek === 6) return this.SATURDAY_START; // Thứ 7: 7:00
    return this.WEEKDAY_START; // Thứ 2-6: 7:00
  }

  private getWorkingHoursEnd(dayOfWeek: number): number | null {
    if (dayOfWeek === 0) return null; // Chủ nhật
    if (dayOfWeek === 6) return this.SATURDAY_END; // Thứ 7: 12:00
    return this.WEEKDAY_END; // Thứ 2-6: 17:00
  }

  private hasEnoughBuffer(date: Date): boolean {
    const now = new Date();
    const minAllowedTime = new Date(now);
    minAllowedTime.setHours(minAllowedTime.getHours() + this.MIN_BUFFER_HOURS);
    return date >= minAllowedTime;
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek] || 'Ngày';
  }

  private getNextWorkingDayStart(fromDate: Date): string {
    let nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Tìm ngày làm việc tiếp theo (bỏ qua Chủ nhật)
    let dayOfWeek = nextDate.getDay();
    while (dayOfWeek === 0) {
      nextDate.setDate(nextDate.getDate() + 1);
      dayOfWeek = nextDate.getDay();
    }

    const workingStart = this.getWorkingHoursStart(dayOfWeek);
    if (workingStart === null) {
      // Không nên xảy ra vì đã bỏ qua Chủ nhật, nhưng để an toàn
      nextDate.setDate(nextDate.getDate() + 1);
      dayOfWeek = nextDate.getDay();
      const nextWorkingStart = this.getWorkingHoursStart(dayOfWeek);
      if (nextWorkingStart !== null) {
        nextDate.setHours(nextWorkingStart, 0, 0);
      } else {
        // Fallback: Thứ 2, 7:00
        nextDate.setHours(this.WEEKDAY_START, 0, 0);
      }
    } else {
      nextDate.setHours(workingStart, 0, 0);
    }
    return this.formatDateTimeLocal(nextDate);
  }

  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Lấy label hiển thị cho trạng thái
  getStatusLabel(status: string): string {
    if (!status) return 'Chưa xác định';
    
    // Hiển thị "Đã khám" khi trạng thái là "Hoàn thành"
    if (status === 'Hoàn thành' || status.toLowerCase().includes('hoàn thành')) {
      return 'Đã khám';
    }
    
    return status;
  }

  // Lấy class CSS cho trạng thái
  getStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('hoàn thành') || statusLower.includes('đã khám')) {
      return 'status-completed';
    } else if (statusLower.includes('đã hủy') || statusLower.includes('hủy')) {
      return 'status-cancelled';
    } else if (statusLower.includes('đổi lịch')) {
      return 'status-changed';
    } else if (statusLower.includes('đã đặt')) {
      return 'status-pending';
    }
    
    return 'status-unknown';
  }

  formatDateTime(datetime: string): string {
    if (!datetime) return '';
    try {
      // Parse MySQL datetime format (YYYY-MM-DD HH:mm:ss) manually to avoid timezone issues
      const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
      const match = datetime.match(mysqlDateTimeRegex);
      
      if (match) {
        // Use the exact values from the string (no timezone conversion)
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hours = match[4];
        const minutes = match[5];
        return `${hours}:${minutes} - ${day}/${month}/${year}`;
      }
      
      // Fallback to Date parsing if format doesn't match
      const date = new Date(datetime);
      if (isNaN(date.getTime())) return '';
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${hours}:${minutes} - ${day}/${month}/${year}`;
    } catch (e) {
      return '';
    }
  }
}
