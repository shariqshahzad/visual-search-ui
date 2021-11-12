var express = require('express'),
    app = express(),
    cors = require('cors'),
    visualSearchController = require('../controllers/visualSearchController'),
    fileupload = require("express-fileupload");

app.use(express.json());
app.use(cors());
app.use(fileupload());

app.post('/visual-search/:provider', visualSearchController.index);

module.exports = app;
