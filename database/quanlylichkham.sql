-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 18, 2025 at 01:16 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quanlylichkham`
--

-- --------------------------------------------------------

--
-- Table structure for table `bacsi`
--

DROP TABLE IF EXISTS `bacsi`;
CREATE TABLE IF NOT EXISTS `bacsi` (
  `MaBacSi` int NOT NULL AUTO_INCREMENT,
  `HoTen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `GioiTinh` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgaySinh` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `MaKhoa` int NOT NULL,
  `ChuyenMon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SoDienThoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CCCD` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DiaChi` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrangThai` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`MaBacSi`),
  KEY `idx_bacsi_khoa` (`MaKhoa`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bacsi`
--

INSERT INTO `bacsi` (`MaBacSi`, `HoTen`, `GioiTinh`, `NgaySinh`, `MaKhoa`, `ChuyenMon`, `SoDienThoai`, `CCCD`, `DiaChi`, `Email`, `TrangThai`) VALUES
(1, 'BS. Nguyễn Văn A', 'Nam', '1975-01-20', 1, 'Tim mạch', '0912345678', '012345678901', 'Quy Nhơn Nam, Bình Định', 'bsa@hospital.vn', 'Inactive'),
(2, 'BS. Trần Thị B', 'Nữ', '1980-01-20', 2, 'Nhi khoa', '0987654321', '098765432109', 'An Nhơn, Bình Định', 'bsb@hospital.vn', 'Active'),
(3, 'BS. Lê Văn C', 'Nam', '1985-01-20', 3, 'Xương khớp', '0909988776', '012345557788', 'Phù Cát, Bình Định\r\n', 'bsc@hospital.vn', 'Active'),
(4, 'BS. Phạm Thị D', 'Nữ', '1979-03-20', 4, 'Ngoại tổng hợp', '0933555777', '056789012345', 'Tuy Phước, Bình Định', 'bsd@hospital.vn', 'Active'),
(5, 'BS. Nguyễn Văn Nam', 'Nam', '1987-01-30', 1, 'Nội tổng quát', '0987654321', '011223344556', 'Hoài Nhơn, Bình Định', 'bacsiC@hospital.vn', 'Active');

-- --------------------------------------------------------

--
-- Table structure for table `baocaodoanhthu`
--

