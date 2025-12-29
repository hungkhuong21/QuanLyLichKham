const db = require('../config/db');

// Tạo lịch hẹn mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO lichhen (MaBenhNhan, MaBacSi, ThoiGianKham, TrangThai, Note) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.MaBenhNhan,
    data.MaBacSi,
    data.ThoiGianKham,
    data.TrangThai || 'Đã đặt',
    data.Note || null
  ], callback);
};

// Helper function: Tính toán date range cho filter
const getDateRange = (filter) => {
  if (!filter || filter === 'Tất cả' || filter === 'all') {
    return null; // Không filter
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextDay = new Date(tomorrow);
  nextDay.setDate(nextDay.getDate() + 1);

  // Tính tuần này: từ thứ 2 đến chủ nhật
  const currentDay = now.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1; // Chuyển Chủ nhật thành 6
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - daysFromMonday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Tính tháng này
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  switch (filter) {
    case 'Hôm nay':
    case 'today':
      return {
        start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 00:00:00`,
        end: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')} 23:59:59`
      };
    case 'Ngày mai':
    case 'tomorrow':
      return {
        start: `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')} 00:00:00`,
        end: `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')} 23:59:59`
      };
    case 'Tuần này':
    case 'this week':
    case 'week':
      return {
        start: `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')} 00:00:00`,
        end: `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')} 23:59:59`
      };
    case 'Tháng này':
    case 'this month':
    case 'month':
      return {
        start: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-${String(monthStart.getDate()).padStart(2, '0')} 00:00:00`,
        end: `${monthEnd.getFullYear()}-${String(monthEnd.getMonth() + 1).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')} 00:00:00`
      };
    default:
      return null;
  }
};

// Helper function: Format datetime từ MySQL Date object sang string YYYY-MM-DD HH:mm:ss
// MySQL lưu datetime là local time, không phải UTC
const formatDateTime = (date) => {
  if (!date) return null;
  // Nếu đã là string với format YYYY-MM-DD HH:mm:ss, trả về luôn
  if (typeof date === 'string') {
    // Kiểm tra format YYYY-MM-DD HH:mm:ss (không có T và Z)
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
      return date;
    }
    // Nếu là ISO format với Z (UTC), cần convert từ UTC về local time
    // Nhưng MySQL lưu local time, nên nếu driver convert sang UTC, cần convert ngược lại
    if (date.includes('T') && date.includes('Z')) {
      const d = new Date(date);
      // Lấy local time từ UTC date (do MySQL lưu local time, nhưng driver trả về UTC)
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    // Nếu là ISO format không có Z (local time)
    if (date.includes('T')) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    return date;
  }
  // Nếu là Date object, format về YYYY-MM-DD HH:mm:ss (local time)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Lấy tất cả lịch hẹn
exports.getAll = (filter, callback) => {
  // Nếu callback là undefined, filter là callback (tương thích ngược)
  if (typeof filter === 'function') {
    callback = filter;
    filter = null;
  }

  const dateRange = getDateRange(filter);
  let sql = `
    SELECT 
      lh.MaLichHen as id,
      lh.MaBenhNhan as patientId,
      lh.MaBacSi as doctorId,
      DATE_FORMAT(lh.ThoiGianKham, '%Y-%m-%d %H:%i:%s') as appointmentTime,
      lh.TrangThai as status,
      lh.Note as note,
      lh.CreatedAt as createdAt,
      lh.UpdatedAt as updatedAt,
      bn.HoTen as patientName,
      bn.SoDienThoai as patientPhone,
      bs.HoTen as doctorName,
      k.TenKhoa as departmentName,
      bs.MaKhoa as departmentId
    FROM lichhen lh
    LEFT JOIN benhnhan bn ON lh.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN bacsi bs ON lh.MaBacSi = bs.MaBacSi
    LEFT JOIN khoa k ON bs.MaKhoa = k.MaKhoa
  `;

  const params = [];
  if (dateRange) {
    sql += ` WHERE lh.ThoiGianKham >= ? AND lh.ThoiGianKham <= ?`;
    params.push(dateRange.start, dateRange.end);
  }

  sql += ` ORDER BY lh.ThoiGianKham DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    // Format datetime cho mỗi kết quả để đảm bảo format đúng
    const formattedResults = results.map(row => ({
      ...row,
      appointmentTime: formatDateTime(row.appointmentTime)
    }));
    callback(null, formattedResults);
  });
};

// Lấy lịch hẹn theo id
exports.getById = (id, callback) => {
  const sql = `
    SELECT 
      lh.MaLichHen as id,
      lh.MaBenhNhan as patientId,
      lh.MaBacSi as doctorId,
      DATE_FORMAT(lh.ThoiGianKham, '%Y-%m-%d %H:%i:%s') as appointmentTime,
      lh.TrangThai as status,
      lh.Note as note,
      lh.CreatedAt as createdAt,
      lh.UpdatedAt as updatedAt,
      bn.HoTen as patientName,
      bn.SoDienThoai as patientPhone,
      bs.HoTen as doctorName,
      k.TenKhoa as departmentName,
      bs.MaKhoa as departmentId
    FROM lichhen lh
    LEFT JOIN benhnhan bn ON lh.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN bacsi bs ON lh.MaBacSi = bs.MaBacSi
    LEFT JOIN khoa k ON bs.MaKhoa = k.MaKhoa
    WHERE lh.MaLichHen = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, []);
    // Format datetime cho kết quả
    const formattedResults = results.map(row => ({
      ...row,
      appointmentTime: formatDateTime(row.appointmentTime)
    }));
    callback(null, formattedResults);
  });
};

