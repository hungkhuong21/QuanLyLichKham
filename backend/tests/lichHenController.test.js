const LichHen = require('../models/lichHenModel');
const TiepNhanModel = require('../models/tiepNhanModel');
const TrangThaiTiepNhan = require('../models/trangThaiTiepNhanModel');
const BacSi = require('../models/bacSiModel');
const BenhNhan = require('../models/benhNhanModel');
const TaiKhoan = require('../models/taiKhoanModel');

const controller = require('../controllers/lichHenController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ============================================================
// User Story 2.14 - Xem lịch hẹn trên trang bệnh nhân
// Số lượng test: 3
// Mô tả: Kiểm tra chức năng xem danh sách lịch hẹn của bệnh nhân
// ============================================================

describe('User Story 2.14 - Xem lịch hẹn trên trang bệnh nhân', () => {
  // Test 1: Kiểm tra trường hợp thiếu thông tin đăng nhập (MaNguoiDung)
  test('getAllLichHen -> 401 when MaNguoiDung missing for patient', () => {
    const req = { query: { LoaiNguoiDung: 'BenhNhan' } };
    const res = mockRes();
    controller.getAllLichHen(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Vui lòng đăng nhập để xem lịch hẹn' });
  });

  // Test 2: Kiểm tra trường hợp MaNguoiDung = 0 (tài khoản chưa liên kết với bệnh nhân)
  test('getAllLichHen -> returns empty array when MaNguoiDung = 0 for patient', () => {
    const req = { query: { MaNguoiDung: '0', LoaiNguoiDung: 'BenhNhan' } };
    const res = mockRes();
    controller.getAllLichHen(req, res);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  // Test 3: Kiểm tra trường hợp thành công - trả về danh sách lịch hẹn của bệnh nhân
  test('getAllLichHen -> success returns patient appointments', (done) => {
    const req = { query: { MaNguoiDung: '1', LoaiNguoiDung: 'BenhNhan', filter: null } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getByMaBenhNhan').mockImplementation((id, filter, cb) => 
      cb(null, [{ MaLichHen: 1, MaBenhNhan: 1 }])
    );

    controller.getAllLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaLichHen: 1, MaBenhNhan: 1 }]);
      done();
    });
  });
});

// ============================================================
// User Story 2.15 - Đặt lịch hẹn
// Số lượng test: 4
// Mô tả: Kiểm tra chức năng đặt lịch hẹn mới (bao gồm validation và các trường hợp đặc biệt)
// ============================================================

describe('User Story 2.15 - Đặt lịch hẹn', () => {
  // Test 1: Kiểm tra thiếu thông tin bắt buộc (MaBacSi hoặc ThoiGianKham)
  test('datLichHen -> 400 when missing MaBacSi or ThoiGianKham', () => {
    const req = { body: { MaBenhNhan: 1 } };
    const res = mockRes();
    controller.datLichHen(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc: MaBacSi, ThoiGianKham' });
  });

  // Test 2: Kiểm tra trường hợp trùng lịch (bác sĩ đã có lịch vào thời gian đó)
  test('datLichHen -> 409 when appointment time conflicts', (done) => {
    const req = { body: { MaBenhNhan: 1, MaBacSi: 2, ThoiGianKham: '2025-01-01 10:00' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'checkTrungLich').mockImplementation((maBacSi, tg, cb) => 
      cb(null, [{ MaLichHen: 99 }]) // Có lịch trùng
    );

    controller.datLichHen(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Bác sĩ đã có lịch hẹn vào thời gian này' });
      done();
    });
  });

  // Test 3: Kiểm tra thiếu thông tin bệnh nhân (không có MaBenhNhan và không có HoTen/SoDienThoai)
  test('datLichHen -> 400 when missing patient information', () => {
    const req = { body: { MaBacSi: 2, ThoiGianKham: '2025-01-01 10:00' } };
    const res = mockRes();
    controller.datLichHen(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Thiếu thông tin bệnh nhân. Vui lòng cung cấp MaBenhNhan hoặc (HoTen và SoDienThoai)' 
    });
  });

  // Test 4: Kiểm tra trường hợp thành công - đặt lịch hẹn thành công
  test('datLichHen -> success creates appointment and reception', (done) => {
    const req = { body: { MaBenhNhan: 1, MaBacSi: 2, ThoiGianKham: '2025-01-01 10:00', Note: 'note' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'checkTrungLich').mockImplementation((maBacSi, tg, cb) => cb(null, []));
    jest.spyOn(BacSi, 'getById').mockImplementation((id, cb) => cb(null, [{ MaKhoa: 9 }]));
    jest.spyOn(LichHen, 'create').mockImplementation((payload, cb) => cb(null, { insertId: 77 }));
    jest.spyOn(TrangThaiTiepNhan, 'getByTen').mockImplementation((ten, cb) => cb(null, [{ MaTrangThai: 5 }]));
    jest.spyOn(TiepNhanModel, 'create').mockImplementation((data, cb) => cb(null, { insertId: 888 }));

    controller.datLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Đặt lịch hẹn thành công', 
        MaLichHen: 77, 
        MaTiepNhan: 888, 
        MaBenhNhan: 1 
      });
      done();
    });
  });
});

