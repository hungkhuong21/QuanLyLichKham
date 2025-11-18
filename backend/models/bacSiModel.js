const db = require('../config/db');

// Lấy tất cả bác sĩ
exports.getAll = (callback) => {
  db.query('SELECT * FROM bacsi', callback);
};

// Lấy bác sĩ theo id
exports.getById = (id, callback) => {
  db.query('SELECT * FROM bacsi WHERE MaBacSi = ?', [id], callback);
};

// Thêm bác sĩ mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO bacsi (HoTen, GioiTinh, NgaySinh , MaKhoa, ChuyenMon, SoDienThoai, CCCD, DiaChi , Email, TrangThai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.HoTen,
    data.GioiTinh,
    data.NgaySinh,
    data.MaKhoa,
    data.ChuyenMon,
    data.SoDienThoai,
    data.CCCD,
    data.DiaChi,
    data.Email,
    data.TrangThai || 'Active'
  ], callback);
};

// Cập nhật bác sĩ
exports.update = (id, data, callback) => {
  db.query('SELECT * FROM bacsi WHERE MaBacSi = ?', [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, { affectedRows: 0 });
    const old = results[0];
    const sql = `UPDATE bacsi SET HoTen = ?, GioiTinh = ?, NgaySinh = ?, MaKhoa = ?, ChuyenMon = ?, SoDienThoai = ?, CCCD = ?, DiaChi = ?, Email = ?, TrangThai = ? WHERE MaBacSi = ?`;
    db.query(sql, [
      data.HoTen !== undefined ? data.HoTen : old.HoTen,
      data.GioiTinh !== undefined ? data.GioiTinh : old.GioiTinh,
      data.NgaySinh !== undefined ? data.NgaySinh : old.NgaySinh,
      data.MaKhoa !== undefined ? data.MaKhoa : old.MaKhoa,
      data.ChuyenMon !== undefined ? data.ChuyenMon : old.ChuyenMon,
      data.SoDienThoai !== undefined ? data.SoDienThoai : old.SoDienThoai,
      data.CCCD !== undefined ? data.CCCD : old.CCCD,
      data.DiaChi !== undefined ? data.DiaChi : old.DiaChi,
      data.Email !== undefined ? data.Email : old.Email,
      data.TrangThai !== undefined ? data.TrangThai : old.TrangThai,
      id
    ], callback);
  });
};

// Xóa bác sĩ
exports.delete = (id, callback) => {
  db.query('DELETE FROM bacsi WHERE MaBacSi = ?', [id], callback);
};

// Tổng số bác sĩ còn làm (Active)
exports.countActive = (callback) => {
  db.query('SELECT COUNT(*) AS total FROM bacsi WHERE TrangThai = "Active"', callback);
};

// Tổng số bác sĩ nghỉ phép (Inactive)
exports.countInactive = (callback) => {
  db.query('SELECT COUNT(*) AS total FROM bacsi WHERE TrangThai = "Inactive"', callback);
};

// Tìm kiếm bác sĩ
exports.search = (searchParams, callback) => {
  let sql = 'SELECT * FROM bacsi WHERE 1=1';
  const params = [];

  // Tìm kiếm theo tên
  if (searchParams.HoTen) {
    sql += ' AND HoTen LIKE ?';
    params.push(`%${searchParams.HoTen}%`);
  }

  // Tìm kiếm theo chuyên môn
  if (searchParams.ChuyenMon) {
    sql += ' AND ChuyenMon LIKE ?';
    params.push(`%${searchParams.ChuyenMon}%`);
  }

  // Tìm kiếm theo khoa
  if (searchParams.MaKhoa) {
    sql += ' AND MaKhoa = ?';
    params.push(searchParams.MaKhoa);
  }

  // Tìm kiếm theo trạng thái
  if (searchParams.TrangThai) {
    sql += ' AND TrangThai = ?';
    params.push(searchParams.TrangThai);
  }

  // Tìm kiếm theo số điện thoại
  if (searchParams.SoDienThoai) {
    sql += ' AND SoDienThoai LIKE ?';
    params.push(`%${searchParams.SoDienThoai}%`);
  }

  // Tìm kiếm theo email
  if (searchParams.Email) {
    sql += ' AND Email LIKE ?';
    params.push(`%${searchParams.Email}%`);
  }

  sql += ' ORDER BY MaBacSi DESC';

  db.query(sql, params, callback);
};