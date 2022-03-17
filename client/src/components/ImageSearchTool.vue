<template>
  <v-row class="mt-2">
    <v-col cols="4">
      <ImageCropper
        @crop="(e) => onImageCrop(e)"
        @resetData="onResetData"
        @customCrop="onCustomCrop"
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
        :categorizedData="resultsByCategories"
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
import WSIMLSearchService from "../services/WSIMLSearch.service";
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
    async onCustomCrop(e) {
      let base64 = e.split(",")[1];
      this.isLoading = true
      let result = await WSIMLSearchService.getSimilaritiesResults(
        "chair",
        base64,
        'someId'
      );
      this.isLoading = false
      this.resultsByCategories = [result];
    },
    onResetData() {
      debugger;
      this.resultsByCategories = this.categorizeSearchResults;
    },
    onImageCrop(id) {
      debugger;
      this.resultsByCategories = this.categorizeSearchResults.filter(
        (cat) => cat.categoryId === id
      );
      return;
    },
    emitPriceRange(range) {
      this.filters.priceRangeSelection.min = range[0];
      this.filters.priceRangeSelection.max = range[1];
    },
    onClickCard(url) {
      window.open(url);
    },
  },
  mounted() {
    this.hasCategory = !(this.results && this.results.length > 0);
    // this.hasCategory = true;
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
