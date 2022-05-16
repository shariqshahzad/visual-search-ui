<template>
  <v-card class="ma-2" height="340" width="200">
    <v-img :src="product.image" height="160" max-width="300">
      <v-btn v-if="!product.isPrioritySku" @click="onClickPrioritize" icon>
        <v-icon>mdi-checkbox-blank-circle-outline</v-icon>
      </v-btn>
      <v-btn v-else @click="onClickUnprioritize" icon>
        <v-icon  color="green">mdi-check-circle</v-icon>
      </v-btn>
    </v-img>
    <v-card-text>
      <div class="text-subtitle-1">
        {{ brands[product.brand].name }}
      </div>
      <div>SKU ID: {{ product.skuid }}</div>
      <v-tooltip v-if="product.pid.length > 30" bottom>
        <template v-slot:activator="{ on, attrs }">
          <span v-bind="attrs" v-on="on"
            >PID: {{ product.pid.substring(0, 30) }}...</span
          >
        </template>
        <span>{{ product.pid }}</span>
      </v-tooltip>
      <div v-else>PID: {{ product.pid }}</div>
      <div>Product Type: {{ product.product_type }} </div>
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
import { mapMutations, mapGetters } from "vuex";
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
    ...mapMutations(["markCurrentTabPendingChanges"]),
    onClickCard(url) {
      window.open(url);
    },
    onClickPrioritize() {
      this.markCurrentTabPendingChanges();
      this.$emit("skuPrioritized", this.product.skuid);
    },
    onClickUnprioritize() {
      this.$emit("skuUnprioritized", this.product.skuid);
    },
  },
};
</script>