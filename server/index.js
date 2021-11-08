const express = require('express');
const serveStatic = require("serve-static")
const path = require('path');
const app = express();
const router = require('./routes');
app.use(serveStatic(path.join(__dirname, '/../dist')));
app.use(router);
const port = process.env.PORT || 3000;
app.listen(port);