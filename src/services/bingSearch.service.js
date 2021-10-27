import axios from "axios";

export default {
  async getResults(imageUrl) {
    const bodyFormData = new FormData();
    bodyFormData.append(
      "knowledgeRequest",
      JSON.stringify({
        imageInfo: {
          url: `${imageUrl}`,
        },
        knowledgeRequest: {
          filters: { site: "https://www.williams-sonoma.com" },
        },
      })
    );
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
};
