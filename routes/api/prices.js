require("dotenv").config({ path: "../../keys/keys.env" });

const axios = require("axios");
const express = require("express");
const plaid = require("plaid");
const router = express.Router();
const passport = require("passport");
const moment = require("moment");
const mongoose = require("mongoose");
// Load Account and User models
const Account = require("../../models/Account");
const User = require("../../models/User");

// @route GET api/plaid/accounts
// @desc Get all accounts linked with plaid for a specific user
// @access Private
router.get("/top", passport.authenticate("jwt", { session: false }),
    (req, res) => {
    axios.get("https://api.coinmarketcap.com/v1/ticker/?limit=20")
        .then(response => {
            res.json(response.data);
            console.log(response.data)
        })
        .catch(err => console.log(err));
    }
);

module.exports = router;