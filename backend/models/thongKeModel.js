const db = require('../config/db');

// Thống kê doanh thu theo khoảng thời gian
exports.thongKeDoanhThu = (ngayBatDau, ngayKetThuc, callback) => {
  const sql = `
    SELECT 
      DATE(hd.NgayLap) AS Ngay,
      COUNT(DISTINCT hd.MaHD) AS SoHoaDon,
      SUM(hd.TongTien) AS TongTien,
      SUM((hd.TongTien * hd.Thue / 100) - hd.GiamGia) AS TongThue,
      SUM(hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia) AS TongTienSauThue,
      SUM(CASE WHEN hd.TrangThai = 'Đã thanh toán' THEN hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia ELSE 0 END) AS TongTienDaThanhToan,
      SUM(CASE WHEN hd.TrangThai = 'Chưa thanh toán' THEN hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia ELSE 0 END) AS TongTienChuaThanhToan
    FROM hoadon hd
    WHERE DATE(hd.NgayLap) BETWEEN ? AND ?
    GROUP BY DATE(hd.NgayLap)
    ORDER BY Ngay DESC
  `;
  db.query(sql, [ngayBatDau, ngayKetThuc], callback);
};

// Thống kê tổng quan doanh thu
exports.thongKeTongQuanDoanhThu = (ngayBatDau, ngayKetThuc, callback) => {
  const sql = `
    SELECT 
      COUNT(DISTINCT hd.MaHD) AS TongSoHoaDon,
      COUNT(DISTINCT CASE WHEN hd.TrangThai = 'Đã thanh toán' THEN hd.MaHD END) AS SoHoaDonDaThanhToan,
      COUNT(DISTINCT CASE WHEN hd.TrangThai = 'Chưa thanh toán' THEN hd.MaHD END) AS SoHoaDonChuaThanhToan,
      SUM(hd.TongTien) AS TongTienTatCa,
      SUM((hd.TongTien * hd.Thue / 100) - hd.GiamGia) AS TongThue,
      SUM(hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia) AS TongTienSauThue,
      SUM(CASE WHEN hd.TrangThai = 'Đã thanh toán' THEN hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia ELSE 0 END) AS TongTienDaThanhToan,
      SUM(CASE WHEN hd.TrangThai = 'Chưa thanh toán' THEN hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia ELSE 0 END) AS TongTienChuaThanhToan
    FROM hoadon hd
    WHERE DATE(hd.NgayLap) BETWEEN ? AND ?
  `;
  db.query(sql, [ngayBatDau, ngayKetThuc], callback);
};

// Thống kê doanh thu theo bác sĩ
exports.thongKeDoanhThuTheoBacSi = (ngayBatDau, ngayKetThuc, callback) => {
  const sql = `
    SELECT 
      bs.MaBacSi,
      bs.HoTen AS TenBacSi,
      bs.ChuyenMon,
      k.TenKhoa,
      COUNT(DISTINCT lh.MaLichHen) AS SoLichHen,
      COUNT(DISTINCT hd.MaHD) AS SoHoaDon,
      COALESCE(SUM(hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia), 0) AS TongDoanhThu
    FROM bacsi bs
    LEFT JOIN khoa k ON bs.MaKhoa = k.MaKhoa
    LEFT JOIN lichhen lh ON bs.MaBacSi = lh.MaBacSi
    LEFT JOIN tiepnhan tn ON lh.MaLichHen = tn.MaLichHen
    LEFT JOIN hoadon hd ON tn.MaBenhNhan = hd.MaBN AND DATE(hd.NgayLap) BETWEEN ? AND ?
    WHERE bs.TrangThai = 'Active'
    GROUP BY bs.MaBacSi, bs.HoTen, bs.ChuyenMon, k.TenKhoa
    ORDER BY TongDoanhThu DESC
  `;
  db.query(sql, [ngayBatDau, ngayKetThuc], callback);
};

