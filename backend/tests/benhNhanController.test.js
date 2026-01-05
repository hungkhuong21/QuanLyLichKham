const BenhNhan = require('../models/benhNhanModel');
const LichHen = require('../models/lichHenModel');
const db = require('../config/db');

const controller = require('../controllers/benhNhanController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ============================================================
// User Story 4.1 - Thêm bệnh nhân
// Số lượng test: 8
// Mô tả: Kiểm tra chức năng thêm bệnh nhân mới với các validation và trường hợp khác nhau
// ============================================================

describe('User Story 4.1 - Thêm bệnh nhân', () => {
  // Test 1: Kiểm tra thiếu thông tin bắt buộc (HoTen)
  test('createBenhNhan -> 400 when missing HoTen', () => {
    const req = { body: { NgaySinh: '1990-01-01', GioiTinh: 'Nam' } };
    const res = mockRes();
    controller.createBenhNhan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc' });
  });

  // Test 2: Kiểm tra thiếu thông tin bắt buộc (NgaySinh)
  test('createBenhNhan -> 400 when missing NgaySinh', () => {
    const req = { body: { HoTen: 'Nguyen Van A', GioiTinh: 'Nam' } };
    const res = mockRes();
    controller.createBenhNhan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc' });
  });

  // Test 3: Kiểm tra thiếu thông tin bắt buộc (GioiTinh)
  test('createBenhNhan -> 400 when missing GioiTinh', () => {
    const req = { body: { HoTen: 'Nguyen Van A', NgaySinh: '1990-01-01' } };
    const res = mockRes();
    controller.createBenhNhan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc' });
  });

  // Test 4: Kiểm tra thiếu tất cả thông tin bắt buộc
  test('createBenhNhan -> 400 when missing all required fields', () => {
    const req = { body: {} };
    const res = mockRes();
    controller.createBenhNhan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc' });
  });

  // Test 5: Kiểm tra lỗi database khi tạo bệnh nhân
  test('createBenhNhan -> 500 when database error', (done) => {
    const req = { 
      body: { 
        HoTen: 'Nguyen Van A',
        NgaySinh: '1990-01-01',
        GioiTinh: 'Nam'
      } 
    };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'create').mockImplementation((data, cb) => 
      cb(new Error('Database error'))
    );

    controller.createBenhNhan(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi tạo bệnh nhân', details: expect.any(Error) });
      done();
    });
  });

  // Test 6: Kiểm tra thành công - tạo bệnh nhân với đầy đủ thông tin
  test('createBenhNhan -> success creates patient with full info', (done) => {
    const req = { 
      body: { 
        HoTen: 'Nguyen Van A',
        NgaySinh: '1990-01-01',
        GioiTinh: 'Nam',
        SoDienThoai: '0123456789',
        CMND_CCCD: '123456789012',
        DiaChi: 'Ha Noi'
      } 
    };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'create').mockImplementation((data, cb) => 
      cb(null, { insertId: 200 })
    );

    controller.createBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Thêm bệnh nhân thành công', 
        MaBenhNhan: 200 
      });
      done();
    });
  });

  // Test 7: Kiểm tra thành công - tạo bệnh nhân với thông tin tối thiểu
  test('createBenhNhan -> success creates patient with minimal info', (done) => {
    const req = { 
      body: { 
        HoTen: 'Nguyen Van B',
        NgaySinh: '1991-01-01',
        GioiTinh: 'Nu'
      } 
    };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'create').mockImplementation((data, cb) => 
      cb(null, { insertId: 201 })
    );

    controller.createBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Thêm bệnh nhân thành công', 
        MaBenhNhan: 201 
      });
      done();
    });
  });

  // Test 8: Kiểm tra thành công - tạo bệnh nhân với số điện thoại và CCCD
  test('createBenhNhan -> success creates patient with phone and CCCD', (done) => {
    const req = { 
      body: { 
        HoTen: 'Nguyen Van C',
        NgaySinh: '1992-01-01',
        GioiTinh: 'Nam',
        SoDienThoai: '0987654321',
        CMND_CCCD: '987654321098'
      } 
    };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'create').mockImplementation((data, cb) => 
      cb(null, { insertId: 202 })
    );

    controller.createBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Thêm bệnh nhân thành công', 
        MaBenhNhan: 202 
      });
      done();
    });
  });
});

