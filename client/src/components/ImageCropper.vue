<template>
  <div>
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
    <div class="text-center">
      <v-btn
        class="ma-2"
        v-if="currentTabStatus === TAB_STATUSES.IN_PROGRESS"
        @click="updateApproval"
        color="primary"
        >Mark As Approved</v-btn
      >
      <v-btn
        class="ma-2"
        v-if="currentTabStatus !== TAB_STATUSES.IN_PROGRESS"
        :disabled="currentTabStatus !== TAB_STATUSES.PENDING_CHANGES"
        @click="updateApproval"
        color="primary"
        >Save Changes</v-btn
      >
      <v-btn @click="onClickAddNewSpot" color="primary"> Add New Spot </v-btn>
      <BoundingBoxAddEditDialog
        @newBboxAdded="onAddNewBbox($event)"
        @dialogClosed="onClickDialogClosed"
        v-if="addNewSpotDialog"
        :sourceImage="imageData.src"
        :objectBoundaries="objectBoundaries"
      />

      <v-btn class="ma-2" @click="onClickReset" color="primary">Reset</v-btn>

      <!-- <v-btn class="ma-2" @click="onClickExport" color="primary"
        >Export Data</v-btn
      > -->
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
import { createSpotsFromBoundaries } from "../utils/utils"
import BoundingBoxAddEditDialog from "../components/BoundingBoxAddEditDialog.vue";

export default {
  name: "ImageCropper",
  data() {
    return {
      addNewSpotDialog: false,
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
  watch: {
    objectBoundaries(newVal, oldVal) {
      debugger;
      this.onClickReset();
    },
  },
  mounted() {
    const objectBoundaries = this.objectBoundaries;
    this.$refs.uploadedImage.onload = (img) => {
      this.imageTarget = img.target;
      const dimensions = {
        width: img.target.naturalWidth,
        height: img.target.naturalHeight,
      };
      this.hotspotButtons = createSpotsFromBoundaries(objectBoundaries,dimensions.height,dimensions.width);
      this.initializeCropper();
    };
  },
  methods: {
    onAddNewBbox(e) {
      // this.onClickReset();
      this.$emit("newBboxAdded", e);
    },
    onClickDialogClosed() {
      this.addNewSpotDialog = false;
    },
    onClickAddNewSpot() {
      this.addNewSpotDialog = true;
    },
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
    updateCurrentTabStatus() {
      const tab = this.tabs.find((tab) => tab.key === this.currentTabKey);
      this.currentTabStatus = tab.status;
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
  components: {
    BoundingBoxAddEditDialog,
  },
  computed: {
    ...mapGetters([
      "currentTabKey",
      "tabs",
      // ...
    ]),
  },
  watch: {
    currentTabKey(newValue, oldValue) {
      this.updateCurrentTabStatus();
    },
    tabs(newValue, oldValue) {
      this.updateCurrentTabStatus();
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