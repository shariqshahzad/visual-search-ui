import axios from "axios";
import { generateUUID } from "../utils/utils";
import { BRANDS, WSI_ML_SIMILARITY_ENDPOINT, WSI_ML_EMBEDDINGS_ENDPOINT, WSI_ML_YOLO_ENDPOINT, API_KEY } from "../constants/constants";
import _ from "lodash";
const baseUrl = process.env.VUE_APP_MIDDLEWARE_URL;

export default {
  async getEmbbeddingsResults(categoryName, base64Str, categoryId) {
    let body = {
      img: base64Str,
    };
    let res;
    try {
      res = await axios({
        method: "post",
        url: `${baseUrl}${WSI_ML_EMBEDDINGS_ENDPOINT}`,
        data: body,
      });
    } catch (e) {
      console.log(e);
    }

    return { categoryName, embedding: res.data.embedding, categoryId };
  },
  async getSimilaritiesResults(embeddings) {
    let body = embeddings.map((emb) => ({
      img: emb.embedding,
      one_per_pid: true,
      filter_prod_type: true,
      name: emb.categoryName,
    }));
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
    const similarityResults = res.data.map((element, index) => {
      let products = element.map((r, index) => {
        const product = {};
        product.product_type = r.product_type;
        product.image = r.thumb_image;
        product.isPrioritySku = false;
        // product.price = 123.0;
        product.pid = r.pid;
        // product.hostPageUrl = r.pid;
        product.category = r.category;
        product.similarity = r.similarity;
        product.skuid = r.skuid;
        product.brand = r.brand;
        return product;
      });
      return { categoryName: embeddings[index].categoryName, categoryId: embeddings[index].categoryId, data: products, previewData: products };
    });
    return similarityResults;
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
    return res.data.map((yd) => {
      yd.id = generateUUID();
      yd.mappedPrId = yd.id;
      return yd;
    });
  },
};
