const db = require("../connectSV");
const message = require("../utils/message");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { user, pass } = req.body;
  db.getConnection((err, connection) => {
    if (err) {
      console.log("Không thể kết nối đến cơ sở dữ liệu:", err);
      return res
        .status(500)
        .json({ error: "Không thể kết nối đến cơ sở dữ liệu." });
    }
    try {
      const [users] = db
        .promise()
        .query("select * from users where user = ?"[user]);
      if (users.length == 0) {
        connection.release();
        return res
          .status(200)
          .json({ status: 1, message: "Tài khoản không tồn tại." });
      }
      const userData = users[0];
      const checkPass = bcrypt.compare(pass, userData.pass);
      if (!checkPass) {
        connection.release();
        return res
          .status(200)
          .json({ status: 0, message: "Mật khẩu không đúng." });
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
      return res.status(500).json({ error: "Đăng nhập thất bại." });
    }
  });
});
