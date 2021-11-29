import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import Vuex from "vuex";

Vue.use(Vuetify);

Vue.use(Vuex);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: "#231f20",
      },
    },
  },
});
