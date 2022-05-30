<template>
  <v-row class="mt-2">
    <v-col cols="4">
      <div>
        <div class="ml-2 mb-2" style="display: flex; flex-wrap: wrap">
          <strong class="mt-1"
            ><v-icon>mdi-filter</v-icon>Filter By Brands :</strong
          >
          <v-checkbox
            v-for="brand of brands"
            :key="brand.name"
            v-model="selectedBrands"
            class="mx-2 my-0"
            @change="onChangeBrand(brand, $event)"
            :value="brand.key"
            :label="brand.key"
          ></v-checkbox>
          <!-- <v-row>
        <v-col> </v-col>
        <v-col cols="2"> </v-col>
      </v-row> -->
        </div>
      </div>
      <ImageCropper
        @newBboxAdded="onAddNewBbox($event)"
        @updateApproval="(e) => onApprovalUpdate(e)"
        @crop="(e) => onImageCrop(e)"
        @resetData="onResetData"
        @exportData="onExportData"
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
        @skuUpdated="onSkuUpdate($event)"
        @skuAdded="onSkuAdd($event)"
        @skuPrioritized="onSkuPrioritized($event)"
        @skuUnprioritized="onSkuUnprioritized($event)"
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
import WSIMLSearchService from "../services/WSIMLSearch.service";
import CategoryProductDisplay from "./CategoryProductDisplay.vue";
import ProductDisplay from "./ProductDisplay.vue";
import { BRANDS } from "../constants/constants";
import { mapGetters } from "vuex";

export default {
  components: {
    ProductDisplay,
    ImageCropper,
    CategoryProductDisplay,
    // Filters
  },
  watch: {
    categorizeSearchResults: function (newVal) {
      this.resultsByCategories = _.cloneDeep(newVal);
    },
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
    onApprovalUpdate(bboxes) {
      this.$emit("updateApproval", bboxes);
    },
    onAddNewBbox(e) {
      this.$emit("newBboxAdded", e);
    },
    onExportData(bboxes) {},
    onChangeBrand() {
      this.applyFilters();
    },
    onSkuAdd($event) {
      this.$emit("skuAdded", $event);
    },
    onSkuUpdate($event) {
      this.$emit("skuUpdated", $event);
    },
    onSkuPrioritized(event) {
      this.$emit("skuPrioritized", event);
    },
    onSkuUnprioritized(event) {
      this.$emit("skuUnprioritized", event);
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
      let embeddings = await WSIMLSearchService.getEmbbeddingsResults(
        "someCat",
        base64,
        "someId"
      );
      let result = await WSIMLSearchService.getSimilaritiesResults([
        embeddings,
      ]);
      this.isLoading = false;
      this.resultsByCategories = result;
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
