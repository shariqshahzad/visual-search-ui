var express = require('express'),
    router = express.Router(),
    bodyParser = require('body-parser'),
    app = express();

app.use(bodyParser.json());

/* GET home page. */
router.get('/test', async function (req, res, next) {
  res.send("Working!");
});

module.exports = router;
