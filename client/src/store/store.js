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
    isDataLoading: (state) => {
      return state.isDataLoading;
    },
  },
  state: {
    tabsData: {},
    approvedItems: {},
    selectedBrand: null,
    tabs: [],
    currentTabKey: "",
    isDataLoading: false,
  },
  mutations: {
    setIsDataLoading(state, payload) {
      state.isDataLoading = payload;
    },
    setTabsData(state, payload) {
      if (state.currentTabKey) state.tabsData[state.currentTabKey] = JSON.parse(JSON.stringify(state.imageToolModule));
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
      if (!state.approvedItems[payload.fileName]) {
        state.approvedItems[payload.fileName] = {};
      }
      state.approvedItems[payload.fileName].assetPath = payload.assetPath;
      state.approvedItems[payload.fileName].data = _.orderBy(payload.data, ["sno"], ["asc"]);
    },
    setTabs(state, payload) {
      state.tabs = payload;
    },
    setSelectedBrand(state, payload) {
      state.selectedBrand = payload;
    },
    setCurrentTabKey(state, payload) {
      if (state.tabsData[payload]) {
        state.imageToolModule.categorizedSearchResults = state.tabsData[payload].categorizedSearchResults;
        state.imageToolModule.selectedSpot = state.tabsData[payload].selectedSpot;
        state.imageToolModule.objectBoundaries = state.tabsData[payload].objectBoundaries;
        state.imageToolModule.searchResultsWithoutSimilarFilter = state.tabsData[payload].searchResultsWithoutSimilarFilter;
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
