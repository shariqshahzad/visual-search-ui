<template>
  <v-card   class="ma-2" height="340" width="200">
    <v-img :src="product.image" height="160" max-width="300">
      <div style="display: flex">
        <v-btn @click.prevent="onClickPrioritize" v-if="!product.isPrioritySku" icon>
          <v-icon>mdi-checkbox-blank-circle-outline</v-icon>
        </v-btn>
        <v-btn v-else @click="onClickUnprioritize" icon>
          <v-icon color="green">mdi-check-circle</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <SkuEditDialog @skuUpdated="onSkuUpdate($event)" :product="product" />
      </div>
    </v-img>
    <v-card-text style="cursor:pointer" @click="onClickProductCard(product)">
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
      <div>Product Type: {{ product.product_type }}</div>
      <div>Similarity Score: {{ product.similarity && product.similarity.toFixed(2) }}</div>
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
import SkuEditDialog from "./SkuEditDialog.vue";


export default {
  components: {
    SkuEditDialog,
  },
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
    onClickProductCard(product){
      window.open(`${this.brands[product.brand].hostUrl}/products/${product.pid}`);
    },
    onClickPrioritize() {
      this.markCurrentTabPendingChanges();
      this.$emit("skuPrioritized", this.product.skuid);
    },
    onClickUnprioritize() {
      this.$emit("skuUnprioritized", this.product.skuid);
    },
    onSkuUpdate(skuDetails) {
      this.product.skuid = skuDetails.skuid;
      this.product.image = skuDetails.image;
      this.product.product_type = skuDetails.product_type;
      this.$emit("skuUpdated",this.product);
      this.markCurrentTabPendingChanges();
    },
  },
};
</script>