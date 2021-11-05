<template>
  <div>
    <div style="max-height: 600px" class="ma-2">
      <img ref="image" :src="src" crossorigin />
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
      image: {},
    };
  },
  props: {
    src: String,
  },
  mounted() {
    const debounce = (func, timeout = 1000) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    };
    // eslint-disable-next-line no-unused-vars
    const processChange = debounce((canvas) => {
      this.destination = canvas.toDataURL("image/png");
      this.$emit("crop", this.destination);
    });
    let isInitialCrop = true;
    this.cropper = new Cropper(this.$refs.image, {
      crop: () => {
        if (isInitialCrop) {
          console.log(isInitialCrop);
          isInitialCrop = false;
          return;
        }
        // const cropBoxData = this.cropper.getCropBoxData();
        const canvas = this.cropper.getCroppedCanvas();
        processChange(canvas);
      },
    });
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