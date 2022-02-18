<template>
  <v-app id="inspire">
    <v-app-bar app>
      <v-form
        ref="form"
        style="text-align: center; width: 100%"
        v-on:submit.prevent
      >
        <v-row align="center" justify="center" no-gutters>
          <v-col cols="3">
            <img
              class="float-left mt-1"
              style="height: 40px"
              src="https://assets.wsimgs.com/wsimgs/rk/images/i/202143/0006/images/common/logo.svg"
            />
          </v-col>
          <v-col cols="4" class="mt-5">
            <v-radio-group class="float-right" row v-model="radioGrp">
              <v-radio
                v-for="btn in radioButtons"
                :key="btn.value"
                :label="btn.label"
                :value="btn.value"
              ></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="5" class="mt-5">
            <v-btn
              @click="onClickSearch()"
              type="submit"
              dark
              class="float-right ml-5 mb-3"
              elevation="2"
            >
              SEARCH
            </v-btn>
            <v-file-input
              v-if="radioGrp === 'fileUpload'"
              v-model="xlsxFile"
              required
              :multiple="false"
              accept="text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,	application/csv"
              placeholder="Select an Excel File"
              prepend-icon="mdi-file-excel-box"
              label="Excel File"
            ></v-file-input>
            <v-file-input
              v-if="radioGrp === 'imageUpload'"
              v-model="imageFiles"
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
        v-if="tabs.length"
        background-color="transparent"
        next-icon="mdi-arrow-right-bold-box-outline"
        prev-icon="mdi-arrow-left-bold-box-outline"
        show-arrows
        v-model="tab"
      >
        <v-tabs-slider color="primary lighten-3"></v-tabs-slider>
        <v-tab v-for="item in tabs" :key="item.key">
          {{ item.name }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in tabs" :key="item.key">
          <ImageSearchTab :searchProp="item" />
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-app>
</template>

<script>
import ImageSearchTab from "./ImageSearchTab.vue";
import Cropper from "cropperjs";
import {
  googleResultsToProductMapper,
  parseExcel,
  toDataURL,
  generateUUID,
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
      radioButtons: [
        { value: "imageUpload", label: "Image Upload" },
        { value: "fileUpload", label: "File Upload" },
      ],
      brands: Object.keys(BRANDS).map((key) => ({
        name: BRANDS[key].name,
        value: key,
      })),
      radioGrp: "imageUpload",
      searchOption: null,
      imageFiles: [],
      xlsxFile: null,
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
      this.tabs = [];
      this.tab = null;
      let files;
      if (this.radioGrp === "imageUpload") {
        files = this.imageFiles;
        if (files.length && files.length > 0) {
          files.forEach((file,index) => {
            this.tabs.push({ name: `Image ${index+1}`,key:generateUUID() , file });
          });
        }
      } else {
        files = await this.getImageFilesFromExcel();
        if (files.length && files.length > 0) {
          files.forEach((file) => {
            this.tabs.push(file);
          });
        }
      }
    },
    async getImageFilesFromExcel() {
      let imagesData = JSON.parse(await parseExcel(this.xlsxFile));
      let imagesDataWithDataURI = await Promise.all(
        imagesData.map(async (element,index) => {
          const dataURI = await toDataURL(element.Url);
          return {
            name: `Image ${index+1}`,
            key : generateUUID(),
            dataURI,
          };
        })
      );
      return imagesDataWithDataURI;
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
