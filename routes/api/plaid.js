require("dotenv").config({ path: "../../keys/keys.env" });

const express = require("express");
const plaid = require("plaid");
const router = express.Router();
const passport = require("passport");
const moment = require("moment");
const mongoose = require("mongoose");
// Load Account and User models
const Account = require("../../models/Account");
const User = require("../../models/User");

const client = new plaid.Client(
    process.env.REACT_PLAID_CLIENT_ID,
    process.env.REACT_PLAID_SECRET,
    process.env.REACT_PLAID_PUBLIC_KEY,
    plaid.environments.sandbox,
    { version: "2018-05-22" }
);
var PUBLIC_TOKEN = null;
var ACCESS_TOKEN = null;
var ITEM_ID = null;

// Routes will go here
// @route POST api/plaid/accounts/add
// @desc Trades public token for access token and stores credentials in database
// @access Private

router.post("/accounts/add",
    (req, res) => {
        console.log("Adding new Account");
        console.log(req)
        PUBLIC_TOKEN = req.body.plaidData.public_token;
        const userId = req.body.userId;
        const institution = req.body.plaidData.metadata.institution;
        const { name, institution_id } = institution;
        if (PUBLIC_TOKEN) {
            client.exchangePublicToken(PUBLIC_TOKEN)
                .then(exchangeResponse => {
                    const ACCESS_TOKEN = exchangeResponse.access_token;
                    const ITEM_ID = exchangeResponse.item_id;
                    res.json(exchangeResponse)
                })
            .catch(err => {
                console.log(err)
                res.json(null)
            }); // Plaid Error
        }
    }
);

// @route DELETE api/plaid/accounts/:id
// @desc Delete account with given id
// @access Private
router.delete("/accounts/:id", passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Account.findById(req.params.id).then(account => {
        // Delete account
        account.remove().then(() => res.json({ success: true }));
      });
    }
);

// @route GET api/plaid/accounts
// @desc Get all accounts linked with plaid for a specific user
// @access Private
router.get("/accounts", passport.authenticate("jwt", { session: false }),
    (req, res) => {
      Account.find({ userId: req.user.id })
        .then(accounts => res.json(accounts))
        .catch(err => console.log(err));
    }
);

// @route POST api/plaid/accounts/transactions
// @desc Fetch transactions from past 30 days from all linked accounts
// @access Private
router.post("/accounts/transactions",
    (req, res) => {
        const now = moment();
        const today = now.format("YYYY-MM-DD");
        const thirtyDaysAgo = now.subtract(30, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
        let transactions = [];
        const accounts = req.body;
        if (accounts) {
            accounts.forEach(function(account) {
                ACCESS_TOKEN = account.accessToken;
                const institutionName = account.institutionName;
                client.getTransactions(ACCESS_TOKEN, thirtyDaysAgo, today)
                    .then(response => {
                        transactions.push({
                        accountName: institutionName,
                        transactions: response.transactions
                    });
                    // Don't send back response till all transactions have been added
                    if (transactions.length === accounts.length) {
                        res.json(transactions);
                    }
                })
                .catch(err => console.log(err));
            });
        }
    }
);

router.post("/accounts/balances",
    (req, res) => {
        // const now = moment();
        // const today = now.format("YYYY-MM-DD");
        // const thirtyDaysAgo = now.subtract(30, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
        let balances = [];
        const accounts = req.body;
        if (accounts) {
            accounts.forEach(function(account) {
                ACCESS_TOKEN = account.accessToken;
                const institutionName = account.institutionName;
                client.getBalance(ACCESS_TOKEN)
                    .then(response => {
                        // console.log(response)
                        let accountBalances = [];
                        response.accounts.forEach(function(account) {
                            // console.log(account.balances)
                            accountBalances.push({
                                accountName: institutionName,
                                accountType: account.name,
                                availableBalance: account.balances.available,
                                currentBalance: account.balances.current,
                                limit: account.balances.limit,
                                currency: account.balances.iso_currency_code,
                                officialName: account.official_name
                            })
                        });
                        balances.push(accountBalances)
                        console.log(`accounts: ${accounts.length}`)
                        console.log(`balances: ${balances.length}`)
                        if (balances.length === accounts.length) {
                            res.json(balances);
                        }
                        // console.log(accountBalances)
                        // Don't send back response till all balances have been added
                        // if (balances.length === accounts.length) {
                        // }
                    })
                    .catch(err => console.log(err));
                })
            }
        }
);

// @route GET api/plaid/accounts
// @desc Get all accounts linked with plaid for a specific user
// @access Private
router.post("/assets", passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const now = moment();
        // const today = now.format("YYYY-MM-DD");
        // const thirtyDaysAgo = now.subtract(30, "days").format("YYYY-MM-DD"); // Change this if you want more transactions
        let balances = [];
        const accounts = req.body;
        if (accounts) {
            let accountTokens = [];
            accounts.forEach(function(account) {
                accountTokens.push(account.accessToken)
            })
            client.createAssetReport(accountTokens, 30, {
                client_report_id: '123'}
                ).then(response => res.json(response))
        }
    }
);


// @route GET api/plaid/accounts
// @desc Get all accounts linked with plaid for a specific user
// @access Private
router.post("/getAssets/:id", passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log(req.params.id)
        client.getAssetReport(req.params.id, true).then(response => res.json(response))
            .catch(err => console.log(err))
            
    }
);

module.exports = router;