// Kiểm tra trùng lịch: cùng bác sĩ, cùng thời gian
exports.checkTrungLich = (MaBacSi, ThoiGianKham, callback) => {
  const sql = 'SELECT * FROM lichhen WHERE MaBacSi = ? AND ThoiGianKham = ? AND TrangThai != "Đã hủy"';
  db.query(sql, [MaBacSi, ThoiGianKham], (err, results) => {
    if (err) return callback(err);
    // Format datetime nếu có kết quả
    const formattedResults = results.map(row => ({
      ...row,
      ThoiGianKham: formatDateTime(row.ThoiGianKham)
    }));
    callback(null, formattedResults);
  });
};

// Hàm này đã được thay thế bởi bảng tiepnhan riêng biệt
// Giữ lại để tương thích ngược (deprecated)
exports.updateTiepNhan = (MaLichHen, TiepNhan, TrangThaiTiepNhan, callback) => {
  // Không còn cập nhật trực tiếp trong lichhen, sử dụng bảng tiepnhan thay thế
  callback(null, { affectedRows: 0, message: 'Deprecated: Sử dụng bảng tiepnhan thay thế' });
};

// Cập nhật trạng thái chung của lịch (nếu cần)
exports.updateTrangThai = (MaLichHen, TrangThai, callback) => {
const sql = 'UPDATE lichhen SET TrangThai = ? WHERE MaLichHen = ?';
  db.query(sql, [TrangThai, MaLichHen], callback);
};

// Cập nhật lịch hẹn
exports.update = (id, data, callback) => {
  const fields = [];
  const values = [];
  
  // Chỉ cập nhật các trường được truyền vào
  if (data.TrangThai !== undefined) {
    fields.push('TrangThai = ?');
    values.push(data.TrangThai);
  }
  if (data.ThoiGianKham !== undefined) {
    fields.push('ThoiGianKham = ?');
    values.push(data.ThoiGianKham);
  }
  if (data.Note !== undefined) {
    fields.push('Note = ?');
    values.push(data.Note);
  }
  
  if (fields.length === 0) {
    return callback(new Error('Không có dữ liệu để cập nhật'));
  }
  
  values.push(id);
  const query = `UPDATE lichhen SET ${fields.join(', ')} WHERE MaLichHen = ?`;
  
  db.query(query, values, callback);
};

