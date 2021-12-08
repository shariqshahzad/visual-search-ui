<template>
  <v-row class="mt-5">
    <v-col cols="4">
      <ImageCropper
        @crop="(e) => onImageCrop(e)"
        :imageData="imageData"
        :objectBoundaries="objectBoundaries"
      />
      <!--      <filters :min="defaultFilters.priceRange.min" :max="defaultFilters.priceRange.max" @emitPriceRange="emitPriceRange" />-->
    </v-col>
    <v-col cols="8">
      <CategoryProductDisplay :data="this.resultsByCategories" />
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
import { BRANDS } from "../constants/constants";
import { mapMutations, mapGetters } from "vuex";
// import Filters from "./Filters";

import { reduceBingSearchResults } from "../utils/utils";

export default {
  components: {
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
            visualSearchResultsData = res.productSearchResults.map(
              googleResultsToProductMapper
            );
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
    // console.log(this.imageData);
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
