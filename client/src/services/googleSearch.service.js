import axios from "axios";
import {googleResultsToProductMapper} from "../utils/utils";
// const endpoint = process.env.VUE_APP_SERVER_URL + '/visual-search/google'
const serverPath = process.env.VUE_APP_SERVER_URL;
let endpoint = null;

export default {
  async getSearchResults(params) {
    const { isUrl, payload, selectedBrand } = params;
    let body = {},
      headers = {};
    if (!isUrl) {
      headers = { "Content-Type": `multipart/form-data;` };
      body = new FormData();
      body.append("file", payload);
      body.append("brand", selectedBrand);
      endpoint = serverPath + "/upload";
    } else {
      body = { url: payload };
      endpoint = serverPath + "/url";
    }

    let res = await axios({
      method: "post",
      url: endpoint,
      data: body,
      headers: headers,
    });
    return this.mapResultParams(res.data);
  },
  mapResultParams(result) {
    const productSearchResults =
      result.responses_[0].productSearchResults_.results_,
      productGroupedResults =
      result.responses_[0].productSearchResults_.productGroupedResults_,
      categorizeSearchResults = this.categorizeSearchResults(productSearchResults);

    return { productSearchResults, productGroupedResults, categorizeSearchResults };
    // let productResults;
    // if (result?.responses_[0]?.productSearchResults_?.results_?.length) {
    //   productResults = result.responses_[0].productSearchResults_.results_.map(
    //     (res) => {
    //       const product = res.product_.productLabels_.reduce(
    //         (prevVal, element, index) => {
    //           prevVal[element.key_] = [element.value_];
    //           return prevVal;
    //         },
    //         {}
    //       );
    //       product.name = res.product_.displayName_;
    //       product.image = product.imagePublicURL[0];
    //       product.price = product.price[0];
    //       product.hostPageUrl = product.pip[0];
    //       return product;
    //     }
    //   );
    //   const groupProudctResults = [];
    //   return { productResults, groupProudctResults };
    // } else return [];
  },
  getResultObjectBoundaries(result) {
    let boundaries = [];
    result.forEach((result, i) => {
      const boundingPoly = result.boundingPoly_.normalizedVertices_;
      if (Object.keys(boundingPoly[0]).length === 0) return;
      const rectangleBox = {
          topLeft: { x: boundingPoly[0].x_, y: boundingPoly[0].y_ },
          topRight: { x: boundingPoly[1].x_, y: boundingPoly[1].y_ },
          bottomRight: { x: boundingPoly[2].x_, y: boundingPoly[2].y_ },
          bottomLeft: { x: boundingPoly[3].x_, y: boundingPoly[3].y_ },
        },
        centerPoints = {
          x: (rectangleBox.topLeft.x + rectangleBox.topRight.x) / 2,
          y: (rectangleBox.topLeft.y + rectangleBox.bottomLeft.y) / 2,
        },
        rectangleCenterSpot = {
          topLeft: { x: centerPoints.x, y: centerPoints.y },
          topRight: { x: centerPoints.x, y: centerPoints.y },
          bottomRight: { x: centerPoints.x, y: centerPoints.y },
          bottomLeft: { x: centerPoints.x, y: centerPoints.y },
        };

      boundaries.push({ displayName: null, rectangleBox, rectangleCenterSpot });
    });
    return boundaries;
  },
  getResultsForCroppedArea(params) {
    if (params.cropArea && (typeof params.cropArea.boundingPolyIndex !== "undefined") && this.searchResults.productGroupedResults?.length) {
      const productSearchResults = this.searchResults.productGroupedResults[params.cropArea.boundingPolyIndex]?.results_,
          productGroupedResults = this.searchResults.productGroupedResults,
          categorizeSearchResults = this.categorizeSearchResults(productSearchResults);
      return { productSearchResults , productGroupedResults, categorizeSearchResults };
    }
    return null;
  },
  categorizeSearchResults(searchResult) {
    let categorizeSearchResults = [];
    if (searchResult.length) {
      searchResult.forEach(result => {
        const product = googleResultsToProductMapper(result);
        if (product.category) {
          const dataObj = {
            name: product.name,
            image: product.image,
            price: product.price,
            hostPageUrl: product.hostPageUrl,
          };
          if (!categorizeSearchResults.length) {
            categorizeSearchResults.push({
              categoryName: product.category,
              data: [dataObj],
              previewData: [dataObj]
            });
          } else {
            let categoryResult = categorizeSearchResults.find(r => r.categoryName === product.category);
            if (categoryResult) {
              categoryResult.data.push(dataObj);
              categoryResult.previewData.length < 3 && categoryResult.previewData.push(dataObj);
            } else {
              categorizeSearchResults.push({
                categoryName: product.category,
                data: [dataObj],
                previewData: [dataObj]
              });
            }
          }
        }
      });
    }
    return categorizeSearchResults;
  }
};
