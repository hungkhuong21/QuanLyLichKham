const db = require('../config/db');

// Lấy tất cả tài khoản
exports.getAll = (callback) => {
  const sql = 'SELECT * FROM TaiKhoan';
  db.query(sql, callback);
};

// Lấy tài khoản theo mã
exports.getById = (id, callback) => {
  const sql = 'SELECT * FROM TaiKhoan WHERE MaTK = ?';
  db.query(sql, [id], callback);
};

// Thêm mới tài khoản
exports.create = (data, callback) => {
  const sql = `
    INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTroID, LoaiNguoiDung, MaNguoiDung)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [
    data.TenDangNhap,
    data.MatKhau,
    data.VaiTroID,
    data.LoaiNguoiDung,
    data.MaNguoiDung
  ], callback);
};

// Đăng nhập tài khoản
exports.login = (username, password, callback) => {
  const sql = 'SELECT * FROM TaiKhoan WHERE TenDangNhap = ? AND MatKhau = ?';
  db.query(sql, [username, password], callback);
};

// Cập nhật thông tin tài khoản
exports.update = (id, data, callback) => {
  const sql = `
    UPDATE TaiKhoan 
    SET MatKhau = ?, TrangThai = ?, NgayCapNhat = NOW() 
    WHERE MaTK = ?
  `;
  db.query(sql, [data.MatKhau, data.TrangThai, id], callback);
};

// Xóa tài khoản
exports.delete = (id, callback) => {
  const sql = 'DELETE FROM TaiKhoan WHERE MaTK = ?';
  db.query(sql, [id], callback);
};

// Tìm tài khoản theo tên đăng nhập (email/username)
exports.findByTenDangNhap = (tenDangNhap, callback) => {
  const sql = 'SELECT * FROM TaiKhoan WHERE TenDangNhap = ? LIMIT 1';
  db.query(sql, [tenDangNhap], callback);
};

// Lưu OTP vào bảng xacthuc để đặt lại mật khẩu
// Thời hạn OTP dùng thời gian DB để tránh lệch múi giờ
// ttlMinutes: số phút hết hạn OTP (mặc định 1)
exports.saveOtp = (maTK, otp, ttlMinutes, callback) => {
  if (typeof ttlMinutes === 'function') {
    callback = ttlMinutes;
    ttlMinutes = 1;
  }
  ttlMinutes = ttlMinutes || 1;
  // Note: INTERVAL requires a literal number in SQL, so we build the query string safely with the integer.
  const minutes = parseInt(ttlMinutes, 10) || 1;
  const sql = `INSERT INTO xacthuc (MaTK, Loai, MaOTP, HanSuDung, DaSuDung) VALUES (?, 'password_reset', ?, DATE_ADD(NOW(), INTERVAL ${minutes} MINUTE), 0)`;
  db.query(sql, [maTK, otp], callback);
};

// Tìm OTP hợp lệ (chưa dùng, chưa hết hạn)
exports.findValidOtp = (maTK, otp, callback) => {
  const sql = `SELECT * FROM xacthuc WHERE MaTK = ? AND Loai = 'password_reset' AND MaOTP = ? AND DaSuDung = 0 AND HanSuDung >= NOW() ORDER BY MaXacThuc DESC LIMIT 1`;
  db.query(sql, [maTK, otp], callback);
};

// Đánh dấu OTP đã sử dụng
exports.markOtpUsed = (maXacThuc, callback) => {
  const sql = 'UPDATE xacthuc SET DaSuDung = 1 WHERE MaXacThuc = ?';
  db.query(sql, [maXacThuc], callback);
};

// Cập nhật mật khẩu mới (không mã hóa)
exports.updatePasswordPlain = (maTK, plainPassword, callback) => {
  const sql = 'UPDATE TaiKhoan SET MatKhau = ?, NgayCapNhat = NOW() WHERE MaTK = ?';
  db.query(sql, [plainPassword, maTK], callback);
};
