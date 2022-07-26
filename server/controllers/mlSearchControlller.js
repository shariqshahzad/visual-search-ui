var mlSearchService = require("../services/mlSearchService");

const request = require("request");

exports.getYoloResults = async (req, res) => {
  try {
    const serviceResponse = await mlSearchService.getYoloResults(req.body);
    res.status(200).send(serviceResponse.data);
  } catch (e) {
    console.log(e);
    res.status(500).send("Something Went wrong");
  }
};

exports.getSimilaritiesResults = async (req, res) => {
  try {
    const serviceResponse = await mlSearchService.getSimilaritiesResults(req.body);
    res.status(200).send(serviceResponse.data);
  } catch (e) {
    console.log(e);
    res.status(500).send("Something Went wrong");
  }
};

exports.getPictureFromDam = async (req, res) => {
  try {
    if (req.body && req.body.assetPath) {
      auth = "Basic " + Buffer.from("test-admin:test-admin").toString("base64");
      const imageUrl = "https://dam-east-uat.wsgc.com/crx/de/download.jsp?path=" + req.body.assetPath + "/jcr:content/renditions/original/jcr:content/jcr:data&index=0";
      //const imageUrl = "https://dam-east-uat.wsgc.com/crx/de/download.jsp?path=/content/dam/west-elm/everest-testing/LS-brooklyn-leather-sofa-z.jpeg/jcr:content/renditions/original/jcr:content/jcr:data&index=0";
      request(imageUrl, {
        headers: {
          Authorization: auth,
        },
      }).pipe(res);
    } else {
      res.status(400).send("assetPath is required")
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Something Went wrong");
  }
};

exports.getEmbeddingsResults = async (req, res) => {
  try {
    const serviceResponse = await mlSearchService.getEmbeddingsResults(req.body);
    res.status(200).send(serviceResponse.data);
  } catch (e) {
    console.log(e);
    res.status(500).send("Something Went wrong");
  }
};
