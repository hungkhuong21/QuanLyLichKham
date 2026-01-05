import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScheduleWorkService, ScheduleWork } from '../../services/schedule-work.service';
import { DoctorService, Doctor } from '../../services/doctor.service';

interface Schedule {
  id: number;
  doctorId: number;
  doctorCode?: string;
  doctorName: string;
  specialty: string;
  workDate: string;
  workTime: string;
  startTime: string;
  endTime: string;
  status: string; // status of schedule record (kept)
  doctorStatus?: 'Active' | 'Inactive'; // status from doctor database
}

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-management.component.html',
  styleUrl: './schedule-management.component.scss'
})
export class ScheduleManagementComponent implements OnInit {
  showAddModal: boolean = false;
  showUpdateModal: boolean = false;
  showDetailModal: boolean = false;
  isLoading: boolean = false;

  // Schedule list
  schedules: Schedule[] = [];

  // Filter/search
  searchDoctorName: string = '';
  searchSpecialty: string = '';
  searchDate: string = '';
  filteredSchedules: Schedule[] = [];

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Form data for add/update
  scheduleForm: Schedule = {
    id: 0,
    doctorId: 0,
    doctorName: '',
    specialty: '',
    workDate: '',
    workTime: '',
    startTime: '',
    endTime: '',
    status: 'Hoạt động'
  };

  // Selected schedule for update
  selectedSchedule: Schedule | null = null;

  // Doctors list (for dropdown)
  doctors: Doctor[] = [];
  activeDoctors: Doctor[] = [];
  
  // Specialties list (loaded from doctors)
  specialties: string[] = [];

  // Shifts list
  shifts = [
    'Sáng',
    'Chiều',
    'Tối',
    'Sáng / Chiều',
    'Chiều / Tối',
    'Sáng / Chiều / Tối'
  ];

  // Schedule types list (reserved for future use)
  scheduleTypes = [
    'Khám',
    'Trực cấp cứu',
    'Tư vấn online',
    'Khám / Trực cấp cứu',
    'Khám / Tư vấn online'
  ];

