const db = require("../connectSV");
const bcrypt = require("bcrypt"); // Đảm bảo bạn đã cài bcrypt
const express = require("express");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { user, pass } = req.body;
// console.log("user:", user, "pass:", pass); // Thêm log để kiểm tra giá trị user và pass

  db.getConnection(async (err, connection) => {
    if (err) {
      console.error("Không thể kết nối đến cơ sở dữ liệu:", err);
      return res.status(500).json({ error: "Không thể kết nối đến cơ sở dữ liệu." });
    }

    try {
      const [users] = await connection.promise().query("SELECT * FROM users WHERE user = ?", [user]);
      if (users.length === 0) {
        connection.release();
        return res.status(200).json({ status: 1, message: "Tài khoản không tồn tại." });
      }

      const userData = users[0];
      const checkPass = userData.pass;
      if (pass !== checkPass) {
        connection.release();
        return res.status(200).json({ status: 0, message: "Mật khẩu không đúng." });
      }

      connection.release();
      return res.status(200).json({
        status: 2,
        message: "Đăng nhập thành công.",
        user: {
          id: userData.id,
          user: userData.user,
          hoten: userData.hoten,
          role: userData.role,
        },
      });
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      connection.release();
      return res.status(500).json({ error: "Đăng nhập thất bại." });
    }
  });
});

module.exports = router;