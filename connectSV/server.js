const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const port = 3000;
const path = require("path");
const fs = require("fs");
const setupRoutes = require('../router/routes'); 

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb', type: 'application/json' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
const uploadDir = path.join(__dirname, "../uploads");
fs.readdir(uploadDir, (err, files) => {
    if (err) {
        console.error("Lỗi đọc thư mục uploads:", err);
    } else {
        console.log("Danh sách file trong uploads:", files);
    }
});
//sercurity
app.use(helmet());

// Routes
setupRoutes(app);
app.use("/uploads", express.static(uploadDir));

console.log("Serving static files from:", uploadDir);
app.listen(port, () => {
    console.log(`🚀 Server chạy tại: http://localhost:${port}`);
});