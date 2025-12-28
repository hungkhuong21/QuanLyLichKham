const LichHen = require('../models/lichHenModel');
const TiepNhanModel = require('../models/tiepNhanModel');
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

// Đặt lịch hẹn mới (mặc định xem là đặt online nếu không truyền TiepNhan)
exports.datLichHen = (req, res) => {
  const { MaBenhNhan, MaBacSi, ThoiGianKham, Note, TiepNhan, TrangThaiTiepNhan, MaKhoa, LoaiNguoiDung } = req.body || {};
  
  console.log('=== CREATE APPOINTMENT ===');
  console.log('req.body:', req.body);
  console.log('LoaiNguoiDung:', LoaiNguoiDung);
  console.log('==========================');
  
  // Admin và QuanTriVien có thể tạo lịch hẹn mà không cần kiểm tra MaNguoiDung
  // Nhưng vẫn cần các thông tin bắt buộc: MaBenhNhan, MaBacSi, ThoiGianKham
  if (!MaBenhNhan || !MaBacSi || !ThoiGianKham) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
  }
  // Kiểm tra trùng lịch: cùng bác sĩ, cùng thời gian
  LichHen.checkTrungLich(MaBacSi, ThoiGianKham, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi kiểm tra trùng lịch', details: err });
    if (results && results.length > 0) {
      return res.status(409).json({ error: 'Bác sĩ đã có lịch hẹn vào thời gian này' });
    }
    // Lấy thông tin bác sĩ để lấy MaKhoa nếu chưa có
    BacSi.getById(MaBacSi, (err1, bacSiResults) => {
      if (err1) return res.status(500).json({ error: 'Lỗi lấy thông tin bác sĩ', details: err1 });
      if (!bacSiResults || bacSiResults.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy bác sĩ' });
      }
      const maKhoa = MaKhoa || bacSiResults[0].MaKhoa;
      if (!maKhoa) {
        return res.status(400).json({ error: 'Thiếu thông tin khoa' });
      }

      // Xác định trạng thái tiếp nhận
      // Lưu ý: TrangThai trong lichhen chỉ có: 'Đã đặt','Đã hủy','Hoàn thành','Đổi lịch'
      const isTrucTiep = TiepNhan === 'Trực tiếp';
      const tenTrangThai = TrangThaiTiepNhan || (isTrucTiep ? 'Đã tiếp nhận' : 'Chờ xác nhận');
      // Trạng thái lịch hẹn luôn là 'Đã đặt' khi mới tạo (theo enum trong DB)
      const trangThai = 'Đã đặt';

      // Tạo lịch hẹn trước
      const payload = {
        MaBenhNhan,
        MaBacSi,
        ThoiGianKham,
        Note,
        TrangThai: trangThai
      };
      LichHen.create(payload, (err2, result) => {
        if (err2) return res.status(500).json({ error: 'Lỗi đặt lịch hẹn', details: err2 });
        const MaLichHen = result.insertId;

        // Lấy MaTrangThai và tạo tiếp nhận
        getMaTrangThai(tenTrangThai, (err3, MaTrangThai) => {
          if (err3) return res.status(500).json({ error: 'Lỗi lấy trạng thái tiếp nhận', details: err3 });

          const tiepNhanData = {
            MaBenhNhan,
            MaBacSi,
            MaKhoa: maKhoa,
            MaLichHen,
            MaTrangThai,
            GhiChu: Note
          };

          TiepNhanModel.create(tiepNhanData, (err4, tiepNhanResult) => {
            if (err4) return res.status(500).json({ error: 'Lỗi tạo tiếp nhận', details: err4 });
            res.json({
              message: 'Đặt lịch hẹn thành công',
              MaLichHen: MaLichHen,
              MaTiepNhan: tiepNhanResult.insertId
            });
          });
        });
      });
    });
  });
};

