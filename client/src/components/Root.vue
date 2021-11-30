<template>
  <v-app id="inspire">
    <v-app-bar prominent app>
      <v-form
        ref="form"
        style="text-align: center; width: 100%"
        v-on:submit.prevent
      >
        <img
          class="center mt-2"
          style="height: 50px"
          src="https://assets.wsimgs.com/wsimgs/rk/images/i/202143/0006/images/common/logo.svg"
        />
        <v-row no-gutters>
          <v-col cols="5" align-self="end">
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
              :rules="imgFileRules"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Select an Image"
              prepend-icon="mdi-camera"
              label="Image"
            ></v-file-input>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="2">
            <v-select
              name="brand"
              required
              :items="brands"
              :rules="brandRules"
              v-model="selectedBrand"
              item-text="name"
              item-value="value"
              label="Brand"
            ></v-select>
          </v-col>
          <v-col cols="3">
            <v-btn
              @click="onBingSearch"
              type="submit"
              dark
              class="float-right mr-3"
              elevation="2"
            >
              <v-icon>mdi-microsoft-bing</v-icon>
              Bing
            </v-btn>
            <v-btn
              @click="onGoogleSearch"
              type="submit"
              dark
              class="float-right mr-3"
              elevation="2"
            >
              <v-icon>mdi-google</v-icon>Google
            </v-btn>
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
      <v-row
        v-if="isLoading"
        class="fill-height"
        align-content="center"
        justify="center"
      >
        <v-col class="text-subtitle-1 text-center" cols="12">
          Getting your results
        </v-col>
        <v-col cols="4">
          <v-progress-linear
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </v-col>
      </v-row>
    </v-main>
    <v-dialog v-if="dialog" v-model="dialog" max-width="auto">
      <v-card min-height="800">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title
            ><span class="text-capitalize">{{ this.searchOption }}</span> Search
            Results</v-toolbar-title
          >
          <v-spacer></v-spacer>
        </v-toolbar>
        <div style="padding:10px; overflow:hidden">
          <ImageSearchTool
            :results="resultsData"
            :imageData="imageData"
            :objectBoundaries="objectBoundaries"
            :defaultFilters="this.filters"
            :searchOption="searchOption"
          />
        </div>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import bingSearchService from "../services/bingSearch.service";
import googleSearchService from "../services/googleSearch.service";
import ImageSearchTool from "./ImageSearchTool.vue";
import { googleResultsToProductMapper } from "../utils/utils";
import { BRANDS } from "../constants/constants";
import { mapMutations, mapGetters } from "vuex";

export default {
  components: {
    ImageSearchTool,
  },
  data() {
    return {
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
        (v) => v.size <= 2000000 || "Image size should be less than 1 MB!",
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
    // onChangeInputSelection() {
    //   console.log(this.radioGrp);
    // },
    onSnackBarClose() {
      this.isError = false;
      this.errorDetail = "";
    },

    onBingSearch() {
      this.setSelectedBrand(BRANDS[this.selectedBrand]);
      this.searchOption = "bing";
      this.objectBoundaries = [];
      this.bingSearch(this.radioGrp === "imageUrl");
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
  },
};
</script>
<style scoped>
.img-container {
  width: 640px;
  height: 480px;
  float: left;
}
.img-preview {
  width: 200px;
  height: 200px;
  float: left;
  margin-left: 10px;
}
</style>
