const TiepNhanModel = require('../models/tiepNhanModel');
const LichHen = require('../models/lichHenModel');
const TrangThaiTiepNhan = require('../models/trangThaiTiepNhanModel');
const BacSi = require('../models/bacSiModel');

// Helper function: Lấy MaTrangThai từ tên trạng thái
const getMaTrangThai = (tenTrangThai, callback) => {
  TrangThaiTiepNhan.getByTen(tenTrangThai, (err, results) => {
    if (err) return callback(err);
    if (!results || results.length === 0) {
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
  const { MaLichHen } = req.body;
  
  if (!MaLichHen) {
    return res.status(400).json({ error: 'Thiếu mã lịch hẹn' });
  }
  
  // Lấy thông tin lịch hẹn
  LichHen.getById(MaLichHen, (err, lichHenResults) => {
    if (err) return res.status(500).json({ error: 'Lỗi lấy thông tin lịch hẹn', details: err });
    if (!lichHenResults || lichHenResults.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    }
    
    const lichHen = lichHenResults[0];
    
    // Kiểm tra xem đã có tiếp nhận chưa
    TiepNhanModel.getByMaLichHen(MaLichHen, (err2, tiepNhanResults) => {
      if (err2) return res.status(500).json({ error: 'Lỗi kiểm tra tiếp nhận', details: err2 });
      
      if (tiepNhanResults && tiepNhanResults.length > 0) {
        return res.status(409).json({ error: 'Lịch hẹn này đã được tiếp nhận' });
      }
      
      // Lấy thông tin bác sĩ để lấy MaKhoa
      BacSi.getById(lichHen.MaBacSi, (err3, bacSiResults) => {
        if (err3) return res.status(500).json({ error: 'Lỗi lấy thông tin bác sĩ', details: err3 });
        if (!bacSiResults || bacSiResults.length === 0) {
          return res.status(404).json({ error: 'Không tìm thấy bác sĩ' });
        }
        
        const maKhoa = bacSiResults[0].MaKhoa;
        
        // Lấy MaTrangThai cho "Đã tiếp nhận"
        getMaTrangThai('Đã tiếp nhận', (err4, MaTrangThai) => {
          if (err4) return res.status(500).json({ error: 'Lỗi lấy trạng thái tiếp nhận', details: err4 });
          
          // Tạo tiếp nhận
          const tiepNhanData = {
            MaBenhNhan: lichHen.MaBenhNhan,
            MaBacSi: lichHen.MaBacSi,
            MaKhoa: maKhoa,
            MaLichHen: MaLichHen,
            MaTrangThai: MaTrangThai,
            GhiChu: lichHen.GhiChu || null
          };
          
          TiepNhanModel.create(tiepNhanData, (err5, tiepNhanResult) => {
            if (err5) return res.status(500).json({ error: 'Lỗi tạo tiếp nhận', details: err5 });
            
            res.json({
              message: 'Tiếp nhận theo lịch thành công',
              MaTiepNhan: tiepNhanResult.insertId,
              MaLichHen: MaLichHen
            });
          });
        });
      });
    });
  });
};

// Tìm kiếm tiếp nhận theo mã lịch hẹn, số điện thoại, cccd
exports.searchTiepNhan = (req, res) => {
  const { maLichHen, soDienThoai, cccd } = req.query;
  
  console.log('=== SEARCH RECEPTION ===');
  console.log('req.query:', req.query);
  console.log('========================');
  
  // Kiểm tra ít nhất một tham số tìm kiếm
  if (!maLichHen && !soDienThoai && !cccd) {
    return res.status(400).json({ 
      error: 'Vui lòng cung cấp ít nhất một tham số tìm kiếm (maLichHen, soDienThoai, hoặc cccd)' 
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
  
  TiepNhanModel.search(searchParams, (err, results) => {
    if (err) {
      console.error('[ERROR] Database error:', err);
      return res.status(500).json({ error: 'Lỗi tìm kiếm tiếp nhận', details: err });
    }
    console.log('[SUCCESS] Found', results.length, 'receptions');
    res.json(results);
  });
};