// Thống kê doanh thu theo khoa
exports.thongKeDoanhThuTheoKhoa = (ngayBatDau, ngayKetThuc, callback) => {
  const sql = `
    SELECT 
      k.MaKhoa,
      k.TenKhoa,
      COUNT(DISTINCT bs.MaBacSi) AS SoBacSi,
      COUNT(DISTINCT lh.MaLichHen) AS SoLichHen,
      COUNT(DISTINCT hd.MaHD) AS SoHoaDon,
      COALESCE(SUM(hd.TongTien + (hd.TongTien * hd.Thue / 100) - hd.GiamGia), 0) AS TongDoanhThu
    FROM khoa k
    LEFT JOIN bacsi bs ON k.MaKhoa = bs.MaKhoa AND bs.TrangThai = 'Active'
    LEFT JOIN lichhen lh ON bs.MaBacSi = lh.MaBacSi
    LEFT JOIN tiepnhan tn ON lh.MaLichHen = tn.MaLichHen
    LEFT JOIN hoadon hd ON tn.MaBenhNhan = hd.MaBN AND DATE(hd.NgayLap) BETWEEN ? AND ?
    GROUP BY k.MaKhoa, k.TenKhoa
    ORDER BY TongDoanhThu DESC
  `;
  db.query(sql, [ngayBatDau, ngayKetThuc], callback);
};

// Thống kê bệnh nhân
exports.thongKeBenhNhan = (ngayBatDau, ngayKetThuc, callback) => {
  const sql = `
    SELECT 
      COUNT(DISTINCT bn.MaBenhNhan) AS TongSoBenhNhan,
      COUNT(DISTINCT CASE WHEN DATE(bn.NgayTao) BETWEEN ? AND ? THEN bn.MaBenhNhan END) AS BenhNhanMoi,
      COUNT(DISTINCT lh.MaLichHen) AS TongSoLichHen,
      COUNT(DISTINCT CASE WHEN lh.TrangThai = 'Hoàn thành' THEN lh.MaLichHen END) AS LichHenHoanThanh,
      COUNT(DISTINCT CASE WHEN lh.TrangThai = 'Đã hủy' THEN lh.MaLichHen END) AS LichHenHuy
    FROM benhnhan bn
    LEFT JOIN lichhen lh ON bn.MaBenhNhan = lh.MaBenhNhan
  `;
  db.query(sql, [ngayBatDau, ngayKetThuc], callback);
};

// Thống kê lịch hẹn theo trạng thái
exports.thongKeLichHen = (ngayBatDau, ngayKetThuc, callback) => {
  const sql = `
    SELECT 
      lh.TrangThai,
      COUNT(*) AS SoLuong,
      COUNT(DISTINCT lh.MaBenhNhan) AS SoBenhNhan
    FROM lichhen lh
    WHERE DATE(lh.ThoiGianKham) BETWEEN ? AND ?
    GROUP BY lh.TrangThai
    ORDER BY SoLuong DESC
  `;
  db.query(sql, [ngayBatDau, ngayKetThuc], callback);
};

// Thống kê phương thức thanh toán
exports.thongKePhuongThucThanhToan = (ngayBatDau, ngayKetThuc, callback) => {
  const sql = `
    SELECT 
      tt.PhuongThuc,
      COUNT(*) AS SoLuong,
      SUM(tt.SoTien) AS TongTien,
      AVG(tt.SoTien) AS TrungBinh
    FROM thanhtoan tt
    LEFT JOIN hoadon hd ON tt.MaHD = hd.MaHD
    WHERE DATE(hd.NgayLap) BETWEEN ? AND ? AND tt.TrangThai = 'Thành công'
    GROUP BY tt.PhuongThuc
    ORDER BY TongTien DESC
  `;
  db.query(sql, [ngayBatDau, ngayKetThuc], callback);
};

// Thống kê tổng quan hệ thống
exports.thongKeTongQuan = (callback) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM benhnhan) AS TongSoBenhNhan,
      (SELECT COUNT(*) FROM bacsi WHERE TrangThai = 'Active') AS TongSoBacSi,
      (SELECT COUNT(*) FROM lichhen) AS TongSoLichHen,
      (SELECT COUNT(*) FROM hoadon) AS TongSoHoaDon,
      (SELECT COUNT(*) FROM hoadon WHERE TrangThai = 'Đã thanh toán') AS SoHoaDonDaThanhToan,
      (SELECT SUM(TongTien + (TongTien * Thue / 100) - GiamGia) FROM hoadon WHERE TrangThai = 'Đã thanh toán') AS TongDoanhThu,
      (SELECT COUNT(*) FROM khoa) AS TongSoKhoa
  `;
  db.query(sql, callback);
};

