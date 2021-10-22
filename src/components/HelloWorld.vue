<template>
  <v-app id="inspire">
    <v-app-bar app>
      <v-row no-gutters>
        <v-col cols="8">
          <v-text-field
            class="mt-10"
            label="Image Url"
            v-model="imageUrl"
            placeholder="Please Enter your url here"
          ></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-btn
            @click="onClickSearch"
            class="mt-9 float-right mr-15"
            elevation="2"
            >Search</v-btn
          >
        </v-col>
      </v-row>
      <!-- <v-row no-gutters>
        <v-col cols="8">
          <v-text-field
            class="mt-10"
            label="Regular"
            placeholder="Placeholder"
          ></v-text-field>
        </v-col>

        <v-col cols="4" align-self="end">
          
        </v-col>
      </v-row> -->
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col v-for="n in 24" :key="n" cols="4">
            <v-card height="200"></v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import bingSearchService from "../services/bingSearch.service";
export default {
  data() {
    return {
      imageUrl: ""
    };
  },
  methods: {
    onClickSearch() {
      bingSearchService.getResults(this.imageUrl);
    },
  },
};
</script>
