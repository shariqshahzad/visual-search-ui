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
              class="float-right ml-5 mb-3"
              color="teal"
              @click="onClickExport()"
              :disabled="!(Object.keys(approvedItems).length > 0)"
            >
              <v-icon color="white"> mdi-file-excel-box </v-icon>
            </v-btn>
            <!-- <v-btn
              @click="onClickExport()"
              :disabled="!(Object.keys(approvedItems).length > 0)"
              type="button"
              dark

              elevation="2"
            >
              <v-icon>mdi-export</v-icon>
            </v-btn> -->
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
              v-if="radioGrp === 'zipUpload'"
              v-model="zipFile"
              required
              :multiple="false"
              accept="application/zip"
              placeholder="Select a zip File"
              prepend-icon="mdi-folder-zip-outline"
              label="Zip File"
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
      <v-row
        v-if="isDataLoading && tabs.length <= 0"
        align-content="center"
        justify="center"
        style="margin: 200px"
      >
        <v-col class="text-subtitle-1 text-center" cols="12">
          Fetching Images From DAM ...
        </v-col>
        <v-col cols="4">
          <v-progress-linear
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </v-col>
      </v-row>
      <v-tabs
        @change="onChangeTab($event)"
        centered
        v-if="tabs.length"
        background-color="transparent"
        next-icon="mdi-arrow-right-bold-box-outline"
        prev-icon="mdi-arrow-left-bold-box-outline"
        show-arrows
        v-model="tab"
      >
        <v-tabs-slider color="primary lighten-3"></v-tabs-slider>
        <v-tab
          v-for="item in tabs"
          :key="item.key"
          :disabled="isDataLoading && !tabs.length > 0"
        >
          <v-tooltip bottom color="primary">
            <template v-slot:activator="{ on, attrs }">
              <div v-bind="attrs" v-on="on">
                {{ item.name }}
                <v-icon
                  color="green"
                  v-if="item.status === TAB_STATUSES.APPROVED"
                  >mdi-checkbox-marked-circle</v-icon
                >
                <v-icon
                  color="orange"
                  style="margin-bottom: 3px; font-size: 25px"
                  v-if="item.status === TAB_STATUSES.PENDING_CHANGES"
                  >mdi-clock-time-three</v-icon
                >
                <!-- <span v-if="item.status === TAB_STATUSES.PENDING_CHANGES"
                  >*</span
                > -->
                <!-- <v-icon v-if="item.status === TAB_STATUSES.IN_PROGRESS"
                  >mdi-alert-circle</v-icon
                > -->
              </div>
            </template>
            <div style="width: 200px">
              <img :src="item.imgSrc" />
            </div>
          </v-tooltip>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item
          v-for="(item, i) in tabs"
          :key="item.key"
          class="tab-section"
          :tab-index="i"
        >
          <ImageSearchTab :searchProp="item" :tabindex="i" />
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </v-app>
</template>

<script>
import ImageSearchTab from "./ImageSearchTab.vue";
import JSZip from "jszip";
import { createJsonFileAndDownload } from "../utils/utils";
import Cropper from "cropperjs";
import {
  googleResultsToProductMapper,
  convertApprovedItemsToBinaryObjects,
  parseExcel,
  toDataURL,
  getMimeTypeOfFile,
  encodeImageFileAsURL,
  generateUUID,
  exportExcel,
} from "../utils/utils";
import { BRANDS, TAB_STATUSES } from "../constants/constants";

import { mapMutations, mapGetters } from "vuex";
import WSIMLSearchService from "../services/WSIMLSearch.service";

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
      TAB_STATUSES,
      tab: null,
      imgBase64: null,
      selectedBrand: null,
      radioButtons: [
        { value: "imageUpload", label: "Image Upload" },
        { value: "zipUpload", label: "Upload a zip file" },
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
      zipFile: null,
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
  watch: {
    // approvedItems(newValue, oldValue) {
    //   this.
    // },
  },
  computed: {
    ...mapGetters([
      "tabs",
      "approvedItems",
      "isDataLoading",
      // ...
    ]),
    imageProxyUrl: function () {
      return `${process.env.VUE_APP_PROXY_SERVER_URL}/${this.imageUrl}`;
    },
  },
  methods: {
    ...mapMutations([
      "setTabs",
      "setCurrentTabKey",
      "setTabsData",
      "setIsDataLoading",
    ]),
    onSnackBarClose() {
      this.isError = false;
      this.errorDetail = "";
    },
    onClickExport() {
      exportExcel(convertApprovedItemsToBinaryObjects(this.approvedItems));
      // createJsonFileAndDownload(this.approvedItems);
    },
    onChangeTab(e) {
      if (!this.tabs[e].status) {
        const payload = this.tabs.map((tab, index) => {
          if (index === e) {
            tab.status = TAB_STATUSES.IN_PROGRESS;
          }
          return tab;
        });
        this.setTabs(payload);
      }
      this.setTabsData();
      this.setCurrentTabKey(this.tabs[e].key);
    },
    async onClickSearch() {
      this.setTabs([]);
      this.tab = null;
      let files;
      if (this.radioGrp === "imageUpload") {
        files = this.imageFiles;
        if (files.length && files.length > 0) {
          files.forEach(async (file, index) => {
            await this.addElementToTabs({
              name: `Image ${index + 1}`,
              key: generateUUID(),
              file,
            });
            // this.tabs.push();
          });
        }
      } else if (this.radioGrp === "zipUpload") {
        var new_zip = new JSZip();
        // more files !
        const zip = await new_zip.loadAsync(this.zipFile);
        const keys = Object.keys(zip.files);
        let knownFilesCount = 0;
        for (let i = 0; i < keys.length; i++) {
          let fileData = await zip.files[keys[i]].async("blob");
          const mimeType = await getMimeTypeOfFile(fileData);
          const file = new File([fileData], keys[i], { type: mimeType });

          if (file.type !== "unknown filetype") {
            knownFilesCount++;
            await this.addElementToTabs({
              name: `Image ${knownFilesCount}`,
              key: generateUUID(),
              file,
            });
          }

          // console.log(file);
        }
        console.log(`${knownFilesCount} files are known`);
        // Object.keys(zip.files).forEach(async (key, index) => {});
      } else {
        this.setIsDataLoading(true);
        files = await this.getImageFilesFromExcel();
        if (files.length && files.length > 0) {
          files.forEach(async (file) => {
            await this.addElementToTabs(file);
          });
        }
      }
    },
    async addElementToTabs(element) {
      let base64str;
      base64str = element.dataURI
        ? element.dataURI
        : await encodeImageFileAsURL(element.file);
      element.imgSrc = base64str;
      this.setTabs([...this.tabs, element]);
    },
    async getImageFilesFromExcel() {
      let imagesData = JSON.parse(await parseExcel(this.xlsxFile));
      let imagesDataWithDataURI = await Promise.all(
        imagesData.map(async (element, index) => {
          const response = await WSIMLSearchService.getDamImageByAssetPath(
            element.assetPath
          );
          const blob = new Blob([response.data]);
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          await img.decode();
          const dataURI = await toDataURL(img.src);
          return {
            name: `Image ${index + 1}`,
            key: generateUUID(),
            dataURI,
            assetPath: element.assetPath,
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
