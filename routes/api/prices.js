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
        console.log("TEST")
    axios.get("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?CMC_PRO_API_KEY=" + process.env.REACT_CMC_API_KEY)
        .then(response => {
            console.log(response.data)

            res.json(response.data);
        })
        .catch(err => console.log(err));
    }
);

module.exports = router;