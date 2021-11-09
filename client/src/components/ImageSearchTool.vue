<template>
  <v-row class="mt-5">
    <v-col cols="4">
      <ImageCropper @crop="(e) => onImageCrop(e)" :imageData="imageData" />
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
            <v-img :src="data.contentUrl" height="auto"></v-img>
            <v-card-title height="40px"> {{ data.name }} </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<style>
.v-card__title{
  height:126px;
}
</style>
<script>
import ImageCropper from "./ImageCropper.vue";
import bingSearchService from "../services/bingSearch.service";
// import Filters from "./Filters";

import { dataURLtoFile, searchResultsReducer } from "../utils/utils";

export default {
  components: {
    ImageCropper,
    // Filters
  },
  data() {
    return {
      isLoading: false,
      cropper: {},
      destination: {},
      image: {},
      filters: {
        priceRangeSelection: {
          min: null,
          max: null
        }
      }
    };
  },
  computed: {
    filteredResult: function () {
      return this.results.filter(value => {
        const price = value?.insightsMetadata?.aggregateOffer?.lowPrice;
        if (price) {
          return (
              price >= this.filters.priceRangeSelection.min
              && price <= this.filters.priceRangeSelection.max
          );
        }
        return true;
      });
    }
  },
  methods: {
    onImageCrop(value) {
      const file = dataURLtoFile(value);
      this.isLoading = true;
      bingSearchService
        .getBingSearchResults(false, file)
        .then((res) => {
          const visualSearchResultsData = res.tags.reduce(
            searchResultsReducer,
            null
          );
          if (visualSearchResultsData && visualSearchResultsData.length > 0) {
            this.results = visualSearchResultsData;
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
      window.open(url);
    },
  },
  mounted() {
    console.log(this.imageData);
  },
  props: {
    results: Array,
    imageData: Object,
  },
};
</script>
