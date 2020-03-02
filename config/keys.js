require("dotenv").config({ path: "../../keys/keys.env" });

module.exports = {
  mongoURI: process.env.MONGO_URI,
  secretOrKey: "secret"
};
