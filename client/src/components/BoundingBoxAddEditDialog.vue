<template>
  <v-dialog v-model="open" scrollable max-width="1200px">
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
        <v-row>
          <v-col cols="8" class="mt-5">
            <div class="img-container">
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
          </v-col>
          <v-col cols="4" class="mt-5">
            <v-text-field
              :disabled="!isLoading"
              label="Category Name"
              :v-model="categoryName"
            ></v-text-field>
            <v-btn
              @click="onClickSave"
              :disabled="!isLoading"
              :dark="isLoading ? true : false"
              class="float-right"
              >Save</v-btn
            >
            <v-btn class="float-right mr-2">Cancel</v-btn>
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
import { singleColors } from "../constants/constants";
import { generateUUID } from "../utils/utils";
import WSIMLSearchService from "../services/WSIMLSearch.service";

export default {
  name: "BoundingBoxAddEditDialog",
  props: {
    sourceImage: String,
    hotspotButtonsProp: Array,
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
    hotspotButtonsProp: function (newVal, oldVal) {
      this.hotspotButtons = JSON.parse(JSON.stringify(newVal));
    },
    isLoading: function (isLoading, oldVal) {
      if (isLoading) {
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
      isLoading: false,
      open: true,
      hotspotButtons: null,
      imageTarget: null,
    };
  },
  methods: {
    async onClickSave() {
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
      this.$emit("newBboxAdded", {
        categorizeSearchResults: productResults[0],
        objectBoundaries: this.yoloData,
      });
      this.open = false;
    },
    onCropEnd() {
      debugger;
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
      this.isLoading = true;
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