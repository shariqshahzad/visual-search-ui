<template>
  <div style="max-height: 400px" class="ma-2">
    <h3>Price:</h3>
    <v-range-slider
        v-model="range"
        :max="max"
        :min="min"
        hide-details
        class="align-center"
        @change="$emit('emitPriceRange',range)"
    >
    </v-range-slider>
    <div class="price-labels">
      <b style="float: left">${{range[0]}}</b>
      <p>To</p>
      <b style="float: right">${{range[1]}}</b>
    </div>

  </div>
</template>

<script>
export default {
  name: "Filters",
  props: ['min','max'],
  data() {
    return {
      range: [this.min, this.max],
    }
  }
}
</script>

<style scoped>
.price-labels{
  display: flex;
  justify-content: space-between;
}
</style>