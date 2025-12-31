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

