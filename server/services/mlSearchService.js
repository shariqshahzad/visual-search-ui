const { default: axios } = require("axios");
var constants = require("../constants/constants");

exports.getYoloResults = async (body) => {
  let headers = { Authorization: `Bearer ${constants.WSI_ML_IMAGE_YOLO_API_KEY}` };
  return axios({
    method: "post",
    url: constants.WSI_ML_IMAGE_YOLO_URL,
    data: body,
    headers,
  });
};

exports.getSimilaritiesResults = async (body) => {
  let headers = { Authorization: `Bearer ${constants.WSI_ML_IMAGE_SEARCH_API_KEY}` };
  return axios({
    method: "post",
    url: constants.WSI_ML_IMAGE_SEARCH_URL,
    data: body,
    headers,
  });
};
