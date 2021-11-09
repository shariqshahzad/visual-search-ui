var httpProxy = require('http-proxy'),
    url = require('url');

function processRequest(req, res, proxy, new_req) {
    req.url = new_req.path
    req.headers.host = new_req.host
    res.oldWriteHead = res.writeHead;
    res.writeHead = function (statusCode, headers) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Credentials', true)
        res.oldWriteHead(statusCode, headers);
    }
    try {
        proxy.proxyRequest(req, res, {
            host: req.headers.host.split(":")[0],
            port: parseInt(req.headers.host.split(":")[1]) || 80
        });
    } catch (err) {
        console.log(err);
    }
}

const port = process.env.PORT || 8000;
console.log('port - proxy', port);
httpProxy.createServer(function (req, res, proxy) {
    var url_path = req.url.slice(1);
    let new_req;
    new_req = url.parse(url_path)
    if (new_req.host)
        processRequest(req, res, proxy, new_req);
}).listen(port);

process.on('uncaughtException', function (e) {
    console.log(e)
});
