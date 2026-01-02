const db = require('../config/db');

// Lấy tất cả bệnh nhân
exports.getAll = (callback) => {
  db.query('SELECT * FROM benhnhan', callback);
};

// Lấy bệnh nhân theo id
exports.getById = (id, callback) => {
  db.query('SELECT * FROM benhnhan WHERE MaBenhNhan = ?', [id], callback);
};

// Thêm bệnh nhân mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO benhnhan (HoTen, NgaySinh, GioiTinh, SoDienThoai, CMND_CCCD, DiaChi) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.HoTen,
    data.NgaySinh,
    data.GioiTinh,
    data.SoDienThoai,
    data.CMND_CCCD,
    data.DiaChi
  ], callback);
};

// Cập nhật bệnh nhân
exports.update = (id, data, callback) => {
  // Lấy thông tin hiện tại
  db.query('SELECT * FROM benhnhan WHERE MaBenhNhan = ?', [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, { affectedRows: 0 });
    const old = results[0];
    // Chỉ cập nhật trường nào truyền lên, còn lại giữ nguyên
    const sql = `UPDATE benhnhan SET HoTen = ?, NgaySinh = ?, GioiTinh = ?, SoDienThoai = ?, CMND_CCCD = ?, DiaChi = ? WHERE MaBenhNhan = ?`;
    db.query(sql, [
      data.HoTen !== undefined ? data.HoTen : old.HoTen,
      data.NgaySinh !== undefined ? data.NgaySinh : old.NgaySinh,
      data.GioiTinh !== undefined ? data.GioiTinh : old.GioiTinh,
      data.SoDienThoai !== undefined ? data.SoDienThoai : old.SoDienThoai,
      data.CMND_CCCD !== undefined ? data.CMND_CCCD : old.CMND_CCCD,
      data.DiaChi !== undefined ? data.DiaChi : old.DiaChi,
      id
    ], callback);
  });
};

// Xóa bệnh nhân
exports.delete = (id, callback) => {
  db.query('DELETE FROM benhnhan WHERE MaBenhNhan = ?', [id], callback);
};


// Tìm kiếm bệnh nhân
exports.search = (searchParams, callback) => {
  let sql = 'SELECT * FROM benhnhan WHERE 1=1';
  const params = [];

  // Tìm kiếm theo tên
  if (searchParams.HoTen) {
    sql += ' AND HoTen LIKE ?';
    params.push(`%${searchParams.HoTen}%`);
  }

  // Tìm kiếm theo số điện thoại
  if (searchParams.SoDienThoai) {
    sql += ' AND SoDienThoai LIKE ?';
    params.push(`%${searchParams.SoDienThoai}%`);
  }

  // Tìm kiếm theo CMND/CCCD
  if (searchParams.CMND_CCCD) {
    sql += ' AND CMND_CCCD LIKE ?';
    params.push(`%${searchParams.CMND_CCCD}%`);
  }

  // Tìm kiếm theo giới tính
  if (searchParams.GioiTinh) {
    sql += ' AND GioiTinh = ?';
    params.push(searchParams.GioiTinh);
  }

  // Tìm kiếm theo địa chỉ
  if (searchParams.DiaChi) {
    sql += ' AND DiaChi LIKE ?';
    params.push(`%${searchParams.DiaChi}%`);
  }

  sql += ' ORDER BY MaBenhNhan DESC';

  db.query(sql, params, callback);
};

