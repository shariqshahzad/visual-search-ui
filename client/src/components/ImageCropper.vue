<template>
  <div>
    <div class="text-center">
      <v-btn
        class="ma-2"
        v-if="currentTab.status === TAB_STATUSES.IN_PROGRESS"
        @click="updateApproval"
        color="primary"
        >Mark As Approved</v-btn
      >
      <v-btn
        class="ma-2"
        v-if="currentTab.status !== TAB_STATUSES.IN_PROGRESS"
        :disabled="currentTab.status !== TAB_STATUSES.PENDING_CHANGES"
        @click="updateApproval"
        color="primary"
        >Save Changes</v-btn
      >

      <v-btn class="ma-2" @click="onClickReset" color="primary">Reset</v-btn>
      <!-- <v-btn class="ma-2" @click="onClickExport" color="primary"
        >Export Data</v-btn
      > -->
    </div>
    <div class="img-container mx-2">
      <img
        ref="uploadedImage"
        style="max-width: 100%"
        :src="imageData.src"
        crossorigin
      />
      <span
        @click="emitSpotChange(btn)"
        v-for="(btn, index) in hotspotButtons"
        :key="index"
        v-bind:style="btn.btnStyle"
        :class="`dot ${isLoading ? 'disabled' : ''}`"
      ></span>
    </div>

    <!-- <div class="img-container" style="display: hidden; justify-content: center">
      <img ref="image" :src="destination" crossorigin />
    </div> -->
  </div>
</template>

<script>
import Cropper from "cropperjs";
import { mapGetters } from "vuex";
import { singleColors, TAB_STATUSES } from "../constants/constants";

export default {
  name: "ImageCropper",
  data() {
    return {
      hotspotButtons: [],
      TAB_STATUSES,
      currentTabStatus: TAB_STATUSES.IN_PROGRESS,
      cropper: {},
      destination: {},
      imageTarget: null,
      fileImageSrc: "",
      urlImageSrc: "",
    };
  },
  props: {
    imageData: Object,
    objectBoundaries: Array,
    isLoading: Boolean,
  },
  mounted() {
    const objectBoundaries = this.objectBoundaries;
    this.$refs.uploadedImage.onload = (img) => {
      this.imageTarget = img.target;
      const dimensions = {
        width: img.target.naturalWidth,
        height: img.target.naturalHeight,
      };
      let colorIndex = 0;

      this.hotspotButtons = objectBoundaries.map((bd) => {
        const top = ((bd.bbox[1] + bd.bbox[3]) / 2 / dimensions.height) * 100;
        const left = ((bd.bbox[0] + bd.bbox[2]) / 2 / dimensions.width) * 100;
        if (!bd.bgColor) colorIndex++;
        return {
          btnStyle: {
            top: `calc(${top}% - 10px)`,
            left: `calc(${left}% - 7px)`,
            background: bd.bgColor || singleColors[colorIndex],
          },
          cropperCoordinates: {
            x: bd.bbox[0],
            y: bd.bbox[1],
            width: bd.bbox[2] - bd.bbox[0],
            height: bd.bbox[3] - bd.bbox[1],
          },
          categoryId: bd.mappedPrId,
          id: bd.id,
          // boundingPolyIndex: bd.boundingPolyIndex,
        };
      });

      // objectBoundaries.map((bd) => {
      //   const x = bd.rectangleBox.topLeft.x * dimensions.width,
      //     y = bd.rectangleBox.topLeft.y * dimensions.height;
      //   return {
      //     btnStyle: {
      //       top: `${bd.rectangleCenterSpot.topLeft.y * 100}%`,
      //       left: `${bd.rectangleCenterSpot.topLeft.x * 100}%`,
      //       transform: `translate(-${
      //         (bd.rectangleCenterSpot.topLeft.x * 100) / 2
      //       }%, -${(bd.rectangleCenterSpot.topLeft.y * 100) / 2}%)`,
      //     },
      //     cropperCoordinates: {
      //       x,
      //       y,
      //       width: bd.rectangleBox.topRight.x * dimensions.width - x,
      //       height: bd.rectangleBox.bottomRight.y * dimensions.height - y,
      //     },
      //     boundingPolyIndex: bd.boundingPolyIndex,
      //   };
      // });

      // const objectBoundary = objectBoundaries[0];
      //
      // const rectangleBox = objectBoundary.rectangleBox,
      //   x = rectangleBox.topLeft.x * dimensions.width,
      //   y = rectangleBox.topLeft.y * dimensions.height,
      //   width = rectangleBox.topRight.x * dimensions.width - x,
      //   height = rectangleBox.bottomRight.y * dimensions.height - y;
      this.initializeCropper();
    };
  },
  methods: {
    initializeCropper(isReset) {
      this.cropper = new Cropper(this.imageTarget, {
        zoomable: false,
        autoCropArea: 0,
        viewMode: 3,
        autoCrop: false,
        cropend: (e) => {
          this.emitSpotChange(e, false);
        },
      });
    },
    updateApproval() {
      this.$emit("updateApproval", this.objectBoundaries);
    },
    onClickExport() {
      this.$emit("exportData", this.objectBoundaries);
    },
    onClickReset() {
      this.cropper.destroy();
      this.initializeCropper(true);
      this.$emit("resetData", null);
    },
    emitSpotChange(e, setCropper = true) {
      this.cropper.crop();
      if (setCropper) {
        this.cropper.setData(e.cropperCoordinates);
        this.$emit("crop", e.categoryId);
      } else {
        this.$emit(
          "customCrop",
          this.cropper.getCroppedCanvas().toDataURL("image/jpeg")
        );
      }
    },
  },
  computed: {
    ...mapGetters([
      "currentTab",
      "tabs",
      // ...
    ]),
  },
  watch: {
    tabs(newValue, oldValue) {
      this.currentTabStatus = this.currentTab.status;
    },
    isLoading: function (isLoading, oldVal) {
      if (isLoading) this.cropper.disable();
      else this.cropper.enable();
    },
  },
};
</script>

<style scoped>
.dot {
  position: absolute;
  width: 18px;
  height: 18px;
  border: #fff 3px solid;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
}
.btn {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #555;
  color: white;
  font-size: 16px;
  padding: 12px 24px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  text-align: center;
}

.img-container {
  position: relative;
  /*max-height: 600px;*/
}
.img-preview {
  width: 200px;
  height: 200px;
  float: left;
  margin-left: 10px;
}

.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>