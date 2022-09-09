const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middlewares/checkAuth");

// This will help us connect to the database
const dbo = require("../db/conn");

//bcrypt
const saltRounds = 10;

router.get("/", checkAuth, (req, res) => {
  res.status(200).json(checkAuth.req);
});

router.post("/signup", async (req, res, next) => {
  let { email, password } = req.body;
  if (!email && !password) {
    return next({ statusCode: 400, errorMessage: "Invalid email or password" });
  }

  const dbConnect = dbo.getDb().collection("users");

  //query for existing email
  const findEmailQuery = { email: email };
  const user = await dbConnect.findOne(findEmailQuery);

  if (user) {
    return next({ statusCode: 400, errorMessage: "User already exists." });
  }

  try {
    bcrypt.hash(password, saltRounds, async function (err, hash) {
      const insertUserQuery = { email: email, password: hash };
      const result = await dbConnect.insertOne(insertUserQuery);

      console.log(`Added a new user with id ${result.insertedId}`);
      res.status(201).json("okay");
    });
  } catch {
    next({
      statusCode: 400,
      errorMessage: "Error occured while inserting the user",
    });
  }
});

router.post("/login", async (req, res, next) => {
  let { email, password } = req.body;

  if (!email && !password) {
    return next({ statusCode: 400, errorMessage: "Email or password is null" });
  }

  const dbConnect = dbo.getDb().collection("users");

  //query for existing email
  const findEmailQuery = { email: email };
  const user = await dbConnect.findOne(findEmailQuery);

  if (!user) {
    return next({ statusCode: 400, errorMessage: "User doesnt exist" });
  }

  try {
    bcrypt.compare(password, user.password, async function (err, result) {
      if (result) {
        const token = jwt.sign({ email: user.email }, "secret_key", {
          expiresIn: "2h",
        });
        return res.status(200).send({ message: "success", token: token });
      } else {
        return next({ statusCode: 400, errorMessage: "Password is invalid" });
      }
    });
  } catch {
    return next({ statusCode: 400, errorMessage: "Error" });
  }
});

router.post("/logout", checkAuth, (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next({ statusCode: 400, errorMessage: "token is required" });
  }
  // just do it on frontend
  res.status(200).json("logout");
});

router.post("/changePassword", async (req, res, next) => {
  const { authorization } = req.headers;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next({ statusCode: 400, errorMessage: "password is required" });
  }

  const token = authorization.split(" ")[1];

  const { email } = jwt.decode(token);
  const dbConnect = dbo.getDb().collection("users");
  const findEmailQuery = { email: email };
  const user = await dbConnect.findOne(findEmailQuery);

  bcrypt.compare(oldPassword, user.password, async function (err, result) {
    if (result) {
      bcrypt.hash(newPassword, saltRounds, async function (err, hash) {
        const newPasswordObject = {
          $set: { password: hash },
        };
        await dbConnect.updateOne(findEmailQuery, newPasswordObject, {
          upsert: false,
        });
        return res.status(200).json({ message: "success" });
      });
    } else {
      return next({
        statusCode: 400,
        errorMessage: "Something is wrong",
      });
    }
  });
});

module.exports = router;