// Tiếp nhận online: có thể tạo mới hoặc cập nhật lịch đã có
exports.tiepNhanOnline = (req, res) => {
  const { MaLichHen, MaBenhNhan, MaBacSi, ThoiGianKham, Note, MaKhoa, LoaiNguoiDung } = req.body || {};
  // Nếu có MaLichHen -> cập nhật tiếp nhận
  if (MaLichHen) {
    // Lấy thông tin lịch hẹn để lấy MaBenhNhan, MaBacSi nếu cần
    LichHen.getById(MaLichHen, (err, lichHenResults) => {
      if (err) return res.status(500).json({ error: 'Lỗi lấy thông tin lịch hẹn', details: err });
      if (!lichHenResults || lichHenResults.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
      }
      const lichHen = lichHenResults[0];

      // Lấy thông tin bác sĩ để lấy MaKhoa
      BacSi.getById(lichHen.MaBacSi, (err1, bacSiResults) => {
        if (err1) return res.status(500).json({ error: 'Lỗi lấy thông tin bác sĩ', details: err1 });
        const maKhoa = MaKhoa || bacSiResults[0].MaKhoa;

        // Lấy MaTrangThai cho "Chờ xác nhận"
        getMaTrangThai('Chờ xác nhận', (err2, MaTrangThai) => {
          if (err2) return res.status(500).json({ error: 'Lỗi lấy trạng thái tiếp nhận', details: err2 });

          // Kiểm tra xem đã có tiếp nhận chưa
          TiepNhanModel.getByMaLichHen(MaLichHen, (err3, tiepNhanResults) => {
            if (err3) return res.status(500).json({ error: 'Lỗi kiểm tra tiếp nhận', details: err3 });

            if (tiepNhanResults && tiepNhanResults.length > 0) {
              // Cập nhật tiếp nhận hiện có
              TiepNhanModel.updateByMaLichHen(MaLichHen, { MaTrangThai, GhiChu: Note }, (err4) => {
                if (err4) return res.status(500).json({ error: 'Lỗi cập nhật tiếp nhận', details: err4 });
                // Không cập nhật TrangThai trong lichhen vì enum chỉ có: 'Đã đặt','Đã hủy','Hoàn thành','Đổi lịch'
                return res.json({ message: 'Cập nhật tiếp nhận online thành công' });
              });
            } else {
              // Tạo mới tiếp nhận
              const tiepNhanData = {
                MaBenhNhan: lichHen.MaBenhNhan,
                MaBacSi: lichHen.MaBacSi,
                MaKhoa: maKhoa,
                MaLichHen,
                MaTrangThai,
                GhiChu: Note
              };
              TiepNhanModel.create(tiepNhanData, (err4) => {
                if (err4) return res.status(500).json({ error: 'Lỗi tạo tiếp nhận', details: err4 });
                return res.json({ message: 'Cập nhật tiếp nhận online thành công' });
              });
            }
          });
        });
      });
    });
    return;
  }
  // Nếu không có MaLichHen -> tạo mới như đặt lịch online
  if (!MaBenhNhan || !MaBacSi || !ThoiGianKham) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc để tạo lịch online' });
  }
  LichHen.checkTrungLich(MaBacSi, ThoiGianKham, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi kiểm tra trùng lịch', details: err });
    if (results && results.length > 0) {
      return res.status(409).json({ error: 'Bác sĩ đã có lịch hẹn vào thời gian này' });
    }
    // Lấy thông tin bác sĩ để lấy MaKhoa
    BacSi.getById(MaBacSi, (err1, bacSiResults) => {
      if (err1) return res.status(500).json({ error: 'Lỗi lấy thông tin bác sĩ', details: err1 });
      const maKhoa = MaKhoa || bacSiResults[0].MaKhoa;

      // Tạo lịch hẹn (TrangThai mặc định là 'Đã đặt' theo enum trong DB)
      const payload = {
        MaBenhNhan,
        MaBacSi,
        ThoiGianKham,
        Note,
        TrangThai: 'Đã đặt'
      };
      LichHen.create(payload, (err2, result) => {
        if (err2) return res.status(500).json({ error: 'Lỗi tạo lịch online', details: err2 });
        const MaLichHen = result.insertId;

        // Tạo tiếp nhận
        getMaTrangThai('Chờ xác nhận', (err3, MaTrangThai) => {
          if (err3) return res.status(500).json({ error: 'Lỗi lấy trạng thái tiếp nhận', details: err3 });

          const tiepNhanData = {
            MaBenhNhan,
            MaBacSi,
            MaKhoa: maKhoa,
            MaLichHen,
            MaTrangThai,
            GhiChu: Note
          };

          TiepNhanModel.create(tiepNhanData, (err4, tiepNhanResult) => {
            if (err4) return res.status(500).json({ error: 'Lỗi tạo tiếp nhận', details: err4 });
            res.json({
              message: 'Đặt lịch online thành công',
              MaLichHen: MaLichHen,
              MaTiepNhan: tiepNhanResult.insertId
            });
          });
        });
      });
    });
  });
};

