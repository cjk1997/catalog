const express = require('express');
const router = express.Router();
const { 
    getArticles,
    addArticle
} = require('../../data/articles');

router.get('/', async function(req, res, next) {
    try{
        const data = await getArticles();
        res.send(data);
    } catch(err) {
        console.log(err);
        res.send(500, 'Internal Server Issue, check logs');
    }  
});

router.post('/', async function(req, res, next) {
    try {
        const data = addArticle(req.body);
        res.send(data);
    } catch(err) {
        if (err.msg) {
            res.status(400).send(err.msg);
        } else {
            console.log(err);
            res.status(400).send('Internal Server Issue, check logs');

        };
    };
});

module.exports = router;