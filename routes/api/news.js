require("dotenv").config({ path: "./variables.env" });
// import { Router } from "express";
const express = require("express");
const router = express.Router();
// const cors = require("cors");
const Pusher = require("pusher");
const NewsAPI = require("newsapi");

// import Pusher from "pusher";
// import NewsAPI from "newsapi";
const axios = require("axios");

const pusher = new Pusher({
  appId: process.env.REACT_PUSHER_APP_ID,
  key: process.env.REACT_PUSHER_APP_KEY,
  secret: process.env.REACT_PUSHER_APP_SECRET,
  cluster: process.env.REACT_PUSHER_APP_CLUSTER,
  encrypted: true
});


const newsapi = new NewsAPI(process.env.REACT_NEWS_API_KEY);

setTimeout(() => cryptoCompareNews(), 10000);

setTimeout(() => fetchNewsData(), 5);

const fetchNews = (searchTerm, pageNum, date) =>
  newsapi.v2.everything({
    q: searchTerm,
    from: date,
    language: "en",
    sortBy: "recency"
  });

// app.use(cors());

function updateFeed(topic) {
  let counter = 2;
  var now = new Date();
  now.setMinutes(now.getMinutes() - 3);
  setInterval(() => {
    fetchNews(topic, counter, now)
      .then(response => {
        let sorted = response.articles.sort((a, b) =>
          a.publishedAt > b.publishedAt ? 1 : -1
        );

        for (let i = 0; i < sorted.length; i++) {
          // console.log(JSON.stringify(response.articles[i]))
          pusher.trigger("news-channel", "update-news", {
            articles: sorted[i]
          });
        }
        counter += 1;
      })
      .catch(error => console.log(error));
  }, 172800);
}

router.get("/live", (req, res) => {
  const topic = "crypto";
  var now = new Date();
  now.setHours(now.getHours() - 6);
  console.log("Calling Live");
  cryptoCompareNews();
  fetchNews(topic, 1, now.toISOString())
    .then(response => {
      let sorted = response.articles.sort((a, b) =>
        a.publishedAt > b.publishedAt ? 1 : -1
      );
      for (let i = 0; i < sorted.length; i++) {
        pusher.trigger("news-channel", "update-news", {
          articles: sorted[i]
        });
      }
      res.json(sorted);
      // updateFeed(topic);
    })
    .catch(error => console.log(error));
});

function cryptoCompareNews() {
  axios.get("https://min-api.cryptocompare.com/data/v2/news/")
    .then(response => {
      if (response.data !== null && response.data.Data !== undefined) {
        console.log("sendings news");
        for (let i = 0; i < response.data.Data.length; i++) {
          pusher.trigger("news-channel", "update-news", {
            articles: response.data.Data[i]
          });
        }
      } else {
        console.log("not sendings news");
      }
    })
    .catch(err => console.log(err));
}

function fetchNewsData() {
  const topic = "crypto";
  var now = new Date();
  now.setHours(now.getHours() - 6);
  console.log("Calling Live");
  fetchNews(topic, 1, now.toISOString())
    .then(response => {
      let sorted = response.articles.sort((a, b) =>
        a.publishedAt > b.publishedAt ? 1 : -1
      );

      for (let i = 0; i < sorted.length; i++) {
        pusher.trigger("news-channel", "update-news", {
          articles: sorted[i]
        });
      }
      // res.json(sorted);
      updateFeed(topic);
    })
    .catch(error => console.log(error));
}

module.exports = router;