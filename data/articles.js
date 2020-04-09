const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
 
// Connection URL
const url = process.env.DB_URL;

// Database Name
const dbName = 'wiki';
const colName = 'articles';

// Database Settings
const settings = { useUnifiedTopology: true };
 
// Validator function
const invalidArticle = (article) => {
    let result;
    if (!article.title) {
        result = 'Articls Require a Title';
    } else if (!article.link) {
        result = 'Articles Require a Link';
    } else if (!validURL(article.link)) {
        result = 'Link not valid URL';
    };
    return result;
}

const validURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
}

// Use connect method to connect to the server
const getArticles = () => {
    const iou = new Promise((resolve, reject) => {
        MongoClient.connect(url, settings, function(err, client) {
            if (err) {
                reject(err);
            } else {
                console.log("Connected successfully to server to GET Articles");
                const db = client.db(dbName);
                const collection = db.collection(colName);
                collection.find({}).toArray(function(err, docs) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("Found the following records");
                        console.log(docs);
                        resolve(docs);
                        client.close();
                    };
                });
            };
        });
    });
    return iou;
};

const addArticle = (articles) => {
    // const invalidArticles =
    const iou = new Promise((resolve, reject) => {
        if (!Array.isArray(articles)) {
            reject({ error: 'Need to send an Array of Articles' });
        } else {
            const invalidArticles = articles.filter((article) => {
                const check = invalidArticle(article);
                if (check) {
                    article.invalid = check;
                }
                return article.invalid;
            });
            if (invalidArticles.length > 0) {
                reject({
                    error: "Some Articles were invalid",
                    data: invalidArticles
                });
            } else {
                MongoClient.connect(url, settings, async function(err, client) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("Connected successfully to server to POST Articles");
                        const db = client.db(dbName);
                        const collection = db.collection(colName);
                        articles.forEach((article) => { 
                            article.dateAdded = new Date(Date.now()).toUTCString(); 
                        });
                        const results = await collection.insertMany(articles);
                        resolve(results.ops);
                    };
                });
            };
        };
    });
    return iou;
};

const updateArticle = (id, article) => {
    const iou = new Promise((resolve, reject) => {
        if (article.link) {
            if (!validURL(article.link)) {
                article.invalid = "Link not valid URL";
                reject(article);
            };
        };
        MongoClient.connect(url, settings, async function(err, client) {
            if (err) {
                reject(err);
            } else {
                console.log("Connect successfully to server to PATCH an Article");
                const db = client.db(dbName);
                const collection = db.collection(colName);
                try {
                    const _id = new ObjectID(id);
                    collection.updateOne( { _id},
                        { $set: { ...article } },
                        function(err, data) {
                            if (err) {
                                reject(err);
                            } else {
                                console.log(data);
                                resolve('Succesfully Updated');
                            };
                        });
                } catch (err) {
                    console.log(err);
                    reject({ error: "ID has to be in ObjectID format" });
                };
            };
        });
    });
    return iou;
};

const deleteArticle = (id) => {
    const iou = new Promise((resolve, reject) => {
        MongoClient.connect(url, settings, async function(err, client) {
            if (err) {
                reject(err);
            } else {
                console.log("Connected successfully to server to DELETE an Article");
                const db = client.db(dbName);
                const collection = db.collection(colName);
                try {
                    const _id = new ObjectID(id);
                    collection.findOneAndDelete({ _id }, function(err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            if(data.lastErrorObject.n > 0) {
                                resolve(data.value);
                            } else {
                                resolve({ error: "ID doesn't exist" });
                            }
                        };
                    });
                } catch {
                    console.log(data);
                    reject({ error: "ID has to be in ObjectID format" });
                };
            };
        });
    });
    return iou;
};

module.exports = {
    getArticles,
    addArticle,
    updateArticle,
    deleteArticle
};