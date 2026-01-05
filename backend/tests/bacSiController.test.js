const BacSi = require('../models/bacSiModel');

const controller = require('../controllers/bacSiController');

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// ============================================================
// User Story 3.1 - Thêm tài khoản bác sĩ
// Số lượng test: 4
// Mô tả: Kiểm tra chức năng thêm tài khoản bác sĩ mới
// ============================================================

describe('User Story 3.1 - Thêm tài khoản bác sĩ', () => {
  // Test 1: Kiểm tra thiếu thông tin bắt buộc (HoTen)
  test('createBacSi -> 400 when missing HoTen', () => {
    const req = { body: { MaKhoa: 1 } };
    const res = mockRes();
    controller.createBacSi(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc' });
  });

  // Test 2: Kiểm tra thiếu thông tin bắt buộc (MaKhoa)
  test('createBacSi -> 400 when missing MaKhoa', () => {
    const req = { body: { HoTen: 'Nguyen Van A' } };
    const res = mockRes();
    controller.createBacSi(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Thiếu thông tin bắt buộc' });
  });

  // Test 3: Kiểm tra lỗi database khi tạo bác sĩ
  test('createBacSi -> 500 when database error', (done) => {
    const req = { body: { HoTen: 'Nguyen Van A', MaKhoa: 1 } };
    const res = mockRes();

    jest.spyOn(BacSi, 'create').mockImplementation((data, cb) => 
      cb(new Error('Database error'))
    );

    controller.createBacSi(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi tạo bác sĩ', details: expect.any(Error) });
      done();
    });
  });

  // Test 4: Kiểm tra thành công - tạo bác sĩ
  test('createBacSi -> success creates doctor', (done) => {
    const req = { 
      body: { 
        HoTen: 'Nguyen Van A', 
        MaKhoa: 1, 
        GioiTinh: 'Nam',
        NgaySinh: '1990-01-01',
        ChuyenMon: 'Tim mach',
        SoDienThoai: '0123456789',
        CCCD: '123456789012',
        DiaChi: 'Ha Noi',
        Email: 'doctor@example.com',
        TrangThai: 'Active'
      } 
    };
    const res = mockRes();

    jest.spyOn(BacSi, 'create').mockImplementation((data, cb) => 
      cb(null, { insertId: 100 })
    );

    controller.createBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Thêm bác sĩ thành công', 
        MaBacSi: 100 
      });
      done();
    });
  });
});

// ============================================================
// User Story 3.2 - Tìm kiếm bác sĩ theo tên
// Số lượng test: 5
// Mô tả: Kiểm tra chức năng tìm kiếm bác sĩ dựa trên tên
// ============================================================

describe('User Story 3.2 - Tìm kiếm bác sĩ theo tên', () => {
  // Test 1: Kiểm tra tìm kiếm với tên đầy đủ
  test('searchBacSi -> success returns results by full name', (done) => {
    const req = { query: { HoTen: 'Nguyen Van A' } };
    const res = mockRes();

    jest.spyOn(BacSi, 'search').mockImplementation((params, cb) => 
      cb(null, [{ MaBacSi: 1, HoTen: 'Nguyen Van A' }])
    );

    controller.searchBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([{ MaBacSi: 1, HoTen: 'Nguyen Van A' }]);
      done();
    });
  });

  // Test 2: Kiểm tra tìm kiếm với tên một phần (partial match)
  test('searchBacSi -> success returns results by partial name', (done) => {
    const req = { query: { HoTen: 'Nguyen' } };
    const res = mockRes();

    jest.spyOn(BacSi, 'search').mockImplementation((params, cb) => 
      cb(null, [
        { MaBacSi: 1, HoTen: 'Nguyen Van A' },
        { MaBacSi: 2, HoTen: 'Nguyen Thi B' }
      ])
    );

    controller.searchBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([
        { MaBacSi: 1, HoTen: 'Nguyen Van A' },
        { MaBacSi: 2, HoTen: 'Nguyen Thi B' }
      ]);
      done();
    });
  });

  // Test 3: Kiểm tra tìm kiếm với tên không tìm thấy
  test('searchBacSi -> success returns empty array when not found', (done) => {
    const req = { query: { HoTen: 'NonExistent' } };
    const res = mockRes();

    jest.spyOn(BacSi, 'search').mockImplementation((params, cb) => 
      cb(null, [])
    );

    controller.searchBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([]);
      done();
    });
  });

  // Test 4: Kiểm tra tìm kiếm với tên rỗng (không có tham số)
  test('searchBacSi -> success returns all when no search params', (done) => {
    const req = { query: {} };
    const res = mockRes();

    jest.spyOn(BacSi, 'search').mockImplementation((params, cb) => 
      cb(null, [
        { MaBacSi: 1, HoTen: 'Nguyen Van A' },
        { MaBacSi: 2, HoTen: 'Tran Van B' }
      ])
    );

    controller.searchBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([
        { MaBacSi: 1, HoTen: 'Nguyen Van A' },
        { MaBacSi: 2, HoTen: 'Tran Van B' }
      ]);
      done();
    });
  });

  // Test 5: Kiểm tra lỗi database khi tìm kiếm
  test('searchBacSi -> 500 when database error', (done) => {
    const req = { query: { HoTen: 'Nguyen' } };
    const res = mockRes();

    jest.spyOn(BacSi, 'search').mockImplementation((params, cb) => 
      cb(new Error('Database error'))
    );

    controller.searchBacSi(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi tìm kiếm bác sĩ', details: expect.any(Error) });
      done();
    });
  });
});

