const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../connectSV/index");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // 🔥 Thêm module fs để kiểm tra thư mục
const thongBao = require("../sevice/stringThongBao");
const e = require("cors");
const { randomInt } = require("crypto");
const funAPI = require("../sevice/funAPI");
const Joi = require("joi");
const RequestHandler = require("../utils/requestHandler");
const requestHandler = new RequestHandler();
const messages = require("../utils/message");
// Đảm bảo thư mục uploads tồn tại
const app = express();

// Đảm bảo Express có thể serve thư mục 'uploads'
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Tạo thư mục nếu chưa có
}

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Sử dụng đường dẫn tuyệt đối của thư mục uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Đổi tên file tránh trùng lặp
  },
});

const upload = multer({ storage: storage });

// API upload ảnh
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Vui lòng chọn ảnh" });
  }

  const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({ message: "Tải lên thành công", imageUrl });
});

// Cấu hình cho phép truy cập thư mục uploads
router.use("/uploads", express.static(uploadDir));


router.get("/services/getTasks", async (req, res) => {
  db.query("SELECT * FROM tasks", (err, result) => {
    if (err) {
      console.log("Lỗi lấy bài viết, vui lòng thử lại sau");
      return res
        .status(404)
        .json({ error: "Lỗi lấy bài viết, vui lòng thử lại sau !" });
    }
    return requestHandler.sendSuccess(res, messages.success)(result);
  });
});
// Thêm task mới
router.post("/services/addTask", (req, res) => {
  let   id = Math.floor(Math.random() * 100000);
  const { name, priority, deadline, kpi, weight, status, completed, notes } = req.body;
  const sql = `INSERT INTO tasks (id,name, priority, deadline, kpi, weight, status, completed, notes) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [id,name, priority, deadline, kpi, weight, status, completed, notes], (err, result) => {
    if (err) {
      console.log("Lỗi thêm task:", err);
      return res.status(500).json({ error: "Lỗi thêm task" });
    }
    return res.json({ message: "Thêm task thành công", taskId: result.insertId });
  });
});

// Sửa task theo id
router.put("/services/updateTask/:id", (req, res) => {
  const id = req.params.id;
  const { name, priority, deadline, kpi, weight, status, completed, notes } = req.body;
  const sql = `UPDATE tasks SET name = ?, priority = ?, deadline = ?, kpi = ?, weight = ?, status = ?, completed = ?, notes = ? WHERE id = ?`;
  db.query(sql, [name, priority, deadline, kpi, weight, status, completed, notes, id], (err, result) => {
    if (err) {
      console.log("Lỗi cập nhật task:", err);
      return res.status(500).json({ error: "Lỗi cập nhật task" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task không tồn tại" });
    }
    return res.json({ message: "Cập nhật task thành công" });
  });
});

// Xóa task theo id
router.delete("/services/deleteTask/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM tasks WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Lỗi xóa task:", err);
      return res.status(500).json({ error: "Lỗi xóa task" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task không tồn tại" });
    }
    return res.json({ message: "Xóa task thành công" });
  });
});

module.exports = router;
