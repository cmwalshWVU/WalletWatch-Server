require("dotenv").config({ path: "./keys/keys.env" });
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const users = require("./routes/api/users");
const plaid = require("./routes/api/plaid");
const news = require("./routes/api/news");
const prices = require("./routes/api/prices");

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());

// DB Config
const db = require("./config/keys").mongoURI;

console.log(`MONGO URI: ${process.env.REACT_MONGO_URI}`)
// Connect to MongoDB
mongoose
  .connect(
    process.env.REACT_MONGO_URI,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);
app.use("/api/plaid", plaid);
app.use("/api/news", news);
app.use("/api/prices", prices);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));
