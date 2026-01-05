const BacSi = require('../models/bacSiModel');

// Lấy tất cả bác sĩ
exports.getAllBacSi = (req, res) => {
  BacSi.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách bác sĩ' });
    res.json(results);
  });
};

// Lấy bác sĩ theo id
exports.getBacSiById = (req, res) => {
  BacSi.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    res.json(results[0]);
  });
};

// Thêm bác sĩ mới
exports.createBacSi = (req, res) => {
  const data = req.body;
  if (!data.HoTen || !data.MaKhoa) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  BacSi.create(data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi tạo bác sĩ', details: err });
    res.json({ message: 'Thêm bác sĩ thành công', MaBacSi: result.insertId });
  });
};

// Cập nhật bác sĩ
exports.updateBacSi = (req, res) => {
  const data = req.body;
  BacSi.update(req.params.id, data, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật bác sĩ', details: err });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// Xóa bác sĩ
exports.deleteBacSi = (req, res) => {
  BacSi.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xóa bác sĩ', details: err });
    res.json({ message: 'Đã xóa bác sĩ' });
  });
};

// Tổng số bác sĩ còn làm
exports.getTotalActive = (req, res) => {
  BacSi.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    const activeList = results.filter(row => row.TrangThai === 'Active');
    res.json({
      totalActive: activeList.length,
      list: activeList.map(row => ({
        MaBacSi: row.MaBacSi,
        HoTen: row.HoTen,
        GioiTinh: row.GioiTinh,
        NgaySinh: row.NgaySinh,
        MaKhoa: row.MaKhoa,
        ChuyenMon: row.ChuyenMon,
        SoDienThoai: row.SoDienThoai,
        CCCD: row.CCCD,
        DiaCHi: row.DiaChi,
        Email: row.Email,
        TrangThai: row.TrangThai
      }))
    });
  });
};

// Tổng số bác sĩ nghỉ phép
exports.getTotalInactive = (req, res) => {
  BacSi.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    const inactiveList = results.filter(row => row.TrangThai === 'Inactive');
    res.json({
      totalInactive: inactiveList.length,
      list: inactiveList.map(row => ({
        MaBacSi: row.MaBacSi,
        HoTen: row.HoTen,
        GioiTinh: row.GioiTinh,
        NgaySinh: row.NgaySinh,
        MaKhoa: row.MaKhoa,
        ChuyenMon: row.ChuyenMon,
        SoDienThoai: row.SoDienThoai,
        CCCD: row.CCCD,
        DiaCHi: row.DiaChi,
        Email: row.Email,
        TrangThai: row.TrangThai
      }))
    });
  });
};

// Tìm kiếm bác sĩ
exports.searchBacSi = (req, res) => {
  const searchParams = {
    HoTen: req.query.HoTen || req.query.name,
    ChuyenMon: req.query.ChuyenMon || req.query.specialty,
    MaKhoa: req.query.MaKhoa || req.query.departmentId,
    TrangThai: req.query.TrangThai || req.query.status,
    SoDienThoai: req.query.SoDienThoai || req.query.phoneNumber || req.query.phone,
    Email: req.query.Email || req.query.email
  };

  // Loại bỏ các tham số rỗng
  Object.keys(searchParams).forEach(key => {
    if (!searchParams[key]) {
      delete searchParams[key];
    }
  });

  // Chuyển đổi MaKhoa sang số nếu có
  if (searchParams.MaKhoa) {
    searchParams.MaKhoa = parseInt(searchParams.MaKhoa);
    if (isNaN(searchParams.MaKhoa)) {
      delete searchParams.MaKhoa;
    }
  }

  BacSi.search(searchParams, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi tìm kiếm bác sĩ', details: err });
    res.json(results);
  });
};

