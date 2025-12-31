const db = require('../config/db');

// Tạo tiếp nhận mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO tiepnhan (MaBenhNhan, MaBacSi, MaKhoa, MaLichHen, MaTrangThai, NgayTiepNhan, GhiChu) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.MaBenhNhan,
    data.MaBacSi,
    data.MaKhoa,
    data.MaLichHen || null,
    data.MaTrangThai,
    data.NgayTiepNhan || new Date(),
    data.GhiChu || null
  ], callback);
};

// Lấy tiếp nhận theo MaLichHen
exports.getByMaLichHen = (MaLichHen, callback) => {
  const sql = `SELECT tn.*, tt.TenTrangThai 
               FROM tiepnhan tn 
               LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai 
               WHERE tn.MaLichHen = ?`;
  db.query(sql, [MaLichHen], callback);
};

// Tìm kiếm tiếp nhận theo mã lịch hẹn, số điện thoại, cccd
exports.search = (searchParams, callback) => {
  const { maLichHen, soDienThoai, cccd } = searchParams;
  
  let sql = `
    SELECT 
      tn.MaTiepNhan,
      tn.MaBenhNhan,
      tn.MaBacSi,
      tn.MaKhoa,
      tn.MaLichHen,
      tn.MaTrangThai,
      tn.NgayTiepNhan,
      tn.GhiChu,
      tt.TenTrangThai,
      bn.HoTen as patientName,
      bn.SoDienThoai as patientPhone,
      bn.CMND_CCCD as patientCCCD,
      bs.HoTen as doctorName,
      k.TenKhoa as departmentName,
      lh.ThoiGianKham as appointmentTime
    FROM tiepnhan tn
    LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai
    LEFT JOIN benhnhan bn ON tn.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN bacsi bs ON tn.MaBacSi = bs.MaBacSi
    LEFT JOIN khoa k ON tn.MaKhoa = k.MaKhoa
    LEFT JOIN lichhen lh ON tn.MaLichHen = lh.MaLichHen
    WHERE 1=1
  `;
  
  const params = [];
  
  if (maLichHen) {
    sql += ` AND tn.MaLichHen = ?`;
    params.push(maLichHen);
  }
  
  if (soDienThoai) {
    sql += ` AND bn.SoDienThoai LIKE ?`;
    params.push(`%${soDienThoai}%`);
  }
  
  if (cccd) {
    sql += ` AND bn.CMND_CCCD LIKE ?`;
    params.push(`%${cccd}%`);
  }
  
  sql += ` ORDER BY tn.NgayTiepNhan DESC`;
  
  db.query(sql, params, callback);
};

// Tìm kiếm danh sách bệnh nhân trong ngày (mã lịch hẹn, tên, sđt)
exports.searchByDate = (date, searchParams, page = 1, limit = 10, callback) => {
  const { maLichHen, ten, soDienThoai } = searchParams;
  const offset = (page - 1) * limit;
  
  // Xây dựng điều kiện WHERE
  let whereConditions = `(DATE(tn.NgayTiepNhan) = ? OR DATE(lh.ThoiGianKham) = ?)`;
  const params = [date, date];
  const countParams = [date, date];
  
  if (maLichHen) {
    whereConditions += ` AND tn.MaLichHen = ?`;
    params.push(maLichHen);
    countParams.push(maLichHen);
  }
  
  if (ten) {
    whereConditions += ` AND bn.HoTen LIKE ?`;
    params.push(`%${ten}%`);
    countParams.push(`%${ten}%`);
  }
  
  if (soDienThoai) {
    whereConditions += ` AND bn.SoDienThoai LIKE ?`;
    params.push(`%${soDienThoai}%`);
    countParams.push(`%${soDienThoai}%`);
  }
  
  // Query để đếm tổng số
  const countSql = `
    SELECT COUNT(*) as total
    FROM tiepnhan tn
    LEFT JOIN benhnhan bn ON tn.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN lichhen lh ON tn.MaLichHen = lh.MaLichHen
    WHERE ${whereConditions}
  `;
  
  // Query để lấy dữ liệu
  const dataSql = `
    SELECT 
      tn.MaTiepNhan,
      tn.MaBenhNhan,
      tn.MaBacSi,
      tn.MaKhoa,
      tn.MaLichHen,
      tn.MaTrangThai,
      tn.NgayTiepNhan,
      tn.GhiChu,
      tt.TenTrangThai,
      bn.HoTen as patientName,
      bn.SoDienThoai as patientPhone,
      bn.CMND_CCCD as patientCCCD,
      bn.NgaySinh as patientBirthday,
      bn.GioiTinh as patientGender,
      bn.DiaChi as patientAddress,
      bs.HoTen as doctorName,
      k.TenKhoa as departmentName,
      lh.ThoiGianKham as appointmentTime,
      lh.TrangThai as appointmentStatus
    FROM tiepnhan tn
    LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai
    LEFT JOIN benhnhan bn ON tn.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN bacsi bs ON tn.MaBacSi = bs.MaBacSi
    LEFT JOIN khoa k ON tn.MaKhoa = k.MaKhoa
    LEFT JOIN lichhen lh ON tn.MaLichHen = lh.MaLichHen
    WHERE ${whereConditions}
    ORDER BY tn.NgayTiepNhan DESC, lh.ThoiGianKham DESC
    LIMIT ? OFFSET ?
  `;
  
  // Đếm tổng số
  db.query(countSql, countParams, (err, countResults) => {
    if (err) return callback(err);
    const total = countResults[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Lấy dữ liệu
    params.push(limit, offset);
    db.query(dataSql, params, (err2, results) => {
      if (err2) return callback(err2);
      callback(null, {
        data: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: totalPages
        }
      });
    });
  });
};

