const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db'); 

const taiKhoanRoutes = require('./routes/taiKhoanRoutes');
const lichHenRoutes = require('./routes/lichHenRoutes');
const benhNhanRoutes = require('./routes/benhNhanRoutes');
const bacSiRoutes = require('./routes/bacSiRoutes');
const lichLamViecRoutes = require('./routes/lichLamViecRoutes');
const khoaRoutes = require('./routes/khoaRoutes');
const thanhToanRoutes = require('./routes/thanhToanRoutes');
const thongKeRoutes = require('./routes/thongKeRoutes');

app.use(cors());
app.use(express.json());

require('dotenv').config(); //dùng để gửi mã qua email

// Route gốc
app.get('/', (req, res) => {
  res.send('API Quản lý lịch khám đang chạy...');
});

// Route tài khoản
app.use('/api/taikhoan', taiKhoanRoutes);
app.use('/api/lichhen', lichHenRoutes);
app.use('/api/benhnhan', benhNhanRoutes);
app.use('/api/bacsi', bacSiRoutes);
app.use('/api/lichlamviec', lichLamViecRoutes);
app.use('/api/khoa', khoaRoutes);
app.use('/api/thanhtoan', thanhToanRoutes);
app.use('/api/thongke', thongKeRoutes);

// Chạy server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
