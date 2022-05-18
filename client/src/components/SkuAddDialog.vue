-<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        color="primary"
        class="ma-2 float-left"
      >
        Add SKU
      </v-btn>
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">SKU Editor</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                label="Image URL"
                v-model="skuData.image"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                label="Product Id"
                v-model="skuData.pid"
                required
              ></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                label="SKU ID*"
                v-model="skuData.skuid"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-select
                :items="brands"
                v-model="skuData.brand"
                item-text="displayName"
                item-value="value"
                label="Brand"
              >
              </v-select>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <v-text-field
                label="Product Type*"
                v-model="skuData.product_type"
                persistent-hint
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <small>*indicates required field</small>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="onClickClose"> Close </v-btn>
        <v-btn color="blue darken-1" text @click="onClickSave"> Save </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { BRANDS } from "../constants/constants";

export default {
  data: () => ({
    dialog: false,
    skuData: {},
    brands: Object.keys(BRANDS).map((key) => {
      return {
        displayName: BRANDS[key].name,
        value: key,
      };
    }),
  }),
  methods: {
    onClickSave() {
    //   category: "Collaborations|Art & Mirrors";
    //   similarity: 0.6887461543083191;
      this.skuData.isPrioritySku = false;
      this.$emit("skuAdded", this.skuData);
      this.resetDataAndCloseDialog();
    },
    onClickClose() {
      this.resetDataAndCloseDialog();
    },
    resetDataAndCloseDialog() {
      this.dialog = false;
      this.skuData = {};
    },
  },
};
</script>