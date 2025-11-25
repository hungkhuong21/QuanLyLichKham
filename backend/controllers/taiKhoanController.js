const TaiKhoan = require('../models/taiKhoanModel');
const db = require('../config/db');
const crypto = require('crypto');

// Lấy tất cả tài khoản
exports.getAllTaiKhoan = (req, res) => {
  TaiKhoan.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách tài khoản' });
    res.json(results);
  });
};

// Lấy tài khoản theo mã
exports.getTaiKhoanById = (req, res) => {
  TaiKhoan.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(results[0]);
  });
};

// Hàm kiểm tra email hợp lệ
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Regex pattern để kiểm tra email hợp lệ
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// Thêm mới tài khoản
exports.createTaiKhoan = (req, res) => {
  const { TenDangNhap, MatKhau, VaiTroID, LoaiNguoiDung, MaNguoiDung } = req.body || {};
  
  // Kiểm tra các trường bắt buộc
  if (!TenDangNhap) {
    return res.status(400).json({ error: 'Vui lòng nhập email' });
  }
  
  if (!MatKhau) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu' });
  }
  
  // Kiểm tra email hợp lệ
  if (!isValidEmail(TenDangNhap)) {
    return res.status(400).json({ error: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: example@gmail.com)' });
  }
  
  // Kiểm tra độ dài mật khẩu (tối thiểu 6 ký tự)
  if (MatKhau.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' });
  }
  
  // Kiểm tra email đã tồn tại chưa
  TaiKhoan.findByTenDangNhap(TenDangNhap.trim(), (err, results) => {
    if (err) {
      console.error('Lỗi kiểm tra email:', err);
      return res.status(500).json({ error: 'Lỗi kiểm tra email' });
    }
    
    if (results && results.length > 0) {
      return res.status(409).json({ error: 'Email này đã được sử dụng. Vui lòng chọn email khác' });
    }
    
    // Nếu email chưa tồn tại, tạo tài khoản mới
    const data = {
      TenDangNhap: TenDangNhap.trim(),
      MatKhau,
      VaiTroID,
      LoaiNguoiDung,
      MaNguoiDung
    };
    
    TaiKhoan.create(data, (err2, result) => {
      if (err2) {
        console.error('Lỗi tạo tài khoản:', err2);
        // Kiểm tra lỗi duplicate key từ database
        if (err2.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Email này đã được sử dụng' });
        }
        return res.status(500).json({ error: 'Lỗi tạo tài khoản', details: err2.message });
      }
      res.json({ message: 'Tạo tài khoản thành công', MaTK: result.insertId });
    });
  });
};

// Đăng nhập tài khoản
exports.loginTaiKhoan = (req, res) => {
  const { TenDangNhap, MatKhau } = req.body || {};
  if (!TenDangNhap || !MatKhau) return res.status(400).json({ error: 'Thiếu tham số đăng nhập' });
  TaiKhoan.login(TenDangNhap, MatKhau, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (results.length === 0)
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    res.json({ message: 'Đăng nhập thành công', user: results[0] });
  });
};

// Cập nhật thông tin tài khoản
exports.updateTaiKhoan = (req, res) => {
  TaiKhoan.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật' });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// Xóa tài khoản
exports.deleteTaiKhoan = (req, res) => {
  TaiKhoan.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xóa' });
    res.json({ message: 'Đã xóa tài khoản' });
  });
};

// Tạo mã OTP gồm 6 chữ số
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Hàm chuyển đổi kiểu ngày sang định dạng MySQL datetime
function toMySQLDate(dt) {
  return new Date(dt).toISOString().slice(0, 19).replace('T', ' ');
}

// Tạo transporter gửi email nếu có thông tin SMTP
function getTransporter() {
  // Chỉ require nodemailer khi cần. Nếu chưa cài thì trả về null để xử lý fallback.
  if (!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) return null;
  try {
    const nodemailer = require('nodemailer');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } catch (e) {
  // nodemailer chưa được cài đặt
  console.warn('nodemailer không được cài đặt; sẽ trả OTP trong response (dev).');
    return null;
  }
}

