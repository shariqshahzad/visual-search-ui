import axios from "axios";

export default {
  async getBingSearchResults(isUrl, payload) {
    return isUrl ? this.getURLResults(payload) : this.getImageResults(payload);
  },
  async getURLResults(imageUrl) {
    const bodyFormData = this.createBodyForUrl(imageUrl);
    const headers = {
      "Content-Type": `multipart/form-data; boundary=${bodyFormData._boundary}`,
      "Ocp-Apim-Subscription-Key": "691fac28b4e145bdb4ca086f6c190c5d",
    };
    let res = await axios({
      method: "post",
      url: "https://api.bing.microsoft.com/v7.0/images/visualsearch?mkt=en-us",
      data: bodyFormData,
      headers: headers,
    });
    return res.data;
  },
  async getImageResults(file) {
    console.log(file);
    const bodyFormData = this.createBodyForFileImage(file);
    const headers = {
      "Content-Type": `multipart/form-data; boundary=${bodyFormData._boundary}`,
      "Ocp-Apim-Subscription-Key": "691fac28b4e145bdb4ca086f6c190c5d",
    };
    let res = await axios({
      method: "post",
      url: "https://api.bing.microsoft.com/v7.0/images/visualsearch?mkt=en-us",
      data: bodyFormData,
      headers: headers,
    });
    return res.data;
  },
  createBodyForUrl(url) {
    const bodyFormData = new FormData();
    bodyFormData.append(
      "knowledgeRequest",
      JSON.stringify({
        imageInfo: {
          url: `${url}`,
          // cropArea: {
          //   top: 0.1,
          //   left: 0.2,
          //   bottom: 0.7,
          //   right: 0.5,
          // },
        },
        knowledgeRequest: {
          filters: { site: "https://www.williams-sonoma.com" },
        },
      })
    );
    return bodyFormData;
  },
  createBodyForFileImage(file) {
    const bodyFormData = new FormData();
    bodyFormData.append(
      "knowledgeRequest",
      JSON.stringify({
        knowledgeRequest: {
          filters: { site: "https://www.williams-sonoma.com" },
        },
      })
    );
    bodyFormData.append("image", file);
    return bodyFormData;
  },
};