// Tiếp nhận trực tiếp: thường là tại quầy -> tạo hoặc cập nhật và đặt trạng thái là đã tiếp nhận
exports.tiepNhanTrucTiep = (req, res) => {
  const { MaLichHen, MaBenhNhan, MaBacSi, ThoiGianKham, Note, MaKhoa, LoaiNguoiDung } = req.body || {};
  if (MaLichHen) {
    // Cập nhật tiếp nhận trực tiếp
    LichHen.getById(MaLichHen, (err, lichHenResults) => {
      if (err) return res.status(500).json({ error: 'Lỗi lấy thông tin lịch hẹn', details: err });
      if (!lichHenResults || lichHenResults.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
      }
      const lichHen = lichHenResults[0];

      // Lấy thông tin bác sĩ để lấy MaKhoa
      BacSi.getById(lichHen.MaBacSi, (err1, bacSiResults) => {
        if (err1) return res.status(500).json({ error: 'Lỗi lấy thông tin bác sĩ', details: err1 });
        const maKhoa = MaKhoa || bacSiResults[0].MaKhoa;

        // Lấy MaTrangThai cho "Đã tiếp nhận"
        getMaTrangThai('Đã tiếp nhận', (err2, MaTrangThai) => {
          if (err2) return res.status(500).json({ error: 'Lỗi lấy trạng thái tiếp nhận', details: err2 });

          // Kiểm tra xem đã có tiếp nhận chưa
          TiepNhanModel.getByMaLichHen(MaLichHen, (err3, tiepNhanResults) => {
            if (err3) return res.status(500).json({ error: 'Lỗi kiểm tra tiếp nhận', details: err3 });

            if (tiepNhanResults && tiepNhanResults.length > 0) {
              // Cập nhật tiếp nhận hiện có
              TiepNhanModel.updateByMaLichHen(MaLichHen, { MaTrangThai, GhiChu: Note }, (err4) => {
                if (err4) return res.status(500).json({ error: 'Lỗi cập nhật tiếp nhận', details: err4 });
                // Không cập nhật TrangThai trong lichhen vì enum chỉ có: 'Đã đặt','Đã hủy','Hoàn thành','Đổi lịch'
                return res.json({ message: 'Cập nhật tiếp nhận trực tiếp thành công' });
              });
            } else {
              // Tạo mới tiếp nhận
              const tiepNhanData = {
                MaBenhNhan: lichHen.MaBenhNhan,
                MaBacSi: lichHen.MaBacSi,
                MaKhoa: maKhoa,
                MaLichHen,
                MaTrangThai,
                GhiChu: Note
              };
              TiepNhanModel.create(tiepNhanData, (err4) => {
                if (err4) return res.status(500).json({ error: 'Lỗi tạo tiếp nhận', details: err4 });
                return res.json({ message: 'Cập nhật tiếp nhận trực tiếp thành công' });
              });
            }
          });
        });
      });
    });
    return;
  }
  // Tạo mới trực tiếp
  if (!MaBenhNhan || !MaBacSi || !ThoiGianKham) {
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc để tạo lịch trực tiếp' });
  }
  LichHen.checkTrungLich(MaBacSi, ThoiGianKham, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi kiểm tra trùng lịch', details: err });
    if (results && results.length > 0) {
      return res.status(409).json({ error: 'Bác sĩ đã có lịch hẹn vào thời gian này' });
    }
    // Lấy thông tin bác sĩ để lấy MaKhoa
    BacSi.getById(MaBacSi, (err1, bacSiResults) => {
      if (err1) return res.status(500).json({ error: 'Lỗi lấy thông tin bác sĩ', details: err1 });
      const maKhoa = MaKhoa || bacSiResults[0].MaKhoa;

      // Tạo lịch hẹn (TrangThai mặc định là 'Đã đặt' theo enum trong DB)
      const payload = {
        MaBenhNhan,
        MaBacSi,
        ThoiGianKham,
        Note,
        TrangThai: 'Đã đặt'
      };
      LichHen.create(payload, (err2, result) => {
        if (err2) return res.status(500).json({ error: 'Lỗi tạo lịch trực tiếp', details: err2 });
        const MaLichHen = result.insertId;

        // Tạo tiếp nhận
        getMaTrangThai('Đã tiếp nhận', (err3, MaTrangThai) => {
          if (err3) return res.status(500).json({ error: 'Lỗi lấy trạng thái tiếp nhận', details: err3 });

          const tiepNhanData = {
            MaBenhNhan,
            MaBacSi,
            MaKhoa: maKhoa,
            MaLichHen,
            MaTrangThai,
            GhiChu: Note
          };

          TiepNhanModel.create(tiepNhanData, (err4, tiepNhanResult) => {
            if (err4) return res.status(500).json({ error: 'Lỗi tạo tiếp nhận', details: err4 });
            res.json({
              message: 'Tiếp nhận trực tiếp thành công',
              MaLichHen: MaLichHen,
              MaTiepNhan: tiepNhanResult.insertId
            });
          });
        });
      });
    });
  });
};

