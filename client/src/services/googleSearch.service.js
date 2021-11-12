import axios from "axios";
// const endpoint = process.env.VUE_APP_SERVER_URL + '/visual-search/google'
const serverPath = process.env.VUE_APP_SERVER_URL;
let endpoint = null;

export default {
  async getSearchResults(isUrl, payload) {
    let body = {}, headers = {};
    if (!isUrl) {
      headers = {
        "Content-Type": `multipart/form-data;`,
      }
      body = new FormData()
      body.append("file", payload);
      endpoint = serverPath + '/upload';
    } else {
      body = { url: payload };
      endpoint = serverPath + '/url';
    }

    let res = await axios({
      method: "post",
      url: endpoint,
      data: body,
      headers: headers,
    });
    return this.mapResultParams(res.data);
  },
  mapResultParams(result){
    return result.map(res => {
      return {
        name: res.productName,
        image: res.productImage,
        price: res.productPrice,
        hostPageUrl: 'https://www.williams-sonoma.com/'
      };
    });
  }
};
