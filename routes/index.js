const db = require("../db");
const bcrypt = require("bcrypt");
var express = require("express");
var router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const config = require("../config");
const { infoLogger, errorLogger } = require('../loggger');

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
  res.render("index", { title: "Panel do zarządzania klientami" });
});

router.get("/addcustomer", function (req, res, next) {//1
  res.render("admin/addCustomer", {
    title: "Dodawanie klientów",
    message: "",
    username: getUserName(req.session.token, res),
  });
});



router.post("/addcustomer", function (req, res, next) {
  const { name, address, email, phone } = req.body; //^
   //--kopia1-2
  const sql = `SELECT * from customers WHERE username=$1 LIMIT 1`;

  db.all(sql, [username], async (err, rows) => {
    if (err)
      return errorLogger.error(`Błąd przy próbie odczytu z bazy ${err.message}`, { label: 'index.js' });

    if (rows.length === 1) {
      res.render("admin/addCustomer", {
        title: "Dodawanie użytkownika",
        message: "Użytkownik już istnieje",
        username: "",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
   //--koniec1-2
    const sqlInsert = `INSERT INTO customers(name, address, email, phone) VALUES($1, $2, $3, $4)`;//2
  
    db.all(
      sqlInsert,
      [name, address, email, phone],
      (err, rows) => {
        if (err) {
          console.error("Błąd przy próbie zapisu do bazy");
          res.render("admin/addCustomer", {
            title: "Dodawanie klientów",
            message: "",
            username: getUserName(req.session.token, res),
          });
        }

    res.render("admin/addCustomer", {                                                           //3
      title: "Dodawanie klientów",
      message: "Użytkownik został dodany",
      username: getUserName(req.session.token, res),
    });
  })
})
});


//----user


router.get("/adduser", function (req, res, next) { //----1
  res.render("admin/addUser", {
    title: "Dodawanie użytkownika",
    message: "",
    username: getUserName(req.session.token, res),
  });
});



router.post("/adduser", function (req, res, next) {
  const { username, password, email, isAdmin } = req.body;
    //--kopia1-2
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
    //--koniec1-2
    const sqlInsert = `INSERT INTO users(username, password, email, isAdmin) VALUES($1, $2, $3, $4)`;//--2

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

        res.render("admin/addUser", {                                                               //--3
          title: "Dodawanie użytkownika",
          message: "Użytkownik został dodany",
          username: "",
        });
      }
    );
  });
});           


//^
//--products
router.get("/addproduct", function (req, res, next) {//1
  res.render("admin/addProduct", {
    title: "Dodawanie produktów",
    message: "",
    username: getUserName(req.session.token, res),
  });
});



router.post("/addproduct", function (req, res, next) {
  const {product_name, amount, desciption, category, price } = req.body; //^
   //--kopia1-2
  const sql = `SELECT * from products WHERE product_name=$1 LIMIT 1`;

  db.all(sql, [product_name], async (err, rows) => {
    if (err)
      return console.error(`Błąd przy próbie odczytu z bazy`, err.message);

    if (rows.length === 1) {
      res.render("admin/addProduct", {
        title: "Dodawanie produktów",
        message: "Użytkownik już istnieje",
        username: "",
       

      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
   //--koniec1-2
    const sqlInsert = `INSERT INTO products(product_name, amount, description, category, price) VALUES($1, $2, $3, $4, $5)`;//2
  
    db.all(
      sqlInsert,
      [product_name, amount, desciption, category, price],
      (err, rows) => {
        if (err) {
          console.error("Błąd przy próbie zapisu do bazy");
          res.render("admin/addProduct", {
            title: "Dodawanie produktów",
            message: "",
            username: "",
          });
        }

    res.render("admin/addProduct", {                                                           //3
      title: "Dodawanie produktów",
      message: "Produkt został dodany",
      username: "",
    });
  })
})
});
//--logowanie
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
    infoLogger.info(`Użytkownik ${username} został zalogowany`, { label: 'app.js' });
    res.redirect("/");
  });
});


router.get('/logout', (req, res) => {
  // Zniszczenie sesji
  res.clearCookie('session')

  res.redirect('/login')

  // req.session.destroy(err => {
  //     if(err) {
  //         console.error('Błąd podczas niszczenia sesji:', err);
  //         res.status(500).send('Wystąpił błąd podczas wylogowania');
  //     } else {
  //         res.redirect('/login');
  //     }
  // });
});




module.exports = router;

//export default router;









