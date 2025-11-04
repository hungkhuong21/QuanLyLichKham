const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./config/db'); // thay '../db' bằng '../config/db'
const taiKhoanRoutes = require('./routes/taiKhoanRoutes');

app.use(cors());
app.use(express.json());

// Route gốc
app.get('/', (req, res) => {
  res.send('API Quản lý lịch khám đang chạy...');
});

// Route tài khoản
app.use('/api/taikhoan', taiKhoanRoutes);

// Chạy server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
