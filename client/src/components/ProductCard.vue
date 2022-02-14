<template>
  <v-card class="ma-4" @click="onClickCard(product.hostPageUrl)" height="400" width="300">
    <v-img :src="product.image" height="200" max-width="300"></v-img>
    <v-card-title></v-card-title>
    <v-card-text>
      <div class="my-4 text-subtitle-1">
        {{ brands[product.brand].name }}
      </div>
      <div>SKU ID: {{ product.skuid }}</div>
      <div>Similarity Score: {{ product.similarity.toFixed(2) }}</div>
    </v-card-text>
  </v-card>
</template>
<style scoped>
.v-card__title {
  height: 40px;
}
</style>

<script>
import { BRANDS } from "../constants/constants";
export default {
  data() {
    return {
      brands: BRANDS,
    };
  },
  props: {
    product: Object,
  },
  methods: {
    onClickCard(url) {
      window.open(url);
    },
  },
};
</script>