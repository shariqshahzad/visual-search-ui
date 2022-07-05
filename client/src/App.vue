<template>
  <v-app>
    <!-- <MaintenancePage/> -->
      <Root/>
  </v-app>
</template>

<script>
import Root from './components/Root';
import MaintenancePage from './components/MaintenancePage'

export default {
  name: 'App',

  components: {
    Root,
    MaintenancePage
  },

  data: () => ({
    //
  }),
};
</script>