// ============================================================
// User Story 2.16 - Xem lịch sử đặt lịch hẹn
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng xem chi tiết một lịch hẹn cụ thể (lịch sử)
// ============================================================

describe('User Story 2.16 - Xem lịch sử đặt lịch hẹn', () => {
  // Test 1: Kiểm tra trường hợp không tìm thấy lịch hẹn
  test('getLichHenById -> 404 when not found', (done) => {
    const req = { params: { id: 123 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => cb(null, []));

    controller.getLichHenById(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy lịch hẹn' });
      done();
    });
  });

  // Test 2: Kiểm tra trường hợp thành công - trả về thông tin lịch hẹn
  test('getLichHenById -> success returns appointment', (done) => {
    const req = { params: { id: 123 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => 
      cb(null, [{ MaLichHen: 123, MaBenhNhan: 1, MaBacSi: 2 }])
    );

    controller.getLichHenById(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ MaLichHen: 123, MaBenhNhan: 1, MaBacSi: 2 });
      done();
    });
  });
});

// ============================================================
// User Story 2.17 - Lọc lịch hẹn theo ngày / tuần / tháng trên trang xem lịch hẹn
// Số lượng test: 3
// Mô tả: Kiểm tra chức năng lọc lịch hẹn theo các khoảng thời gian khác nhau
// ============================================================

describe('User Story 2.17 - Lọc lịch hẹn theo ngày / tuần / tháng', () => {
  // Test 1: Kiểm tra lọc theo ngày (filter = 'day')
  test('getAllLichHen -> success filters by day', (done) => {
    const req = { query: { MaNguoiDung: '1', LoaiNguoiDung: 'BenhNhan', filter: 'day' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getByMaBenhNhan').mockImplementation((id, filter, cb) => 
      cb(null, [{ MaLichHen: 1, filter: 'day' }])
    );

    controller.getAllLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaLichHen: 1, filter: 'day' }]);
      done();
    });
  });

  // Test 2: Kiểm tra lọc theo tuần (filter = 'week')
  test('getAllLichHen -> success filters by week', (done) => {
    const req = { query: { MaNguoiDung: '1', LoaiNguoiDung: 'BenhNhan', filter: 'week' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getByMaBenhNhan').mockImplementation((id, filter, cb) => 
      cb(null, [{ MaLichHen: 1, filter: 'week' }])
    );

    controller.getAllLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaLichHen: 1, filter: 'week' }]);
      done();
    });
  });

  // Test 3: Kiểm tra lọc theo tháng (filter = 'month')
  test('getAllLichHen -> success filters by month', (done) => {
    const req = { query: { MaNguoiDung: '1', LoaiNguoiDung: 'BenhNhan', filter: 'month' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getByMaBenhNhan').mockImplementation((id, filter, cb) => 
      cb(null, [{ MaLichHen: 1, filter: 'month' }])
    );

    controller.getAllLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaLichHen: 1, filter: 'month' }]);
      done();
    });
  });
});

// ============================================================
// User Story 2.18 - Thay đổi lịch hẹn
// Số lượng test: 3
// Mô tả: Kiểm tra chức năng cập nhật trạng thái lịch hẹn (thay đổi lịch)
// ============================================================

