<template>
  <v-dialog v-model="open" width="700">
    <v-card tile :key="dialogKey">
      <v-toolbar flat dark color="primary">
        <v-btn icon dark @click="open = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Delete boundary box</v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- <v-toolbar-items>
          <v-btn dark text @click="dialog = false"> Save </v-btn>
        </v-toolbar-items> -->
      </v-toolbar>
      <v-card-text>
        <div v-if="!isLoading">
          <div ref="container" class="img-container mt-5">
            <img
              ref="uploadedImage"
              style="max-width: 100%"
              :src="sourceImage"
              @load="onSourceImgLoad"
              crossorigin
              alt=""
            />
            <div
              v-for="(btn, index) in hotspotButtons"
              :key="index"
              v-bind:style="btn.btnStyle"
              class="dot"
              @click.self="emitSpotChange(btn)"
            >
              <v-icon
                class="spot-delete-btn"
                color="red"
                @click.prevent="onClickDelete(btn)"
                style="font-size: 15px"
                >mdi-close-circle</v-icon
              >
            </div>
          </div>
          <div class="text-center mt-5">
            <v-btn
              @click="onClickSave"
              :disabled="!inProgress"
              :dark="inProgress ? true : false"
              class="mr-2"
              >Save</v-btn
            >
            <v-btn class="mr-2" @click="onClickCancel">Cancel</v-btn>
          </div>
        </div>
        <v-row
          v-else
          class="fill-height"
          align-content="center"
          justify="center"
          style="margin: 200px"
        >
          <v-col class="text-subtitle-1 text-center" cols="12">
            Fetching Results, please wait ...
          </v-col>
          <v-col cols="4">
            <v-progress-linear
              indeterminate
              rounded
              height="6"
            ></v-progress-linear>
          </v-col>
        </v-row>
        <!-- <h1 class="my-4 text-center">Draw the boundary for new object</h1> -->
      </v-card-text>
      <div style="flex: 1 1 auto"></div>
    </v-card>
  </v-dialog>
</template>

<script>
import Cropper from "cropperjs";
import _ from "lodash";
import { singleColors } from "../constants/constants";
import { generateUUID, createSpotsFromBoundaries } from "../utils/utils";
import WSIMLSearchService from "../services/WSIMLSearch.service";

export default {
  name: "BoundingBoxDeleteDialog",
  props: {
    sourceImage: String,
    objectBoundaries: Array,
  },
  computed: {},
  mounted() {
    this.hotspotButtons = JSON.parse(JSON.stringify(this.hotspotButtonsProp));
    console.log(this.hotspotButtonsProp);
  },
  watch: {
    open(newVal, oldVal) {
      !newVal && this.$emit("dialogClosed");
    },
    // objectBoundaries: function (newVal, oldVal) {
    //   this.hotspotButtons = JSON.parse(JSON.stringify(newVal));
    // },
    inProgress: function (inProgress, oldVal) {
      if (inProgress) {
        this.cropper.disable();
      } else {
        this.cropper.enable();
      }
    },
  },
  data() {
    return {
      selectedSpot: null,
      deletedSpotsIds: [],
      croppedImageBase64: null,
      categoryName: "",
      img: null,
      yoloData: null,
      dialogKey: null,
      inProgress: false,
      isLoading: false,
      open: true,
      hotspotButtons: null,
      imageTarget: null,
    };
  },
  mounted() {
    this.$refs.uploadedImage.onload = (img) => {
      this.imageTarget = img.target;
      const dimensions = {
        width: img.target.naturalWidth,
        height: img.target.naturalHeight,
      };
      this.hotspotButtons = createSpotsFromBoundaries(
        this.objectBoundaries,
        dimensions.height,
        dimensions.width
      );
    };
  },
  methods: {
    onClickDelete(btn) {
      this.deletedSpotsIds.push(btn.id);
      this.hotspotButtons = this.hotspotButtons.filter(
        (bd) => bd.id !== btn.id
      );
      this.inProgress = true;
    },
    onClickCancel() {
      this.open = false;
    },
    async onClickSave() {
      this.$emit("bboxDeleted", this.deletedSpotsIds);
      this.isLoading = false;
      this.open = false;
    },
    initializeCropper() {
      this.cropper = new Cropper(this.imageTarget, {
        zoomable: false,
        autoCropArea: 0,
        viewMode: 3,
        autoCrop: false,
        cropend: (e) => {
          this.onCropEnd();
        },
      });
    },
    emitSpotChange(e, setCropper = true) {
      this.cropper.crop();
      if (setCropper) {
        this.selectedSpot = e;
        this.cropper.setData(e.cropperCoordinates);
      }
      return;
    },
    onSourceImgLoad(img) {
      this.imageTarget = img.target;
      this.initializeCropper();
      this.cropper.disable();
    },
  },
};
</script>

<style scoped>
.img-container {
  position: relative;
  width: 600px;
  margin: auto !important;
  /*max-height: 600px;*/
}

.dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border: #fff 3px solid;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
}
.spot-delete-btn {
  font-size: 15px;
  bottom: 16px;
  left: 9px;
  cursor: pointer;
}
.disabled {
  pointer-events: none;
  background: #dddddd;
}
</style>