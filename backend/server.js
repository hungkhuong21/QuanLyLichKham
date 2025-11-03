const express = require('express');
const cors = require('cors');
const app = express();
const productRoutes = require('./routes/productRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Route chính
app.use('/products', productRoutes);

// Route test
app.get('/', (req, res) => {
  res.send('Backend Node.js + Express + MySQL đang hoạt động!');
});

// Chạy server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(` Server chạy tại http://localhost:${PORT}`);
});
