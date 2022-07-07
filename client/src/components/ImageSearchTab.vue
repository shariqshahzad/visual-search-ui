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
      @updateApproval="(e) => onUpdateApproval(e)"
      :key="key"
      v-if="resultsAvailable"
      :imageData="imageData"
      :objectBoundaries="objectBoundaries"
      :categorizeSearchResults="categorizeSearchResults"
      :fileName="searchProp.file.name"
    />
    <!-- <v-card>
      <div style="padding: 10px; overflow: hidden"></div>
    </v-card> -->
  </div>
</template>
<script>
import WSIMLSearchService from "../services/WSIMLSearch.service";
import { mapMutations, mapGetters } from "vuex";
import {
  encodeImageFileAsURL,
  generateUUID,
  setSNoAndBgColorToBoundaries,
} from "../utils/utils";
import ImageSearchTool from "./ImageSearchTool.vue";
import _ from "lodash";
import Cropper from "cropperjs";
import { multipleColors, TAB_STATUSES } from "../constants/constants";
export default {
  computed: {
    ...mapGetters([
      "tabs",
      "currentTabKey",
      // ...
    ]),
  },
  components: {
    ImageSearchTool,
  },
  props: {
    searchProp: Object,
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
      key: null,
      resultsAvailable: false,
      imageData: null,
      objectBoundaries: [],
      categorizeSearchResults: [],
      imageUrl: "",
      isLoading: false,
      isError: false,
      errorDetail: "",
    };
  },
  methods: {
    ...mapMutations([
      "setTabs",
      "setApprovedItems",
      "setCategorizedSearchResults",
      "setTabsData",
      "setObjectBoundaries",
      "setSearchResultsWithoutSimilarFilter",
    ]),
    onUpdateApproval(bboxes) {
      const exportData = this.categorizeSearchResults.map((res) => {
        const bbox = bboxes.find((bbox) => bbox.mappedPrId === res.categoryId);
        return {
          bbox: bbox.bbox,
          class: bbox.class,
          sno: bbox.sno,
          bgColor: bbox.bgColor,
          data: res.previewData.filter((pd) => pd.isPrioritySku),
        };
      });
      const approvedItemsPayload = {
        fileName: this.searchProp.file.name,
        data: exportData,
      };
      const tabsPayload = this.tabs.map((tab) => {
        if (tab.key === this.searchProp.key) {
          tab.status = tab.status = TAB_STATUSES.APPROVED;
        }
        return tab;
      });
      this.setApprovedItems(approvedItemsPayload);
      this.setTabs(tabsPayload);
    },

    async onWSIMLSearch() {
      let base64str;
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
          WSIMLSearchService.getEmbbeddingsResults(
            element.class,
            base64,
            element.id
          )
        );
      });
      this.objectBoundaries = yoloData;
      this.setObjectBoundaries(yoloData);
      let objectEmbeddings = await Promise.all(promises);
      let productResults = await WSIMLSearchService.getSimilaritiesResults(
        objectEmbeddings
      );
      this.setSearchResultsWithoutSimilarFilter(
        JSON.parse(JSON.stringify(productResults))
      );
      this.processSimilarResults(productResults, yoloData);
      this.objectBoundaries = setSNoAndBgColorToBoundaries(yoloData);
      productResults = _.uniqBy(productResults, "categoryId");
      this.isLoading = false;
      this.setCategorizedSearchResults(productResults);
      this.categorizeSearchResults = productResults;
      this.imageData = {
        isUrl: false,
        src: this.imgBase64,
        files: this.file,
      };
      this.resultsAvailable = true;
    },
    processSimilarResults(productResults, yoloData) {
      const similarCategories = {};
      const categories = productResults.map((p) => p.categoryName);
      let categoryWiseResults = this.getCategoryWiseResults(
        categories,
        productResults
      );

      for (const [key, value] of Object.entries(categoryWiseResults)) {
        if (value.data.length > 1) {
          const data = value.data;
          var combinations = data.flatMap((v, i) =>
            data.slice(i + 1).map((w) => ({
              combinedResults: [v.results, w.results],
              categories: [v.categoryId, w.categoryId],
            }))
          );
          combinations.map((combination) => {
            const intersection = _.intersectionBy(
              ...combination.combinedResults,
              "skuid"
            );

            if (intersection.length > 0) {
              //
              //
              yoloData.forEach((yd) => {
                if (combination.categories.includes(yd.id)) {
                  yd.hasSimilarity = true;
                }
              });
            }
          });
          const similarItems = yoloData
            .filter((yd) => yd.hasSimilarity && yd.class === key)
            .map((yd) => yd.id);
          if (similarItems.length > 0) similarCategories[key] = similarItems;
          //
        }
      }
      this.prioritizeSimilarProductDataset(
        productResults,
        similarCategories,
        yoloData
      );
    },
    prioritizeSimilarProductDataset(
      productResults,
      similarCategories,
      yoloData
    ) {
      const prioritizedSimilarProductDataset = [];
      for (const [index, [key, value]] of Object.entries(
        Object.entries(similarCategories)
      )) {
        const prsForSimilarCategory = productResults
          .filter(
            (pr) => pr.categoryName === key && value.includes(pr.categoryId)
          )
          .map((pr) => ({
            score: _.maxBy(pr.data, "similarity").similarity,
            categoryId: pr.categoryId,
            categoryName: key,
          }));
        const categoryToBePrioritized = _.maxBy(prsForSimilarCategory, "score");
        _.remove(productResults, (pr) => {
          const isPrToBeRemoved =
            value.includes(pr.categoryId) &&
            pr.categoryName === key &&
            pr.categoryId !== categoryToBePrioritized.categoryId;
          const yoloitem = yoloData.find((yd) => yd.id === pr.categoryId);
          if (
            isPrToBeRemoved ||
            pr.categoryId === categoryToBePrioritized.categoryId
          ) {
            yoloitem.mappedPrId = categoryToBePrioritized.categoryId;
            yoloitem.bgColor = multipleColors[index];
          }
          return isPrToBeRemoved;
        });

        prioritizedSimilarProductDataset.push(categoryToBePrioritized);
      }
    },
    getCategoryWiseResults(categories, productResults) {
      return categories.reduce((categoryWiseResults, element) => {
        if (!categoryWiseResults.hasOwnProperty(element)) {
          categoryWiseResults[element] = {};
          categoryWiseResults[element].mergedCategories = [];
          categoryWiseResults[element].data = productResults
            .filter((p) => {
              if (p.categoryName === element) {
                categoryWiseResults[element].mergedCategories.push(
                  p.categoryId
                );
                return true;
              }
              categoryWiseResults[element].mergedCategories;
              return false;
            })
            .map((p) => ({ results: p.data, categoryId: p.categoryId }));
        }
        return categoryWiseResults;
      }, {});
    },
  },
};
</script>
