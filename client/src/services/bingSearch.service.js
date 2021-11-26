import axios from "axios";
import {isInt} from "../utils/utils";
const searchHostBing = 'https://www.westelm.com',
    apiKey = process.env.VUE_APP_BING_SEARCH_SUBSCRIPTION_KEY;

export default {
  async getSearchResults(params) {
    const {isUrl, payload, cropArea} = params;

    return isUrl ? this.getURLResults(payload, cropArea) : this.getImageResults(payload, cropArea);
  },
  async getURLResults(imageUrl, cropArea) {
    const bodyFormData = this.createBodyForUrl(imageUrl, cropArea);
    const headers = {
      "Content-Type": `multipart/form-data; boundary=${bodyFormData._boundary}`,
      "Ocp-Apim-Subscription-Key": apiKey,
    };
    let res = await axios({
      method: "post",
      url: "https://api.bing.microsoft.com/v7.0/images/visualsearch?mkt=en-us",
      data: bodyFormData,
      headers: headers,
    });
    return res.data; // response
  },
  async getImageResults(file, cropArea) {
    const bodyFormData = this.createBodyForFileImage(file, cropArea);
    const headers = {
      "Content-Type": `multipart/form-data; boundary=${bodyFormData._boundary}`,
      "Ocp-Apim-Subscription-Key": apiKey,
    };
    let res = await axios({
      method: "post",
      url: "https://api.bing.microsoft.com/v7.0/images/visualsearch?mkt=en-us",
      data: bodyFormData,
      headers: headers,
    });
    return res.data;
  },
  createBodyForUrl(url, cropArea) {
    const bodyFormData = new FormData();
    let imageInfo = {
      url: `${url}`
    };
    if (cropArea?.coordinates)
      imageInfo['cropArea'] = cropArea.coordinates;
    bodyFormData.append(
      "knowledgeRequest",
      JSON.stringify({
        imageInfo,
        knowledgeRequest: {
          filters: { site: searchHostBing },
        },
      })
    );
    return bodyFormData;
  },
  createBodyForFileImage(file, cropArea) {
    const bodyFormData = new FormData();
    let imageInfo = {};
    if (cropArea?.coordinates)
      imageInfo['cropArea'] = cropArea.coordinates;


    bodyFormData.append(
      "knowledgeRequest",
      JSON.stringify({
        imageInfo,
        knowledgeRequest: {
          filters: { site: searchHostBing },
        },
      })
    );
    bodyFormData.append("image", file);
    return bodyFormData;
  },
  mapResultParams(result){
    if (result && result.length)
      return result.map(res => {
        return {
          name: res.name,
          image: res.contentUrl,
          price: res?.insightsMetadata?.aggregateOffer?.lowPrice || 0,
          hostPageUrl: res.hostPageUrl
        };
      });
    return [];
  },
  getResultObjectBoundaries(result) {
    let boundaries = [];
    result.tags.forEach(tag => {
      if (!tag.displayName)
        return;
      const rectangleBox = tag.boundingBox.queryRectangle,
          rectangleCenterSpot = tag.boundingBox.displayRectangle,
          displayName = tag.displayName;

      if (isInt(rectangleBox.topLeft.x) && isInt(rectangleBox.bottomRight.y))
        return; //

      boundaries.push({rectangleBox,rectangleCenterSpot,displayName})
    })
      return boundaries;
  },
  reduceSearchResults(result) {
    return result.reduce(
        (finalResult, tag) => {
          let actionWithVisualSearchResults = tag.actions?.find(
              (action) =>
                  action.actionType == `ProductVisualSearch`
                || action.actionType == `VisualSearch`
          );


          // let actionWithVisualSearchResults = [];
          // const productVisualSearchResults = tag.actions?.find(
          //     (action) =>
          //         action.actionType == `ProductVisualSearch`
          // );
          // const visualSearchResults = tag.actions?.find(
          //     (action) =>
          //         action.actionType == `VisualSearch`
          // );
          // productVisualSearchResults?.data?.value && actionWithVisualSearchResults.push(...productVisualSearchResults.data.value);
          // visualSearchResults?.data?.value && actionWithVisualSearchResults.push(...visualSearchResults.data.value);

          return actionWithVisualSearchResults?.data?.value.length
              ? actionWithVisualSearchResults?.data?.value.filter(value => {
                // console.log('-v',value)
                return value.hostPageUrl.includes("product")
              })
              : finalResult;
        },
        null
    )
  }
};
