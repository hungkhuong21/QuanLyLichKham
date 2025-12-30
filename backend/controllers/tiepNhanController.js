const TiepNhan = require('../models/tiepNhanModel');
const LichHen = require('../models/lichHenModel');
const TrangThaiTiepNhan = require('../models/trangThaiTiepNhanModel');
const BacSi = require('../models/bacSiModel');

// Helper function: Lấy MaTrangThai từ tên trạng thái
const getMaTrangThai = (tenTrangThai, callback) => {
  TrangThaiTiepNhan.getByTen(tenTrangThai, (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) {
      // Nếu không tìm thấy, tạo mới
      TrangThaiTiepNhan.create({ TenTrangThai: tenTrangThai }, (err2, result) => {
        if (err2) return callback(err2);
        callback(null, result.insertId);
      });
    } else {
      callback(null, results[0].MaTrangThai);
    }
  });
};

// Tiếp nhận theo lịch (từ lịch hẹn đã có)
exports.tiepNhanTheoLich = (req, res) => {
  const { MaLichHen, GhiChu } = req.body;

  if (!MaLichHen) {
    return res.status(400).json({ error: 'Thiếu mã lịch hẹn' });
  }

  // Lấy thông tin lịch hẹn
  LichHen.getById(MaLichHen, (err, lichHenResults) => {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({ error: 'Lỗi lấy thông tin lịch hẹn', details: err });
    }

    if (!lichHenResults || lichHenResults.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    }

    const lichHen = lichHenResults[0];

    // Kiểm tra xem đã có tiếp nhận chưa
    TiepNhan.getByMaLichHen(MaLichHen, (err2, tiepNhanResults) => {
      if (err2) {
        console.error('[ERROR] Database error:', err2);
        return res.status(500).json({ error: 'Lỗi kiểm tra tiếp nhận', details: err2 });
      }

      // Lấy thông tin bác sĩ để lấy MaKhoa
      BacSi.getById(lichHen.MaBacSi, (err3, bacSiResults) => {
        if (err3) {
          console.error('[ERROR] Database error:', err3);
          return res.status(500).json({ error: 'Lỗi lấy thông tin bác sĩ', details: err3 });
        }

        if (!bacSiResults || bacSiResults.length === 0) {
          return res.status(404).json({ error: 'Không tìm thấy bác sĩ' });
        }

        const maKhoa = bacSiResults[0].MaKhoa;

        // Lấy MaTrangThai cho "Đã tiếp nhận"
        getMaTrangThai('Đã tiếp nhận', (err4, MaTrangThai) => {
          if (err4) {
            console.error('[ERROR] Database error:', err4);
            return res.status(500).json({ error: 'Lỗi lấy trạng thái tiếp nhận', details: err4 });
          }

          if (tiepNhanResults && tiepNhanResults.length > 0) {
            // Cập nhật tiếp nhận hiện có
            TiepNhan.updateByMaLichHen(MaLichHen, { MaTrangThai, GhiChu: GhiChu || null }, (err5) => {
              if (err5) {
                console.error('[ERROR] Database error:', err5);
                return res.status(500).json({ error: 'Lỗi cập nhật tiếp nhận', details: err5 });
              }
              return res.json({ message: 'Cập nhật tiếp nhận thành công' });
            });
          } else {
            // Tạo mới tiếp nhận
            const tiepNhanData = {
              MaBenhNhan: lichHen.MaBenhNhan,
              MaBacSi: lichHen.MaBacSi,
              MaKhoa: maKhoa,
              MaLichHen,
              MaTrangThai,
              GhiChu: GhiChu || null
            };

            TiepNhan.create(tiepNhanData, (err5) => {
              if (err5) {
                console.error('[ERROR] Database error:', err5);
                return res.status(500).json({ error: 'Lỗi tạo tiếp nhận', details: err5 });
              }
              return res.json({ message: 'Tiếp nhận theo lịch thành công' });
            });
          }
        });
      });
    });
  });
};

// Tìm kiếm theo mã lịch hẹn, số điện thoại, cccd
exports.searchTiepNhan = (req, res) => {
  const { maLichHen, soDienThoai, cccd } = req.query;

  // Kiểm tra ít nhất một tham số tìm kiếm
  if (!maLichHen && !soDienThoai && !cccd) {
    return res.status(400).json({
      error: 'Vui lòng cung cấp ít nhất một tham số tìm kiếm (maLichHen, soDienThoai hoặc cccd)'
    });
  }

  const searchParams = {
    maLichHen: maLichHen ? parseInt(maLichHen) : null,
    soDienThoai: soDienThoai || null,
    cccd: cccd || null
  };

  // Kiểm tra số hợp lệ
  if (searchParams.maLichHen && isNaN(searchParams.maLichHen)) {
    return res.status(400).json({ error: 'maLichHen không hợp lệ' });
  }

  TiepNhan.search(searchParams, (err, results) => {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({ error: 'Lỗi tìm kiếm tiếp nhận', details: err });
    }
    console.log('[SUCCESS] Found', results.length, 'reception records');
    res.json(results);
  });
};

// Tìm kiếm danh sách bệnh nhân trong ngày bằng mã lịch hẹn, tên, sđt (có phân trang)
exports.searchDanhSachBenhNhanTrongNgay = (req, res) => {
  const { date, maLichHen, ten, soDienThoai, page = 1, limit = 10 } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Thiếu tham số date (format: YYYY-MM-DD)' });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Định dạng date không hợp lệ (phải là YYYY-MM-DD)' });
  }

  // Kiểm tra ít nhất một tham số tìm kiếm
  if (!maLichHen && !ten && !soDienThoai) {
    return res.status(400).json({
      error: 'Vui lòng cung cấp ít nhất một tham số tìm kiếm (maLichHen, ten hoặc soDienThoai)'
    });
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: 'page phải là số nguyên dương' });
  }

  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ error: 'limit phải là số nguyên dương' });
  }

  const searchParams = {
    maLichHen: maLichHen ? parseInt(maLichHen) : null,
    ten: ten || null,
    soDienThoai: soDienThoai || null
  };

  // Kiểm tra số hợp lệ
  if (searchParams.maLichHen && isNaN(searchParams.maLichHen)) {
    return res.status(400).json({ error: 'maLichHen không hợp lệ' });
  }

  TiepNhan.searchByDate(date, searchParams, pageNum, limitNum, (err, result) => {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({ error: 'Lỗi tìm kiếm danh sách bệnh nhân', details: err });
    }
    res.json(result);
  });
};

// Xem danh sách bệnh nhân theo ngày (có phân trang)
exports.getDanhSachBenhNhanTheoNgay = (req, res) => {
  const { date, page = 1, limit = 10 } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Thiếu tham số date (format: YYYY-MM-DD)' });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Định dạng date không hợp lệ (phải là YYYY-MM-DD)' });
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: 'page phải là số nguyên dương' });
  }

  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ error: 'limit phải là số nguyên dương' });
  }

  TiepNhan.getByDate(date, pageNum, limitNum, (err, result) => {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({ error: 'Lỗi lấy danh sách bệnh nhân', details: err });
    }
    res.json(result);
  });
};

