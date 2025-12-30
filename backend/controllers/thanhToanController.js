const HoaDon = require('../models/hoaDonModel');
const ThanhToan = require('../models/thanhToanModel');

// Tạo hóa đơn mới
exports.createHoaDon = (req, res) => {
  const { MaBN, TongTien, Thue, GiamGia, TrangThai } = req.body || {};
  
  if (!MaBN || !TongTien) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (MaBN, TongTien)' });
  }
  
  if (TongTien < 0) {
    return res.status(400).json({ error: 'Tổng tiền không được âm' });
  }
  
  const hoaDonData = {
    MaBN,
    TongTien: parseFloat(TongTien),
    Thue: Thue ? parseFloat(Thue) : 0,
    GiamGia: GiamGia ? parseFloat(GiamGia) : 0,
    TrangThai: TrangThai || 'Chưa thanh toán'
  };
  
  HoaDon.create(hoaDonData, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi tạo hóa đơn', details: err });
    
    const MaHD = result.insertId;
    const tongTienSauThue = HoaDon.calculateTotal(hoaDonData.TongTien, hoaDonData.Thue, hoaDonData.GiamGia);
    
    res.json({
      message: 'Tạo hóa đơn thành công',
      MaHD: MaHD,
      TongTien: hoaDonData.TongTien,
      Thue: hoaDonData.Thue,
      GiamGia: hoaDonData.GiamGia,
      TongTienSauThue: tongTienSauThue
    });
  });
};

// Lấy tất cả hóa đơn
exports.getAllHoaDon = (req, res) => {
  HoaDon.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách hóa đơn' });
    res.json(results);
  });
};

// Lấy hóa đơn theo id
exports.getHoaDonById = (req, res) => {
  HoaDon.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    res.json(results[0]);
  });
};

// Lấy hóa đơn theo MaBN
exports.getHoaDonByMaBN = (req, res) => {
  HoaDon.getByMaBN(req.params.MaBN, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    res.json(results);
  });
};

// Cập nhật hóa đơn
exports.updateHoaDon = (req, res) => {
  HoaDon.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật hóa đơn' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
    }
    res.json({ message: 'Cập nhật hóa đơn thành công' });
  });
};

// Thanh toán hóa đơn
exports.thanhToanHoaDon = (req, res) => {
  const { MaHD, PhuongThuc, SoTien } = req.body || {};
  
  if (!MaHD || !PhuongThuc || !SoTien) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (MaHD, PhuongThuc, SoTien)' });
  }
  
  // Kiểm tra phương thức thanh toán hợp lệ
  const phuongThucHopLe = ['Tiền mặt', 'Thẻ ngân hàng', 'Ví điện tử'];
  if (!phuongThucHopLe.includes(PhuongThuc)) {
    return res.status(400).json({ 
      error: 'Phương thức thanh toán không hợp lệ',
      phuongThucHopLe: phuongThucHopLe
    });
  }
  
  // Lấy thông tin hóa đơn
  HoaDon.getById(MaHD, (err, hoaDonResults) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy thông tin hóa đơn', details: err });
    if (!hoaDonResults || hoaDonResults.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hóa đơn' });
    }
    
    const hoaDon = hoaDonResults[0];
    
    // Kiểm tra hóa đơn đã thanh toán chưa
    if (hoaDon.TrangThai === 'Đã thanh toán') {
      return res.status(400).json({ error: 'Hóa đơn đã được thanh toán' });
    }
    
    // Tính tổng tiền cần thanh toán
    const tongTienSauThue = HoaDon.calculateTotal(
      parseFloat(hoaDon.TongTien),
      parseFloat(hoaDon.Thue || 0),
      parseFloat(hoaDon.GiamGia || 0)
    );
    
    // Kiểm tra số tiền thanh toán
    if (parseFloat(SoTien) < tongTienSauThue) {
      return res.status(400).json({ 
        error: 'Số tiền thanh toán không đủ',
        tongTienCanThanhToan: tongTienSauThue,
        soTienThanhToan: parseFloat(SoTien)
      });
    }
    
    // Tạo thanh toán
    const thanhToanData = {
      MaHD,
      PhuongThuc,
      SoTien: parseFloat(SoTien),
      TrangThai: 'Thành công'
    };
    
    ThanhToan.create(thanhToanData, (err2, thanhToanResult) => {
      if (err2) return res.status(500).json({ error: 'Lỗi tạo thanh toán', details: err2 });
      
      // Cập nhật trạng thái hóa đơn thành "Đã thanh toán"
      HoaDon.updateTrangThai(MaHD, 'Đã thanh toán', (err3) => {
        if (err3) {
          // Nếu lỗi cập nhật trạng thái, vẫn trả về thành công cho thanh toán
          return res.json({
            message: 'Thanh toán thành công nhưng không thể cập nhật trạng thái hóa đơn',
            MaTT: thanhToanResult.insertId,
            warning: 'Vui lòng cập nhật trạng thái hóa đơn thủ công'
          });
        }
        
        res.json({
          message: 'Thanh toán thành công',
          MaTT: thanhToanResult.insertId,
          MaHD: MaHD,
          TongTien: hoaDon.TongTien,
          TongTienSauThue: tongTienSauThue,
          SoTienThanhToan: parseFloat(SoTien),
          TienThua: parseFloat(SoTien) - tongTienSauThue,
          PhuongThuc: PhuongThuc
        });
      });
    });
  });
};

// Lấy tất cả thanh toán
exports.getAllThanhToan = (req, res) => {
  ThanhToan.getAll((err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy danh sách thanh toán' });
    res.json(results);
  });
};

// Lấy thanh toán theo id
exports.getThanhToanById = (req, res) => {
  ThanhToan.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    res.json(results[0]);
  });
};

// Lấy thanh toán theo MaHD
exports.getThanhToanByMaHD = (req, res) => {
  ThanhToan.getByMaHD(req.params.MaHD, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    res.json(results);
  });
};

// Lấy thanh toán theo MaBN
exports.getThanhToanByMaBN = (req, res) => {
  ThanhToan.getByMaBN(req.params.MaBN, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    res.json(results);
  });
};

// Cập nhật thanh toán
exports.updateThanhToan = (req, res) => {
  ThanhToan.update(req.params.id, req.body, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi cập nhật thanh toán' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }
    res.json({ message: 'Cập nhật thanh toán thành công' });
  });
};

// Xóa thanh toán
exports.deleteThanhToan = (req, res) => {
  ThanhToan.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: 'Lỗi xóa thanh toán' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }
    res.json({ message: 'Xóa thanh toán thành công' });
  });
};