// ============================================================
// User Story 4.2 - Tìm bệnh nhân theo tên, sđt...
// Số lượng test: 3
// Mô tả: Kiểm tra chức năng tìm kiếm bệnh nhân dựa trên tên, số điện thoại, v.v.
// ============================================================

describe('User Story 4.2 - Tìm bệnh nhân theo tên, sđt...', () => {
  // Test 1: Kiểm tra tìm kiếm theo tên
  test('searchBenhNhan -> success returns results by name', (done) => {
    const req = { query: { HoTen: 'Nguyen', page: 1, limit: 10 } };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'search').mockImplementation((params, page, limit, cb) => 
      cb(null, {
        data: [{ MaBenhNhan: 1, HoTen: 'Nguyen Van A' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })
    );

    controller.searchBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({
        data: [{ MaBenhNhan: 1, HoTen: 'Nguyen Van A' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });
      done();
    });
  });

  // Test 2: Kiểm tra tìm kiếm theo số điện thoại
  test('searchBenhNhan -> success returns results by phone', (done) => {
    const req = { query: { SoDienThoai: '0123456789', page: 1, limit: 10 } };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'search').mockImplementation((params, page, limit, cb) => 
      cb(null, {
        data: [{ MaBenhNhan: 1, SoDienThoai: '0123456789' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })
    );

    controller.searchBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({
        data: [{ MaBenhNhan: 1, SoDienThoai: '0123456789' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });
      done();
    });
  });

  // Test 3: Kiểm tra tìm kiếm theo CMND/CCCD
  test('searchBenhNhan -> success returns results by CMND_CCCD', (done) => {
    const req = { query: { CMND_CCCD: '123456789012', page: 1, limit: 10 } };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'search').mockImplementation((params, page, limit, cb) => 
      cb(null, {
        data: [{ MaBenhNhan: 1, CMND_CCCD: '123456789012' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })
    );

    controller.searchBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({
        data: [{ MaBenhNhan: 1, CMND_CCCD: '123456789012' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });
      done();
    });
  });
});

// ============================================================
// User Story 4.3 - Xem thông tin chi tiết của bệnh nhân
// Số lượng test: 1
// Mô tả: Kiểm tra chức năng xem chi tiết thông tin một bệnh nhân cụ thể
// ============================================================

describe('User Story 4.3 - Xem thông tin chi tiết của bệnh nhân', () => {
  // Test 1: Kiểm tra thành công - trả về thông tin chi tiết bệnh nhân
  test('getBenhNhanById -> success returns patient details', (done) => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'getById').mockImplementation((id, cb) => 
      cb(null, [{
        MaBenhNhan: 1,
        HoTen: 'Nguyen Van A',
        NgaySinh: '1990-01-01',
        GioiTinh: 'Nam',
        SoDienThoai: '0123456789',
        CMND_CCCD: '123456789012',
        DiaChi: 'Ha Noi'
      }])
    );

    controller.getBenhNhanById(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({
        MaBenhNhan: 1,
        HoTen: 'Nguyen Van A',
        NgaySinh: '1990-01-01',
        GioiTinh: 'Nam',
        SoDienThoai: '0123456789',
        CMND_CCCD: '123456789012',
        DiaChi: 'Ha Noi'
      });
      done();
    });
  });
});

// ============================================================
// User Story 4.4 - Cập nhật tài khoản của bệnh nhân
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng cập nhật thông tin tài khoản bệnh nhân
// ============================================================