describe('User Story 2.18 - Thay đổi lịch hẹn', () => {
  // Test 1: Kiểm tra thiếu trạng thái cần cập nhật
  test('updateTrangThaiLichHen -> 400 when missing TrangThai', () => {
    const req = { params: { MaLichHen: 1 }, body: {} };
    const res = mockRes();
    controller.updateTrangThaiLichHen(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu trạng thái cần cập nhật' });
  });

  // Test 2: Kiểm tra không tìm thấy lịch hẹn
  test('updateTrangThaiLichHen -> 404 when MaLichHen not found', (done) => {
    const req = { params: { MaLichHen: 999 }, body: { TrangThai: 'Đã hủy' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => cb(null, []));

    controller.updateTrangThaiLichHen(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy lịch hẹn' });
      done();
    });
  });

  // Test 3: Kiểm tra thành công - cập nhật trạng thái lịch hẹn (không có tiếp nhận)
  test('updateTrangThaiLichHen -> success updates only lichhen when no tiepnhan', (done) => {
    const req = { params: { MaLichHen: 5 }, body: { TrangThai: 'Đã hủy' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => cb(null, [{ MaLichHen: 5 }]));
    jest.spyOn(LichHen, 'updateTrangThai').mockImplementation((id, trangthai, cb) => 
      cb(null, { affectedRows: 1 })
    );
    jest.spyOn(TiepNhanModel, 'getByMaLichHen').mockImplementation((id, cb) => cb(null, []));

    controller.updateTrangThaiLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Cập nhật trạng thái lịch hẹn thành công', 
        MaLichHen: 5, 
        TrangThai: 'Đã hủy' 
      });
      done();
    });
  });
});

// ============================================================
// User Story 2.19 - Hủy lịch hẹn
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng hủy/xóa lịch hẹn
// ============================================================

describe('User Story 2.19 - Hủy lịch hẹn', () => {
  // Test 1: Kiểm tra không tìm thấy lịch hẹn để hủy
  test('deleteLichHen -> 404 when id not found', (done) => {
    const req = { params: { id: 88 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => cb(null, []));

    controller.deleteLichHen(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy lịch hẹn' });
      done();
    });
  });

  // Test 2: Kiểm tra thành công - xóa lịch hẹn và tiếp nhận liên quan
  test('deleteLichHen -> success deletes tied tiepnhan then lichhen', (done) => {
    const req = { params: { id: 90 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => cb(null, [{ MaLichHen: 90 }]));
    jest.spyOn(TiepNhanModel, 'getByMaLichHen').mockImplementation((id, cb) => 
      cb(null, [{ MaTiepNhan: 1 }])
    );
    jest.spyOn(TiepNhanModel, 'delete').mockImplementation((id, cb) => cb(null));
    jest.spyOn(LichHen, 'delete').mockImplementation((id, cb) => cb(null, { affectedRows: 1 }));

    controller.deleteLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Xóa lịch hẹn thành công' });
      done();
    });
  });
});

// ============================================================
// User Story 2.20 - Thêm lịch hẹn
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng thêm lịch hẹn mới (tương tự đặt lịch nhưng có thể là từ admin/staff)
// ============================================================

describe('User Story 2.20 - Thêm lịch hẹn', () => {
  // Test 1: Kiểm tra thiếu thông tin bắt buộc khi thêm lịch hẹn
  test('datLichHen -> 400 when missing MaBacSi or ThoiGianKham for adding', () => {
    const req = { body: { MaBenhNhan: 1 } };
    const res = mockRes();
    controller.datLichHen(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc: MaBacSi, ThoiGianKham' });
  });

  // Test 2: Kiểm tra thành công - thêm lịch hẹn mới (không tạo tiếp nhận tự động)
  test('datLichHen -> success creates appointment without auto reception', (done) => {
    const req = { body: { MaBenhNhan: 1, MaBacSi: 2, ThoiGianKham: '2025-01-01 10:00', Note: 'note', TiepNhan: null } };
    const res = mockRes();

    jest.spyOn(LichHen, 'checkTrungLich').mockImplementation((maBacSi, tg, cb) => cb(null, []));
    jest.spyOn(BacSi, 'getById').mockImplementation((id, cb) => cb(null, [{ MaKhoa: 9 }]));
    jest.spyOn(LichHen, 'create').mockImplementation((payload, cb) => cb(null, { insertId: 77 }));
    jest.spyOn(TrangThaiTiepNhan, 'getByTen').mockImplementation((ten, cb) => cb(null, [{ MaTrangThai: 5 }]));
    jest.spyOn(TiepNhanModel, 'create').mockImplementation((data, cb) => cb(null, { insertId: 888 }));

    controller.datLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Đặt lịch hẹn thành công', 
        MaLichHen: 77, 
        MaTiepNhan: 888, 
        MaBenhNhan: 1 
      });
      done();
    });
  });
});

