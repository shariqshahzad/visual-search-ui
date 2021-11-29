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
          <v-progress-linear
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
        </v-col>
      </v-row>
      <v-row v-if="!isLoading">
        <v-col v-for="(data, index) in filteredResult" :key="index" cols="4">
          <v-card @click="onClickCard(data.hostPageUrl)">
            <v-img :src="data.image" height="auto"></v-img>
            <v-card-title height="40px"> {{ data.name }} </v-card-title>
          </v-card>
        </v-col>
      </v-row>
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
import { mapMutations,mapGetters } from "vuex";
// import Filters from "./Filters";

import { reduceBingSearchResults } from "../utils/utils";

export default {
  components: {
    ImageCropper,
    // Filters
  },
  data() {
    return {
      dataResults: this.results,
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
          selectedBrand: BRANDS[this.selectedBrand],
          isUrl: false,
          payload: file,
          cropArea,
        })
        .then((res) => {
          let visualSearchResultsData;
          if ("bing" === this.searchOption) {
            visualSearchResultsData = bingSearchService.reduceSearchResults(
              res.tags
            );
            visualSearchResultsData = bingSearchService.mapResultParams(
              visualSearchResultsData
            );
          } else
            visualSearchResultsData = res.productResults.map(
              googleResultsToProductMapper
            );

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
    console.log(this.imageData);
  },
  props: {
    results: Array,
    imageData: Object,
    objectBoundaries: Array,
    searchOption: String,
  },
};
</script>
