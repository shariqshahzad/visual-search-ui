import axios from "axios";

export default {
  async getBingSearchResults(searchType, payload, domainUrl) {
    return searchType === "imageUrl"
      ? this.getURLResults(payload, domainUrl)
      : this.getImageResults(payload, domainUrl);
  },
  async getURLResults(imageUrl, domainUrl) {
    const bodyFormData = this.createBodyForUrl(imageUrl, domainUrl);
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
  async getImageResults(file, domainUrl) {
    console.log(file);
    const bodyFormData = this.createBodyForFileImage(file, domainUrl);
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
  createBodyForUrl(url, domainUrl) {
    const bodyFormData = new FormData();
    bodyFormData.append(
      "knowledgeRequest",
      JSON.stringify({
        imageInfo: {
          url: `${url}`,
        },
        knowledgeRequest: {
          filters: { site: domainUrl },
        },
      })
    );
    return bodyFormData;
  },
  createBodyForFileImage(file, domainUrl) {
    const bodyFormData = new FormData();
    bodyFormData.append(
      "knowledgeRequest",
      JSON.stringify({
        knowledgeRequest: {
          filters: { site: domainUrl },
        },
      })
    );
    bodyFormData.append("image", file);
    return bodyFormData;
  },
};
