import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterLink } from '@angular/router';
import { AppointmentScheduleComponent } from '../appointment-schedule/appointment-schedule.component';
import { AppointmentService } from '../services/appointment.service';
import { DoctorService, Doctor } from '../services/doctor.service';
import { DepartmentService, Department } from '../services/department.service';
import { PatientService, Patient } from '../services/patient.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent, RouterLink, AppointmentScheduleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  // Appointment form
  appointmentName: string = '';
  appointmentPhone: string = '';
  appointmentSpecialty: string = '';
  appointmentDoctor: string = '';
  appointmentTime: string = '';

  // Specialties and Doctors data
  specialties: Department[] = [];
  doctors: Doctor[] = [];
  isLoadingDepartments: boolean = false;
  isLoadingDoctors: boolean = false;
  isSubmittingAppointment: boolean = false;

  get filteredDoctors() {
    if (!this.appointmentSpecialty) {
      return [];
    }
    const departmentId = parseInt(this.appointmentSpecialty);
    return this.doctors.filter(doctor => doctor.departmentId === departmentId && doctor.status === 'Active');
  }

  // Doctor search
  doctorName: string = '';
  doctorDepartmentId: string = '';
  searchResults: Doctor[] = [];
  isSearching: boolean = false;
  hasSearched: boolean = false;
  
  // Appointment Schedule Modal
  isAppointmentScheduleOpen: boolean = false;

  // Contact Modal
  isContactModalOpen: boolean = false;

  // Services
  services = [
    {
      title: 'Điều trị nha khoa',
      description: 'Chăm sóc răng miệng toàn diện – từ khám, tẩy trắng, trám, đến điều trị chuyên sâu.',
      image: '🦷',
      icon: 'tooth'
    },
    {
      title: 'Điều trị xương khớp',
      description: 'Chẩn đoán và điều trị các bệnh lý về xương, khớp, chấn thương và phục hồi chức năng.',
      image: '🦴',
      icon: 'bone'
    },
    {
      title: 'Chẩn đoán y khoa',
      description: 'Ứng dụng công nghệ hình ảnh và xét nghiệm tiên tiến để chẩn đoán chính xác, nhanh chóng.',
      image: '🏥',
      icon: 'diagnosis'
    },
    {
      title: 'Tim mạch',
      description: 'Khám, tư vấn và điều trị các bệnh lý về tim mạch với đội ngũ chuyên gia hàng đầu.',
      image: '❤️',
      icon: 'cardiology'
    },
    {
      title: 'Phẫu thuật',
      description: 'Thực hiện các ca phẫu thuật an toàn, hiệu quả với trang thiết bị hiện đại và bác sĩ giàu kinh nghiệm.',
      image: '⚕️',
      icon: 'surgery'
    },
    {
      title: 'Chăm sóc mắt',
      description: 'Khám và điều trị các vấn đề về thị lực, mang lại đôi mắt sáng khỏe cho bạn.',
      image: '👁️',
      icon: 'eye-care'
    }
  ];

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private patientService: PatientService,
    private authService: AuthService
  ) { }

  // Giờ làm việc theo ngày
  // Thứ 2 - Thứ 6: 7:00 - 17:00
  // Thứ 7: 7:00 - 12:00 (chỉ sáng)
  // Chủ nhật: Không làm việc
  private readonly WEEKDAY_START = 7; // 7:00
  private readonly WEEKDAY_END = 17; // 17:00 (không bao gồm, tức là đến 16:59)
  private readonly SATURDAY_START = 7; // 7:00
  private readonly SATURDAY_END = 12; // 12:00 (không bao gồm, tức là đến 11:59)
  private readonly MIN_BUFFER_HOURS = 2; // Phải đặt trước ít nhất 2 giờ

  // Lấy thời gian tối thiểu cho datetime picker
  // Nếu đặt lịch hôm nay: phải sau giờ hiện tại + buffer, và trong giờ làm việc
  // Nếu đặt lịch ngày khác: từ giờ bắt đầu làm việc của ngày đó
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
      if (todayDayOfWeek === 0) {
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

  // Lấy ngày làm việc tiếp theo và giờ bắt đầu
  private getNextWorkingDayStart(fromDate: Date): string {
    let nextDate = new Date(fromDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Tìm ngày làm việc tiếp theo (bỏ qua Chủ nhật)
    let dayOfWeek = this.getDayOfWeek(nextDate);
    while (dayOfWeek === 0) {
      nextDate.setDate(nextDate.getDate() + 1);
      dayOfWeek = this.getDayOfWeek(nextDate);
    }
    
    const workingStart = this.getWorkingHoursStart(dayOfWeek);
    if (workingStart === null) {
      // Không nên xảy ra vì đã bỏ qua Chủ nhật, nhưng để an toàn
      nextDate.setDate(nextDate.getDate() + 1);
      dayOfWeek = this.getDayOfWeek(nextDate);
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

  // Helper: Format Date thành datetime-local format
  private formatDateTimeLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Lấy ngày trong tuần (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
  private getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  // Kiểm tra thời gian có trong giờ làm việc không
  private isWithinWorkingHours(date: Date): boolean {
    const dayOfWeek = this.getDayOfWeek(date);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Chủ nhật (0): Không làm việc
    if (dayOfWeek === 0) {
      return false;
    }
    
    // Thứ 7 (6): Chỉ sáng từ 7:00 - 11:59
    if (dayOfWeek === 6) {
      if (hours < this.SATURDAY_START) return false;
      if (hours >= this.SATURDAY_END) return false;
      return true;
    }
    
    // Thứ 2 - Thứ 6 (1-5): 7:00 - 16:59
    if (hours < this.WEEKDAY_START) return false;
    if (hours >= this.WEEKDAY_END) return false;
    return true;
  }

  // Lấy giờ bắt đầu làm việc theo ngày
  private getWorkingHoursStart(dayOfWeek: number): number | null {
    if (dayOfWeek === 0) return null; // Chủ nhật không làm việc
    if (dayOfWeek === 6) return this.SATURDAY_START; // Thứ 7: 7:00
    return this.WEEKDAY_START; // Thứ 2-6: 7:00
  }

  // Lấy giờ kết thúc làm việc theo ngày
  private getWorkingHoursEnd(dayOfWeek: number): number | null {
    if (dayOfWeek === 0) return null; // Chủ nhật không làm việc
    if (dayOfWeek === 6) return this.SATURDAY_END; // Thứ 7: 12:00
    return this.WEEKDAY_END; // Thứ 2-6: 17:00
  }

  // Kiểm tra thời gian có đủ buffer không (ít nhất 2 giờ từ bây giờ)
  private hasEnoughBuffer(date: Date): boolean {
    const now = new Date();
    const minAllowedTime = new Date(now);
    minAllowedTime.setHours(minAllowedTime.getHours() + this.MIN_BUFFER_HOURS);
    return date >= minAllowedTime;
  }

  // Lấy tên ngày trong tuần
  private getDayName(dayOfWeek: number): string {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return days[dayOfWeek];
  }

  // Lấy mô tả giờ làm việc
  getWorkingHoursDescription(): string {
    return 'Thứ 2-6: 7:00 - 17:00 | Thứ 7: 7:00 - 12:00 | Chủ nhật: Nghỉ';
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadDoctors();
  }

  loadDepartments(): void {
    this.isLoadingDepartments = true;
    console.log('Đang tải danh sách khoa...');
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        console.log('Danh sách khoa đã tải:', departments);
        this.specialties = departments;
        this.isLoadingDepartments = false;
        if (departments.length === 0) {
          console.warn('Không có khoa nào trong hệ thống');
        }
      },
      error: (error) => {
        console.error('Lỗi tải danh sách khoa:', error);
        console.error('Chi tiết lỗi:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url
        });
        const errorMessage = error.error?.error || error.error?.message || error.message || 'Không thể tải danh sách khoa. Vui lòng kiểm tra backend có chạy và có API /api/khoa không.';
        alert('Lỗi: ' + errorMessage);
        this.isLoadingDepartments = false;
      }
    });
  }

  loadDoctors(): void {
    this.isLoadingDoctors = true;
    console.log('Đang tải danh sách bác sĩ...');
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        console.log('Danh sách bác sĩ đã tải:', doctors);
        this.doctors = doctors;
        this.isLoadingDoctors = false;
        if (doctors.length === 0) {
          console.warn('Không có bác sĩ nào trong hệ thống');
        }
      },
      error: (error) => {
        console.error('Lỗi tải danh sách bác sĩ:', error);
        console.error('Chi tiết lỗi:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url
        });
        const errorMessage = error.error?.error || error.error?.message || error.message || 'Không thể tải danh sách bác sĩ. Vui lòng kiểm tra backend có chạy và có API /api/bacsi không.';
        alert('Lỗi: ' + errorMessage);
        this.isLoadingDoctors = false;
      }
    });
  }

  onAppointmentSubmit(): void {
    // Ngăn submit nhiều lần
    if (this.isSubmittingAppointment) {
      return;
    }

    // Kiểm tra user đã đăng nhập chưa
    const currentUser = this.authService.currentUserValue;
    console.log('[DEBUG] Current user from authService:', currentUser);
    
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đặt lịch hẹn.');
      // Có thể redirect đến trang login
      // this.router.navigate(['/login']);
      return;
    }

    // Kiểm tra user có phải là bệnh nhân không
    if (currentUser.LoaiNguoiDung !== 'BenhNhan') {
      alert('Chỉ tài khoản bệnh nhân mới được đặt lịch hẹn.');
      return;
    }

    // Nếu MaNguoiDung = 0, backend sẽ tự động tạo bệnh nhân từ thông tin form
    // Không cần kiểm tra ở đây nữa

    // Validation đầy đủ
    if (!this.appointmentName || !this.appointmentName.trim()) {
      alert('Vui lòng nhập tên.');
      return;
    }
    
    // Validation tên (ít nhất 2 ký tự)
    if (this.appointmentName.trim().length < 2) {
      alert('Tên phải có ít nhất 2 ký tự.');
      return;
    }

    // Validation số điện thoại
    if (!this.appointmentPhone || !this.appointmentPhone.trim()) {
      alert('Vui lòng nhập số điện thoại.');
      return;
    }
    
    // Kiểm tra số điện thoại hợp lệ (10-11 số, bắt đầu bằng 0, không phải toàn số 0)
    const phone = this.appointmentPhone.trim().replace(/\s+/g, '');
    
    // Kiểm tra độ dài
    if (phone.length < 10 || phone.length > 11) {
      alert('Số điện thoại phải có 10-11 số. Vui lòng nhập lại (VD: 0912345678).');
      return;
    }
    
    // Kiểm tra format (bắt đầu bằng 0, tiếp theo là số)
    if (!/^0\d{9,10}$/.test(phone)) {
      alert('Số điện thoại không hợp lệ. Phải bắt đầu bằng 0 và chỉ chứa số (VD: 0912345678).');
      return;
    }
    
    // Kiểm tra không phải toàn số 0
    if (/^0+$/.test(phone)) {
      alert('Số điện thoại không hợp lệ. Không được là toàn số 0. Vui lòng nhập số điện thoại thực (VD: 0912345678).');
      return;
  }

    // Cập nhật lại số điện thoại đã được validate
    this.appointmentPhone = phone;
    
    if (!this.appointmentSpecialty || !this.appointmentSpecialty.trim()) {
      alert('Vui lòng chọn chuyên khoa.');
      return;
    }
    
    if (!this.appointmentDoctor || !this.appointmentDoctor.trim()) {
      alert('Vui lòng chọn bác sĩ.');
      return;
    }
    
    if (!this.appointmentTime || !this.appointmentTime.trim()) {
      alert('Vui lòng chọn thời gian.');
      return;
    }

    // Validation thời gian - parse thủ công để tránh timezone issues
    // datetime-local format: "YYYY-MM-DDTHH:mm"
    const datetimeLocalRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
    const match = this.appointmentTime.match(datetimeLocalRegex);
    
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
    
    // Tạo Date object từ các giá trị đã parse (local time, không timezone conversion)
    const appointmentDateTime = new Date(year, month, day, hours, minutes, 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const appointmentDate = new Date(year, month, day);
    
    if (isNaN(appointmentDateTime.getTime())) {
      alert('Thời gian không hợp lệ. Vui lòng chọn lại.');
      return;
    }
    
    // Không được trong quá khứ
    if (appointmentDateTime < now) {
      alert('Thời gian không được trong quá khứ. Vui lòng chọn thời gian tương lai.');
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
      const dayName = this.getDayName(appointmentDayOfWeek);
      const workingStart = this.getWorkingHoursStart(appointmentDayOfWeek);
      const workingEnd = this.getWorkingHoursEnd(appointmentDayOfWeek);
      
      if (workingStart === null || workingEnd === null) {
        alert(`${dayName} bệnh viện không làm việc. Vui lòng chọn ngày khác.`);
      } else if (appointmentDayOfWeek === 6) {
        alert(`${dayName} bệnh viện chỉ làm việc buổi sáng (${workingStart}:00 - ${workingEnd}:00). Vui lòng chọn thời gian khác.`);
      } else {
        alert(`${dayName} bệnh viện làm việc từ ${workingStart}:00 - ${workingEnd}:00. Vui lòng chọn thời gian trong khoảng này.`);
      }
      return;
    }
    
    // Kiểm tra nếu đặt lịch hôm nay
    const isToday = appointmentDate.getTime() === today.getTime();
    
    if (isToday) {
      // Kiểm tra buffer time (phải đặt trước ít nhất 2 giờ)
      if (!this.hasEnoughBuffer(appointmentDateTime)) {
        const bufferHours = this.MIN_BUFFER_HOURS;
        alert(`Khi đặt lịch hôm nay, bạn phải đặt trước ít nhất ${bufferHours} giờ. Vui lòng chọn thời gian sau ${bufferHours} giờ kể từ bây giờ hoặc chọn ngày khác.`);
        return;
      }
    }

    // Set loading state
    this.isSubmittingAppointment = true;

    console.log('Bắt đầu đặt lịch hẹn với thông tin:', {
      name: this.appointmentName,
      phone: this.appointmentPhone,
      specialty: this.appointmentSpecialty,
      doctor: this.appointmentDoctor,
      time: this.appointmentTime
    });

    // Lấy MaNguoiDung từ currentUser (đã kiểm tra ở trên)
    const maNguoiDung = currentUser.MaNguoiDung;
    // Kiểm tra null/undefined (cho phép 0 là giá trị hợp lệ)
    if (maNguoiDung === null || maNguoiDung === undefined || maNguoiDung === '') {
      this.isSubmittingAppointment = false;
      alert('Không thể lấy thông tin tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    console.log('MaNguoiDung:', maNguoiDung);
    console.log('[DEBUG] Original datetime-local input:', this.appointmentTime);
    
    // Format datetime từ giá trị đã parse ở trên (match từ dòng 413)
    // Sử dụng lại match để lấy giá trị gốc (month từ match[2] đã là 1-12, không cần +1)
    const formattedYear = match[1];
    const formattedMonth = match[2];
    const formattedDay = match[3];
    const formattedHours = match[4];
    const formattedMinutes = match[5];
    const formattedDateTime = `${formattedYear}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:00`;

    console.log('[DEBUG] Formatted datetime for backend:', formattedDateTime);

    // Tạo lịch hẹn - gửi thêm thông tin tên và số điện thoại để backend có thể tạo bệnh nhân nếu MaNguoiDung = 0
    const appointmentData = {
      doctorId: parseInt(this.appointmentDoctor),
      appointmentTime: formattedDateTime,
      note: `Đặt lịch bởi ${this.appointmentName} (${this.appointmentPhone})`,
      HoTen: this.appointmentName.trim(), // Thêm tên để backend tạo bệnh nhân nếu cần
      SoDienThoai: this.appointmentPhone.trim() // Thêm số điện thoại để backend tạo bệnh nhân nếu cần
    };
    
    console.log('[DEBUG] Full appointment data being sent:', JSON.stringify(appointmentData, null, 2));
    console.log('Dữ liệu lịch hẹn sẽ gửi:', appointmentData);

    this.appointmentService.createAppointment(appointmentData, maNguoiDung).subscribe({
      next: (response) => {
        console.log('Đặt lịch hẹn thành công:', response);
        this.isSubmittingAppointment = false;
        
        // Nếu backend trả về MaNguoiDung mới (sau khi tạo bệnh nhân), cập nhật currentUser
        if (response.MaNguoiDung && response.MaNguoiDung !== maNguoiDung) {
          console.log('Cập nhật MaNguoiDung từ', maNguoiDung, 'thành', response.MaNguoiDung);
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            currentUser.MaNguoiDung = response.MaNguoiDung;
            // Cập nhật localStorage và BehaviorSubject thông qua AuthService
            this.authService.updateCurrentUser(currentUser);
            console.log('Đã cập nhật MaNguoiDung trong localStorage và BehaviorSubject');
          }
        }
        
        const successMessage = response.message || 'Đặt lịch hẹn thành công!';
        const maLichHen = response.MaLichHen || response.id || '';
        const fullMessage = successMessage + (maLichHen ? `\nMã lịch hẹn: ${maLichHen}` : '') + '\n\nChúng tôi sẽ liên hệ với bạn sớm nhất.';
        
        alert(fullMessage);
        
        // Reset form
        this.resetAppointmentForm();
      },
      error: (error) => {
        this.isSubmittingAppointment = false;
        console.error('Lỗi đặt lịch hẹn:', error);
        console.error('Chi tiết lỗi:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url
        });
        
        let errorMessage = 'Không thể đặt lịch hẹn. Vui lòng thử lại.';
        
        // Ưu tiên hiển thị thông báo lỗi từ backend (bao gồm cả lỗi về số lịch hẹn đã đủ)
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 401) {
          errorMessage = 'Vui lòng đăng nhập để đặt lịch hẹn.';
        } else if (error.status === 403) {
          errorMessage = 'Tài khoản không có quyền đặt lịch hẹn. Vui lòng đăng nhập bằng tài khoản bệnh nhân.';
        } else if (error.status === 409) {
          // Conflict - Trùng lịch hoặc đã đủ 2 lịch
          errorMessage = 'Bác sĩ đã có lịch hẹn vào thời gian này hoặc ngày này đã đủ 2 lịch hẹn. Vui lòng chọn thời gian khác.';
        } else if (error.status === 400) {
          errorMessage = 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (error.status === 404) {
          errorMessage = 'API không tồn tại. Vui lòng kiểm tra backend.';
        } else if (error.status === 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        } else if (error.status === 0) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối.';
        }
        
        alert(errorMessage);
      }
    });
  }

  onSpecialtyChange(): void {
    // Reset doctor selection when specialty changes
    this.appointmentDoctor = '';
  }

  resetAppointmentForm(): void {
    this.appointmentName = '';
    this.appointmentPhone = '';
    this.appointmentSpecialty = '';
    this.appointmentDoctor = '';
    this.appointmentTime = '';
  }

  // Format datetime để hiển thị cho user
  // datetime có thể là datetime-local format (YYYY-MM-DDTHH:mm) hoặc MySQL format (YYYY-MM-DD HH:mm:ss)
  formatDateTime(datetime: string): string {
    if (!datetime) return '';
    try {
      // Kiểm tra xem là datetime-local format hay MySQL format
      const datetimeLocalRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;
      const mysqlDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/;
      
      let match = datetime.match(datetimeLocalRegex);
      if (match) {
        // datetime-local format: "YYYY-MM-DDTHH:mm"
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hours = match[4];
        const minutes = match[5];
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      match = datetime.match(mysqlDateTimeRegex);
      if (match) {
        // MySQL format: "YYYY-MM-DD HH:mm:ss"
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const hours = match[4];
        const minutes = match[5];
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      
      // Fallback: dùng Date parsing
      const date = new Date(datetime);
      if (isNaN(date.getTime())) return datetime;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return datetime;
    }
  }

  onDoctorSearch(): void {
    // Không cần điều kiện bắt buộc - có thể tìm kiếm tất cả bác sĩ
    this.isSearching = true;
    this.hasSearched = true;
    
    const searchParams: { name?: string; departmentId?: number; specialty?: string } = {};
    
    if (this.doctorName && this.doctorName.trim()) {
      searchParams.name = this.doctorName.trim();
    }
    
    if (this.doctorDepartmentId && this.doctorDepartmentId.trim()) {
      const departmentId = parseInt(this.doctorDepartmentId);
      if (!isNaN(departmentId)) {
        searchParams.departmentId = departmentId;
      }
    }
    
    console.log('Đang tìm kiếm bác sĩ với tham số:', searchParams);
    
    this.doctorService.searchDoctors(searchParams).subscribe({
      next: (doctors) => {
        console.log('Kết quả tìm kiếm:', doctors);
        this.searchResults = doctors;
        this.isSearching = false;
        
        if (doctors.length === 0) {
          console.log('Không tìm thấy bác sĩ nào');
        }
      },
      error: (error) => {
        console.error('Lỗi tìm kiếm bác sĩ:', error);
        this.isSearching = false;
        const errorMessage = error.error?.error || error.message || 'Không thể tìm kiếm bác sĩ. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
        this.searchResults = [];
      }
    });
  }

  openAppointmentSchedule(): void {
    this.isAppointmentScheduleOpen = true;
  }

  closeAppointmentSchedule(): void {
    this.isAppointmentScheduleOpen = false;
  }

  contactNow(): void {
    this.isContactModalOpen = true;
  }

  closeContactModal(): void {
    this.isContactModalOpen = false;
  }

  openPhoneDialer(): void {
    window.location.href = 'tel:19001234';
  }

  openEmail(): void {
    window.location.href = 'mailto:info@healthcare.com';
  }
}