// ============================================================
// User Story 2.21 - Tìm kiếm lịch hẹn theo khoa, bác sĩ
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng tìm kiếm lịch hẹn dựa trên khoa và bác sĩ
// ============================================================

describe('User Story 2.21 - Tìm kiếm lịch hẹn theo khoa, bác sĩ', () => {
  // Test 1: Kiểm tra tham số không hợp lệ (maKhoa là string không phải số)
  test('searchLichHen -> 400 on invalid maKhoa (string)', () => {
    const req = { query: { maKhoa: 'not-a-number' } };
    const res = mockRes();
    controller.searchLichHen(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'maKhoa không hợp lệ' });
  });

  // Test 2: Kiểm tra thành công - tìm kiếm theo khoa và bác sĩ
  test('searchLichHen -> success returns results by department and doctor', (done) => {
    const req = { query: { maKhoa: '1', maBacSi: '2' } };
    const res = mockRes();

    jest.spyOn(LichHen, 'search').mockImplementation((params, cb) => 
      cb(null, [{ MaLichHen: 1, MaKhoa: 1, MaBacSi: 2 }])
    );

    controller.searchLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaLichHen: 1, MaKhoa: 1, MaBacSi: 2 }]);
      done();
    });
  });
});

// ============================================================
// User Story 2.22 - Chi tiết lịch hẹn
// Số lượng test: 1
// Mô tả: Kiểm tra chức năng xem chi tiết một lịch hẹn cụ thể
// ============================================================

describe('User Story 2.22 - Chi tiết lịch hẹn', () => {
  // Test 1: Kiểm tra thành công - trả về chi tiết lịch hẹn
  test('getLichHenById -> success returns appointment details', (done) => {
    const req = { params: { id: 123 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => 
      cb(null, [{ 
        MaLichHen: 123, 
        MaBenhNhan: 1, 
        MaBacSi: 2, 
        ThoiGianKham: '2025-01-01 10:00',
        TrangThai: 'Đã đặt',
        Note: 'Ghi chú'
      }])
    );

    controller.getLichHenById(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        MaLichHen: 123, 
        MaBenhNhan: 1, 
        MaBacSi: 2, 
        ThoiGianKham: '2025-01-01 10:00',
        TrangThai: 'Đã đặt',
        Note: 'Ghi chú'
      });
      done();
    });
  });
});

// ============================================================
// User Story 2.23 - Cập nhật lịch hẹn
// Số lượng test: 1
// Mô tả: Kiểm tra chức năng cập nhật thông tin lịch hẹn (updateLichHen)
// ============================================================

describe('User Story 2.23 - Cập nhật lịch hẹn', () => {
  // Test 1: Kiểm tra thành công - cập nhật lịch hẹn
  test('updateLichHen -> success updates appointment', (done) => {
    const req = { 
      params: { id: 1 }, 
      body: { 
        ThoiGianKham: '2025-01-02 14:00',
        Note: 'Ghi chú mới'
      } 
    };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => 
      cb(null, [{ MaLichHen: 1 }])
    );
    jest.spyOn(LichHen, 'update').mockImplementation((id, data, cb) => 
      cb(null, { affectedRows: 1 })
    );

    controller.updateLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: 'Cập nhật lịch hẹn thành công'
      }));
      done();
    });
  });
});

// ============================================================
// User Story 2.24 - Xóa lịch hẹn
// Số lượng test: 1
// Mô tả: Kiểm tra chức năng xóa lịch hẹn (deleteLichHen)
// ============================================================

describe('User Story 2.24 - Xóa lịch hẹn', () => {
  // Test 1: Kiểm tra thành công - xóa lịch hẹn
  test('deleteLichHen -> success deletes appointment', (done) => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => 
      cb(null, [{ MaLichHen: 1 }])
    );
    jest.spyOn(TiepNhanModel, 'getByMaLichHen').mockImplementation((id, cb) => 
      cb(null, [])
    );
    jest.spyOn(LichHen, 'delete').mockImplementation((id, cb) => 
      cb(null, { affectedRows: 1 })
    );

    controller.deleteLichHen(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Xóa lịch hẹn thành công' });
      done();
    });
  });
});
