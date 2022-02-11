var express = require('express'),
    app = express(),
    cors = require('cors'),
    visualSearchController = require('../controllers/visualSearchController'),
    mlSearchControlller = require('../controllers/mlSearchControlller'),
    fileupload = require("express-fileupload");

app.use(express.json({limit: '50mb'}));
app.use(cors());
app.use(fileupload());

app.post('/visual-search/:provider', visualSearchController.index);
app.post('/ml-visual-search/yolo', mlSearchControlller.getYoloResults);
app.post('/ml-visual-search/similarity', mlSearchControlller.getSimilaritiesResults);

module.exports = app;
