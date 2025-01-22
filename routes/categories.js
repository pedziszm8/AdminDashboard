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
      return res.redirect("/login");
    }
  };


  const getIsAdmin = (token, res) => {
    try {
      if (token == null) return "";
      const tokenVerify = jsonwebtoken.verify(token, config.SECRET);
      return tokenVerify.isAdmin;
    } catch (e) {
      return res.redirect("/login");
    }
  };





  router.get("/", function (req, res, next) {
    const sql = "SELECT id, name FROM categories";

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Błąd przy próbie odczytu z bazy");
            return res.status(500).send("Wystąpił błąd serwera");
        }

        res.render("categories/list.ejs", {
            title: "Nasi użytkownicy",
            username: getUserName(req.session.token, res),
            data: rows,
            isAdmin: getIsAdmin(req.session.token, res),
        });
    });
});


















module.exports = router