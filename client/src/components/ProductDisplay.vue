<template>
  <div>
    <div style="padding: 10px; overflow: hidden">
      <v-row class="mt-5">
        <v-col
            cols="4"
            v-for="(product, index) in products"
            :key="index"
        >
          <v-card @click="onClickCard(product.hostPageUrl)">
            <v-img :src="product.image" height="auto"></v-img>
            <v-card-title height="30px"> {{ product.name }} </v-card-title>
          </v-card>
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
    return {
    };
  },
  methods: {
    onClickCard(url) {
      window.open(url);
    },
  },
};
</script>