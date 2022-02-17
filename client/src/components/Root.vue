<template>
  <v-app id="inspire">
    <v-app-bar app>
      <v-form
        ref="form"
        style="text-align: center; width: 100%"
        v-on:submit.prevent
      >
        <v-row align="center" justify="center" no-gutters>
          <v-col col="5">
            <img
              class="float-left mt-1"
              style="height: 50px"
              src="https://assets.wsimgs.com/wsimgs/rk/images/i/202143/0006/images/common/logo.svg"
            />
          </v-col>
          <v-col cols="5">
            <v-btn
              @click="onClickSearch()"
              type="submit"
              dark
              class="float-right ml-5 mb-3"
              elevation="2"
            >
              SEARCH
            </v-btn>
            <v-text-field
              v-if="radioGrp === 'imageUrl'"
              required
              :rules="rules"
              label="Image Url"
              name="imgUrl"
              v-model="imageUrl"
              placeholder="Please Enter your url here"
            ></v-text-field>
            <v-file-input
              v-if="radioGrp === 'imageUpload'"
              v-model="files"
              required
              multiple
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Select an Image"
              prepend-icon="mdi-camera"
              label="Image"
            ></v-file-input>
          </v-col>
        </v-row>
      </v-form>
    </v-app-bar>
    <v-snackbar v-model="isError">
      {{ errorDetail }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="onSnackBarClose">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-main>
      <v-tabs
        fixed-tabs
        icons-and-text
        v-if="tabs.length"
        background-color="transparent"
        next-icon="mdi-arrow-right-bold-box-outline"
        prev-icon="mdi-arrow-left-bold-box-outline"
        show-arrows
        v-model="tab"
      >
        <v-tabs-slider color="primary lighten-3"></v-tabs-slider>
        <v-tab v-for="item in tabs" :key="item.name">
          {{ item.name }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in tabs" :key="item.name">
          <ImageSearchTab :file="item" />
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-app>
</template>

<script>
import bingSearchService from "../services/bingSearch.service";
import googleSearchService from "../services/googleSearch.service";
import WSIMLSearchService from "../services/WSIMLSearch.service";
import ImageSearchTab from "./ImageSearchTab.vue";
import Cropper from "cropperjs";
import {
  googleResultsToProductMapper,
  encodeImageFileAsURL,
} from "../utils/utils";
import { BRANDS } from "../constants/constants";
import { mapMutations, mapGetters } from "vuex";

export default {
  components: {
    ImageSearchTab,
  },
  mounted() {
    // this.$refs.uploadedImage.onload = (img) => {
    //   this.cropper = new Cropper(img.target, {
    //     zoomable: false,
    //     autoCropArea: 0,
    //     autoCrop: false,
    //   });
    // };
  },
  data() {
    return {
      tabs: [],
      tab: null,
      imgBase64: null,
      selectedBrand: null,
      brands: Object.keys(BRANDS).map((key) => ({
        name: BRANDS[key].name,
        value: key,
      })),
      radioGrp: "imageUpload",
      searchOption: null,
      files: [],
      dialog: false,
      imageData: null,
      objectBoundaries: [],
      imgFileRules: [
        (v) =>
          (v && v.size <= 2000000) || "Image size should be less than 1 MB!",
      ],
      brandRules: [(v) => !!v || "Brand is required"],
      rules: [
        (v) => {
          var expression =
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi; // eslint-disable-line
          var regex = new RegExp(expression);
          return Boolean(v.match(regex)) || "Invalid URL";
        },
      ],
      resultsData: [],
      categorizeSearchResults: [],
      imageUrl: "",
      filters: {
        priceRange: {
          min: null,
          max: null,
        },
      },
      isLoading: false,
      isError: false,
      errorDetail: "",
    };
  },

  computed: {
    // ...mapGetters([
    //   "selectedBrand",
    //   // ...
    // ]),
    imageProxyUrl: function () {
      return `${process.env.VUE_APP_PROXY_SERVER_URL}/${this.imageUrl}`;
    },
  },
  methods: {
    ...mapMutations(["setSelectedBrand"]),
    onSnackBarClose() {
      this.isError = false;
      this.errorDetail = "";
    },
    async onClickSearch() {
      if (this.files.length && this.files.length > 0) {
        this.files.map((file) => {
          this.tabs.push(file);
        });
      }
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
        isUrl: this.radioGrp === "imageUrl",
        src:
          this.radioGrp === "imageUrl"
            ? this.imageProxyUrl
            : URL.createObjectURL(this.files),
        files: this.files,
      };
      this.dialog = true;
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
    onGoogleSearch() {
      this.setSelectedBrand(BRANDS[this.selectedBrand]);
      this.searchOption = "google";
      this.objectBoundaries = [];
      this.googleSearch(this.radioGrp === "imageUrl");
    },
    bingSearch(isUrl = false) {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.isLoading = true;

      bingSearchService
        .getSearchResults({
          selectedBrand: BRANDS[this.selectedBrand],
          isUrl,
          payload: isUrl ? this.imageUrl : this.files,
        })
        .then((res) => {
          this.objectBoundaries =
            bingSearchService.getResultObjectBoundaries(res);
          let visualSearchResultsData = bingSearchService.reduceSearchResults(
            res.tags
          );
          visualSearchResultsData = bingSearchService.mapResultParams(
            visualSearchResultsData
          );
          if (visualSearchResultsData && visualSearchResultsData.length > 0) {
            this.resultsData = visualSearchResultsData;

            this.filters.priceRange = {
              ...this.filters.priceRange,
              min: Math.min.apply(
                Math,
                visualSearchResultsData.map((v) => (!v.price ? 0 : v.price))
              ),
              max: Math.max.apply(
                Math,
                visualSearchResultsData.map((v) => (!v.price ? 0 : v.price))
              ),
            };

            this.imageData = {
              isUrl: this.radioGrp === "imageUrl",
              src:
                this.radioGrp === "imageUrl"
                  ? this.imageProxyUrl
                  : URL.createObjectURL(this.files),
              files: this.files,
            };
            this.dialog = true;
            return;
          }
          this.isError = true;
          this.errorDetail = "No results found";
        })
        .catch((e) => {
          this.isError = true;
          this.errorDetail = "Something Went Wrong";
          console.log(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    googleSearch(isUrl = false) {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.isLoading = true;
      googleSearchService
        .getSearchResults({
          selectedBrand: this.selectedBrand,
          isUrl,
          payload: isUrl ? this.imageUrl : this.files,
        })
        .then((res) => {
          const visualSearchResultsData = res.productSearchResults.map(
            googleResultsToProductMapper
          );
          if (visualSearchResultsData && visualSearchResultsData.length > 0) {
            this.objectBoundaries =
              googleSearchService.getResultObjectBoundaries(
                res.productGroupedResults
              );

            this.categorizeSearchResults = res.categorizeSearchResults;

            this.resultsData = null;
            this.filters.priceRange = {
              ...this.filters.priceRange,
              min: Math.min.apply(
                Math,
                visualSearchResultsData.map((v) => (!v.price ? 0 : v.price))
              ),
              max: Math.max.apply(
                Math,
                visualSearchResultsData.map((v) => (!v.price ? 0 : v.price))
              ),
            };

            this.imageData = {
              isUrl: this.radioGrp === "imageUrl",
              src:
                this.radioGrp === "imageUrl"
                  ? this.imageProxyUrl
                  : URL.createObjectURL(this.files),
              files: this.files,
            };
            this.dialog = true;
            return;
          }
          this.isError = true;
          this.errorDetail = "No results found";
        })
        .catch((e) => {
          this.isError = true;
          this.errorDetail = "Something Went Wrong";
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>
<style >
#inspire
  > div
  > main
  > div
  > div.v-window.v-item-group.theme--light.v-tabs-items
  > div
  > div
  > div
  > div.cropper-container.cropper-bg {
  display: none !important;
}
</style>
