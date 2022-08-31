const router = require("express").Router();
const bcrypt = require("bcrypt");
const e = require("express");

// This will help us connect to the database
const dbo = require("../db/conn");

//bcrypt
const saltRounds = 10;

router.get("/", (req, res) => {
  res.status(200).json("welcome");
});

router.get("/users", async (req, res) => {
  const dbConnect = dbo.getDb();
  dbConnect
    .collection("users")
    .find({ email: email })
    .toArray(function (err, result) {
      if (err) throw err;
      console.log(result);
      db.close();
    });
});

router.post("/signup", async (req, res, next) => {
  let { email, password } = req.body;
  const dbConnect = dbo.getDb();
  let queryMail = "";
  let cursor = await dbConnect
    .collection("users")
    .find({ email: email })
    .toArray(function (err, result) {
      if (err) {
        next({ statusCode: 400, errorMessage: err });
      } else {
        queryMail = result;
        if (email && password && !queryMail) {
          bcrypt.hash(password, saltRounds).then(function (hash) {
            password = hash;

            const userDocument = {
              email: email,
              password: password,
            };
            dbConnect
              .collection("users")
              .insertOne(userDocument, function (err, result) {
                if (err) {
                  next({ statusCode: 400, errorMessage: "inserting?" });
                } else {
                  console.log(`Added a new user with id ${result.insertedId}`);
                  res.status(201).json("okay");
                }
              });
          });
        } else {
          next({ statusCode: 400, errorMessage: "name?" });
        }
      }
    });
});

router.post("/changePassword", (req, res) => {
  res.status(200).json("changePassword");
});

router.post("/login", (req, res) => {
  res.status(200).json("login");
});

router.post("/logout", (req, res) => {
  res.status(200).json("logout");
});

module.exports = router;
