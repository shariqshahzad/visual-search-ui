import axios from "axios";
import { googleResultsToProductMapper } from "../utils/utils";
import { BRANDS, WSI_ML_SIMILARITY_ENDPOINT, WSI_ML_YOLO_ENDPOINT, API_KEY } from "../constants/constants";
import _ from "lodash";
const baseUrl = process.env.VUE_APP_MIDDLEWARE_URL;

export default {
  async getSimilaritiesResults(categoryName, base64Str, categoryId) {
    let body = {
      img: base64Str,
      one_per_pid: true,
      filter_prod_type: true,
      name: categoryName,
    };
    let res;
    try {
      res = await axios({
        method: "post",
        url: `${baseUrl}${WSI_ML_SIMILARITY_ENDPOINT}`,
        data: body,
      });
    } catch (e) {
      console.log(e);
    }
    let products = res.data.map((r) => {
      const product = {};
      product.name = r.product_type;
      product.image = r.thumb_image;
      product.price = 123.0;
      product.pid = r.pid;
      product.hostPageUrl = r.pid;
      product.category = r.category;
      product.similarity = r.similarity;
      product.skuid = r.skuid;
      product.brand = r.brand;
      return product;
    });
    return { categoryName,categoryId,data: products, previewData: products };
  },
  async getYoloResults(base64Str) {
    let body = {
      img: base64Str,
    };
    let res;
    try {
      res = await axios({
        method: "post",
        url: `${baseUrl}${WSI_ML_YOLO_ENDPOINT}`,
        data: body,
      });
    } catch (e) {
      console.log(e);
    }
    return res.data.map((yd,index)=>{
      yd.id = index+1;
      return yd;
    });
  },
};
