var express = require('express');
var router = express.Router();

const { 
  getArticles,
  addArticle,
  updateArticle,
  deleteArticle
} = require('../data/articles');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Catalog' });
});

router.get('/articles', async function(req, res, next) {
  try {
    const data = await getArticles();
    res.render('articles', { title: "Articles", data: data });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Issue, check log');
  };
});

module.exports = router;
