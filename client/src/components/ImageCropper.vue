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
      >
        <span
          :class="`dot-number ${btn.sno > 9 ? 'dot-number-dbl-digit' : ''}`"
          >{{ btn.sno }}</span
        >
      </span>
    </div>
    <div class="text-center">
      <v-btn class="ma-2" @click="onClickReset" color="primary"
        ><v-icon>mdi-refresh</v-icon></v-btn
      >
      <v-btn
        class="ma-2"
        v-if="currentTabStatus === TAB_STATUSES.IN_PROGRESS"
        @click="updateApproval"
        color="primary"
        >Approve</v-btn
      >
      <v-btn
        class="ma-2"
        v-if="currentTabStatus !== TAB_STATUSES.IN_PROGRESS"
        :disabled="currentTabStatus !== TAB_STATUSES.PENDING_CHANGES"
        @click="updateApproval"
        color="primary"
        >Save</v-btn
      >
      <v-btn @click="onClickAddNewSpot" class="ma-2" color="primary">
        Add New Spot
      </v-btn>
      <BoundingBoxAddEditDialog
        @newBboxAdded="onAddNewBbox($event)"
        @dialogClosed="onAddDialogClosed"
        v-if="addNewSpotDialog"
        :sourceImage="imageData.src"
      />

      <v-btn @click="onClickDeleteSpot" color="primary"> Delete Spots </v-btn>
      <BoundingBoxDeleteDialog
        @bboxDeleted="onDeleteBbox($event)"
        @dialogClosed="onDeleteDialogClosed"
        v-if="deleteSpotDialog"
        :sourceImage="imageData.src"
      />

      <div
        :id="`cropper-preview-${tabindex}`"
        style="
          position: absolute;
          visibility: hidden;
          width: 500%;
          height: 300px;
          overflow: hidden;
        "
      ></div>
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
import { mapGetters, mapMutations } from "vuex";
import { singleColors, TAB_STATUSES } from "../constants/constants";
import { createSpotsFromBoundaries } from "../utils/utils";
import BoundingBoxAddEditDialog from "./BoundingBoxAddEditDialog.vue";
import BoundingBoxDeleteDialog from "./BoundingBoxDeleteDialog.vue";
import { EventBus } from "../event-bus/event-bus";

export default {
  name: "ImageCropper",
  data() {
    return {
      imageDimensions: null,
      deleteSpotDialog: false,
      selectedSpot: null,
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
    isLoading: Boolean,
    tabindex: Number,
  },
  mounted() {
    EventBus.$on("grouped", this.onGrouped);
    EventBus.$on("unGrouped", this.onUngrouped);
    const objectBoundaries = this.objectBoundaries;
    this.$refs.uploadedImage.onload = (img) => {
      this.imageTarget = img.target;
      const dimensions = {
        width: img.target.naturalWidth,
        height: img.target.naturalHeight,
      };
      this.imageDimensions = dimensions;
      this.hotspotButtons = createSpotsFromBoundaries(
        objectBoundaries,
        dimensions.height,
        dimensions.width
      );
      this.initializeCropper();
    };
  },
  methods: {
    ...mapMutations(["setSelectedSpot"]),
    setHotspotButtons(img) {},
    onGrouped(params) {
      this.onClickReset();
    },
    onUngrouped(params) {
      this.onClickReset();
    },
    onAddNewBbox(e) {
      // this.onClickReset();
      this.$emit("newBboxAdded", e);
    },
    onDeleteBbox(e) {
      this.$emit("bboxDeleted", e);
    },
    onAddDialogClosed() {
      this.addNewSpotDialog = false;
    },
    onDeleteDialogClosed() {
      this.deleteSpotDialog = false;
    },
    onClickAddNewSpot() {
      this.addNewSpotDialog = true;
    },
    onClickDeleteSpot() {
      this.deleteSpotDialog = true;
    },
    initializeCropper(isReset) {
      this.cropper = new Cropper(this.imageTarget, {
        zoomable: false,
        autoCropArea: 0,
        viewMode: 3,
        autoCrop: false,
        ready: () => {
          const vueInstance = this;
          // let x = document.getElementsByClassName("cropper-container")[0];
          let x = document
            .querySelectorAll(`.tab-section[tab-index="${this.tabindex}"]`)[0]
            .getElementsByClassName("cropper-container")[0];
          x.onmousemove = (e) => {
            var el = document.getElementById(
              `cropper-preview-${this.tabindex}`
            );
            var x = e.x;
            var y = e.y;
            if (vueInstance.selectedSpot) {
              el.style.visibility = "visible";
            } else el.style.visibility = "hidden";
            el.style.zIndex = 1;
            el.style.position = "absolute";
            el.style.left = x + "px";
            el.style.top = y + "px";
          };
          x.onmouseleave = (e) => {
            var el = document.getElementById(
              `cropper-preview-${this.tabindex}`
            );
            el.style.visibility = "hidden";
          };
        },
        preview: `#cropper-preview-${this.tabindex}`,
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
      this.selectedSpot = null;
      this.cropper.destroy();
      this.initializeCropper(true);
      this.$emit("resetData", null);
    },
    updateCurrentTabStatus() {
      const tab = this.tabs.find((tab) => tab.key === this.currentTabKey);
      this.currentTabStatus = tab.status;
    },
    emitSpotChange(e, setCropper = true) {
      this.selectedSpot = e;
      this.cropper.crop();
      if (setCropper) {
        this.cropper.setData(e.cropperCoordinates);
        this.$emit("crop", e.categoryId);
        this.setSelectedSpot(e);
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
    BoundingBoxDeleteDialog,
  },
  computed: {
    ...mapGetters([
      "currentTabKey",
      "tabs",
      "objectBoundaries",
      // ...
    ]),
  },
  watch: {
    objectBoundaries(newVal, oldVal) {
      this.hotspotButtons = createSpotsFromBoundaries(
        newVal,
        this.imageDimensions.height,
        this.imageDimensions.width
      );
    },
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
  width: 26px;
  height: 26px;
  border: #fff 3px solid;
  border-radius: 50%;
  display: inline-block;
  cursor: pointer;
}

.dot-number {
  font-size: 0.9rem;
  position: relative;
  left: 28%;
  color: #fff;
  bottom: 14%;
}
.dot-number-dbl-digit {
  left: 10%;
  bottom: 16%;
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
/* .img-preview {
  width: 200px;
  height: 200px;
  float: left;
  margin-left: 10px;
} */

.disabled {
  pointer-events: none;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
