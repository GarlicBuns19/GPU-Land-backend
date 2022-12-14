require("dotenv").config();
const db = require("../config/dbMysql");
const mysql = require("mysql");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
router.post("/register", bodyParser.json(), (req, res) => {
  let checkEmail = {
    email: req.body.email,
  };
  let checkEmail1 = `Select * from users where email = ?`;
  db.query(checkEmail1, checkEmail.email, async (err, emails) => {
    if (err) {
      res.json({
        status: 400,
        msg: "Cannot register",
      });
    }
    if (emails.length > 0) {
      res.json({
        status: 400,
        msg: "This email already exist",
      });
    } else {
      let { userFName, userLName, email, userPassword, userImg } = req.body;
      let hash = await bcrypt.hash(userPassword, 10);
      let register = `Insert into users(userFName,userLName,email,userPassword,userImg)
                            Values(?,?,?,?,?)`;

      db.query(
        register,
        [userFName, userLName, email, hash, userImg],
        (err, userData) => {
          if (err) {
            res.json({
              status: 400,
              msg: "Cannot register",
            });
          }
          res.json({
            status: 200,
            msg: "You are successfully registered",
          });
        }
      );
    }
  });
});

// Login
router.post("/login", bodyParser.json(), async (req, res) => {
  let { email, userPassword } = req.body;
  let login = `Select * from users where email = ?`;
  db.query(login, email, async (err, results) => {
    if (err){
        res.json({
          status : 400,
          msg : 'Cannot login with your data'
        })
      }
    // res.send(results[0].userPassword)
    if (results.length === 0) {
      res.json({
        status: 400,
        msg: `Email doesn't exist`,
      });
    } else {
      const match = await bcrypt.compare(userPassword, results[0].userPassword);
      // res.send(match)
      if (match === false) {
        res.json({
          status: 400,
          msg: `The password does not match`,
        });
      } else {
        let user = {
          user_id: results[0].user_id,
          userFName: results[0].userFName,
          userLName: results[0].userLName,
          email: results[0].email,
          userPassword: results[0].userPassword,
          userRole: results[0].userRole,
          userImg: results[0].userImg,
        };
        jwt.sign(
          user,
          process.env.jwtsecret,
          {
            expiresIn: "365d",
          },
          (err, token) => {
            if (err){
                res.json({
                  status : 400,
                  msg : 'Cannot get a token'
                })
              }
            // console.log(token)
            let userToken = token;
            // console.log(userToken)
            res.json({
              results: user,
              token: userToken,
              msg: "login successful",
            });
          }
        );
        // console.log(user)
      }
    }
  });
});

module.exports = router;