  constructor(
    private scheduleWorkService: ScheduleWorkService,
    private doctorService: DoctorService
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
    this.loadSchedules();
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.activeDoctors = doctors.filter(d => d.status === 'Active');
        // Extract unique specialties from doctors
        const specialtySet = new Set<string>();
        doctors.forEach(doctor => {
          if (doctor.specialty) {
            specialtySet.add(doctor.specialty);
          }
        });
        this.specialties = Array.from(specialtySet).sort();
        console.log('Đã load danh sách bác sĩ:', doctors);
        console.log('Danh sách chuyên khoa:', this.specialties);
      },
      error: (error) => {
        console.error('Lỗi load danh sách bác sĩ:', error);
        alert('Không thể tải danh sách bác sĩ. Vui lòng thử lại.');
      }
    });
  }

  getUpdateDoctorOptions(): Doctor[] {
    if (!this.selectedSchedule) return this.activeDoctors;
    const current = this.doctors.find(d => d.id === this.selectedSchedule!.doctorId);
    if (current && current.status !== 'Active') {
      const exists = this.activeDoctors.find(d => d.id === current.id);
      return exists ? this.activeDoctors : [...this.activeDoctors, current];
    }
    return this.activeDoctors;
  }

  loadSchedules(filters?: { tenBacSi?: string; chuyenKhoa?: string; ngay?: string }): void {
    this.isLoading = true;
    
    // Nếu có filters từ search, sử dụng search API
    if (this.hasActiveFilters()) {
      this.searchSchedules();
      return;
    }
    
    // Convert date format from dd/mm/yyyy to yyyy-mm-dd if needed
    let formattedFilters = filters ? { ...filters } : {};
    if (formattedFilters.ngay && formattedFilters.ngay.includes('/')) {
      const parts = formattedFilters.ngay.split('/');
      if (parts.length === 3) {
        formattedFilters.ngay = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    this.scheduleWorkService.getAllSchedules(formattedFilters).subscribe({
      next: (scheduleWorks) => {
        this.schedules = scheduleWorks.map(sw => this.mapScheduleWorkToSchedule(sw));
        this.filteredSchedules = this.schedules;
        this.updatePagination();
        this.isLoading = false;
        console.log('Đã load danh sách lịch làm việc:', this.schedules);
      },
      error: (error) => {
        console.error('Lỗi load danh sách lịch làm việc:', error);
        alert('Không thể tải danh sách lịch làm việc. Vui lòng thử lại.');
        this.isLoading = false;
      }
    });
  }

  hasActiveFilters(): boolean {
    return !!(this.searchDoctorName?.trim() || 
              this.searchSpecialty || 
              this.searchDate);
  }

  searchSchedules(): void {
    this.isLoading = true;
    
    const searchParams: any = {};
    
    if (this.searchDoctorName?.trim()) {
      searchParams.doctorName = this.searchDoctorName.trim();
    }
    
    if (this.searchSpecialty) {
      searchParams.specialty = this.searchSpecialty;
    }
    
    if (this.searchDate) {
      // Convert date format from dd/mm/yyyy to yyyy-mm-dd if needed
      let formattedDate = this.searchDate;
      if (formattedDate.includes('/')) {
        const parts = formattedDate.split('/');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      searchParams.workDate = formattedDate;
    }
    
    this.scheduleWorkService.searchSchedules(searchParams).subscribe({
      next: (scheduleWorks) => {
        this.schedules = scheduleWorks.map(sw => this.mapScheduleWorkToSchedule(sw));
        this.filteredSchedules = this.schedules;
        this.updatePagination();
        this.isLoading = false;
        console.log('Đã tìm kiếm lịch làm việc:', this.schedules);
      },
      error: (error) => {
        console.error('Lỗi tìm kiếm lịch làm việc:', error);
        alert('Lỗi: ' + (error.error?.error || 'Không thể tìm kiếm lịch làm việc'));
        this.isLoading = false;
      }
    });
  }

  mapScheduleWorkToSchedule(scheduleWork: ScheduleWork): Schedule {
    // Format date from yyyy-mm-dd or datetime to dd/mm/yyyy for display
    const formatDateForDisplay = (dateStr: string) => {
      if (!dateStr) return '';
      
      console.log('formatDateForDisplay - Input:', dateStr);
      
      let datePart = dateStr.trim();
      
      // If it contains 'T' (datetime string), we need to handle timezone carefully
      if (datePart.includes('T')) {
        // If it's a datetime with timezone (Z or + or -), we need special handling
        // The issue: if backend stores "2025-12-31 00:00:00" local time and converts to UTC,
        // it becomes "2025-12-30T17:00:00.000Z" (for GMT+7). When we parse with UTC methods,
        // we get 30/12, not 31/12.
        // Solution: Parse the datetime string and use LOCAL timezone methods to get the date
        if (datePart.includes('Z') || datePart.includes('+') || (datePart.includes('-') && datePart.length > 19)) {
          // Parse the datetime string
          const date = new Date(datePart);
          // Use LOCAL timezone methods to get the date as it was intended
          // This will give us the date in the user's local timezone
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          datePart = `${year}-${month}-${day}`;
          console.log('Parsed datetime with timezone using LOCAL methods:', datePart);
        } else {
          // No timezone, just extract date part
          datePart = datePart.split('T')[0];
          console.log('Extracted date part from T:', datePart);
        }
      } else if (datePart.includes(' ')) {
        // Format: yyyy-mm-dd HH:mm:ss
        datePart = datePart.split(' ')[0];
        console.log('Extracted date part from space:', datePart);
      }
      
      // Ensure we only have yyyy-mm-dd format (10 chars)
      if (datePart.length > 10) {
        datePart = datePart.substring(0, 10);
      }
      
      // Format from yyyy-mm-dd to dd/mm/yyyy using ONLY string manipulation
      const parts = datePart.split('-');
      if (parts.length === 3 && parts[0].length === 4) {
        // Validate it's a proper date format: yyyy-mm-dd
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        const result = `${day}/${month}/${year}`;
        console.log('Converted to dd/mm/yyyy:', result);
        return result;
      }
      
      // If already in dd/mm/yyyy format, return as is
      if (datePart.includes('/') && datePart.split('/').length === 3) {
        console.log('Already in dd/mm/yyyy format:', datePart);
        return datePart;
      }
      
      console.log('Returning original:', dateStr);
      return dateStr;
    };

    // Format time from HH:mm:ss to HH:mm
    const formatTime = (timeStr: string) => {
      if (!timeStr) return '';
      return timeStr.substring(0, 5);
    };

    const mapped: Schedule = {
      id: scheduleWork.id,
      doctorId: scheduleWork.doctorId,
      doctorName: scheduleWork.doctorName,
      specialty: scheduleWork.specialty,
      workDate: formatDateForDisplay(scheduleWork.workDate), // Display format: dd/mm/yyyy
      startTime: formatTime(scheduleWork.startTime),
      endTime: formatTime(scheduleWork.endTime),
      workTime: `${formatTime(scheduleWork.startTime)} - ${formatTime(scheduleWork.endTime)}`,
      status: scheduleWork.status
    };
    // Annotate with doctor status from doctor list
    const doctor = this.doctors.find(d => d.id === mapped.doctorId);
    if (doctor) {
      mapped.doctorStatus = (doctor.status === 'Active') ? 'Active' : 'Inactive';
    }
    return mapped;
  }

  openAddModal(): void {
    this.resetForm();
    this.showAddModal = true;
    this.showUpdateModal = false;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  openUpdateModal(schedule: Schedule): void {
    this.selectedSchedule = schedule;
    this.scheduleForm = { ...schedule };
    
    console.log('openUpdateModal - schedule.workDate:', schedule.workDate);
    console.log('openUpdateModal - scheduleForm.workDate (before):', this.scheduleForm.workDate);
    
    // Convert date from dd/mm/yyyy to yyyy-mm-dd for date input
    // Use ONLY string manipulation to avoid timezone issues
    if (this.scheduleForm.workDate) {
      const workDate = this.scheduleForm.workDate.trim();
      
      if (workDate.includes('/')) {
        // Format: dd/mm/yyyy - convert to yyyy-mm-dd
        const parts = workDate.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2];
          this.scheduleForm.workDate = `${year}-${month}-${day}`;
          console.log('Converted from dd/mm/yyyy to yyyy-mm-dd:', this.scheduleForm.workDate);
        }
      } else if (workDate.includes('T')) {
        // Format: yyyy-mm-ddTHH:mm:ss - handle timezone properly
        if (workDate.includes('Z') || workDate.includes('+') || (workDate.includes('-') && workDate.length > 19)) {
          // If has timezone, parse and use LOCAL timezone to get correct date
          const date = new Date(workDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          this.scheduleForm.workDate = `${year}-${month}-${day}`;
          console.log('Parsed datetime with timezone using LOCAL methods:', this.scheduleForm.workDate);
        } else {
          // No timezone, just extract date part
          this.scheduleForm.workDate = workDate.split('T')[0].substring(0, 10);
          console.log('Extracted date from datetime string:', this.scheduleForm.workDate);
        }
      } else if (workDate.includes(' ')) {
        // Format: yyyy-mm-dd HH:mm:ss - extract only date part
        this.scheduleForm.workDate = workDate.split(' ')[0].substring(0, 10);
        console.log('Extracted date from space-separated string:', this.scheduleForm.workDate);
      } else if (workDate.length > 10) {
        // If longer than 10 chars, take only first 10 (yyyy-mm-dd)
        this.scheduleForm.workDate = workDate.substring(0, 10);
        console.log('Trimmed to yyyy-mm-dd:', this.scheduleForm.workDate);
      }
      // If already in yyyy-mm-dd format (exactly 10 chars), keep it as is
      console.log('Final scheduleForm.workDate:', this.scheduleForm.workDate);
    }
    
    // Parse workTime to startTime and endTime
    if (this.scheduleForm.workTime) {
      const timeParts = this.scheduleForm.workTime.split(' - ');
      if (timeParts.length === 2) {
        // Format time to HH:mm for time input
        const formatTime = (time: string) => {
          if (!time) return '';
          return time.length >= 5 ? time.substring(0, 5) : time;
        };
        this.scheduleForm.startTime = formatTime(timeParts[0].trim());
        this.scheduleForm.endTime = formatTime(timeParts[1].trim());
      }
    }
    
    // Ensure doctorId is set correctly
    if (!this.scheduleForm.doctorId && schedule.doctorId) {
      this.scheduleForm.doctorId = schedule.doctorId;
    }
    
    // Update doctor name and specialty if doctorId is set
    if (this.scheduleForm.doctorId) {
      const doctor = this.doctors.find(d => d.id === this.scheduleForm.doctorId);
      if (doctor) {
        this.scheduleForm.doctorName = doctor.name;
        this.scheduleForm.specialty = doctor.specialty || '';
      }
    }
    
    console.log('Mở update modal với schedule:', schedule);
    console.log('Schedule form:', this.scheduleForm);
    
    this.showUpdateModal = true;
    this.showAddModal = false;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.resetForm();
    this.selectedSchedule = null;
  }

  viewDetails(schedule: Schedule): void {
    if (!schedule.id) {
      alert('Không tìm thấy ID lịch làm việc. Vui lòng thử lại.');
      return;
    }
    
    // Gọi API getById để lấy chi tiết từ backend
    this.scheduleWorkService.getScheduleById(schedule.id).subscribe({
      next: (detailedScheduleWork) => {
        const detailedSchedule = this.mapScheduleWorkToSchedule(detailedScheduleWork);
        this.selectedSchedule = detailedSchedule;
        this.showDetailModal = true;
      },
      error: (error) => {
        console.error('Lỗi lấy chi tiết lịch làm việc:', error);
        // Fallback: sử dụng dữ liệu hiện có
        this.selectedSchedule = schedule;
        this.showDetailModal = true;
        alert('Không thể tải chi tiết từ server. Hiển thị thông tin cơ bản.');
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedSchedule = null;
  }

  applyFilters(): void {
    // Filtering được xử lý ở backend, chỉ cần cập nhật pagination
    this.updatePagination();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadSchedules();
  }

  onSearchInputChange(): void {
    // Có thể giữ lại real-time filter client-side nếu muốn
    // Hoặc chỉ gọi khi blur/enter
    this.applyFilters();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSchedules.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get paginatedSchedules(): Schedule[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredSchedules.slice(startIndex, endIndex);
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

  onDoctorSelect(doctorId: any): void {
    // Convert to number if it's a string
    const id = typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId;
    const doctor = this.doctors.find(d => d.id === id);
    if (doctor) {
      this.scheduleForm.doctorId = doctor.id;
      this.scheduleForm.doctorName = doctor.name;
      this.scheduleForm.specialty = doctor.specialty || '';
      if (doctor.status !== 'Active') {
        // Allow if updating and keeping same inactive doctor
        const isUpdatingSame = !!this.selectedSchedule && this.selectedSchedule.doctorId === doctor.id;
        if (!isUpdatingSame) {
          alert('Bác sĩ đang ở trạng thái Nghỉ phép. Vui lòng chọn bác sĩ đang làm việc.');
          this.scheduleForm.doctorId = 0;
        }
      }
      console.log('Đã chọn bác sĩ:', doctor.name, 'ID:', doctor.id);
    } else {
      console.warn('Không tìm thấy bác sĩ với ID:', id);
    }
  }

  onTimeChange(): void {
    if (this.scheduleForm.startTime && this.scheduleForm.endTime) {
      // Format time to HH:mm if it's HH:mm:ss
      const formatTime = (time: string) => {
        if (!time) return '';
        return time.length >= 5 ? time.substring(0, 5) : time;
      };
      this.scheduleForm.workTime = `${formatTime(this.scheduleForm.startTime)} - ${formatTime(this.scheduleForm.endTime)}`;
    }
  }

  addSchedule(): void {
    console.log('Form data khi submit:', this.scheduleForm);
    
    // Validation
    if (!this.scheduleForm.doctorId || this.scheduleForm.doctorId === 0) {
      alert('Vui lòng chọn bác sĩ.');
      return;
    }
    // Ensure doctor is Active
    const sel = this.doctors.find(d => d.id === this.scheduleForm.doctorId);
    if (!sel || sel.status !== 'Active') {
      alert('Chỉ có thể tạo lịch cho bác sĩ đang làm việc (Active).');
      return;
    }
    if (!this.scheduleForm.workDate || !this.scheduleForm.workDate.trim()) {
      alert('Vui lòng nhập ngày làm việc.');
      return;
    }
    if (!this.scheduleForm.startTime || !this.scheduleForm.startTime.trim()) {
      alert('Vui lòng nhập giờ bắt đầu.');
      return;
    }
    if (!this.scheduleForm.endTime || !this.scheduleForm.endTime.trim()) {
      alert('Vui lòng nhập giờ kết thúc.');
      return;
    }

    // Date input type="date" already returns yyyy-mm-dd format
    let formattedDate = this.scheduleForm.workDate;
    // If somehow it's still in dd/mm/yyyy format, convert it
    if (formattedDate && formattedDate.includes('/')) {
      const parts = formattedDate.split('/');
      if (parts.length === 3) {
        // Ensure proper padding and use exact date parts
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        formattedDate = `${year}-${month}-${day}`;
      }
    }
    // Ensure date is in yyyy-mm-dd format (from date input, it should already be)
    // Don't convert through Date object to avoid timezone issues

    // Format time to HH:mm:ss
    const formatTimeToFull = (time: string) => {
      if (!time) return '';
      return time.length === 5 ? `${time}:00` : time;
    };

    const scheduleData: Partial<ScheduleWork> = {
      doctorId: this.scheduleForm.doctorId,
      workDate: formattedDate,
      startTime: formatTimeToFull(this.scheduleForm.startTime),
      endTime: formatTimeToFull(this.scheduleForm.endTime),
      status: this.scheduleForm.status || 'Hoạt động'
    };

    this.scheduleWorkService.createSchedule(scheduleData).subscribe({
      next: (response) => {
        console.log('Thêm lịch làm việc thành công:', response);
        alert('Thêm lịch làm việc thành công!');
        this.closeAddModal();
        this.loadSchedules();
      },
      error: (error) => {
        console.error('Lỗi thêm lịch làm việc:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Thêm lịch làm việc thất bại. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }

  selectScheduleForUpdate(schedule: Schedule): void {
    this.openUpdateModal(schedule);
  }

  updateSchedule(): void {
    if (!this.selectedSchedule) {
      alert('Không tìm thấy lịch làm việc cần cập nhật. Vui lòng chọn lại từ danh sách.');
      this.closeUpdateModal();
      return;
    }

    // Validation
    if (!this.scheduleForm.doctorId || this.scheduleForm.doctorId === 0) {
      alert('Vui lòng chọn bác sĩ.');
      return;
    }
    // Ensure doctor is Active unless keeping same inactive doctor
    const sel = this.doctors.find(d => d.id === this.scheduleForm.doctorId);
    const keepingSameInactive = !!this.selectedSchedule && sel && sel.status !== 'Active' && this.selectedSchedule.doctorId === sel.id;
    if (!sel || (sel.status !== 'Active' && !keepingSameInactive)) {
      alert('Chỉ có thể cập nhật lịch cho bác sĩ đang làm việc (Active).');
      return;
    }
    if (!this.scheduleForm.workDate || !this.scheduleForm.workDate.trim()) {
      alert('Vui lòng nhập ngày làm việc.');
      return;
    }
    if (!this.scheduleForm.startTime || !this.scheduleForm.startTime.trim()) {
      alert('Vui lòng nhập giờ bắt đầu.');
      return;
    }
    if (!this.scheduleForm.endTime || !this.scheduleForm.endTime.trim()) {
      alert('Vui lòng nhập giờ kết thúc.');
      return;
    }

    // Date input type="date" already returns yyyy-mm-dd format
    let formattedDate = this.scheduleForm.workDate;
    // If somehow it's still in dd/mm/yyyy format, convert it
    if (formattedDate && formattedDate.includes('/')) {
      const parts = formattedDate.split('/');
      if (parts.length === 3) {
        // Ensure proper padding and use exact date parts
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        formattedDate = `${year}-${month}-${day}`;
      }
    }
    // Ensure date is in yyyy-mm-dd format (from date input, it should already be)
    // Don't convert through Date object to avoid timezone issues

    // Format time to HH:mm:ss
    const formatTimeToFull = (time: string) => {
      if (!time) return '';
      return time.length === 5 ? `${time}:00` : time;
    };

    const scheduleData: Partial<ScheduleWork> = {
      doctorId: this.scheduleForm.doctorId,
      workDate: formattedDate,
      startTime: formatTimeToFull(this.scheduleForm.startTime),
      endTime: formatTimeToFull(this.scheduleForm.endTime),
      status: this.scheduleForm.status || 'Hoạt động'
    };

    this.scheduleWorkService.updateSchedule(this.selectedSchedule.id, scheduleData).subscribe({
      next: (response) => {
        console.log('Cập nhật lịch làm việc thành công:', response);
        alert('Cập nhật lịch làm việc thành công!');
        this.closeUpdateModal();
        this.loadSchedules();
      },
      error: (error) => {
        console.error('Lỗi cập nhật lịch làm việc:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Cập nhật lịch làm việc thất bại. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }

  deleteSchedule(schedule: Schedule | null): void {
    if (!schedule) {
      alert('Không tìm thấy lịch làm việc cần xóa.');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa lịch làm việc của bác sĩ "${schedule.doctorName}"?\n\nHành động này không thể hoàn tác.`)) {
      return;
    }

    // Check if schedule is being edited
    const isCurrentlyEditing = this.selectedSchedule?.id === schedule.id && this.showUpdateModal;

    this.scheduleWorkService.deleteSchedule(schedule.id).subscribe({
      next: (response) => {
        console.log('Xóa lịch làm việc thành công:', response);
        alert('Xóa lịch làm việc thành công!');
        
        // If deleting the schedule being edited, close modal
        if (isCurrentlyEditing) {
          this.closeUpdateModal();
        }
        
        this.loadSchedules();
      },
      error: (error) => {
        console.error('Lỗi xóa lịch làm việc:', error);
        const errorMessage = error.error?.error || error.error?.message || 'Xóa lịch làm việc thất bại. Vui lòng thử lại.';
        alert('Lỗi: ' + errorMessage);
      }
    });
  }

  resetForm(): void {
    this.scheduleForm = {
      id: 0,
      doctorId: 0,
      doctorName: '',
      specialty: '',
      workDate: '',
      workTime: '',
      startTime: '',
      endTime: '',
      status: 'Hoạt động'
    };
    this.selectedSchedule = null;
  }
}