// ============================================================
// User Story 3.3 - Xem thông tin chi tiết của tài khoản bác sĩ
// Số lượng test: 1
// Mô tả: Kiểm tra chức năng xem chi tiết thông tin một bác sĩ cụ thể
// ============================================================

describe('User Story 3.3 - Xem thông tin chi tiết của tài khoản bác sĩ', () => {
  // Test 1: Kiểm tra thành công - trả về thông tin chi tiết bác sĩ
  test('getBacSiById -> success returns doctor details', (done) => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    jest.spyOn(BacSi, 'getById').mockImplementation((id, cb) => 
      cb(null, [{
        MaBacSi: 1,
        HoTen: 'Nguyen Van A',
        GioiTinh: 'Nam',
        NgaySinh: '1990-01-01',
        MaKhoa: 1,
        ChuyenMon: 'Tim mach',
        SoDienThoai: '0123456789',
        CCCD: '123456789012',
        DiaChi: 'Ha Noi',
        Email: 'doctor@example.com',
        TrangThai: 'Active'
      }])
    );

    controller.getBacSiById(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({
        MaBacSi: 1,
        HoTen: 'Nguyen Van A',
        GioiTinh: 'Nam',
        NgaySinh: '1990-01-01',
        MaKhoa: 1,
        ChuyenMon: 'Tim mach',
        SoDienThoai: '0123456789',
        CCCD: '123456789012',
        DiaChi: 'Ha Noi',
        Email: 'doctor@example.com',
        TrangThai: 'Active'
      });
      done();
    });
  });
});

// ============================================================
// User Story 3.4 - Cập nhật tài khoản bác sĩ
// Số lượng test: 4
// Mô tả: Kiểm tra chức năng cập nhật thông tin tài khoản bác sĩ
// ============================================================

