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
    const sql = "SELECT * FROM customers";

    db.all(sql, [], (err, rows)=> {
        if(err) return console.error("Błąd przy próbie odczytu z bazy");
        const isAdmin = getIsAdmin(req.session.token, res)
        
        res.render("customer/list.ejs", {
            title: "Nasi klienci",
            username: getUserName(req.session.token, res),
            data: rows,
            isAdmin: isAdmin
        })

    })
})

router.post("/edit/:id", (req, res, next)=> {
    const {name, address, email, phone} = req.body;
    const  {id} = req.params;
    const isAdmin = getIsAdmin(req.session.token, res)

    if(isAdmin){ 
        const sqlUpdate = "UPDATE customers SET name=$1, address=$2, email=$3, phone=$4 WHERE id=$5"
    
        db.all(sqlUpdate, [name,address,email,phone,id],(err, rows)=>{
            res.redirect("/customers")
        })
    } else {
        res.redirect("/customers")
    } 


})


router.get("/edit/:id", (req, res, next) => {
    const  {id} = req.params;

    const sql = "SELECT * FROM customers  WHERE id=$1";

    db.all(sql, [id], (err, rows) => {
        if(err) return console.log("Błąd przy próbie odczytu z bazy", err.message)
        const isAdmin = getIsAdmin(req.session.token, res)

        if(isAdmin){
            res.render("admin/editCustomer.ejs", {
                title: "Edycja danych",
                username: getUserName(req.session.token, res),
                data: rows
            })
        } else {
            res.redirect("/customers")
        }
        
    })
})

router.get("/delete/:id", (req, res, next) => {
    const  {id} = req.params;

    const sql = "DELETE FROM customers WHERE id=$1";                                                                             //

    db.all(sql, [id], (err, rows) => {
        if(err) return console.log("Błąd przy próbie odczytu z bazy", err.message)
        const isAdmin = getIsAdmin(req.session.token, res)
        res.redirect("/customers")

        
    })
})

module.exports = router