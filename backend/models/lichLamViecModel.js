const db = require('../config/db');

// Lấy danh sách lịch làm việc, có thể lọc theo tên, chuyên khoa, ngày
exports.getAll = (filters, callback) => {
  let sql = `SELECT llv.*, b.HoTen AS TenBacSi, b.ChuyenMon AS ChuyenKhoa 
             FROM lichlamviec llv 
             JOIN bacsi b ON llv.MaBacSi = b.MaBacSi 
             WHERE 1=1`;
  const params = [];
  if (filters.tenBacSi) {
    sql += ' AND b.HoTen LIKE ?';
    params.push('%' + filters.tenBacSi + '%');
  }
  if (filters.chuyenKhoa) {
    sql += ' AND b.ChuyenMon = ?';
    params.push(filters.chuyenKhoa);
  }
  if (filters.ngay) {
    sql += ' AND llv.NgayLamViec = ?';
    params.push(filters.ngay);
  }
  sql += ' ORDER BY llv.NgayLamViec ASC, llv.GioBatDau ASC';
  db.query(sql, params, callback);
};

// Lấy lịch làm việc theo id
exports.getById = (id, callback) => {
  const sql = `SELECT llv.*, b.HoTen AS TenBacSi, b.ChuyenMon AS ChuyenKhoa FROM lichlamviec llv JOIN bacsi b ON llv.MaBacSi = b.MaBacSi WHERE llv.MaLich = ?`;
  db.query(sql, [id], callback);
};

// Thêm lịch làm việc mới
exports.create = (data, callback) => {
  const sql = `INSERT INTO lichlamviec (MaBacSi, NgayLamViec, GioBatDau, GioKetThuc, TrangThai) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [
    data.MaBacSi,
    data.NgayLamViec,
    data.GioBatDau,
    data.GioKetThuc,
    data.TrangThai || 'Hoạt động'
  ], callback);
};

// Cập nhật lịch làm việc
exports.update = (id, data, callback) => {
  db.query('SELECT * FROM lichlamviec WHERE MaLich = ?', [id], (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) return callback(null, { affectedRows: 0 });
    const old = results[0];
    const sql = `UPDATE lichlamviec SET MaBacSi = ?, NgayLamViec = ?, GioBatDau = ?, GioKetThuc = ?, TrangThai = ? WHERE MaLich = ?`;
    db.query(sql, [
      data.MaBacSi !== undefined ? data.MaBacSi : old.MaBacSi,
      data.NgayLamViec !== undefined ? data.NgayLamViec : old.NgayLamViec,
      data.GioBatDau !== undefined ? data.GioBatDau : old.GioBatDau,
      data.GioKetThuc !== undefined ? data.GioKetThuc : old.GioKetThuc,
      data.TrangThai !== undefined ? data.TrangThai : old.TrangThai,
      id
    ], callback);
  });
};

// Xóa lịch làm việc
exports.delete = (id, callback) => {
  db.query('DELETE FROM lichlamviec WHERE MaLich = ?', [id], callback);
};

// Kiểm tra trùng lịch làm việc (trùng bác sĩ, ngày và giao nhau thời gian)
exports.checkOverlap = (MaBacSi, NgayLamViec, GioBatDau, GioKetThuc, excludeId, callback) => {
  const sql = `
    SELECT * FROM lichlamviec 
    WHERE MaBacSi = ? 
      AND NgayLamViec = ?
      AND NOT (GioKetThuc <= ? OR GioBatDau >= ?)
      ${excludeId ? 'AND MaLich != ?' : ''}
  `;
  const params = excludeId
    ? [MaBacSi, NgayLamViec, GioBatDau, GioKetThuc, excludeId]
    : [MaBacSi, NgayLamViec, GioBatDau, GioKetThuc];
  db.query(sql, params, callback);
};
