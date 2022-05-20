-<template>
  <v-dialog v-model="dialog" persistent max-width="600px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" color="primary" class="my-2 float-right">
        Add SKU
      </v-btn>
    </template>
    <v-card>
      <v-form ref="form" @submit.prevent="onSubmit">
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
                  label="Product Id*"
                  :rules="[(v) => !!v || 'Product Id is required']"
                  v-model="skuData.pid"
                  required
                ></v-text-field>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="SKU ID*"
                  :rules="[(v) => !!v || 'SKU ID is required']"
                  v-model="skuData.skuid"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-select
                  :items="brands"
                  :rules="[(v) => !!v || 'Brand is required']"
                  v-model="skuData.brand"
                  item-text="displayName"
                  item-value="value"
                  label="Brand*"
                >
                </v-select>
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  label="Product Type"
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
          <v-btn color="primary" text @click="onClickClose"> Close </v-btn>
          <v-btn color="primary" type="submit"> Save </v-btn>
        </v-card-actions>
      </v-form>
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
  watch: {
    dialog(newValue, oldValue) {
      if (newValue) this.skuData = {};
    },
  },
  methods: {
    onSubmit(e) {
      if (!this.$refs.form.validate()) {
          return;
      }
      this.skuData.isPrioritySku = false;
      this.$emit("skuAdded", this.skuData);
      this.resetDataAndCloseDialog();
    },
    onClickSave() {
      //   category: "Collaborations|Art & Mirrors";
      //   similarity: 0.6887461543083191;
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