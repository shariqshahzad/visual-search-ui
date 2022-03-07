<template>
  <div>
    <v-row v-for="(category, index) in data" :key="index">
      <v-col cols="12">
        <v-sheet
          class="pa-2"
          elevation="8"
          max-width="1100"
          style="overflow: hidden"
        >
          <div>
            <span
              cols="10"
              class="ml-5 text-h6 font-weight-medium text-capitalize"
            >
            </span>
            <a
              cols="12"
              class="
                text-h6
                grey--text
                text-darken-1
                font-weight-medium
                float-right
              "
              @click.prevent="(e) => onClickViewAll(category)"
            >
              View All<v-icon>mdi-arrow-right</v-icon>
            </a>
          </div>
          <div style="display: flex">
            <div>
              <div class="ma-2" style="width: 150px">
                <v-checkbox
                  v-for="(filter, index) in category.filters"
                  :key="filter + index"
                  :label="filter.filterName"
                  @change="(e) => onChangeFilterCheckbox(e, category, filter)"
                  hide-details
                ></v-checkbox>
              </div>
            </div>
            <div class="slider-bar">
              <ProductCard
                v-for="(product, index) in category.previewData"
                :key="index"
                :product="product"
              />
            </div>
          </div>
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
            <ProductCard
              v-for="(product, index) in selectedCategoryFullData"
              :key="index"
              :product="product"
            />
            <!-- <v-col
              cols="3"

            >
              
            </v-col> -->
          </v-row>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>
<style scoped>
.slider-bar {
  flex-wrap: nowrap !important;
  overflow-x: scroll !important;
  display: flex;
  overflow-y: hidden;
}
</style>
<script>
import _ from "lodash";
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
  mounted() {
    this.data.forEach(
      (element) =>
        (element.filters = _.uniqBy(element.data, "product_type").map((el) => ({
          filterName: el.product_type,
          isEnabled: false,
        })))
    );
    console.log(this.data);
  },
  methods: {
    onChangeFilterCheckbox(e, category, filter) {
      let selectedFilter = category.filters.find(
        (f) => f.filterName === filter.filterName
      );
      selectedFilter.isEnabled = e;
      this.updateDataAsPerFilters(category);
    },
    updateDataAsPerFilters(category) {
      const conditionArray = category.filters.reduce(function (
        conditions,
        filter
      ) {
        if (filter.isEnabled) {
          conditions.push({ product_type: filter.filterName });
        }
        return conditions;
      },
      []);
      if (conditionArray.length > 0) {
        category.previewData = category.data.filter((item) =>
          conditionArray.every(
            (val) => item.product_type.indexOf(val.product_type) > -1
          )
        );
        // category.previewData = _.filter(
        //   category.data,
        //   conditionArray,
        //   "product_type"
        // );
        return;
      }
      category.previewData = category.data;

      // category.filters.forEach((f) => {
      //   if (f.isEnabled) {
      //     category.previewData = category.data.filter(
      //       (p) => p.product_type === f.filterName
      //     );
      //   }
      // });
    },
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