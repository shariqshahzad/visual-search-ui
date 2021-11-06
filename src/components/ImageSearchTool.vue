<template>
  <v-row class="mt-5">
    <v-col cols="4">
      <ImageCropper @crop="(e) => onImageCrop(e)" :imageData="imageData" />
    </v-col>
    <v-col cols="8">
      <v-row v-if="!isLoading">
        <v-col v-for="(data, index) in results" :key="index" cols="4">
          <v-card @click="onClickCard(data.hostPageDisplayUrl)">
            <v-img :src="data.contentUrl" height="200px"></v-img>
            <v-card-title> {{ data.name }} </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
<script>
import ImageCropper from "./ImageCropper.vue";
import bingSearchService from "../services/bingSearch.service";
import { dataURLtoFile } from "../utils/utils";

export default {
  components: {
    ImageCropper,
  },
  data() {
    return {
      isLoading: false,
      cropper: {},
      destination: {},
      image: {},
    };
  },
  methods: {
    onImageCrop(value) {
      const file = dataURLtoFile(value);
      this.isLoading = true;
      bingSearchService
        .getBingSearchResults(false, file)
        .then((res) => {
          const visualSearchResultsData = res.tags.reduce(
            (finalResult, tag) => {
              const actionWithVisualSearchResults = tag.actions?.find(
                (action) =>
                  action.actionType == `ProductVisualSearch` ||
                  action.actionType == "VisualSearch"
              );
              return actionWithVisualSearchResults?.data
                ? actionWithVisualSearchResults?.data.value
                : finalResult;
            },
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