<template>
  <v-app id="inspire">
    <v-app-bar prominent app>
      <v-form
        ref="form"
        style="text-align: center; width: 100%"
        @submit.prevent="onClickSearch"
      >
        <img
          class="center mt-2"
          style="height: 50px"
          src="https://assets.wsimgs.com/wsimgs/rk/images/i/202143/0006/images/common/logo.svg"
        />
        <v-row no-gutters>
          <v-col cols="7" align-self="end">
            <v-text-field
              v-if="radioGrp === 'imageUrl'"
              required
              :rules="rules"
              label="Image Url"
              name="imgUrl"
              v-model="imageUrl"
              placeholder="Please Enter your url here"
            ></v-text-field>
            <v-file-input
              v-if="radioGrp === 'imageUpload'"
              v-model="files"
              :rules="imgFileRules"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Select an Image"
              prepend-icon="mdi-camera"
              label="Image"
            ></v-file-input>
          </v-col>

          <v-col cols="5">
            <v-row>
              <v-col cols="7">
                <v-radio-group class="ml-3 mt-2" v-model="radioGrp" row>
                  <v-radio
                    key="imageUpload"
                    label="Upload Image"
                    value="imageUpload"
                  ></v-radio>
                  <v-radio
                    key="imageUrl"
                    label="Image URL"
                    value="imageUrl"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="5">
                <v-btn type="submit" dark class="float-right mr-3" elevation="2"
                  >Search</v-btn
                >
                <!-- <v-btn class="float-right mr-3" dark @click="dialog = true">
                  Crop
                </v-btn> -->
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
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
    <v-snackbar v-model="isError">
      {{ errorDetail }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text v-bind="attrs" @click="onSnackBarClose">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-main>
      <v-container>
        <v-row>
          <v-progress-linear
            v-if="isLoading"
            color="#231f20"
            indeterminate
            rounded
            height="6"
          ></v-progress-linear>
          <v-col v-for="(data, index) in resultsData" :key="index" cols="4">
            <v-card @click="onClickCard(data.hostPageDisplayUrl)">
              <v-img :src="data.contentUrl" height="200px"></v-img>
              <v-card-title> {{ data.name }} </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-dialog v-model="dialog" max-width="auto">
      <v-card>
        <v-card-title>Crop Image</v-card-title>
        <ImageCropper :src="imageUrl" />
        <v-card-actions>
          <v-btn color="primary" text @click="dialog = false"> Close </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import bingSearchService from "../services/bingSearch.service";
import ImageCropper from "./ImageCropper.vue";
export default {
  components: {
    ImageCropper,
  },
  data() {
    return {
      radioGrp: "imageUrl",
      files: [],
      dialog: false,
      imgFileRules: [
        (value) =>
          !value ||
          value.size <= 2000000 ||
          "Avatar size should be less than 1 MB!",
      ],
      rules: [
        (v) => {
          var expression =
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi; // eslint-disable-line
          var regex = new RegExp(expression);
          return Boolean(v.match(regex)) || "Invalid URL";
        },
      ],
      resultsData: [],
      imageUrl: "",
      isLoading: false,
      isError: false,
      errorDetail: "",
    };
  },
  methods: {
    // onChangeInputSelection() {
    //   console.log(this.radioGrp);
    // },
    onSnackBarClose() {
      this.isError = false;
      this.errorDetail = "";
    },
    onClickCard(url) {
      window.open(url);
    },
    onClickSearch() {
      if (!this.$refs.form.validate()) {
        return;
      }
      this.isLoading = true;
      bingSearchService
        .getBingSearchResults(
          this.radioGrp,
          this.radioGrp === "imageUrl" ? this.imageUrl : this.files
        )
        .then((res) => {
          const visualSearchResultsData = res.tags.reduce(
            (finalResult, tag) => {
              const actionWithVisualSearchResults = tag.actions?.find(
                (action) =>
                  action.actionType == `ProductVisualSearch`
              );
              return actionWithVisualSearchResults?.data
                ? actionWithVisualSearchResults?.data.value
                : finalResult;
            },
            null
          );
          if (visualSearchResultsData && visualSearchResultsData.length > 0) {
            this.resultsData = visualSearchResultsData;
            return;
          }
          this.isError = true;
          this.errorDetail = "No results found";
        })
        .catch((e) => {
          this.isError = true;
          this.errorDetail = "Something Went Wrong";
          console.log(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>
