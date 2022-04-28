var express = require('express'),
    app = express(),
    cors = require('cors'),
    visualSearchController = require('../controllers/visualSearchController'),
    mlSearchControlller = require('../controllers/mlSearchControlller'),
    mlSearchTest = require('../tests/mlSearchServiceTest'),
    fileupload = require("express-fileupload");

app.use(express.json({limit: '50mb'}));
app.use(cors());
app.use(fileupload());

app.post('/visual-search/:provider', visualSearchController.index);
app.post('/ml-visual-search/yolo', mlSearchControlller.getYoloResults);
app.post('/ml-visual-search/similarity', mlSearchControlller.getSimilaritiesResults);
app.get('/ml-visual-search/test', mlSearchTest.initiate);

module.exports = app;
