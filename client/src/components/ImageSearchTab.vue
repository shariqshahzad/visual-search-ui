<template>
  <div>
    <v-row
      v-if="isLoading"
      class="fill-height"
      align-content="center"
      justify="center"
      style="margin: 200px"
    >
      <v-col class="text-subtitle-1 text-center" cols="12">
        Getting your results...
      </v-col>
      <v-col cols="4">
        <v-progress-linear indeterminate rounded height="6"></v-progress-linear>
      </v-col>
    </v-row>
    <img
      style="display: none"
      ref="uploadedImage"
      :src="imgBase64"
      crossorigin
    />
    <ImageSearchTool
      v-if="resultsAvailable"
      :results="resultsData"
      :imageData="imageData"
      :objectBoundaries="objectBoundaries"
      :categorizeSearchResults="categorizeSearchResults"
    />
    <!-- <v-card>
      <div style="padding: 10px; overflow: hidden"></div>
    </v-card> -->
  </div>
</template>
<script>
import WSIMLSearchService from "../services/WSIMLSearch.service";
import { encodeImageFileAsURL } from "../utils/utils";
import ImageSearchTool from "./ImageSearchTool.vue";
import Cropper from "cropperjs";
export default {
  components: {
    ImageSearchTool,
  },
  props: {
    searchProp : Object,
  },
  mounted() {
    this.$refs.uploadedImage.onload = (img) => {
      this.cropper = new Cropper(img.target, {
        zoomable: false,
        autoCropArea: 0,
        autoCrop: false,
      });
    };
    this.onWSIMLSearch();
  },
  data() {
    return {
      imgBase64: null,
      resultsAvailable: false,
      imageData: null,
      objectBoundaries: [],
      //   imgFileRules: [
      //     (v) =>
      //       (v && v.size <= 2000000) || "Image size should be less than 1 MB!",
      //   ],
      resultsData: [],
      categorizeSearchResults: [],
      imageUrl: "",
      isLoading: false,
      isError: false,
      errorDetail: "",
    };
  },
  methods: {
    async onWSIMLSearch() {
      debugger;
      let base64str;
      console.log(this.searchProp.dataURI);
      base64str = this.searchProp.dataURI
        ? this.searchProp.dataURI
        : await encodeImageFileAsURL(this.searchProp.file);
      this.imgBase64 = base64str;
      base64str = base64str.split(",")[1];
      await this.WSIMLSearch(base64str);
    },
    createBase64StringForBoundary(element) {
      let cropperCoordinates = {
        x: element.bbox[0],
        y: element.bbox[1],
        width: element.bbox[2] - element.bbox[0],
        height: element.bbox[3] - element.bbox[1],
      };
      this.cropper.crop();
      this.cropper.setData(cropperCoordinates);
      let base64 = this.cropper.getCroppedCanvas().toDataURL("image/jpeg");
      base64 = base64.split(",")[1];
      return base64;
    },
    async WSIMLSearch(base64str) {
      this.isLoading = true;
      const yoloData = await WSIMLSearchService.getYoloResults(base64str);
      const promises = [];
      yoloData.forEach((element) => {
        let base64 = this.createBase64StringForBoundary(element);
        promises.push(
          WSIMLSearchService.getSimilaritiesResults(
            element.class,
            base64,
            element.id
          )
        );
        this.objectBoundaries = yoloData;
      });
      const productResults = await Promise.all(promises);
      this.isLoading = false;
      this.categorizeSearchResults = productResults;

      this.resultsData = null;
      this.imageData = {
        isUrl: false,
        src: this.imgBase64,
        files: this.file,
      };
      this.resultsAvailable = true;
    },
  },
};
</script>