const TiepNhanModel = require('../models/tiepNhanModel');
const LichHen = require('../models/lichHenModel');
const TrangThaiTiepNhan = require('../models/trangThaiTiepNhanModel');
const BacSi = require('../models/bacSiModel');

const controller = require('../controllers/tiepNhanController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ============================================================
// User Story 4.7 - Tiếp nhận bệnh nhân theo lịch
// Số lượng test: 3
// Mô tả: Kiểm tra chức năng tiếp nhận bệnh nhân từ lịch hẹn đã có
// ============================================================

describe('User Story 4.7 - Tiếp nhận bệnh nhân theo lịch', () => {
  // Test 1: Kiểm tra thiếu mã lịch hẹn
  test('tiepNhanTheoLich -> 400 when MaLichHen missing', () => {
    const req = { body: {} };
    const res = mockRes();
    controller.tiepNhanTheoLich(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu mã lịch hẹn' });
  });

  // Test 2: Kiểm tra không tìm thấy lịch hẹn
  test('tiepNhanTheoLich -> 404 when lich hen not found', (done) => {
    const req = { body: { MaLichHen: 123 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => cb(null, []));

    controller.tiepNhanTheoLich(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Không tìm thấy lịch hẹn' });
      done();
    });
  });

  // Test 3: Kiểm tra thành công - tạo tiếp nhận từ lịch hẹn
  test('tiepNhanTheoLich -> success creates reception', (done) => {
    const req = { body: { MaLichHen: 123 } };
    const res = mockRes();

    jest.spyOn(LichHen, 'getById').mockImplementation((id, cb) => 
      cb(null, [{ patientId: 10, doctorId: 20, note: 'note' }])
    );
    jest.spyOn(TiepNhanModel, 'getByMaLichHen').mockImplementation((id, cb) => cb(null, []));
    jest.spyOn(BacSi, 'getById').mockImplementation((id, cb) => cb(null, [{ MaKhoa: 7 }]));
    jest.spyOn(TrangThaiTiepNhan, 'getByTen').mockImplementation((ten, cb) => 
      cb(null, [{ MaTrangThai: 99 }])
    );
    jest.spyOn(TiepNhanModel, 'create').mockImplementation((data, cb) => 
      cb(null, { insertId: 500 })
    );

    controller.tiepNhanTheoLich(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Tiếp nhận theo lịch thành công', 
        MaTiepNhan: 500, 
        MaLichHen: 123 
      });
      done();
    });
  });
});

// ============================================================
// User Story 4.8 - Tìm kiếm lịch hẹn theo mã lịch hẹn / SĐT / CCCD
// Số lượng test: 3
// Mô tả: Kiểm tra chức năng tìm kiếm tiếp nhận dựa trên mã lịch hẹn, số điện thoại hoặc CCCD
// ============================================================

describe('User Story 4.8 - Tìm kiếm lịch hẹn theo mã lịch hẹn / SĐT / CCCD', () => {
  // Test 1: Kiểm tra thiếu tham số tìm kiếm
  test('searchTiepNhan -> 400 when no params', () => {
    const req = { query: {} };
    const res = mockRes();
    controller.searchTiepNhan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
      error: 'Vui lòng cung cấp ít nhất một tham số tìm kiếm (maLichHen, soDienThoai, hoặc cccd)' 
    });
  });

  // Test 2: Kiểm tra thành công - trả về kết quả tìm kiếm theo SĐT
  test('searchTiepNhan -> success returns results by phone', (done) => {
    const req = { query: { soDienThoai: '0123456789' } };
    const res = mockRes();

    jest.spyOn(TiepNhanModel, 'search').mockImplementation((params, cb) => 
      cb(null, [{ MaTiepNhan: 1, SoDienThoai: '0123456789' }])
    );

    controller.searchTiepNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaTiepNhan: 1, SoDienThoai: '0123456789' }]);
      done();
    });
  });

  // Test 3: Kiểm tra thành công - trả về kết quả tìm kiếm theo mã lịch hẹn
  test('searchTiepNhan -> success returns results by appointment code', (done) => {
    const req = { query: { maLichHen: '123' } };
    const res = mockRes();

    jest.spyOn(TiepNhanModel, 'search').mockImplementation((params, cb) => 
      cb(null, [{ MaTiepNhan: 1, MaLichHen: 123 }])
    );

    controller.searchTiepNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaTiepNhan: 1, MaLichHen: 123 }]);
      done();
    });
  });
});

// ============================================================
// User Story 4.9 - Xem danh sách bệnh nhân theo ngày
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng xem danh sách bệnh nhân đã tiếp nhận trong một ngày cụ thể
// ============================================================

