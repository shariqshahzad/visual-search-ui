<template>
  <div>
    <v-row v-for="(category, index) in categorizedData" :key="index">
      <v-col cols="12">
        <v-sheet
          class="pa-2"
          elevation="8"
          max-width="1100"
          style="overflow: hidden"
        >
          <!-- <div>
            <span
              cols="10"
              class="ml-5 text-h6 font-weight-medium text-capitalize"
            >
            </span>
            
          </div> -->
          <div style="display: flex">
            <!-- <div>
              <div class="ma-2" style="width: 150px">
                <v-checkbox
                  v-for="(filter, index) in categoryFilters[
                    `categoryId_${category.categoryId}`
                  ]"
                  :value="filter.isEnabled"
                  :key="`${index}_${filter.filterName}`"
                  :label="filter.filterName"
                  @change="(e) => onChangeFilterCheckbox(e, category, filter)"
                  hide-details
                ></v-checkbox>
              </div>
            </div> -->
            <div class="slider-bar" style="flex-direction: column">
              <div>
                <SkuAddDialog @skuAdded="(e) => onSkuAdd(e, category)" />
              </div>
              <v-snackbar top right v-model="skuAddSnackbar">
                <v-icon color="green" class="mb-1">mdi-check</v-icon> Sku added
                successfully

                <!-- <template v-slot:action="{ attrs }">
                  <v-btn
                    color="green"
                    text
                    v-bind="attrs"
                    @click="snackbar = false"
                  >
                    Close
                  </v-btn>
                </template> -->
              </v-snackbar>
              <div
                :class="{
                  'slider-bar': categorizedData.length > 1,
                  vertical: categorizedData.length === 1,
                }"
              >
                <ProductCard
                  @skuPrioritized="onSkuPrioritized($event, category)"
                  @skuUnprioritized="onSkuUnprioritized($event, category)"
                  @skuUpdated="onSkuUpdate($event,category)"
                  v-for="(product, index) in category.previewData"
                  :key="index"
                  :product="product"
                />
              </div>
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <v-dialog v-if="showMore" v-model="showMore">
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
          <v-row class="mt-5" style="justify-content: center">
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
.vertical {
  display: flex;
  flex-wrap: wrap;
}
</style>
<script>
import _ from "lodash";
import SkuAddDialog from "./SkuAddDialog.vue";
import ProductCard from "./ProductCard.vue";
import { mapMutations } from "vuex";
export default {
  components: {
    ProductCard,
    SkuAddDialog,
  },
  props: {
    categorizedData: Array,
    categoryFilters: Object,
  },
  watch: {
    categorizedData: function (newVal, oldVal) {
      this.updateDataAsPerFilters();
    },
  },
  data() {
    return {
      showMore: false,
      skuAddSnackbar: false,
      selectedCategoryFullData: [],
      selectedCategoryHeading: "",
    };
  },
  methods: {
    ...mapMutations(["markCurrentTabPendingChanges"]),
    onSkuAdd(sku, category) {
      this.$emit("skuAdded", {
        product:sku,
        categoryId: category.categoryId,
      });
      // category.previewData.unshift(sku);
      this.skuAddSnackbar = true;
      this.markCurrentTabPendingChanges();
    },
    onSkuUpdate(product,category) {
      this.$emit("skuUpdated", {
        product,
        categoryId: category.categoryId,
      });
    },
    onSkuPrioritized(skuid, category) {
      this.$emit("skuPrioritized", { skuid, categoryId: category.categoryId });
    },
    onSkuUnprioritized() {
      this.$emit("skuUnprioritized", {
        skuid,
        categoryId: category.categoryId,
      });
    },
    onChangeFilterCheckbox(e, category, filter) {
      filter.isEnabled = e;
      this.updateDataAsPerFilters();
    },
    updateDataAsPerFilters() {
      debugger;
      this.categorizedData.forEach((category) => {
        const filterNames = this.categoryFilters[
          `categoryId_${category.categoryId}`
        ]
          .filter((f) => f.isEnabled)
          .map((f) => f.filterName);
        if (filterNames.length > 0) {
          category.previewData = category.data.filter((product) => {
            return filterNames.includes(product.product_type);
          });
        } else {
          category.previewData = category.data;
        }
      });
      // const filterCount = this.categoryFilters.filter(
      //   (f) => f.isEnabled
      // ).length;
      // if (filterCount > 0) {
      //   const conditionArray = this.categoryFilters.reduce(
      //     (filtered, filter) => {
      //       if (filter.isEnabled) {
      //         const filterItems = category.data.filter(
      //           (d) => d.product_type === filter.filterName
      //         );
      //         filtered.push(...filterItems);
      //       }
      //       return filtered;
      //     },
      //     []
      //   );
      //   category.previewData = conditionArray;
      //   return;
      // }
      // category.previewData = category.data;
      // if (conditionArray.length > 0) {
      //   category.previewData = category.data.filter((item) =>
      //     conditionArray.every(
      //       (val) => item.product_type.indexOf(val.product_type) > -1
      //     )
      //   );
      //   return;
      // }
      // category.previewData = category.data;

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