// Lấy danh sách bệnh nhân theo ngày (có phân trang)
exports.getByDate = (date, page = 1, limit = 10, callback) => {
  const offset = (page - 1) * limit;
  
  // Tính toán date range cho ngày đó
  const startDate = `${date} 00:00:00`;
  const endDate = `${date} 23:59:59`;
  
  // Query để đếm tổng số
  const countSql = `
    SELECT COUNT(*) as total
    FROM tiepnhan tn
    LEFT JOIN benhnhan bn ON tn.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN lichhen lh ON tn.MaLichHen = lh.MaLichHen
    WHERE DATE(tn.NgayTiepNhan) = ? OR DATE(lh.ThoiGianKham) = ?
  `;
  
  // Query để lấy dữ liệu
  const dataSql = `
    SELECT 
      tn.MaTiepNhan,
      tn.MaBenhNhan,
      tn.MaBacSi,
      tn.MaKhoa,
      tn.MaLichHen,
      tn.MaTrangThai,
      tn.NgayTiepNhan,
      tn.GhiChu,
      tt.TenTrangThai,
      bn.HoTen as patientName,
      bn.SoDienThoai as patientPhone,
      bn.CMND_CCCD as patientCCCD,
      bn.NgaySinh as patientBirthday,
      bn.GioiTinh as patientGender,
      bn.DiaChi as patientAddress,
      bs.HoTen as doctorName,
      k.TenKhoa as departmentName,
      lh.ThoiGianKham as appointmentTime,
      lh.TrangThai as appointmentStatus
    FROM tiepnhan tn
    LEFT JOIN trangthaitiepnhan tt ON tn.MaTrangThai = tt.MaTrangThai
    LEFT JOIN benhnhan bn ON tn.MaBenhNhan = bn.MaBenhNhan
    LEFT JOIN bacsi bs ON tn.MaBacSi = bs.MaBacSi
    LEFT JOIN khoa k ON tn.MaKhoa = k.MaKhoa
    LEFT JOIN lichhen lh ON tn.MaLichHen = lh.MaLichHen
    WHERE DATE(tn.NgayTiepNhan) = ? OR DATE(lh.ThoiGianKham) = ?
    ORDER BY tn.NgayTiepNhan DESC, lh.ThoiGianKham DESC
    LIMIT ? OFFSET ?
  `;
  
  // Đếm tổng số
  db.query(countSql, [date, date], (err, countResults) => {
    if (err) return callback(err);
    const total = countResults[0].total;
    const totalPages = Math.ceil(total / limit);
    
    // Lấy dữ liệu
    db.query(dataSql, [date, date, limit, offset], (err2, results) => {
      if (err2) return callback(err2);
      callback(null, {
        data: results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: totalPages
        }
      });
    });
  });
};

