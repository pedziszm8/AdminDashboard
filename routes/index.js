const db = require("../db");
const bcrypt = require("bcrypt");
var express = require("express");
var router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const config = require("../config");

const getUserName = (token, res) => {
  try {
    if (token == null) return "";
    const tokenVerify = jsonwebtoken.verify(token, config.SECRET);
    return tokenVerify.username;
  } catch (e) {
    return res.redirect("/adduser");
  }
};

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/adduser", function (req, res, next) {
  res.render("admin/addUser", {
    title: "Dodawanie użytkownika",
    message: "",
    username: getUserName(req.session.token, res),
  });
});

router.post("/adduser", function (req, res, next) {
  const { username, password, email, isAdmin } = req.body;

  const sql = `SELECT * from users WHERE username=$1 LIMIT 1`;

  db.all(sql, [username], async (err, rows) => {
    if (err)
      return console.error(`Błąd przy próbie odczytu z bazy`, err.message);

    if (rows.length === 1) {
      res.render("admin/addUser", {
        title: "Dodawanie użytkownika",
        message: "Użytkownik już istnieje",
        username: "",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sqlInsert = `INSERT INTO users(username, password, email, isAdmin) VALUES($1, $2, $3, $4)`;

    db.all(
      sqlInsert,
      [username, hashedPassword, email, isAdmin],
      (err, rows) => {
        if (err) {
          console.log("Błąd przy próbie zapisu do bazy ", err.message);
          res.render("admin/addUser", {
            title: "Dodawanie użytkownika",
            message: `Błąd przy próbie zapisu do bazy, ${err.message}`,
            username: "",
          });
        }

        res.render("admin/addUser", {
          title: "Dodawanie użytkownika",
          message: "Użytkownik został dodany",
          username: "",
        });
      }
    );
  });
});

router.get("/login", (req, res, next) => {
  res.render("login", {
    title: "Panel logowania",
    message: "",
  });
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM users WHERE username=$1 LIMIT 1`;

  db.all(sql, [username], async (err, rows) => {
    if (err) return console.error("Błąd odczytu z bazy");

    if (rows.length === 0) {
      return res.render("login", {
        title: "Panel logowania",
        message: "Użytkownik nie istnieje",
      });
    }

    const comparedPassword = await bcrypt.compare(password, rows[0].password);

    if (!comparedPassword) {
      return res.render("login", {
        title: "Panel logowania",
        message: "Hasło jest nieprawidłowe",
      });
    }

    req.session.admin = rows[0].isAdmin;

    const token = jsonwebtoken.sign(
      {
        username: username,
        isAdmin: rows[0].isAdmin,
      },
      config.SECRET,
      {
        expiresIn: 60 * 60, //godzina
      }
    );

    req.session.token = token;
    res.redirect("/");
  });
});

module.exports = router;
