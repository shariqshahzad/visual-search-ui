<template>
  <div>
    <div style="max-height: 400px" class="ma-2">
      <img ref="image" :src="src" crossorigin />
    </div>
    <!-- <div class="img-container" style="display: flex; justify-content: center">
      <img ref="image" :src="src" crossorigin />
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
    function debounce(func, timeout = 1000) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    }
    // eslint-disable-next-line no-unused-vars
    const processChange = debounce((canvas) => console.log(canvas));

    this.image = this.$refs.image;
    this.cropper = new Cropper(this.image, {
      width: 200,
      height: 200,
      zoomable: false,
      scalable: false,
      aspectRatio: 1,
      crop: () => {
        const canvas = this.cropper.getCropBoxData();
        processChange(canvas);
        // this.destination = canvas.toDataURL("image/png");
      },
    });
    this.cropper.setCropBoxData({left:0.2,top:0.1,width:50,height:100})
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