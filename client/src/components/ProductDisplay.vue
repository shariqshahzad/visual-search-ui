<template>
  <div>
    <div style="padding: 10px; overflow: hidden">
      <v-row class="mt-5">
        <v-col cols="4" v-for="(product, index) in products" :key="index">
          <ProductCard  :product="product" />
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    products: Array,
  },
  data() {
    return {};
  },
  methods: {
    onClickCard(url) {
      window.open(url);
    },
  },
};
</script>