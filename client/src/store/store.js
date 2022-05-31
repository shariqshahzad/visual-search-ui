import Vuex from "vuex";
import _ from "lodash";
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
    currentTabKey: (state) => {
      return state.currentTabKey;
    },
    approvedItems: (state) => {
      return state.approvedItems;
    },
  },
  state: {
    approvedItems: {},
    selectedBrand: null,
    tabs: [],
    currentTabKey: "",
  },
  mutations: {
    markCurrentTabPendingChanges(state, payload) {
      state.tabs = state.tabs.map((tab) => {
        if (tab.key === state.currentTabKey) {
          tab.status = TAB_STATUSES.PENDING_CHANGES;
        }
        return tab;
      });
    },
    setApprovedItems(state, payload) {
      state.approvedItems[payload.fileName] = _.orderBy(payload.data,['sno'],['asc']);
    },
    setTabs(state, payload) {
      state.tabs = payload;
    },
    setSelectedBrand(state, payload) {
      state.selectedBrand = payload;
    },
    setCurrentTabKey(state, payload) {
      state.currentTabKey = payload;
    },
  },
  actions: {
    // increment (context) {
    //   context.commit('increment')
    // }
  },
});
