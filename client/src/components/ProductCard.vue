<template>
  <v-card class="ma-2" height="300" width="200">
    <v-img :src="product.image" height="160" max-width="300"></v-img>
    <v-card-text>
      <div class="text-subtitle-1">
        {{ brands[product.brand].name }}
      </div>
      <div>SKU ID: {{ product.skuid }}</div>
      <v-tooltip v-if="product.pid.length > 33" bottom>
        <template v-slot:activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on"
            >PID: {{ product.pid.substring(0, 33) }} ...</span
          >
        </template>
        <span>{{ product.pid }}</span>
      </v-tooltip>
      <div v-else>PID: {{ product.pid }}</div>
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