describe('User Story 4.9 - Xem danh sách bệnh nhân theo ngày', () => {
  // Test 1: Kiểm tra thiếu tham số ngày
  test('getDanhSachBenhNhanTheoNgay -> 400 when missing date', () => {
    const req = { query: {} };
    const res = mockRes();
    controller.getDanhSachBenhNhanTheoNgay(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu tham số date (format: YYYY-MM-DD)' });
  });

  // Test 2: Kiểm tra thành công - trả về danh sách bệnh nhân theo ngày
  test('getDanhSachBenhNhanTheoNgay -> success returns patients', (done) => {
    const req = { query: { date: '2025-01-01', page: 1, limit: 10 } };
    const res = mockRes();

    jest.spyOn(TiepNhanModel, 'getByDate').mockImplementation((date, page, limit, cb) => 
      cb(null, { 
        data: [{ MaBenhNhan: 1, HoTen: 'Nguyen Van A' }], 
        pagination: { page: 1, limit: 10, total: 1 } 
      })
    );

    controller.getDanhSachBenhNhanTheoNgay(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        data: [{ MaBenhNhan: 1, HoTen: 'Nguyen Van A' }], 
        pagination: { page: 1, limit: 10, total: 1 } 
      });
      done();
    });
  });
});

// ============================================================
// User Story 4.10 - Tìm kiếm bệnh nhân trong ngày
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng tìm kiếm bệnh nhân trong một ngày cụ thể (theo mã lịch hẹn, tên, SĐT)
// ============================================================

describe('User Story 4.10 - Tìm kiếm bệnh nhân trong ngày', () => {
  // Test 1: Kiểm tra thiếu tham số (thiếu ngày hoặc thiếu tham số tìm kiếm)
  test('searchDanhSachBenhNhanTrongNgay -> 400 when missing params', () => {
    const req = { query: {} };
    const res = mockRes();
    controller.searchDanhSachBenhNhanTrongNgay(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu tham số date (format: YYYY-MM-DD)' });
  });

  // Test 2: Kiểm tra thành công - trả về kết quả tìm kiếm bệnh nhân trong ngày
  test('searchDanhSachBenhNhanTrongNgay -> success returns patients', (done) => {
    const req = { query: { date: '2025-01-01', ten: 'Nguyen', page: 1, limit: 10 } };
    const res = mockRes();

    jest.spyOn(TiepNhanModel, 'searchByDate').mockImplementation((date, params, page, limit, cb) => 
      cb(null, { 
        data: [{ MaBenhNhan: 1, HoTen: 'Nguyen Van A' }], 
        pagination: { page: 1, limit: 10, total: 1 } 
      })
    );

    controller.searchDanhSachBenhNhanTrongNgay(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        data: [{ MaBenhNhan: 1, HoTen: 'Nguyen Van A' }], 
        pagination: { page: 1, limit: 10, total: 1 } 
      });
      done();
    });
  });
});

// ============================================================
// User Story 4.11 - Phân trang danh sách bệnh nhân
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng phân trang cho danh sách bệnh nhân (đã được tích hợp trong 4.9 và 4.10)
// Ghi chú: Chức năng phân trang được tích hợp trong getDanhSachBenhNhanTheoNgay và searchDanhSachBenhNhanTrongNgay
// ============================================================

describe('User Story 4.11 - Phân trang danh sách bệnh nhân', () => {
  // Test 1: Kiểm tra phân trang với tham số page và limit hợp lệ
  test('getDanhSachBenhNhanTheoNgay -> success with pagination params', (done) => {
    const req = { query: { date: '2025-01-01', page: 2, limit: 5 } };
    const res = mockRes();

    jest.spyOn(TiepNhanModel, 'getByDate').mockImplementation((date, page, limit, cb) => 
      cb(null, { 
        data: [{ MaBenhNhan: 6 }, { MaBenhNhan: 7 }], 
        pagination: { page: 2, limit: 5, total: 12 } 
      })
    );

    controller.getDanhSachBenhNhanTheoNgay(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        data: [{ MaBenhNhan: 6 }, { MaBenhNhan: 7 }], 
        pagination: { page: 2, limit: 5, total: 12 } 
      });
      done();
    });
  });

  // Test 2: Kiểm tra phân trang với giá trị mặc định (page=1, limit=10) khi không truyền tham số
  test('getDanhSachBenhNhanTheoNgay -> success with default pagination', (done) => {
    const req = { query: { date: '2025-01-01' } };
    const res = mockRes();

    jest.spyOn(TiepNhanModel, 'getByDate').mockImplementation((date, page, limit, cb) => 
      cb(null, { 
        data: [{ MaBenhNhan: 1 }], 
        pagination: { page: 1, limit: 10, total: 1 } 
      })
    );

    controller.getDanhSachBenhNhanTheoNgay(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        data: [{ MaBenhNhan: 1 }], 
        pagination: { page: 1, limit: 10, total: 1 } 
      });
      done();
    });
  });
});
