<template>
  <div>
    <div style="max-height: 600px" class="ma-2">
      <img ref="uploadedImage" :src="imageData.src" crossorigin />
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
    this.$refs.uploadedImage.onload = function () {
      const dimensions = {
        width: this.naturalWidth,
        height: this.naturalHeight,
      }
      const objectBoundary=objectBoundaries[0];

      console.log(objectBoundary.displayName)

      const rectangleBox = objectBoundary.rectangleBox,
          x = rectangleBox.topLeft.x * dimensions.width,
          y = rectangleBox.topLeft.y * dimensions.height,
          width = (rectangleBox.topRight.x * dimensions.width) - x,
          height = (rectangleBox.bottomRight.y * dimensions.height) - y;

      this.cropper = new Cropper(this, {
        zoomable : false,
        data: { x, y, width, height }
      });
    }
  },
};
</script>

<style scoped>
.img-container {
  width: 640px;
  height: 480px;
  float: left;
}
.img-preview {
  width: 200px;
  height: 200px;
  float: left;
  margin-left: 10px;
}
</style>