<template>
  <div>
    <div class="img-container ma-2">
      <img ref="uploadedImage" :src="imageData.src" crossorigin />
      <span
        @click="emitSpotChange(btn)"
        v-for="(btn, index) in hotspotButtons"
        :key="index"
        v-bind:style="btn.btnStyle"
        class="dot"
      ></span>
    </div>

    <!-- <div class="img-container" style="display: hidden; justify-content: center">
      <img ref="image" :src="destination" crossorigin />
    </div> -->
  </div>
</template>

<script>
import Cropper from "cropperjs";
export default {
  name: "ImageCropper",
  data() {
    return {
      hotspotButtons: [],
      cropper: {},
      destination: {},
      imageTarget: null,
      fileImageSrc: "",
      urlImageSrc: "",
      cropperInitialised: false
    };
  },
  props: {
    imageData: Object,
    objectBoundaries: Array,
  },
  mounted() {
    const objectBoundaries = this.objectBoundaries;
    this.$refs.uploadedImage.onload = (img) => {
      this.imageTarget = img.target;
      const dimensions = {
        width: img.target.naturalWidth,
        height: img.target.naturalHeight,
      };
      this.hotspotButtons = objectBoundaries.map((bd) => {
        const x = bd.rectangleBox.topLeft.x * dimensions.width,
          y = bd.rectangleBox.topLeft.y * dimensions.height;
        return {
          btnStyle: {
            top: `${bd.rectangleCenterSpot.topLeft.y * 100}%`,
            left: `${bd.rectangleCenterSpot.topLeft.x * 100}%`,
            transform: `translate(-${
              (bd.rectangleCenterSpot.topLeft.x * 100) / 2
            }%, -${(bd.rectangleCenterSpot.topLeft.y * 100) / 2}%)`,
          },
          cropperCoordinates: {
            x,
            y,
            width: bd.rectangleBox.topRight.x * dimensions.width - x,
            height: bd.rectangleBox.bottomRight.y * dimensions.height - y,
          },
        };
      });

      // const objectBoundary = objectBoundaries[0];
      // console.log(objectBoundary.displayName);
      // const rectangleBox = objectBoundary.rectangleBox,
      //   x = rectangleBox.topLeft.x * dimensions.width,
      //   y = rectangleBox.topLeft.y * dimensions.height,
      //   width = rectangleBox.topRight.x * dimensions.width - x,
      //   height = rectangleBox.bottomRight.y * dimensions.height - y;
    };
  },
  methods: {
    processChange(canvas) {
      setTimeout(() => {
        this.destination = canvas.toDataURL("image/png");
        this.$emit("crop", this.destination);
      },200);
    },
    emitSpotChange(e, setCropper = true) {
      if (!this.cropperInitialised) {
        this.cropper = new Cropper(this.imageTarget, {
          zoomable: false,
          cropend: (e) => {
            this.emitSpotChange(e, false);
            // const canvas = this.cropper.getCroppedCanvas();
            // this.processChange(canvas);
          },
          data: e.cropperCoordinates,
        });
        this.cropperInitialised = true;
      } else {
        setCropper && this.cropper.setData(e.cropperCoordinates);
      }

      setTimeout(() => {
        const cropperData = this.cropper.getData(),
            {naturalWidth, naturalHeight} = this.$refs.uploadedImage,
            coordinates = {
              left: (cropperData.x / naturalWidth),
              right: ((cropperData.x + cropperData.width) / naturalWidth),
              top: (cropperData.y / naturalHeight),
              bottom: ((cropperData.y + cropperData.height) / naturalHeight)
            }

        this.$emit("crop", coordinates);
      },100)
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
  background: #05e9f5;
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
  max-height: 600px;
}
.img-preview {
  width: 200px;
  height: 200px;
  float: left;
  margin-left: 10px;
}
</style>