DROP TABLE IF EXISTS `baocaodoanhthu`;
CREATE TABLE IF NOT EXISTS `baocaodoanhthu` (
  `MaBC` int NOT NULL AUTO_INCREMENT,
  `NgayBatDau` date NOT NULL,
  `NgayKetThuc` date NOT NULL,
  `TongSoHoaDon` int DEFAULT NULL,
  `TongTienThu` decimal(18,2) DEFAULT NULL,
  `GhiChu` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MaBC`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `benhnhan`
--

DROP TABLE IF EXISTS `benhnhan`;
CREATE TABLE IF NOT EXISTS `benhnhan` (
  `MaBenhNhan` int NOT NULL AUTO_INCREMENT,
  `HoTen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgaySinh` date DEFAULT NULL,
  `GioiTinh` enum('Nam','Nữ','Khác') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SoDienThoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `CMND_CCCD` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DiaChi` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaBenhNhan`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `benhnhan`
--

INSERT INTO `benhnhan` (`MaBenhNhan`, `HoTen`, `NgaySinh`, `GioiTinh`, `SoDienThoai`, `CMND_CCCD`, `DiaChi`, `NgayTao`) VALUES
(1, 'Nguyễn Văn E', '1995-05-10', 'Nam', '0911111111', '012345678901', 'Quy Nhơn, Bình Định', '2025-11-05 12:50:09'),
(2, 'Trần Thị F', '1988-09-20', 'Nữ', '0922222222', '098765432109', 'An Nhơn, Bình Định', '2025-11-05 12:50:09'),
(3, 'Lê Văn G', '2001-01-15', 'Nam', '0933333333', '034567890123', 'Phù Cát, Bình Định', '2025-11-05 12:50:09'),
(4, 'Phạm Thị H', '1993-07-25', 'Nữ', '0944444444', '056789012345', 'Tuy Phước, Bình Định', '2025-11-05 12:50:09'),
(5, 'Ngô Hùng Khương', '2004-07-05', 'Nam', '0123456789', '123456789', 'Hoài Nhơn', '2025-11-05 13:12:39');

-- --------------------------------------------------------

--
-- Table structure for table `hoadon`
--

DROP TABLE IF EXISTS `hoadon`;
CREATE TABLE IF NOT EXISTS `hoadon` (
  `MaHD` int NOT NULL AUTO_INCREMENT,
  `MaBN` int NOT NULL,
  `NgayLap` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TongTien` decimal(18,2) NOT NULL,
  `Thue` decimal(18,2) DEFAULT '0.00',
  `GiamGia` decimal(18,2) DEFAULT '0.00',
  `TrangThai` enum('Chưa thanh toán','Đã thanh toán') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chưa thanh toán',
  PRIMARY KEY (`MaHD`),
  KEY `idx_hoadon_mabn` (`MaBN`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hoadon`
--

INSERT INTO `hoadon` (`MaHD`, `MaBN`, `NgayLap`, `TongTien`, `Thue`, `GiamGia`, `TrangThai`) VALUES
(1, 1, '2025-11-10 10:47:45', 500000.00, 10.00, 50000.00, 'Đã thanh toán');

-- --------------------------------------------------------

--
-- Table structure for table `khoa`
--

DROP TABLE IF EXISTS `khoa`;
CREATE TABLE IF NOT EXISTS `khoa` (
  `MaKhoa` int NOT NULL AUTO_INCREMENT,
  `TenKhoa` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MaKhoa`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `khoa`
--

INSERT INTO `khoa` (`MaKhoa`, `TenKhoa`, `MoTa`) VALUES
(1, 'Khoa tim mạch', 'Khám và điều trị bệnh tim mạch'),
(2, 'Khoa nhi', 'Khám trẻ em'),
(3, 'Khoa da liễu', 'Điều trị các bệnh về da'),
(4, 'Khoa ngoại tổng hợp', 'Phẫu thuật & điều trị ngoại khoa');

-- --------------------------------------------------------

--
-- Table structure for table `lichhen`
--

DROP TABLE IF EXISTS `lichhen`;
CREATE TABLE IF NOT EXISTS `lichhen` (
  `MaLichHen` int NOT NULL AUTO_INCREMENT,
  `MaBenhNhan` int NOT NULL,
  `MaBacSi` int NOT NULL,
  `ThoiGianKham` datetime NOT NULL,
  `TrangThai` enum('Đã đặt','Đã hủy','Hoàn thành','Đổi lịch') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Đã đặt',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `Note` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`MaLichHen`),
  KEY `MaBenhNhan` (`MaBenhNhan`),
  KEY `MaBacSi` (`MaBacSi`),
  KEY `idx_lichhen_thoigian` (`ThoiGianKham`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lichhen`
--

INSERT INTO `lichhen` (`MaLichHen`, `MaBenhNhan`, `MaBacSi`, `ThoiGianKham`, `TrangThai`, `CreatedAt`, `UpdatedAt`, `Note`) VALUES
(1, 1, 2, '2025-11-10 09:00:00', 'Hoàn thành', '2025-11-05 13:02:10', '2025-11-10 10:37:40', 'Khám tổng quát'),
(2, 2, 2, '2025-12-11 03:00:00', 'Hoàn thành', '2025-11-05 13:07:20', '2025-11-14 10:18:33', 'Khám tổng quát'),
(3, 1, 1, '2024-12-25 10:00:00', 'Đã hủy', '2025-11-10 10:16:00', '2025-11-14 09:53:11', 'Khám định kỳ'),
(4, 1, 1, '2024-12-25 08:00:00', 'Đã hủy', '2025-11-10 10:17:38', '2025-11-16 08:44:19', 'Khám định kỳ'),
(5, 1, 2, '2025-11-14 11:08:00', 'Đã hủy', '2025-11-13 15:09:10', '2025-11-13 15:09:43', 'Đặt lịch bởi Ngô Hùng Khương (0123456789)'),
(6, 1, 4, '2025-12-12 01:00:00', 'Hoàn thành', '2025-11-16 08:32:27', '2025-11-16 08:41:10', 'Đặt lịch bởi Ngô Hùng Khương (0123123131)'),
(7, 1, 3, '2025-12-11 01:00:00', 'Hoàn thành', '2025-11-16 08:57:10', '2025-11-17 12:06:56', 'Đặt lịch bởi Ngô Hùng Khương (0123123131)'),
(8, 1, 1, '2025-12-11 06:00:00', 'Hoàn thành', '2025-11-16 14:18:24', '2025-11-17 12:06:46', 'Đặt lịch bởi Nguyễn Văn Nam (0132323232)'),
(9, 5, 1, '2025-12-10 18:00:00', 'Hoàn thành', '2025-11-17 12:07:44', '2025-11-18 08:08:22', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lichlamviec`
--

DROP TABLE IF EXISTS `lichlamviec`;
CREATE TABLE IF NOT EXISTS `lichlamviec` (
  `MaLich` int NOT NULL AUTO_INCREMENT,
  `MaBacSi` int NOT NULL,
  `NgayLamViec` date NOT NULL,
  `GioBatDau` time NOT NULL,
  `GioKetThuc` time NOT NULL,
  `TrangThai` enum('Hoạt động','Nghỉ','Tạm nghỉ') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Hoạt động',
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaLich`),
  KEY `idx_lichlamviec_bacsi` (`MaBacSi`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lichlamviec`
--

INSERT INTO `lichlamviec` (`MaLich`, `MaBacSi`, `NgayLamViec`, `GioBatDau`, `GioKetThuc`, `TrangThai`, `NgayTao`) VALUES
(1, 1, '2025-11-10', '08:00:00', '12:00:00', 'Nghỉ', '2025-11-05 16:20:07'),
(2, 1, '2025-11-06', '13:00:00', '16:00:00', 'Hoạt động', '2025-11-05 16:20:07'),
(3, 2, '2025-11-06', '08:00:00', '12:00:00', 'Hoạt động', '2025-11-05 16:20:07'),
(4, 3, '2025-11-07', '08:00:00', '11:00:00', 'Hoạt động', '2025-11-05 16:20:07'),
(5, 1, '2025-11-07', '13:30:00', '16:30:00', 'Nghỉ', '2025-11-05 16:20:07'),
(6, 5, '2025-11-07', '07:30:00', '11:00:00', 'Hoạt động', '2025-11-05 16:20:07');

-- --------------------------------------------------------

--
-- Table structure for table `nhanvien`
--

DROP TABLE IF EXISTS `nhanvien`;
CREATE TABLE IF NOT EXISTS `nhanvien` (
  `MaNV` int NOT NULL AUTO_INCREMENT,
  `HoTen` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ChucVu` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Thu ngân',
  `SDT` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaNV`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `nhanvien`
--

INSERT INTO `nhanvien` (`MaNV`, `HoTen`, `ChucVu`, `SDT`, `Email`, `NgayTao`) VALUES
(1, 'Nguyễn Thị Admin', 'Quản trị hệ thống', '0909090909', 'admin@hospital.vn', '2025-11-05 12:50:09'),
(2, 'Lê Văn Nhân', 'Thu ngân', '0907070707', 'nhanvien1@hospital.vn', '2025-11-05 12:50:09');

-- --------------------------------------------------------

--
-- Table structure for table `taikhoan`
--

DROP TABLE IF EXISTS `taikhoan`;
CREATE TABLE IF NOT EXISTS `taikhoan` (
  `MaTK` int NOT NULL AUTO_INCREMENT,
  `TenDangNhap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MatKhau` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `VaiTroID` int DEFAULT NULL,
  `LoaiNguoiDung` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiDung` int NOT NULL,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HoatDong',
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `NgayCapNhat` datetime DEFAULT NULL,
  PRIMARY KEY (`MaTK`),
  UNIQUE KEY `TenDangNhap` (`TenDangNhap`),
  KEY `VaiTroID` (`VaiTroID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `taikhoan`
--

INSERT INTO `taikhoan` (`MaTK`, `TenDangNhap`, `MatKhau`, `VaiTroID`, `LoaiNguoiDung`, `MaNguoiDung`, `TrangThai`, `NgayTao`, `NgayCapNhat`) VALUES
(1, 'admin@hospital.vn', '123456', 1, 'NhanVien', 1, 'HoatDong', '2025-11-03 09:35:34', NULL),
(2, 'bacsiA@hospital.vn', 'abc123', 2, 'BacSi', 1, 'HoatDong', '2025-11-03 09:35:34', NULL),
(3, 'hungkhuong32@gmail.com', '1234567', 3, 'BenhNhan', 1, 'HoatDong', '2025-11-03 09:35:34', '2025-11-13 15:06:21'),
(6, 'nhk@gmail.com', '1234567', 2, 'BacSi', 1, 'HoatDong', '2025-11-14 10:19:47', NULL),
(7, 'a@gmail.com', '123456', 3, 'BenhNhan', 0, 'HoatDong', '2025-11-16 08:51:26', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `thanhtoan`
--

DROP TABLE IF EXISTS `thanhtoan`;
CREATE TABLE IF NOT EXISTS `thanhtoan` (
  `MaTT` int NOT NULL AUTO_INCREMENT,
  `MaHD` int NOT NULL,
  `PhuongThuc` enum('Tiền mặt','Thẻ ngân hàng','Ví điện tử') COLLATE utf8mb4_unicode_ci NOT NULL,
  `SoTien` decimal(18,2) NOT NULL,
  `NgayTT` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `TrangThai` enum('Thành công','Thất bại') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Thành công',
  PRIMARY KEY (`MaTT`),
  KEY `MaHD` (`MaHD`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `thanhtoan`
--

INSERT INTO `thanhtoan` (`MaTT`, `MaHD`, `PhuongThuc`, `SoTien`, `NgayTT`, `TrangThai`) VALUES
(1, 1, 'Tiền mặt', 500000.00, '2025-11-10 10:49:10', 'Thành công');

-- --------------------------------------------------------

--
-- Table structure for table `tiepnhan`
--

DROP TABLE IF EXISTS `tiepnhan`;
CREATE TABLE IF NOT EXISTS `tiepnhan` (
  `MaTiepNhan` int NOT NULL AUTO_INCREMENT,
  `MaBenhNhan` int NOT NULL,
  `MaBacSi` int NOT NULL,
  `MaKhoa` int NOT NULL,
  `MaLichHen` int DEFAULT NULL,
  `MaTrangThai` int NOT NULL,
  `NgayTiepNhan` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `GhiChu` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MaTiepNhan`),
  KEY `MaBenhNhan` (`MaBenhNhan`),
  KEY `MaBacSi` (`MaBacSi`),
  KEY `MaKhoa` (`MaKhoa`),
  KEY `MaLichHen` (`MaLichHen`),
  KEY `MaTrangThai` (`MaTrangThai`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tiepnhan`
--

INSERT INTO `tiepnhan` (`MaTiepNhan`, `MaBenhNhan`, `MaBacSi`, `MaKhoa`, `MaLichHen`, `MaTrangThai`, `NgayTiepNhan`, `GhiChu`) VALUES
(1, 1, 1, 1, 4, 4, '2025-11-10 10:17:39', NULL),
(2, 1, 2, 2, 1, 3, '2025-11-10 10:34:19', NULL),
(3, 1, 4, 4, 6, 3, '2025-11-16 08:32:28', NULL),
(4, 1, 3, 3, 7, 3, '2025-11-16 08:57:11', NULL),
(5, 1, 1, 1, 8, 3, '2025-11-16 14:18:26', NULL),
(6, 5, 1, 1, 9, 3, '2025-11-17 12:07:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `trangthaitiepnhan`
--

DROP TABLE IF EXISTS `trangthaitiepnhan`;
CREATE TABLE IF NOT EXISTS `trangthaitiepnhan` (
  `MaTrangThai` int NOT NULL AUTO_INCREMENT,
  `TenTrangThai` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`MaTrangThai`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trangthaitiepnhan`
--

INSERT INTO `trangthaitiepnhan` (`MaTrangThai`, `TenTrangThai`) VALUES
(1, 'Chờ xác nhận'),
(2, 'Đã tiếp nhận'),
(3, 'Đã hoàn thành'),
(4, 'Đã hủy');

-- --------------------------------------------------------

--
-- Table structure for table `vaitro`
--

DROP TABLE IF EXISTS `vaitro`;
CREATE TABLE IF NOT EXISTS `vaitro` (
  `MaVaiTro` int NOT NULL AUTO_INCREMENT,
  `TenVaiTro` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MoTa` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`MaVaiTro`),
  UNIQUE KEY `TenVaiTro` (`TenVaiTro`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vaitro`
--

INSERT INTO `vaitro` (`MaVaiTro`, `TenVaiTro`, `MoTa`) VALUES
(1, 'Admin', 'Quản trị hệ thống'),
(2, 'BacSi', 'Bác sĩ'),
(3, 'BenhNhan', 'Người dùng bệnh nhân');

-- --------------------------------------------------------

--
-- Table structure for table `xacthuc`
--

DROP TABLE IF EXISTS `xacthuc`;
CREATE TABLE IF NOT EXISTS `xacthuc` (
  `MaXacThuc` int NOT NULL AUTO_INCREMENT,
  `MaTK` int NOT NULL,
  `Loai` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaOTP` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `HanSuDung` datetime NOT NULL,
  `DaSuDung` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`MaXacThuc`),
  KEY `MaTK` (`MaTK`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `xacthuc`
--

INSERT INTO `xacthuc` (`MaXacThuc`, `MaTK`, `Loai`, `MaOTP`, `NgayTao`, `HanSuDung`, `DaSuDung`) VALUES
(1, 3, 'password_reset', '1277', '2025-11-05 15:34:49', '2025-11-05 15:49:49', 0),
(2, 3, 'password_reset', '5842', '2025-11-05 15:38:47', '2025-11-05 15:53:47', 0),
(3, 3, 'password_reset', '1571', '2025-11-05 15:38:52', '2025-11-05 15:53:52', 0),
(4, 3, 'password_reset', '6701', '2025-11-05 15:54:24', '2025-11-05 16:09:24', 0),
(5, 3, 'password_reset', '2376', '2025-11-05 15:55:26', '2025-11-05 16:10:26', 0),
(6, 3, 'password_reset', '7427', '2025-11-05 15:56:22', '2025-11-05 16:11:22', 0),
(7, 3, 'password_reset', '7231', '2025-11-05 15:56:30', '2025-11-05 16:11:30', 0),
(8, 3, 'password_reset', '4261', '2025-11-05 15:58:15', '2025-11-05 16:13:15', 0),
(9, 3, 'password_reset', '6635', '2025-11-05 15:59:28', '2025-11-05 16:14:28', 0),
(10, 3, 'password_reset', '3179', '2025-11-05 16:00:46', '2025-11-05 16:15:46', 0),
(11, 3, 'password_reset', '4638', '2025-11-05 16:01:28', '2025-11-05 16:02:28', 1),
(12, 3, 'password_reset', '1251', '2025-11-13 15:05:21', '2025-11-13 15:06:21', 1);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bacsi`
--
ALTER TABLE `bacsi`
  ADD CONSTRAINT `bacsi_ibfk_1` FOREIGN KEY (`MaKhoa`) REFERENCES `khoa` (`MaKhoa`);

--
-- Constraints for table `hoadon`
--
ALTER TABLE `hoadon`
  ADD CONSTRAINT `hoadon_ibfk_1` FOREIGN KEY (`MaBN`) REFERENCES `benhnhan` (`MaBenhNhan`);

--
-- Constraints for table `lichhen`
--
ALTER TABLE `lichhen`
  ADD CONSTRAINT `lichhen_ibfk_1` FOREIGN KEY (`MaBenhNhan`) REFERENCES `benhnhan` (`MaBenhNhan`),
  ADD CONSTRAINT `lichhen_ibfk_2` FOREIGN KEY (`MaBacSi`) REFERENCES `bacsi` (`MaBacSi`);

--
-- Constraints for table `lichlamviec`
--
ALTER TABLE `lichlamviec`
  ADD CONSTRAINT `lichlamviec_ibfk_1` FOREIGN KEY (`MaBacSi`) REFERENCES `bacsi` (`MaBacSi`);

--
-- Constraints for table `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`VaiTroID`) REFERENCES `vaitro` (`MaVaiTro`);

--
-- Constraints for table `thanhtoan`
--
ALTER TABLE `thanhtoan`
  ADD CONSTRAINT `thanhtoan_ibfk_1` FOREIGN KEY (`MaHD`) REFERENCES `hoadon` (`MaHD`);

--
-- Constraints for table `tiepnhan`
--
ALTER TABLE `tiepnhan`
  ADD CONSTRAINT `tiepnhan_ibfk_1` FOREIGN KEY (`MaBenhNhan`) REFERENCES `benhnhan` (`MaBenhNhan`),
  ADD CONSTRAINT `tiepnhan_ibfk_2` FOREIGN KEY (`MaBacSi`) REFERENCES `bacsi` (`MaBacSi`),
  ADD CONSTRAINT `tiepnhan_ibfk_3` FOREIGN KEY (`MaKhoa`) REFERENCES `khoa` (`MaKhoa`),
  ADD CONSTRAINT `tiepnhan_ibfk_4` FOREIGN KEY (`MaLichHen`) REFERENCES `lichhen` (`MaLichHen`),
  ADD CONSTRAINT `tiepnhan_ibfk_5` FOREIGN KEY (`MaTrangThai`) REFERENCES `trangthaitiepnhan` (`MaTrangThai`);

--
-- Constraints for table `xacthuc`
--
ALTER TABLE `xacthuc`
  ADD CONSTRAINT `xacthuc_ibfk_1` FOREIGN KEY (`MaTK`) REFERENCES `taikhoan` (`MaTK`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
