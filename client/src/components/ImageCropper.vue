<template>
  <div>
    <div class="img-container ma-2">
      <img ref="uploadedImage" :src="imageData.src" crossorigin />
      <span
        @click="onClickSpot(btn)"
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
      fileImageSrc: "",
      urlImageSrc: "",
    };
  },
  props: {
    imageData: Object,
    objectBoundaries: Array,
  },
  mounted() {
    // console.log(this.imageData);
    const debounce = (func, timeout = 0) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    };
    // eslint-disable-next-line no-unused-vars
    // const processChange = debounce((canvas) => {
    //   this.destination = canvas.toDataURL("image/png");
    //   this.$emit("crop", this.destination);
    // });
    const objectBoundaries = this.objectBoundaries;
    this.$refs.uploadedImage.onload = (img) => {
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

      const objectBoundary = objectBoundaries[0];

      console.log(objectBoundary.displayName);

      // const rectangleBox = objectBoundary.rectangleBox,
      //   x = rectangleBox.topLeft.x * dimensions.width,
      //   y = rectangleBox.topLeft.y * dimensions.height,
      //   width = rectangleBox.topRight.x * dimensions.width - x,
      //   height = rectangleBox.bottomRight.y * dimensions.height - y;

      this.cropper = new Cropper(img.target, {
        zoomable: false,
        cropend: (e) => {
          console.log(e);
        },
        // data: { x, y, width, height },
      });
    };
  },
  methods: {
    onClickSpot(e) {
      console.log(this.cropper.getData());
      console.log(this.$refs.uploadedImage.naturalWidth);
      this.cropper.setData(e.cropperCoordinates);
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