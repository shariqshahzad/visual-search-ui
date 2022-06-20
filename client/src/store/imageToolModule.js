export const imageToolModule = {
  state: () => ({
    categorizedSearchResults: [],
    objectBoundaries: [],
  }),
  mutations: {
    setCategorizedSearchResults(state, payload) {
      state.categorizedSearchResults = payload;
    },
    setObjectBoundaries(state, payload) {
      state.objectBoundaries = payload;
    },
    setSkuUnprioritized(state, payload) {
      const { categoryId, skuid } = payload;
      state.categorizedSearchResults = state.categorizedSearchResults.map((res) => {
        if (res.categoryId === categoryId) {
          let product = res.previewData.find((pd) => pd.skuid === skuid);
          product.isPrioritySku = false;
        }
        return res;
      });
    },
    setSkuPrioritized(state, payload) {
      const { categoryId, skuid } = payload;
      state.categorizedSearchResults = state.categorizedSearchResults.map((res) => {
        if (res.categoryId === categoryId) {
          res.previewData.map((pd) => {
            if (pd.skuid === skuid) {
              pd.isPrioritySku = true;
            } else {
              pd.isPrioritySku = false;
            }
          });
        }
        return res;
      });
    },
    setSkuUpdate(state, payload) {
      let { categoryId, product } = payload;
      state.categorizedSearchResults = state.categorizedSearchResults.map((res) => {
        if (res.categoryId === categoryId) {
          const replaceIndex = res.previewData.findIndex((pd) => pd.skuid === product.skuid);
          if (replaceIndex !== -1) res.previewData[replaceIndex] = product;
        }
        return res;
      });
      // this.$emit("skuUpdated", $event);
    },
    addNewBbox(state, payload) {
      let { categorizeSearchResults, objectBoundaries } = payload;
      state.categorizedSearchResults.unshift(categorizeSearchResults);
      state.objectBoundaries.unshift(objectBoundaries);
      //   this.key = generateUUID();
    },
    deleteBbox(state, payload) {
      state.objectBoundaries = state.objectBoundaries.filter((bd) => !payload.includes(bd.id));
      state.categorizedSearchResults = state.categorizedSearchResults.filter((csr) => state.objectBoundaries.findIndex((bd) => bd.mappedPrId === csr.categoryId) !== -1);
    },
    setSkuAdd(state, payload) {
      let { categoryId, product } = payload;
      state.categorizedSearchResults = state.categorizedSearchResults.map((res) => {
        if (res.categoryId === categoryId) {
          res.previewData.unshift(product);
        }
        return res;
      });
      // this.$emit("skuUpdated", $event);
    },
  },
  getters: {
    categorizedSearchResults(state) {
      return state.categorizedSearchResults;
    },
    objectBoundaries(state) {
      return state.objectBoundaries;
    },
  },
};
