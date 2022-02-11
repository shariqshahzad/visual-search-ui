var mlSearchService = require("../services/mlSearchService");

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