// API: Yêu cầu đặt lại mật khẩu (tạo OTP)
exports.requestPasswordReset = (req, res) => {
  const { TenDangNhap } = req.body || {};
  if (!TenDangNhap) return res.status(400).json({ error: 'Thiếu TenDangNhap' });

  // Tìm tài khoản theo tên đăng nhập
  TaiKhoan.findByTenDangNhap(TenDangNhap, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

    const account = results[0];
    const otp = generateOtp();
    const ttlMinutes = process.env.OTP_TTL_MINUTES ? parseInt(process.env.OTP_TTL_MINUTES, 10) : 1;

  // Lưu OTP, dùng thời gian DB để tránh lệch múi giờ
    TaiKhoan.saveOtp(account.MaTK, otp, ttlMinutes, (err2, result2) => {
      if (err2) return res.status(500).json({ error: 'Lỗi lưu OTP' });

  // Nếu có transporter thì gửi email, nếu không thì trả OTP về response (dev)
      const transporter = getTransporter();
      if (transporter) {
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: account.TenDangNhap,
          subject: 'Yêu cầu đặt lại mật khẩu',
          text: `Mã OTP của bạn là: ${otp}. Hết hạn trong ${ttlMinutes} phút.`
        };
        transporter.sendMail(mailOptions, (mailErr, info) => {
          if (mailErr) {
            // Không gửi được email nhưng OTP đã lưu
            return res.status(200).json({ message: 'OTP đã tạo nhưng gửi mail thất bại', info: mailErr.message });
          }
          return res.json({ message: 'OTP đã gửi qua email' });
        });
      } else {
        // Không có SMTP, không trả OTP về response, chỉ báo lỗi
        return res.status(500).json({ error: 'Không gửi được mã OTP. Vui lòng liên hệ quản trị viên.' });
      }
    });
  });
};

// API: Xác thực OTP
exports.verifyOtp = (req, res) => {
  const { TenDangNhap, otp } = req.body || {};
  if (!TenDangNhap || !otp) return res.status(400).json({ error: 'Thiếu tham số' });

  TaiKhoan.findByTenDangNhap(TenDangNhap, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    const account = results[0];

    TaiKhoan.findValidOtp(account.MaTK, otp, (err2, otps) => {
      if (err2) return res.status(500).json({ error: 'Lỗi truy vấn OTP' });
      if (!otps || otps.length === 0) return res.status(400).json({ valid: false, message: 'OTP không hợp lệ hoặc đã hết hạn' });
      return res.json({ valid: true });
    });
  });
};

// API: Đặt lại mật khẩu bằng OTP
exports.resetPassword = (req, res) => {
  const { TenDangNhap, otp, MatKhau } = req.body || {};
  if (!TenDangNhap || !otp || !MatKhau) {
    return res.status(400).json({ error: 'Thiếu tham số' });
  }

  TaiKhoan.findByTenDangNhap(TenDangNhap, (err, users) => {
    if (err) return res.status(500).json({ error: 'Lỗi server' });
    if (!users || users.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

    const user = users[0];
    TaiKhoan.findValidOtp(user.MaTK, otp, (err, otps) => {
      if (err) return res.status(500).json({ error: 'Lỗi server' });
      if (!otps || otps.length === 0) return res.status(400).json({ error: 'OTP không hợp lệ hoặc đã hết hạn' });

      const otpRow = otps[0];
  // Lưu mật khẩu mới trực tiếp (không mã hóa)
      TaiKhoan.updatePasswordPlain(user.MaTK, MatKhau, (err2) => {
        if (err2) return res.status(500).json({ error: 'Không cập nhật được mật khẩu' });

        TaiKhoan.markOtpUsed(otpRow.MaXacThuc, (err3) => {
          // Dù markOtpUsed lỗi hay không thì vẫn trả về thành công cho flow reset
          return res.json({ message: 'Đổi mật khẩu thành công' });
        });
      });
    });
  });
};
