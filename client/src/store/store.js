import Vuex from "vuex";
import { TAB_STATUSES } from "../constants/constants";

export const store = new Vuex.Store({
  getters: {
    selectedBrand: (state) => {
      return state.selectedBrand;
    },
    dummyCategoryData: (state) => {
      return state.dummyCategoryData;
    },
    tabs: (state) => {
      return state.tabs;
    },
    currentTab: (state) => {
      return state.currentTab;
    },
    approvedItems: (state) => {
      return state.approvedItems;
    },
  },
  state: {
    approvedItems: {},
    selectedBrand: null,
    tabs: [],
    currentTab: null,
  },
  mutations: {
    markCurrentTabPendingChanges(state, payload) {
      state.tabs = state.tabs.map((tab) => {
        if (tab.key === state.currentTab.key) {
          tab.status = TAB_STATUSES.PENDING_CHANGES;
        }
        return tab;
      });
    },
    setApprovedItems(state, payload) {
      state.approvedItems[payload.fileName] = payload.data;
    },
    setTabs(state, payload) {
      state.tabs = payload;
    },
    setSelectedBrand(state, payload) {
      state.selectedBrand = payload;
    },
    setCurrentTab(state, payload) {
      state.currentTab = payload;
    },
  },
  actions: {
    // increment (context) {
    //   context.commit('increment')
    // }
  },
});