// Lấy tất cả lịch hẹn
exports.getAllLichHen = (req, res) => {
  // Lấy params từ query string (do frontend gửi qua HttpParams)
  const { MaNguoiDung, LoaiNguoiDung } = req.query;

  console.log('=== GET ALL APPOINTMENTS ===');
  console.log('req.query:', req.query);
  console.log('MaNguoiDung:', MaNguoiDung, 'type:', typeof MaNguoiDung);
  console.log('LoaiNguoiDung:', LoaiNguoiDung);
  console.log('===========================');

  //  KIỂM TRA ADMIN TRƯỚC - Admin không cần MaNguoiDung
  if (LoaiNguoiDung === 'Admin' || LoaiNguoiDung === 'QuanTriVien') {
    console.log('[INFO] Admin user - returning all appointments');
    LichHen.getAll((err, results) => {
      if (err) {
        console.error('[ERROR] Database error:', err);
        return res.status(500).json({ error: 'Lỗi lấy danh sách lịch hẹn', details: err });
      }
      console.log('[SUCCESS] Admin returned', results.length, 'appointments');
      res.json(results);
    });
    return;
  }

  //  SAU ĐÓ MỚI KIỂM TRA MaNguoiDung cho non-admin users
  if (!MaNguoiDung || MaNguoiDung === 'null' || MaNguoiDung === 'undefined') {
    console.log('[ERROR] No MaNguoiDung provided for non-admin user');
    return res.status(401).json({ error: 'Vui lòng đăng nhập để xem lịch hẹn' });
  }

  const maNguoiDungNumber = parseInt(MaNguoiDung);

  if (isNaN(maNguoiDungNumber)) {
    console.log('[ERROR] Invalid MaNguoiDung:', MaNguoiDung);
    return res.status(400).json({ error: 'MaNguoiDung không hợp lệ' });
  }

  // XỬ LÝ TRƯỜNG HỢP MaNguoiDung = 0 (Tài khoản chưa liên kết với bệnh nhân)
  if (maNguoiDungNumber === 0 && LoaiNguoiDung === 'BenhNhan') {
    console.log('[INFO] MaNguoiDung = 0 - Account not linked to patient yet');
    // Trả về mảng rỗng vì chưa có bệnh nhân
    return res.json([]);
  }

  // BỆNH NHÂN: Chỉ xem lịch của mình
  if (LoaiNguoiDung === 'BenhNhan') {
    console.log('[INFO] Patient user - filtering by MaBenhNhan:', maNguoiDungNumber);
    LichHen.getByMaBenhNhan(maNguoiDungNumber, (err, results) => {
      if (err) {
        console.error('[ERROR] Database error:', err);
        return res.status(500).json({ error: 'Lỗi lấy danh sách lịch hẹn', details: err });
      }
      console.log('[SUCCESS] Found', results.length, 'appointments for patient', maNguoiDungNumber);
      res.json(results);
    });
    return;
  }

  // BÁC SĨ: Xem lịch của bác sĩ đó
  if (LoaiNguoiDung === 'BacSi') {
    console.log('[INFO] Doctor user - filtering by MaBacSi:', maNguoiDungNumber);
    LichHen.getByMaBacSi(maNguoiDungNumber, (err, results) => {
      if (err) {
        console.error('[ERROR] Database error:', err);
        return res.status(500).json({ error: 'Lỗi lấy danh sách lịch hẹn', details: err });
      }
      console.log('[SUCCESS] Found', results.length, 'appointments for doctor', maNguoiDungNumber);
      res.json(results);
    });
    return;
  }

  // Loại người dùng không xác định
  console.log('[ERROR] Unknown user type:', LoaiNguoiDung);
  res.status(403).json({ error: 'Không có quyền truy cập. LoaiNguoiDung không hợp lệ: ' + LoaiNguoiDung });
};

