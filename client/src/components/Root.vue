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
          <v-col cols="7" align-self="end">
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
              :rules="imgFileRules"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Select an Image"
              prepend-icon="mdi-camera"
              label="Image"
            ></v-file-input>
          </v-col>

          <v-col cols="5">
            <v-row>
              <v-col cols="7">
                <v-radio-group class="ml-3 mt-2" v-model="radioGrp" row>
                  <v-radio
                    key="imageUpload"
                    label="Upload Image"
                    value="imageUpload"
                  ></v-radio>
                  <v-radio
                    key="imageUrl"
                    label="Image URL"
                    value="imageUrl"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="5">
                <v-row class="mt-1">
                  <v-btn @click="onBingSearch" type="submit" dark class="float-right mr-3" elevation="2">
                    <v-icon>mdi-microsoft-bing</v-icon>
                    Bing
                  </v-btn>
                  <v-btn @click="onGoogleSearch" type="submit" dark class="float-right mr-3" elevation="2">
                    <v-icon>mdi-google</v-icon>Google
                  </v-btn>
                </v-row>
              </v-col>
            </v-row>
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
          <v-toolbar-title><span class="text-capitalize">{{this.searchOption}}</span> Search Results</v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <ImageSearchTool :results="resultsData" :imageData="imageData" :defaultFilters="this.filters" :searchOption="searchOption" />
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import bingSearchService from "../services/bingSearch.service";
import googleSearchService from "../services/googleSearch.service";
import ImageSearchTool from "./ImageSearchTool.vue";
import { searchResultsReducer } from "../utils/utils";

export default {
  components: {
    ImageSearchTool,
  },
  data() {
    return {
      radioGrp: "imageUrl",
      searchOption:null,
      files: [],
      dialog: false,
      imageData: null,
      imgFileRules: [
        (value) =>
          !value ||
          value.size <= 2000000 ||
          "Avatar size should be less than 1 MB!",
      ],
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
          max: null
        }
      },
      isLoading: false,
      isError: false,
      errorDetail: "",
    };
  },
  computed:{
    imageProxyUrl:function (){
      return `${process.env.VUE_APP_PROXY_SERVER_URL}/${this.imageUrl}`;
    }
  },
  methods: {
    // onChangeInputSelection() {
    //   console.log(this.radioGrp);
    // },
    onSnackBarClose() {
      this.isError = false;
      this.errorDetail = "";
    },

    onBingSearch() {
      this.searchOption = 'bing';
      this.bingSearch(this.radioGrp === "imageUrl");
    },
    onGoogleSearch() {
      this.searchOption = 'google';
      this.googleSearch(this.radioGrp === "imageUrl");
    },
    bingSearch(isUrl = false) {
      if (!this.$refs.form.validate()) {
        return;
      }

      this.isLoading = true;

      bingSearchService
        .getSearchResults(isUrl, isUrl ? this.imageUrl : this.files)
        .then((res) => {
          let visualSearchResultsData = res.tags.reduce(
            searchResultsReducer,
            null
          );
          visualSearchResultsData = bingSearchService.mapResultParams(visualSearchResultsData);
          if (visualSearchResultsData && visualSearchResultsData.length > 0) {
            this.resultsData = visualSearchResultsData;

            this.filters.priceRange = {
              ...this.filters.priceRange,
              min: Math.min.apply(Math, visualSearchResultsData.map(v => !(v.price) ? 0 : v.price)),
              max: Math.max.apply(Math, visualSearchResultsData.map(v => !(v.price) ? 0 : v.price))
            };

            this.imageData = {
              isUrl: this.radioGrp === "imageUrl",
              src:
                this.radioGrp === "imageUrl"
                  ? this.imageProxyUrl
                  : URL.createObjectURL(this.files),
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
          .getSearchResults(isUrl, isUrl ? this.imageUrl : this.files)
          .then((visualSearchResultsData) => {
            if (visualSearchResultsData && visualSearchResultsData.length > 0) {
              this.resultsData = visualSearchResultsData;
              this.filters.priceRange = {
                ...this.filters.priceRange,
                min: Math.min.apply(Math, visualSearchResultsData.map(v => !(v.price) ? 0 : v.price)),
                max: Math.max.apply(Math, visualSearchResultsData.map(v => !(v.price) ? 0 : v.price))
              };

              this.imageData = {
                isUrl: this.radioGrp === "imageUrl",
                src:
                    this.radioGrp === "imageUrl"
                        ? this.imageProxyUrl
                        : URL.createObjectURL(this.files),
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
