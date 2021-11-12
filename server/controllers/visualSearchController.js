var googleVision = require('../services/GoogleVisionService');
var bingVisualSearch = require('../services/bingSearchService');
const services = {
    google: googleVision,
    bing: bingVisualSearch
};

exports.index = async (request, response) => {
    const service = services[request.params.provider];
    if (!service)
        return response.status(403).send("Invalid Service");

    service.invoke(request.files);

    response.send("index");
};