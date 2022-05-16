import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import "font-awesome/css/font-awesome.min.css";
import Vuex from "vuex";

Vue.use(Vuetify);

Vue.use(Vuex);

export default new Vuetify({
  icons: {
    iconfont: "fa4",
  },
  theme: {
    themes: {
      light: {
        primary: "#231f20",
      },
    },
  },
});
