// Middleware để xác thực người dùng
// Lấy MaNguoiDung và LoaiNguoiDung từ:
// 1. Request body (POST/PUT requests)
// 2. Query parameters (GET requests)
// 3. Custom headers (x-user-id, x-user-type)
// 4. Cookies (nếu có session)

const authMiddleware = (req, res, next) => {
  let MaNguoiDung = null;
  let LoaiNguoiDung = null;

  // Thứ tự ưu tiên:
  // 1. Headers (highest priority - dành cho token-based auth sau này)
  if (req.headers['x-user-id']) {
    MaNguoiDung = req.headers['x-user-id'];
  }
  if (req.headers['x-user-type']) {
    LoaiNguoiDung = req.headers['x-user-type'];
  }

  // 2. Request body
  if (req.body?.MaNguoiDung) {
    MaNguoiDung = req.body.MaNguoiDung;
  }
  if (req.body?.LoaiNguoiDung) {
    LoaiNguoiDung = req.body.LoaiNguoiDung;
  }

  // 3. Query parameters
  if (req.query?.MaNguoiDung) {
    MaNguoiDung = req.query.MaNguoiDung;
  }
  if (req.query?.LoaiNguoiDung) {
    LoaiNguoiDung = req.query.LoaiNguoiDung;
  }

  // Gắn user info vào request object để các controller có thể truy cập
  req.user = {
    MaNguoiDung: MaNguoiDung,
    LoaiNguoiDung: LoaiNguoiDung
  };

  next();
};

module.exports = authMiddleware;
