import axios from "axios";
import { googleResultsToProductMapper } from "../utils/utils";
import { BRANDS } from "../constants/constants";
import _ from "lodash";
// const endpoint = process.env.VUE_APP_SERVER_URL + '/visual-search/google'
const serverPath = process.env.VUE_APP_SERVER_URL;
let endpoint = null;

export default {
  searchResults: [],
  async getSearchResults(params) {
    let { isUrl, payload, selectedBrand } = params;

    if (typeof selectedBrand === "object") {
      for (let key in BRANDS) {
        let brand = BRANDS[key];
        if (brand.hostUrl === selectedBrand.hostUrl) {
          selectedBrand = key;
          break;
        }
      }
    }

    /**
     * Below statement gets cropped result from initial search result
     * :: Commenting this statement will make a separate request from google on the selection of each point
     * @type {{productSearchResults: *, productGroupedResults: *, categorizeSearchResults: *}}
     */
    // const resultsForCroppedArea = this.getResultsForCroppedArea(params);
    // if (resultsForCroppedArea) return resultsForCroppedArea;
    /*****************************************************************************************/

    let body = {},
      headers = {};
    if (!isUrl) {
      const file = params.cropArea?.cropAreaImage ?? payload;
      headers = { "Content-Type": `multipart/form-data;` };
      body = new FormData();
      body.append("file", file);
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
    const result = this.mapResultParams(res.data);
    if (!params.cropArea)
      // Avoid setting default search results for cropped area search
      this.searchResults = result;
    return result;
  },
  mapResultParams(result) {
    const productSearchResults =
        result.responses_[0].productSearchResults_.results_,
      productGroupedResults =
        result.responses_[0].productSearchResults_.productGroupedResults_,
      categorizeSearchResults = this.categorizeSearchResultsInitial(
        result.responses_[0].productSearchResults_
      );

    return {
      productSearchResults,
      productGroupedResults,
      categorizeSearchResults,
    };
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
    //   const groupProductResults = [];
    //   return { productResults, groupProductResults };
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

      boundaries.push({
        displayName: null,
        rectangleBox,
        rectangleCenterSpot,
        boundingPolyIndex: i,
      });
    });
    return boundaries;
  },
  getResultsForCroppedArea(params) {
    if (
      params.cropArea &&
      typeof params.cropArea.boundingPolyIndex !== "undefined" &&
      this.searchResults.productGroupedResults?.length
    ) {
      const productSearchResults = this.searchResults.productGroupedResults[
          params.cropArea.boundingPolyIndex
        ]?.results_,
        productGroupedResults = this.searchResults.productGroupedResults,
        categorizeSearchResults = this.categorizeSearchResults(
          productSearchResults
        );
      // console.log('-l',this.searchResults.productGroupedResults[params.cropArea.boundingPolyIndex]?.objectAnnotations_)
      return {
        productSearchResults,
        productGroupedResults,
        categorizeSearchResults,
      };
    }
    return null;
  },
  categorizeSearchResultsInitial(searchResult) {
    let categorizeSearchResults = [];
    if (!searchResult.productGroupedResults_) {
      return searchResult;
    }
    const productGroupedResults = searchResult.productGroupedResults_.map(
      (pgr) => {
        const res = _.cloneDeep(pgr);
        res.results_ = (pgr.results_.map(googleResultsToProductMapper));
        return res;
      }
    );
    if (productGroupedResults.length) {
      productGroupedResults.forEach((categoryResult) => {
        let prevCategoryGroup = categorizeSearchResults.find(o => o.categoryName === categoryResult.objectAnnotations_[0].name_);
        if (prevCategoryGroup) {
          categoryResult.results_.push(...prevCategoryGroup.data);
        }
        else {
          categorizeSearchResults.push({
            categoryName: categoryResult.objectAnnotations_[0].name_,
            data: categoryResult.results_,
            previewData: _.take(categoryResult.results_, 15),
          });
        }
      });

      categorizeSearchResults.forEach(result => {
        result.data = _.unionBy(result.data, "pid");
        result.data = _.orderBy(result.data, ['score'],['desc']);
      });
    }
    return categorizeSearchResults;
  },
  categorizeSearchResults(searchResult) {
    let categorizeSearchResults = [];
    if (searchResult.length) {
      searchResult.forEach((product) => {
        // const product = googleResultsToProductMapper(result);
        if (product.category) {
          const dataObj = {
            name: product.name,
            image: product.image,
            price: product.price,
            hostPageUrl: product.hostPageUrl,
          };
          const categoryPusher = () => {
            categorizeSearchResults.push({
              categoryName: product.category.split("|")[0],
              data: [dataObj],
              previewData: [dataObj],
            });
          };
          if (!categorizeSearchResults.length) {
            categoryPusher();
          } else {
            let categoryResult = categorizeSearchResults.find((r) =>
              product.category.includes(r.categoryName)
            );
            if (categoryResult) {
              categoryResult.data.push(dataObj);
              categoryResult.previewData.length < 15 &&
                categoryResult.previewData.push(dataObj);
            } else {
              categoryPusher();
            }
          }
        }
      });
    }

    return categorizeSearchResults;
  },
};
