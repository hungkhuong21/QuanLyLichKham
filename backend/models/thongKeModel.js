const db = require('../config/db');

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

