require("dotenv").config({ path: "../../keys/keys.env" });

module.exports = {
  mongoURI: process.env.REACT_MONGO_URI,
  secretOrKey: "secret"
};
