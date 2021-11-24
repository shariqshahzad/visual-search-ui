import axios from "axios";
// const endpoint = process.env.VUE_APP_SERVER_URL + '/visual-search/google'
const serverPath = process.env.VUE_APP_SERVER_URL;
let endpoint = null;

export default {
  async getSearchResults(params) {
    const { isUrl, payload } = params;
    let body = {},
      headers = {};
    if (!isUrl) {
      headers = { "Content-Type": `multipart/form-data;` };
      body = new FormData();
      body.append("file", payload);
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
    const productSearchResults = result.responses_[0].productSearchResults_.results_;
    const productGroupedResults = result.responses_[0].productSearchResults_.productGroupedResults_;

    return { productSearchResults , productGroupedResults };
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
};