// Lấy lịch hẹn theo id
exports.getLichHenById = (req, res) => {
  LichHen.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn' });
    if (!results || results.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    res.json(results[0]);
  });
};

// Cập nhật trạng thái lịch hẹn
exports.updateTrangThaiLichHen = (req, res) => {
  const { MaLichHen } = req.params;
  const { TrangThai } = req.body;

  if (!TrangThai) {
    return res.status(400).json({ error: 'Thiếu trạng thái cần cập nhật' });
  }

  // Các trạng thái hợp lệ (theo enum trong bảng lichhen)
  const trangThaiHopLe = ['Đã đặt', 'Đã hủy', 'Hoàn thành', 'Đổi lịch'];
  if (!trangThaiHopLe.includes(TrangThai)) {
    return res.status(400).json({
      error: 'Trạng thái không hợp lệ',
      trangThaiHopLe: trangThaiHopLe,
      note: 'Các trạng thái chi tiết (Chờ xác nhận, Đã tiếp nhận, Đang khám) được quản lý trong bảng tiepnhan'
    });
  }

  LichHen.getById(MaLichHen, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn', details: err });
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Cập nhật trạng thái trong bảng lichhen
    LichHen.updateTrangThai(MaLichHen, TrangThai, (err2, result) => {
      if (err2) return res.status(500).json({ error: 'Lỗi cập nhật trạng thái', details: err2 });

      // Nếu có tiếp nhận, cập nhật trạng thái tiếp nhận tương ứng
      TiepNhanModel.getByMaLichHen(MaLichHen, (err3, tiepNhanResults) => {
        if (err3) {
          // Nếu không có tiếp nhận, chỉ cập nhật lịch hẹn
          return res.json({
            message: 'Cập nhật trạng thái lịch hẹn thành công',
            MaLichHen: MaLichHen,
            TrangThai: TrangThai
          });
        }

        if (tiepNhanResults && tiepNhanResults.length > 0) {
          // Map trạng thái lịch hẹn sang trạng thái tiếp nhận
          let tenTrangThaiTiepNhan = null;
          if (TrangThai === 'Đã đặt') {
            tenTrangThaiTiepNhan = 'Chờ xác nhận';
          } else if (TrangThai === 'Hoàn thành') {
            tenTrangThaiTiepNhan = 'Đã hoàn thành';
          } else if (TrangThai === 'Đã hủy') {
            tenTrangThaiTiepNhan = 'Đã hủy';
          } else if (TrangThai === 'Đổi lịch') {
            tenTrangThaiTiepNhan = 'Chờ xác nhận'; // Đổi lịch thì chờ xác nhận lại
          }

          // Nếu không có mapping, chỉ cập nhật lịch hẹn
          if (!tenTrangThaiTiepNhan) {
            return res.json({
              message: 'Cập nhật trạng thái lịch hẹn thành công',
              MaLichHen: MaLichHen,
              TrangThai: TrangThai
            });
          }

          // Cập nhật trạng thái tiếp nhận
          getMaTrangThai(tenTrangThaiTiepNhan, (err4, MaTrangThai) => {
            if (err4) {
              // Nếu lỗi lấy trạng thái, vẫn trả về thành công cho lịch hẹn
              return res.json({
                message: 'Cập nhật trạng thái lịch hẹn thành công',
                MaLichHen: MaLichHen,
                TrangThai: TrangThai,
                warning: 'Không thể cập nhật trạng thái tiếp nhận'
              });
            }

            TiepNhanModel.updateByMaLichHen(MaLichHen, {
              MaTrangThai,
              GhiChu: null
            }, (err5) => {
              if (err5) {
                return res.json({
                  message: 'Cập nhật trạng thái lịch hẹn thành công',
                  MaLichHen: MaLichHen,
                  TrangThai: TrangThai,
                  warning: 'Không thể cập nhật trạng thái tiếp nhận'
                });
              }

              res.json({
                message: 'Cập nhật trạng thái lịch hẹn và tiếp nhận thành công',
                MaLichHen: MaLichHen,
                TrangThai: TrangThai,
                TrangThaiTiepNhan: tenTrangThaiTiepNhan
              });
            });
          });
        } else {
          res.json({
            message: 'Cập nhật trạng thái lịch hẹn thành công',
            MaLichHen: MaLichHen,
            TrangThai: TrangThai
          });
        }
      });
    });
  });
};

