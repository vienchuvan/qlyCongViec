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
  let id = Math.floor(Math.random() * 100000);
  const { name, priority, deadline, kpi, weight, status, completed, notes } = req.body;
  const sql = `INSERT INTO tasks (id,name, priority, deadline, kpi, weight, status, completed, notes) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(sql, [id, name, priority, deadline, kpi, weight, status, completed, notes], (err, result) => {
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

router.get("/services/getEmployees", async (req, res) => {
  db.query("SELECT * FROM employees", (err, result) => {
    if (err) {
      console.log("Lỗi lấy bài viết, vui lòng thử lại sau");
      return res
        .status(404)
        .json({ error: "Vui lòng thử lại sau !" });
    }
    return requestHandler.sendSuccess(res, messages.success)(result);
  });
});
router.post("/services/addEmployee", async (req, res) => {
  try {
    const {
      name,
      department,
      position,
      quality,
      efficiency,
      timeliness,
      creativity,
      teamwork,
      attitude,
      skills,
      other,
      notes,
    } = req.body;

    let id = Math.floor(Math.random() * 100000);

    const sql = `
      INSERT INTO employees (
        id, name, department, position,
        quality, efficiency, timeliness,
        creativity, teamwork, attitude,
        skills, other, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id, name, department, position,
      quality, efficiency, timeliness,
      creativity, teamwork, attitude,
      skills, other, notes,
    ];

    await db.promise().query(sql, values);

    res.json({ message: "Thêm nhân viên thành công!", id });
  } catch (err) {
    console.error("Lỗi khi thêm nhân viên:", err);
    res.status(500).json({ error: "Thêm nhân viên thất bại." });
  }
});

router.post("/services/addEmployeesBatch", async (req, res) => {
  try {
    const employees = req.body; // Expecting an array of employee objects

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ error: "Dữ liệu không hợp lệ hoặc rỗng." });
    }

    const sql = `
      INSERT INTO employees (
        id, name, department, position,
        quality, efficiency, timeliness,
        creativity, teamwork, attitude,
        skills, other, notes
      ) VALUES ?
    `;

    const values = employees.map((employee) => [
      Math.floor(Math.random() * 100000), // Generate random ID
      employee.name || "",
      employee.department || "",
      employee.position || "",
      parseFloat(employee.quality) || 0,
      parseFloat(employee.efficiency) || 0,
      parseFloat(employee.timeliness) || 0,
      parseFloat(employee.creativity) || 0,
      parseFloat(employee.teamwork) || 0,
      parseFloat(employee.attitude) || 0,
      parseFloat(employee.skills) || 0,
      parseFloat(employee.other) || 0,
      employee.notes || "",
    ]);

    await db.promise().query(sql, [values]);

    res.json({ message: "Thêm nhân viên hàng loạt thành công!" });
  } catch (err) {
    console.error("Lỗi khi thêm nhân viên hàng loạt:", err);
    res.status(500).json({ error: "Thêm nhân viên hàng loạt thất bại." });
  }
});
router.delete("/services/deleteEmployee/:id", (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM employees WHERE id = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("Lỗi xóa nhân viên:", err);
      return res.status(500).json({ error: "Lỗi xóa nhân viên" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nhân viên không tồn tại" });
    }
    return res.json({ message: "Xóa nhân viên thành công" });
  });
});
router.put("/services/updateEmployee/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      department,
      position,
      quality,
      efficiency,
      timeliness,
      creativity,
      teamwork,
      attitude,
      skills,
      other,
      notes,
    } = req.body;

    const sql = `
      UPDATE employees
      SET name = ?, department = ?, position = ?, quality = ?, efficiency = ?, timeliness = ?, creativity = ?, teamwork = ?, attitude = ?, skills = ?, other = ?, notes = ?
      WHERE id = ?
    `;

    const values = [
      name,
      department,
      position,
      quality,
      efficiency,
      timeliness,
      creativity,
      teamwork,
      attitude,
      skills,
      other,
      notes,
      id,
    ];

    const [result] = await db.promise().query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Nhân viên không tồn tại" });
    }

    res.json({ message: "Cập nhật nhân viên thành công!" });
  } catch (err) {
    console.error("Lỗi khi cập nhật nhân viên:", err);
    res.status(500).json({ error: "Cập nhật nhân viên thất bại." });
  }
});

module.exports = router;
