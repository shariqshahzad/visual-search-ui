<template>
  <v-dialog v-model="open" width="700">
    <v-card tile :key="dialogKey">
      <v-toolbar flat dark color="primary">
        <v-btn icon dark @click="open = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>Add new boundary box</v-toolbar-title>
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
            <span
              v-for="(btn, index) in hotspotButtons"
              :key="index"
              v-bind:style="btn.btnStyle"
              class="dot"
              @click="emitSpotChange(btn)"
            ></span>
          </div>
          <div class="text-center mt-5">
            <v-btn
              @click="onClickSave"
              :disabled="!inProgress"
              :dark="inProgress ? true : false"
              class="mr-2"
              >Save</v-btn
            >
            <v-btn @click="onClickCancel">Cancel</v-btn>
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
  name: "BoundingBoxAddEditDialog",
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
    onClickCancel() {
      this.open = false;
    },
    async onClickSave() {
      this.isLoading = true;
      this.yoloData.class = "someCat";
      console.log(this.yoloData);
      let embeddings = await WSIMLSearchService.getEmbbeddingsResults(
        this.yoloData.class,
        this.croppedImageBase64,
        this.yoloData.id
      );
      let productResults = await WSIMLSearchService.getSimilaritiesResults([
        embeddings,
      ]);
      this.yoloData.sno = _.maxBy(this.objectBoundaries, "sno").sno + 1;
      this.yoloData.bgColor = singleColors[this.objectBoundaries.length];
      this.$emit("newBboxAdded", {
        categorizeSearchResults: productResults[0],
        objectBoundaries: this.yoloData,
      });
      this.isLoading = false;
      this.open = false;
    },
    onCropEnd() {
      this.croppedImageBase64 = this.cropper
        .getCroppedCanvas()
        .toDataURL("image/jpeg")
        .split(",")[1];
      const { naturalWidth: imageWidth, naturalHeight: imageHeight } =
        this.cropper.imageData;
      console.log(this.cropper.getData());
      const { height, width, y: y1, x: x1 } = this.cropper.getData();
      const x2 = x1 + width;
      const y2 = y1 + height;

      const cropperCoordinates = {
        height,
        width,
        y: y1,
        x: x1,
      };
      const top = ((y1 + y2) / 2 / imageHeight) * 100;
      const left = ((x1 + x2) / 2 / imageWidth) * 100;

      const btnStyle = {
        top: `calc(${top}% - 10px)`,
        left: `calc(${left}% - 7px)`,
        background: singleColors[this.hotspotButtons.length],
      };
      const id = generateUUID();
      const yoloData = {
        bbox: [x1, y1, x2, y2],
        conf: 1,
        id,
        class: "Some Class",
        mappedPrId: id,
      };
      this.hotspotButtons.push({
        cropperCoordinates,
        btnStyle,
        id: yoloData.id,
        categoryId: yoloData.mappedPrId,
      });
      this.yoloData = yoloData;
      // this.cropper.destroy();
      // this.initializeCropper();
      this.inProgress = true;
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
        console.log(e.cropperCoordinates);
        this.cropper.setData(e.cropperCoordinates);
        this.$emit("crop", e.categoryId);
      } else {
        this.$emit(
          "customCrop",
          this.cropper.getCroppedCanvas().toDataURL("image/jpeg")
        );
      }
    },
    onSourceImgLoad(img) {
      this.imageTarget = img.target;
      this.initializeCropper();
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

.disabled {
  pointer-events: none;
  background: #dddddd;
}
</style>