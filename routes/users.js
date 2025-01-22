




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

router.get("/",function(req, res, next) {
    const sql = "SELECT * FROM users";                                                                          //

    db.all(sql, [], (err, rows)=> {
        if(err) return console.error("Błąd przy próbie odczytu z bazy");
        const isAdmin = getIsAdmin(req.session.token, res)
        
        res.render("users/list.ejs", {
            title: "Nasi pracownicy uzytkownicy",                                                                         //
            username: getUserName(req.session.token, res),
            data: rows,
            isAdmin: isAdmin
        })

    })
})

router.post("/edit/:id", (req, res, next)=> {
    const {username, email, isAdmin} = req.body;
    const  {id} = req.params;
    const isAdmin1 = getIsAdmin(req.session.token, res)

    if(isAdmin1){ 
        const sqlUpdate = "UPDATE users SET username=$1, email=$2, isAdmin$3, WHERE id=$4"               //
    
        db.all(sqlUpdate, [username,email,isAdmin,id],(err, rows)=>{
            res.redirect("/users")                                                                               //
        })
    } else {
        res.redirect("/users")                                                                               //
    } 


})


router.get("/edit/:id", (req, res, next) => {
    const  {id} = req.params;

    const sql = "SELECT * FROM users  WHERE id=$1";                                                                             //

    db.all(sql, [id], (err, rows) => {
        if(err) return console.log("Błąd przy próbie odczytu z bazy", err.message)
        const isAdmin = getIsAdmin(req.session.token, res)

        if(isAdmin){
            res.render("admin/editUser.ejs", {                                           //
                title: "Edycja danych",
                username: getUserName(req.session.token, res),
                data: rows
            })
        } else {
            res.redirect("/users")                                                   
        }
        
    })
})

module.exports = router


