<template>
  <v-row class="mt-5">
    <v-col cols="4">
      <ImageCropper
        @crop="(e) => onImageCrop(e)"
        :imageData="imageData"
        :isLoading="isLoading"
        :objectBoundaries="objectBoundaries"
      />
      <!--      <filters :min="defaultFilters.priceRange.min" :max="defaultFilters.priceRange.max" @emitPriceRange="emitPriceRange" />-->
    </v-col>

    <v-row
        v-if="isLoading"
        class="fill-height"
        align-content="center"
        justify="center"
    >
      <v-col class="text-subtitle-1 text-center" cols="12">
        Getting your results
      </v-col>
      <v-col cols="6">
        <v-progress-linear indeterminate rounded height="6"></v-progress-linear>
      </v-col>
    </v-row>
    <v-col cols="8" v-else>
      <CategoryProductDisplay
        v-if="hasCategory"
        :isLoading="isLoading"
        :data="resultsByCategories"
      />
      <ProductDisplay v-if="!hasCategory" :products="filteredResult" />
    </v-col>
  </v-row>
</template>
<style>
.v-card__title {
  height: 126px;
}
</style>
<script>
import ImageCropper from "./ImageCropper.vue";
import bingSearchService from "../services/bingSearch.service";
import gooogleSearchService from "../services/googleSearch.service";
import { googleResultsToProductMapper } from "../utils/utils";
import CategoryProductDisplay from "./CategoryProductDisplay.vue";
import ProductDisplay from "./ProductDisplay.vue";
import { BRANDS } from "../constants/constants";
import { mapMutations, mapGetters } from "vuex";
// import Filters from "./Filters";

import { reduceBingSearchResults } from "../utils/utils";

export default {
  components: {
    ProductDisplay,
    ImageCropper,
    CategoryProductDisplay,
    // Filters
  },
  data() {
    return {
      dataResults: this.results,
      resultsByCategories: this.categorizeSearchResults,
      isLoading: false,
      cropper: {},
      destination: {},
      image: {},
      hasCategory: true,
      filters: {
        priceRangeSelection: {
          min: null,
          max: null,
        },
      },
    };
  },
  computed: {
    filteredResult: function () {
      return this.dataResults.filter((value) => {
        const price = value.price;
        if (price) {
          // return (
          //     price >= this.filters.priceRangeSelection.min
          //     && price <= this.filters.priceRangeSelection.max
          // );
        }
        return true;
      });
    },
    ...mapGetters([
      "selectedBrand",
      // "dummyCategoryData",
      // ...
    ]),
  },
  methods: {
    onImageCrop(cropArea) {

      // const file = dataURLtoFile(value);
      const file = this.imageData.files;
      this.isLoading = true;
      const searchServices = {
          bing: bingSearchService,
          google: gooogleSearchService,
        },
        searchService = searchServices[this.searchOption];
      searchService
        .getSearchResults({
          selectedBrand: this.selectedBrand,
          isUrl: false,
          payload: file,
          cropArea,
        })
        .then((res) => {
          console.log(res);
          this.hasCategory = false;
          this.resultsByCategories = res.categorizeSearchResults;
          let visualSearchResultsData;
          if ("bing" === this.searchOption) {
            visualSearchResultsData = bingSearchService.reduceSearchResults(
              res.tags
            );
            visualSearchResultsData = bingSearchService.mapResultParams(
              visualSearchResultsData
            );
          } else {
            visualSearchResultsData = res.productSearchResults
          }

          if (visualSearchResultsData && visualSearchResultsData.length > 0) {
            this.dataResults = visualSearchResultsData;
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
    emitPriceRange(range) {
      this.filters.priceRangeSelection.min = range[0];
      this.filters.priceRangeSelection.max = range[1];
    },
    onClickCard(url) {
      console.log(url);
      window.open(url);
    },
  },
  mounted() {
    this.hasCategory = true;
  },
  props: {
    results: Array,
    imageData: Object,
    objectBoundaries: Array,
    searchOption: String,
    categorizeSearchResults: Array,
  },
};
</script>
