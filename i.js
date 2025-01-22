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
        });
    });
  });           
  