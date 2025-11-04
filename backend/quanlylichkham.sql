-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 04, 2025 at 01:19 PM
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
  `MaKhoa` int NOT NULL,
  `ChuyenMon` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `SoDienThoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TrangThai` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`MaBacSi`),
  KEY `idx_bacsi_khoa` (`MaKhoa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `taikhoan`
--

DROP TABLE IF EXISTS `taikhoan`;
CREATE TABLE IF NOT EXISTS `taikhoan` (
  `MaTK` int NOT NULL AUTO_INCREMENT,
  `TenDangNhap` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MatKhauHash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `VaiTroID` int DEFAULT NULL,
  `LoaiNguoiDung` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `MaNguoiDung` int NOT NULL,
  `TrangThai` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HoatDong',
  `NgayTao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `NgayCapNhat` datetime DEFAULT NULL,
  PRIMARY KEY (`MaTK`),
  UNIQUE KEY `TenDangNhap` (`TenDangNhap`),
  KEY `VaiTroID` (`VaiTroID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `taikhoan`
--

INSERT INTO `taikhoan` (`MaTK`, `TenDangNhap`, `MatKhauHash`, `VaiTroID`, `LoaiNguoiDung`, `MaNguoiDung`, `TrangThai`, `NgayTao`, `NgayCapNhat`) VALUES
(1, 'admin@hospital.vn', '123456', 1, 'NhanVien', 1, 'HoatDong', '2025-11-03 09:35:34', NULL),
(2, 'bacsiA@hospital.vn', 'abc123', 2, 'BacSi', 1, 'HoatDong', '2025-11-03 09:35:34', NULL),
(3, 'benhnhanA@gmail.com', 'pass123', 3, 'BenhNhan', 1, 'HoatDong', '2025-11-03 09:35:34', NULL);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `trangthaitiepnhan`
--

DROP TABLE IF EXISTS `trangthaitiepnhan`;
CREATE TABLE IF NOT EXISTS `trangthaitiepnhan` (
  `MaTrangThai` int NOT NULL AUTO_INCREMENT,
  `TenTrangThai` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`MaTrangThai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
