// Loads the configuration from config.env to process.env
require("dotenv").config({ path: "./config.env" });

const express = require("express");
const cors = require("cors");

// get MongoDB driver connection
const dbo = require("./db/conn");
const logger = require("./middlewares/logger");
const errorHandling = require("./middlewares/errorHandling");

const PORT = process.env.PORT || 3000;
const app = express();


app.use(cors());
app.use(express.json());
app.use(logger);
app.use(require("./routes/userRoute"));

// perform a database connection when the server starts
dbo.connectToServer(function (err) {
  if (err) {
    console.error(err);
    process.exit();
  }

  app.use(errorHandling);
  // start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
