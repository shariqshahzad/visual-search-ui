import Vuex from "vuex";
import _ from "lodash";
import { TAB_STATUSES } from "../constants/constants";
import { imageToolModule } from "./imageToolModule";

export const store = new Vuex.Store({
  modules: {
    imageToolModule,
  },
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
    tabsData: (state) => {
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
    tabsData: {},
    approvedItems: {},
    selectedBrand: null,
    tabs: [],
    currentTabKey: "",
  },
  mutations: {
    setTabsData(state, payload) {
      state.tabsData[state.currentTabKey] = JSON.parse(JSON.stringify(state.imageToolModule));
    },
    markCurrentTabPendingChanges(state, payload) {
      state.tabs = state.tabs.map((tab) => {
        if (tab.key === state.currentTabKey) {
          tab.status = TAB_STATUSES.PENDING_CHANGES;
        }
        return tab;
      });
    },
    setApprovedItems(state, payload) {
      state.approvedItems[payload.fileName] = _.orderBy(payload.data, ["sno"], ["asc"]);
    },
    setTabs(state, payload) {
      state.tabs = payload;
    },
    setSelectedBrand(state, payload) {
      state.selectedBrand = payload;
    },
    setCurrentTabKey(state, payload) {
      if(state.tabsData[payload]){
        state.imageToolModule.categorizedSearchResults = state.tabsData[payload].categorizedSearchResults;
        state.imageToolModule.objectBoundaries = state.tabsData[payload].objectBoundaries;
      }
      state.currentTabKey = payload;
    },
  },
  actions: {
    // increment (context) {
    //   context.commit('increment')
    // }
  },
});
