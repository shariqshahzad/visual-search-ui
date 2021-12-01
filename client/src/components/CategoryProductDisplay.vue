<template>
  <div>
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
    <v-row v-for="(category, index) in data" :key="index">
      <v-col cols="12">
        <span class="text-h4 font-weight-medium text-capitalize">
          {{ category.categoryName }} :</span
        >
        <a
          class="
            text-h4
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
          <v-slide-group
            class="pa-4"
            active-class="success"
          >
            <v-slide-item
              v-for="(product, index) in category.previewData"
              :key="index"
            >
              <v-card
                class="ma-4"
                @click="onClickCard(product.hostPageUrl)"
                height="400"
                width="300"
              >
                <!-- <v-row class="fill-height"> -->
                  <v-img :src="product.image" height="200" max-width="300"></v-img>
                  <v-card-title height="40px">
                    {{ product.name }}
                  </v-card-title>
                <!-- </v-row> -->
              </v-card>
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
              <v-card @click="onClickCard(product.hostPageUrl)">
                <v-img :src="product.image" height="auto"></v-img>
                <v-card-title height="40px"> {{ product.name }} </v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    data: Array,
    isLoading: Boolean,
  },
  data() {
    return {
      showMore: false,
      selectedCategoryFullData: [],
      selectedCategoryHeading: "",
    };
  },
  methods: {
    onClickCard() {
      console.log("here");
    },
    onClickViewAll(category) {
      this.selectedCategoryFullData = category.data;
      this.selectedCategoryHeading = category.categoryName;
      this.showMore = true;
    },
  },
};
</script>