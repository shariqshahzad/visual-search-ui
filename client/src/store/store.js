import Vuex from "vuex";

export const store = new Vuex.Store({
  getters: {
    selectedBrand: (state) => {
      return state.selectedBrand;
    },
  },
  state: {
    selectedBrand: null,
  },
  mutations: {
    setSelectedBrand(state, payload) {
      state.selectedBrand = payload;
    },
  },
  actions: {
    // increment (context) {
    //   context.commit('increment')
    // }
  },
});
