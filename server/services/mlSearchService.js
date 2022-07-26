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

exports.getEmbeddingsResults = async (body) => {
  let headers = { Authorization: `Bearer ${constants.WSI_ML_IMAGE_EMBEDDINGS_API_KEY}` };
  return axios({
    method: "post",
    url: constants.WSI_ML_IMAGE_EMBEDDINGS_URL,
    data: body,
    headers,
  });
};

// exports.getPictureFromDam = async (body) => {
//   return axios({
//     method: "get",
//     auth : {
//       username:  'test-admin',
//       password : 'test-admin'
//     },
//     url: `https://dam-east-uat.wsgc.com/crx/de/download.jsp?path=%2Fcontent%2Fdam%2Fwest-elm%2Feverest-testing%2FLS-brooklyn-leather-sofa-z.jpeg%2Fjcr%3Acontent%2Frenditions%2Foriginal%2Fjcr%3Acontent%2Fjcr%3Adata&index=0`,
//   });
// };

exports.getSimilaritiesResults = async (body) => {
  let headers = { Authorization: `Bearer ${constants.WSI_ML_IMAGE_SEARCH_API_KEY}` };
  return axios({
    method: "post",
    url: constants.WSI_ML_IMAGE_SEARCH_URL,
    data: body,
    headers,
  });
};