describe('User Story 4.4 - Cập nhật tài khoản của bệnh nhân', () => {
  // Test 1: Kiểm tra thành công - cập nhật thông tin bệnh nhân
  test('updateBenhNhan -> success updates patient info', (done) => {
    const req = { 
      params: { id: 1 }, 
      body: { HoTen: 'Nguyen Van A Updated', SoDienThoai: '0987654321' } 
    };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'update').mockImplementation((id, data, cb) => 
      cb(null, { affectedRows: 1 })
    );

    controller.updateBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Cập nhật thành công' });
      done();
    });
  });

  // Test 2: Kiểm tra lỗi database khi cập nhật
  test('updateBenhNhan -> 500 when database error', (done) => {
    const req = { 
      params: { id: 1 }, 
      body: { HoTen: 'Updated Name' } 
    };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'update').mockImplementation((id, data, cb) => 
      cb(new Error('Database error'))
    );

    controller.updateBenhNhan(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi cập nhật bệnh nhân', details: expect.any(Error) });
      done();
    });
  });
});

// ============================================================
// User Story 4.5 - Xoá tài khoản của bệnh nhân
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng xóa tài khoản bệnh nhân
// ============================================================

describe('User Story 4.5 - Xoá tài khoản của bệnh nhân', () => {
  // Test 1: Kiểm tra không thể xóa khi có lịch hẹn liên quan
  test('deleteBenhNhan -> 400 when has related appointments', (done) => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'getById').mockImplementation((id, cb) => 
      cb(null, [{ MaBenhNhan: 1 }])
    );
    jest.spyOn(LichHen, 'getByMaBenhNhan').mockImplementation((id, filter, cb) => 
      cb(null, [{ MaLichHen: 1 }])
    );
    jest.spyOn(db, 'query').mockImplementation((sql, params, cb) => {
      if (sql.includes('SELECT * FROM tiepnhan')) {
        cb(null, []); // Không có tiếp nhận
      }
    });

    controller.deleteBenhNhan(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('lịch hẹn')
      }));
      done();
    });
  });

  // Test 2: Kiểm tra thành công - xóa bệnh nhân không có dữ liệu liên quan
  test('deleteBenhNhan -> success deletes patient without relations', (done) => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'getById').mockImplementation((id, cb) => 
      cb(null, [{ MaBenhNhan: 1 }])
    );
    jest.spyOn(LichHen, 'getByMaBenhNhan').mockImplementation((id, filter, cb) => 
      cb(null, [])
    );
    jest.spyOn(db, 'query').mockImplementation((sql, params, cb) => {
      if (sql.includes('SELECT * FROM tiepnhan')) {
        cb(null, []); // Không có tiếp nhận
      }
    });
    jest.spyOn(BenhNhan, 'delete').mockImplementation((id, cb) => 
      cb(null, { affectedRows: 1 })
    );

    controller.deleteBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Đã xóa bệnh nhân thành công' });
      done();
    });
  });
});

// ============================================================
// User Story 4.6 - Phân trang bệnh nhân
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng phân trang danh sách bệnh nhân
// ============================================================

describe('User Story 4.6 - Phân trang bệnh nhân', () => {
  // Test 1: Kiểm tra phân trang với tham số page và limit
  test('getAllBenhNhan -> success returns paginated patients', (done) => {
    const req = { query: { page: 1, limit: 10 } };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'getAll').mockImplementation((page, limit, cb) => 
      cb(null, {
        data: [{ MaBenhNhan: 1 }, { MaBenhNhan: 2 }],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    );

    controller.getAllBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({
        data: [{ MaBenhNhan: 1 }, { MaBenhNhan: 2 }],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      });
      done();
    });
  });

  // Test 2: Kiểm tra phân trang với giá trị mặc định
  test('getAllBenhNhan -> success with default pagination', (done) => {
    const req = { query: {} };
    const res = mockRes();

    jest.spyOn(BenhNhan, 'getAll').mockImplementation((page, limit, cb) => 
      cb(null, {
        data: [{ MaBenhNhan: 1 }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })
    );

    controller.getAllBenhNhan(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({
        data: [{ MaBenhNhan: 1 }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      });
      done();
    });
  });
});
