const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db');
const authMiddleware = require('./middleware/authMiddleware');

const taiKhoanRoutes = require('./routes/taiKhoanRoutes');
const lichHenRoutes = require('./routes/lichHenRoutes');
const benhNhanRoutes = require('./routes/benhNhanRoutes');
const bacSiRoutes = require('./routes/bacSiRoutes');
const lichLamViecRoutes = require('./routes/lichLamViecRoutes');
const khoaRoutes = require('./routes/khoaRoutes');
const thongKeRoutes = require('./routes/thongKeRoutes');
const tiepNhanRoutes = require('./routes/tiepNhanRoutes');

app.use(cors());
app.use(express.json());
app.use(authMiddleware);

require('dotenv').config(); //dùng để gửi mã qua email

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
app.use('/api/thongke', thongKeRoutes);
app.use('/api/tiepnhan', tiepNhanRoutes);

// Chạy server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