describe('User Story 3.4 - Cập nhật tài khoản bác sĩ', () => {
  // Test 1: Kiểm tra thành công - cập nhật một số trường
  test('updateBacSi -> success updates doctor info', (done) => {
    const req = { 
      params: { id: 1 }, 
      body: { HoTen: 'Nguyen Van A Updated', SoDienThoai: '0987654321' } 
    };
    const res = mockRes();

    jest.spyOn(BacSi, 'update').mockImplementation((id, data, cb) => 
      cb(null, { affectedRows: 1 })
    );

    controller.updateBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Cập nhật thành công' });
      done();
    });
  });

  // Test 2: Kiểm tra cập nhật tất cả các trường
  test('updateBacSi -> success updates all fields', (done) => {
    const req = { 
      params: { id: 1 }, 
      body: { 
        HoTen: 'Updated Name',
        GioiTinh: 'Nu',
        NgaySinh: '1991-01-01',
        MaKhoa: 2,
        ChuyenMon: 'Updated Specialty',
        SoDienThoai: '0987654321',
        CCCD: '987654321098',
        DiaChi: 'Updated Address',
        Email: 'updated@example.com',
        TrangThai: 'Inactive'
      } 
    };
    const res = mockRes();

    jest.spyOn(BacSi, 'update').mockImplementation((id, data, cb) => 
      cb(null, { affectedRows: 1 })
    );

    controller.updateBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Cập nhật thành công' });
      done();
    });
  });

  // Test 3: Kiểm tra cập nhật bác sĩ không tồn tại
  test('updateBacSi -> success when doctor not exists', (done) => {
    const req = { 
      params: { id: 999 }, 
      body: { HoTen: 'Updated Name' } 
    };
    const res = mockRes();

    jest.spyOn(BacSi, 'update').mockImplementation((id, data, cb) => 
      cb(null, { affectedRows: 0 })
    );

    controller.updateBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Cập nhật thành công' });
      done();
    });
  });

  // Test 4: Kiểm tra lỗi database khi cập nhật
  test('updateBacSi -> 500 when database error', (done) => {
    const req = { 
      params: { id: 1 }, 
      body: { HoTen: 'Updated Name' } 
    };
    const res = mockRes();

    jest.spyOn(BacSi, 'update').mockImplementation((id, data, cb) => 
      cb(new Error('Database error'))
    );

    controller.updateBacSi(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi cập nhật bác sĩ', details: expect.any(Error) });
      done();
    });
  });
});

// ============================================================
// User Story 3.5 - Xóa tài khoản bác sĩ
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng xóa tài khoản bác sĩ
// ============================================================

describe('User Story 3.5 - Xóa tài khoản bác sĩ', () => {
  // Test 1: Kiểm tra thành công - xóa bác sĩ
  test('deleteBacSi -> success deletes doctor', (done) => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    jest.spyOn(BacSi, 'delete').mockImplementation((id, cb) => 
      cb(null, { affectedRows: 1 })
    );

    controller.deleteBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith({ message: 'Đã xóa bác sĩ' });
      done();
    });
  });

  // Test 2: Kiểm tra lỗi database khi xóa
  test('deleteBacSi -> 500 when database error', (done) => {
    const req = { params: { id: 1 } };
    const res = mockRes();

    jest.spyOn(BacSi, 'delete').mockImplementation((id, cb) => 
      cb(new Error('Database error'))
    );

    controller.deleteBacSi(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi xóa bác sĩ', details: expect.any(Error) });
      done();
    });
  });
});

// ============================================================
// User Story 3.6 - Phân trang bác sĩ
// Số lượng test: 2
// Mô tả: Kiểm tra chức năng phân trang danh sách bác sĩ
// ============================================================

describe('User Story 3.6 - Phân trang bác sĩ', () => {
  // Test 1: Kiểm tra lấy tất cả bác sĩ (không phân trang)
  test('getAllBacSi -> success returns all doctors', (done) => {
    const req = {};
    const res = mockRes();

    jest.spyOn(BacSi, 'getAll').mockImplementation((cb) => 
      cb(null, [
        { MaBacSi: 1, HoTen: 'Nguyen Van A' },
        { MaBacSi: 2, HoTen: 'Nguyen Thi B' }
      ])
    );

    controller.getAllBacSi(req, res);

    setImmediate(() => {
      expect(res.json).toHaveBeenCalledWith([
        { MaBacSi: 1, HoTen: 'Nguyen Van A' },
        { MaBacSi: 2, HoTen: 'Nguyen Thi B' }
      ]);
      done();
    });
  });

  // Test 2: Kiểm tra lỗi database khi lấy danh sách
  test('getAllBacSi -> 500 when database error', (done) => {
    const req = {};
    const res = mockRes();

    jest.spyOn(BacSi, 'getAll').mockImplementation((cb) => 
      cb(new Error('Database error'))
    );

    controller.getAllBacSi(req, res);

    setImmediate(() => {
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Lỗi lấy danh sách bác sĩ' });
      done();
    });
  });
});