// Cập nhật lịch hẹn (tổng quát)
exports.updateLichHen = (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  console.log('Update request:', { id, updateData });

  // Kiểm tra lịch hẹn có tồn tại không
  LichHen.getById(id, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi truy vấn', details: err });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch hẹn' });
    }

    // Map status từ tiếng Việt/tiếng Anh sang giá trị database
    if (updateData.status) {
      // Map các giá trị có thể từ frontend
      const statusMap = {
        'Đã hủy': 'Đã hủy',
        'Đã đặt': 'Đã đặt',
        'Hoàn thành': 'Hoàn thành',
        'Đổi lịch': 'Đổi lịch',
        // Thêm các mapping khác nếu cần
      };

      updateData.TrangThai = statusMap[updateData.status] || updateData.status;
      delete updateData.status;
    }

    // Kiểm tra trạng thái hợp lệ (nếu có)
    if (updateData.TrangThai) {
      const validStatuses = ['Đã đặt', 'Đã hủy', 'Hoàn thành', 'Đổi lịch'];
      if (!validStatuses.includes(updateData.TrangThai)) {
        return res.status(400).json({
          error: 'Trạng thái không hợp lệ',
          validStatuses: validStatuses
        });
      }
    }

    // Cập nhật lịch hẹn
    LichHen.update(id, updateData, (err2, result) => {
      if (err2) {
        console.error('Update error:', err2);
        return res.status(500).json({ error: 'Lỗi cập nhật lịch hẹn', details: err2 });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lịch hẹn để cập nhật' });
      }

      // Nếu cập nhật trạng thái, cũng cập nhật tiếp nhận (nếu có)
      if (updateData.TrangThai) {
        TiepNhanModel.getByMaLichHen(id, (err3, tiepNhanResults) => {
          if (err3 || !tiepNhanResults || tiepNhanResults.length === 0) {
            // Không có tiếp nhận, chỉ trả về kết quả cập nhật lịch hẹn
            return res.json({
              message: 'Cập nhật lịch hẹn thành công',
              data: { TrangThai: updateData.TrangThai }
            });
          }

          // Map trạng thái lịch hẹn sang trạng thái tiếp nhận
          let tenTrangThaiTiepNhan = null;
          if (updateData.TrangThai === 'Đã đặt') {
            tenTrangThaiTiepNhan = 'Chờ xác nhận';
          } else if (updateData.TrangThai === 'Hoàn thành') {
            tenTrangThaiTiepNhan = 'Đã hoàn thành';
          } else if (updateData.TrangThai === 'Đã hủy') {
            tenTrangThaiTiepNhan = 'Đã hủy';
          }

          if (!tenTrangThaiTiepNhan) {
            return res.json({
              message: 'Cập nhật lịch hẹn thành công',
              data: { TrangThai: updateData.TrangThai }
            });
          }

          // Cập nhật trạng thái tiếp nhận
          getMaTrangThai(tenTrangThaiTiepNhan, (err4, MaTrangThai) => {
            if (err4) {
              return res.json({
                message: 'Cập nhật lịch hẹn thành công',
                data: { TrangThai: updateData.TrangThai },
                warning: 'Không thể cập nhật trạng thái tiếp nhận'
              });
            }

            TiepNhanModel.updateByMaLichHen(id, { MaTrangThai }, (err5) => {
              res.json({
                message: 'Cập nhật lịch hẹn và tiếp nhận thành công',
                data: { TrangThai: updateData.TrangThai }
              });
            });
          });
        });
      } else {
        // Không cập nhật trạng thái, chỉ trả về kết quả
        res.json({
          message: 'Cập nhật lịch hẹn thành công'
        });
      }
    });
  });
};

// Xóa lịch hẹn
exports.deleteLichHen = (req, res) => {
  const { id } = req.params;

  // Kiểm tra lịch hẹn có tồn tại không
  LichHen.getById(id, (err, results) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn', details: err });
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Xóa tiếp nhận liên quan (nếu có)
    TiepNhanModel.getByMaLichHen(id, (err2, tiepNhanResults) => {
      if (err2) {
        return deleteLichHenOnly();
      }

      if (tiepNhanResults && tiepNhanResults.length > 0) {
        const deletePromises = tiepNhanResults.map(tn => {
          return new Promise((resolve, reject) => {
            TiepNhanModel.delete(tn.MaTiepNhan, (err3) => {
              if (err3) reject(err3);
              else resolve();
            });
          });
        });

        Promise.all(deletePromises)
          .then(() => deleteLichHenOnly())
          .catch(() => deleteLichHenOnly());
      } else {
        deleteLichHenOnly();
      }
    });

    function deleteLichHenOnly() {
      LichHen.delete(id, (err3, result) => {
        if (err3) return res.status(500).json({ error: 'Lỗi xóa lịch hẹn', details: err3 });
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
        }
        res.json({ message: 'Xóa lịch hẹn thành công' });
      });
    }
  });
};