// Xóa lịch hẹn
exports.delete = (id, callback) => {
  db.query('DELETE FROM lichhen WHERE MaLichHen = ?', [id], callback);
};

// Lấy lịch hẹn theo MaBenhNhan
exports.getByMaBenhNhan = (maBenhNhan, filter, callback) => {
  // Nếu callback là undefined, filter là callback (tương thích ngược)
  if (typeof filter === 'function') {
    callback = filter;
    filter = null;
  }

  const dateRange = getDateRange(filter);
  let sql = `
    SELECT 
      lh.MaLichHen as id,
      lh.MaBenhNhan as patientId,
      lh.MaBacSi as doctorId,
      DATE_FORMAT(lh.ThoiGianKham, '%Y-%m-%d %H:%i:%s') as appointmentTime,
      lh.TrangThai as status,
      lh.Note as note,
      lh.CreatedAt as createdAt,
      lh.UpdatedAt as updatedAt,
      bn.HoTen as patientName,
      bn.SoDienThoai as patientPhone,
      bs.HoTen as doctorName,
      k.TenKhoa as departmentName,
      bs.MaKhoa as departmentId
    FROM lichhen lh
    LEFT JOIN benhnhan bn ON lh.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN bacsi bs ON lh.MaBacSi = bs.MaBacSi
    LEFT JOIN khoa k ON bs.MaKhoa = k.MaKhoa
    WHERE lh.MaBenhNhan = ?
  `;

  const params = [maBenhNhan];
  if (dateRange) {
    sql += ` AND lh.ThoiGianKham >= ? AND lh.ThoiGianKham <= ?`;
    params.push(dateRange.start, dateRange.end);
  }

  sql += ` ORDER BY lh.ThoiGianKham DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    // Format datetime cho mỗi kết quả
    const formattedResults = results.map(row => ({
      ...row,
      appointmentTime: formatDateTime(row.appointmentTime)
    }));
    callback(null, formattedResults);
  });
};

// Lấy lịch hẹn theo MaBacSi
exports.getByMaBacSi = (maBacSi, filter, callback) => {
  // Nếu callback là undefined, filter là callback (tương thích ngược)
  if (typeof filter === 'function') {
    callback = filter;
    filter = null;
  }

  const dateRange = getDateRange(filter);
  let sql = `
    SELECT 
      lh.MaLichHen as id,
      lh.MaBenhNhan as patientId,
      lh.MaBacSi as doctorId,
      DATE_FORMAT(lh.ThoiGianKham, '%Y-%m-%d %H:%i:%s') as appointmentTime,
      lh.TrangThai as status,
      lh.Note as note,
      lh.CreatedAt as createdAt,
      lh.UpdatedAt as updatedAt,
      bn.HoTen as patientName,
      bn.SoDienThoai as patientPhone,
      bs.HoTen as doctorName,
      k.TenKhoa as departmentName,
      bs.MaKhoa as departmentId
    FROM lichhen lh
    LEFT JOIN benhnhan bn ON lh.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN bacsi bs ON lh.MaBacSi = bs.MaBacSi
    LEFT JOIN khoa k ON bs.MaKhoa = k.MaKhoa
    WHERE lh.MaBacSi = ?
  `;

  const params = [maBacSi];
  if (dateRange) {
    sql += ` AND lh.ThoiGianKham >= ? AND lh.ThoiGianKham <= ?`;
    params.push(dateRange.start, dateRange.end);
  }

  sql += ` ORDER BY lh.ThoiGianKham DESC`;

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    // Format datetime cho mỗi kết quả
    const formattedResults = results.map(row => ({
      ...row,
      appointmentTime: formatDateTime(row.appointmentTime)
    }));
    callback(null, formattedResults);
  });
};