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
      <div class="mt-5">
        <strong><v-icon>mdi-filter</v-icon>Filter By Brands :</strong>
        <div class="ma-2" style="display: flex; flex-wrap: wrap">
          <v-checkbox
            v-for="brand of brands"
            :key="brand.name"
            v-model="selectedBrands"
            class="mr-3"
            @change="onChangeBrand(brand, $event)"
            :value="brand.key"
            :label="brand.name"
          ></v-checkbox>
          <!-- <v-row>
        <v-col> </v-col>
        <v-col cols="2"> </v-col>
      </v-row> -->
        </div>
      </div>
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
        :categoryFilters="categoryFilters"
        v-if="showProducts"
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
import _ from "lodash";
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
      showProducts: false,
      selectedBrands: [],
      brands: Object.keys(BRANDS).map((b) => ({
        name: BRANDS[b].name,
        key: b,
      })),
      dataResults: this.results,
      categoryFilters: {},
      resultsByCategories: _.cloneDeep(this.categorizeSearchResults),
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
    onChangeBrand() {
      console.log(this.selectedBrands);
      this.applyFilters();
    },
    applyBrandFilter() {
      if (this.selectedBrands.length > 0) {
        this.resultsByCategories = this.categorizeSearchResults.reduce(
          (prevCatResults, cat) => {
            const prevCat = _.cloneDeep(cat);
            prevCat.data = prevCat.previewData = cat.data.filter((pr) => {
              return this.selectedBrands.includes(pr.brand);
            });
            prevCatResults.push(prevCat);
            return prevCatResults;
          },
          []
        );
      } else {
        this.resultsByCategories = _.cloneDeep(this.categorizeSearchResults);
      }
    },
    async onCustomCrop(e) {
      let base64 = e.split(",")[1];
      this.isLoading = true;
      let result = await WSIMLSearchService.getSimilaritiesResults(
        "chair",
        base64,
        "someId"
      );
      this.isLoading = false;
      this.resultsByCategories = [result];
    },
    applyFilters() {
      this.applyBrandFilter();
      if (this.selectedCropAreaId) {
        this.resultsByCategories = this.resultsByCategories.filter(
          (cat) => cat.categoryId === this.selectedCropAreaId
        );
      }
      return;
    },
    onResetData() {
      this.resultsByCategories = _.cloneDeep(this.categorizeSearchResults);
      this.selectedBrands = [];
      this.selectedCropAreaId = null;
    },
    onImageCrop(id) {
      this.selectedCropAreaId = id;
      this.applyFilters();
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
    this.categorizeSearchResults.forEach((cat) => {
      const filters = _.uniqBy(cat.data, "product_type").map((el) => ({
        filterName: el.product_type,
        isEnabled: false,
      }));
      this.categoryFilters[`categoryId_${cat.categoryId}`] = filters;
    });
    this.showProducts = true;
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
