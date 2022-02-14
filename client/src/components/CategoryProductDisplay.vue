<template>
  <div>
    <v-row v-for="(category, index) in data" :key="index">
      <v-col cols="12">
        <span class="text-h5 font-weight-medium text-capitalize">
          {{ category.categoryName }} :</span
        >
        <a
          class="
            text-h5
            grey--text
            text-darken-1
            font-weight-medium
            float-right
          "
          @click.prevent="(e) => onClickViewAll(category)"
        >
          View All<v-icon>mdi-arrow-right</v-icon>
        </a>
      </v-col>
      <v-col cols="12">
        <v-sheet class="mx-auto" elevation="8" max-width="1100">
          <v-slide-group class="pa-4" active-class="success">
            <v-slide-item
              v-for="(product, index) in category.previewData"
              :key="index"
            >
              <ProductCard :product="product" />
            </v-slide-item>
          </v-slide-group>
        </v-sheet>
      </v-col>
    </v-row>

    <v-dialog v-if="showMore" v-model="showMore" max-width="auto">
      <v-card min-height="800">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="showMore = false">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <v-toolbar-title
            ><span class="text-capitalize">
              {{ this.selectedCategoryHeading }}</span
            >
          </v-toolbar-title>
          <v-spacer></v-spacer>
        </v-toolbar>
        <div style="padding: 10px; overflow: hidden">
          <v-row class="mt-5">
            <v-col
              cols="3"
              v-for="(product, index) in selectedCategoryFullData"
              :key="index"
            >
              <ProductCard :product="product" />
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

import ProductCard from "./ProductCard.vue";
export default {
  components: {
    ProductCard,
  },
  props: {
    data: Array,
  },
  data() {
    return {
      showMore: false,
      selectedCategoryFullData: [],
      selectedCategoryHeading: "",
    };
  },
  methods: {
    onClickCard(url) {
      window.open(url);
    },
    onClickViewAll(category) {
      this.selectedCategoryFullData = category.data;
      this.selectedCategoryHeading = category.categoryName;
      this.showMore = true;
    },
  },
};
</script>