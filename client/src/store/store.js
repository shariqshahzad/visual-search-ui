import Vuex from "vuex";

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
    approvedItems : (state)=>{
      return state.approvedItems;
    }
  },
  state: {
    approvedItems : {},
    selectedBrand: null,
    dummyCategoryData: [
      {
        categoryName: "Sofa Set",
        data: [
          {
            name: "west elm x pbk Modern Play Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0003/west-elm-x-pbk-modern-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/modern-play-table-mb/",
          },
          {
            name: "west elm x pbk Mid-Century Craft Play Table | Pottery Barn ...",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0004/west-elm-x-pbk-mid-century-craft-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/mid-century-craft-play-table-mb/?recstrat=Bought-Bought-1%7CBB-GRP-AFF-CF",
          },
          {
            name: "Spindle Play Table | Pottery Barn Kids",
            image: "http://rk.pkimgs.com/pkimgs/rk/images/dp/wcm/201652/0004/spindle-play-table-m.jpg",
            price: 0,
            hostPageUrl: "http://www.potterybarnkids.com/products/spindle-play-table/?pkey=cplay-table-chairs&&cplay-table-chairs",
          },
          {
            name: "west elm x pbk Scoop Play Chair | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202115/0002/brooklyn-rug-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/scoop-play-chair-mb/",
          },
          {
            name: "west elm x pbk Modern Play Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0003/west-elm-x-pbk-modern-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/modern-play-table-mb/",
          },
          {
            name: "My First Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202111/0018/my-first-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/my-first-play-table/",
          },
        ],
        previewData: [
          {
            name: "west elm x pbk Mid-Century Craft Play Table | Pottery Barn ...",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0004/west-elm-x-pbk-mid-century-craft-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/mid-century-craft-play-table-mb/?recstrat=Bought-Bought-1%7CBB-GRP-AFF-CF",
          },
          {
            name: "Spindle Play Table | Pottery Barn Kids",
            image: "http://rk.pkimgs.com/pkimgs/rk/images/dp/wcm/201652/0004/spindle-play-table-m.jpg",
            price: 0,
            hostPageUrl: "http://www.potterybarnkids.com/products/spindle-play-table/?pkey=cplay-table-chairs&&cplay-table-chairs",
          },
          {
            name: "west elm x pbk Scoop Play Chair | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202115/0002/brooklyn-rug-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/scoop-play-chair-mb/",
          },
        ],
      },
      {
        categoryName: "Curtains",
        data: [
          {
            name: "west elm x pbk Modern Play Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0003/west-elm-x-pbk-modern-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/modern-play-table-mb/",
          },
          {
            name: "west elm x pbk Mid-Century Craft Play Table | Pottery Barn ...",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0004/west-elm-x-pbk-mid-century-craft-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/mid-century-craft-play-table-mb/?recstrat=Bought-Bought-1%7CBB-GRP-AFF-CF",
          },
          {
            name: "Spindle Play Table | Pottery Barn Kids",
            image: "http://rk.pkimgs.com/pkimgs/rk/images/dp/wcm/201652/0004/spindle-play-table-m.jpg",
            price: 0,
            hostPageUrl: "http://www.potterybarnkids.com/products/spindle-play-table/?pkey=cplay-table-chairs&&cplay-table-chairs",
          },
          {
            name: "west elm x pbk Scoop Play Chair | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202115/0002/brooklyn-rug-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/scoop-play-chair-mb/",
          },
          {
            name: "west elm x pbk Modern Play Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0003/west-elm-x-pbk-modern-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/modern-play-table-mb/",
          },
          {
            name: "My First Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202111/0018/my-first-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/my-first-play-table/",
          },
        ],
        previewData: [
          {
            name: "west elm x pbk Mid-Century Craft Play Table | Pottery Barn ...",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0004/west-elm-x-pbk-mid-century-craft-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/mid-century-craft-play-table-mb/?recstrat=Bought-Bought-1%7CBB-GRP-AFF-CF",
          },
          {
            name: "Spindle Play Table | Pottery Barn Kids",
            image: "http://rk.pkimgs.com/pkimgs/rk/images/dp/wcm/201652/0004/spindle-play-table-m.jpg",
            price: 0,
            hostPageUrl: "http://www.potterybarnkids.com/products/spindle-play-table/?pkey=cplay-table-chairs&&cplay-table-chairs",
          },
          {
            name: "west elm x pbk Scoop Play Chair | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202115/0002/brooklyn-rug-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/scoop-play-chair-mb/",
          },
        ],
      },
      {
        categoryName: "Tables",
        data: [
          {
            name: "west elm x pbk Modern Play Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0003/west-elm-x-pbk-modern-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/modern-play-table-mb/",
          },
          {
            name: "west elm x pbk Mid-Century Craft Play Table | Pottery Barn ...",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0004/west-elm-x-pbk-mid-century-craft-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/mid-century-craft-play-table-mb/?recstrat=Bought-Bought-1%7CBB-GRP-AFF-CF",
          },
          {
            name: "Spindle Play Table | Pottery Barn Kids",
            image: "http://rk.pkimgs.com/pkimgs/rk/images/dp/wcm/201652/0004/spindle-play-table-m.jpg",
            price: 0,
            hostPageUrl: "http://www.potterybarnkids.com/products/spindle-play-table/?pkey=cplay-table-chairs&&cplay-table-chairs",
          },
          {
            name: "west elm x pbk Scoop Play Chair | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202115/0002/brooklyn-rug-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/scoop-play-chair-mb/",
          },
          {
            name: "west elm x pbk Modern Play Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0003/west-elm-x-pbk-modern-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/modern-play-table-mb/",
          },
          {
            name: "My First Table | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202111/0018/my-first-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/my-first-play-table/",
          },
        ],
        previewData: [
          {
            name: "west elm x pbk Mid-Century Craft Play Table | Pottery Barn ...",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202114/0004/west-elm-x-pbk-mid-century-craft-play-table-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/mid-century-craft-play-table-mb/?recstrat=Bought-Bought-1%7CBB-GRP-AFF-CF",
          },
          {
            name: "Spindle Play Table | Pottery Barn Kids",
            image: "http://rk.pkimgs.com/pkimgs/rk/images/dp/wcm/201652/0004/spindle-play-table-m.jpg",
            price: 0,
            hostPageUrl: "http://www.potterybarnkids.com/products/spindle-play-table/?pkey=cplay-table-chairs&&cplay-table-chairs",
          },
          {
            name: "west elm x pbk Scoop Play Chair | Pottery Barn Kids",
            image: "https://assets.pkimgs.com/pkimgs/ab/images/dp/wcm/202115/0002/brooklyn-rug-o.jpg",
            price: 0,
            hostPageUrl: "https://www.potterybarnkids.com/products/scoop-play-chair-mb/",
          },
        ],
      },
    ],
    tabs: [],
    currentTabKey: "",
  },
  mutations: {
    setApprovedItems(state, payload){
      state.approvedItems[payload.fileName] = payload.data;
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
