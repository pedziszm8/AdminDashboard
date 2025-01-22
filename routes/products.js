




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
    const sql = "SELECT * FROM products";                                                                          //

    db.all(sql, [], (err, rows)=> {
        if(err) return console.error("Błąd przy próbie odczytu z bazy");
        const isAdmin = getIsAdmin(req.session.token, res)

        rows.forEach(row => {
            if (row.picture) {
                row.picture = `data:image/jpeg;base64,${row.picture.toString('base64')}`;


            }
        })

        res.render("products/list.ejs", {
            title: "Nasi pracownicy uzytkownicy",                                                                         //
            username: getUserName(req.session.token, res),
            data: rows,
            isAdmin: isAdmin
        })

        

    })
})



router.post("/edit/:id", (req, res, next)=> {
    console.log(req.body);
    const {product_name, amount, description, category, price} = req.body;
    const  {id} = req.params;
    const isAdmin1 = getIsAdmin(req.session.token, res)

    if(isAdmin1){ 
        const sqlUpdate = "UPDATE products SET product_name=$1, amount=$2, description=$3, category=$4, price=$5 WHERE id=$6"               //, amount, description, category, price
    
        db.all(sqlUpdate, [product_name, amount, description, category, price, id],(err, rows)=>{
            //console.log(err.message);
            res.redirect("/products")                                                                               //
        })
    } else {
        res.redirect("/products")                                                                               //
    } 


})


router.get("/edit/:id", (req, res, next) => {
    const  {id} = req.params;

    const sql = "SELECT * FROM products  WHERE id=$1";                                                                             //

    db.all(sql, [id], (err, rows) => {
        if(err) return console.log("Błąd przy próbie odczytu z bazy", err.message)
        const isAdmin = getIsAdmin(req.session.token, res)

        if(isAdmin){
            res.render("admin/editProduct.ejs", {                                           //
                title: "Edycja danych",
                username: getUserName(req.session.token, res),
                data: rows
            })
        } else {
            res.redirect("/products")                                                   
        }
        
    })
})

router.get("/delete/:id", (req, res, next) => {
    const  {id} = req.params;

    const sql = "DELETE FROM products WHERE id=$1";                                                                             //

    db.all(sql, [id], (err, rows) => {
        if(err) return console.log("Błąd przy próbie odczytu z bazy", err.message)
        const isAdmin = getIsAdmin(req.session.token, res)
        res.redirect("/products")

        
    })
})

module.exports = router


