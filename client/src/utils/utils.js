export function dataURLtoFile(dataUrl, fileName) {
  var arr = dataUrl.split(",");
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = window.atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

export const isInt = (data) => {
  return data === parseInt(data, 10);
};

function saveInput() {
  console.log("Saving data");
}

export const googleResultsToProductMapper = (res) => {
  const product = res.product_.productLabels_.reduce((prevVal, element) => {
    prevVal[element.key_] = [element.value_];
    return prevVal;
  }, {});
  product.name = res.product_.displayName_;
  product.image = `${product.bucketPath &&
    product.bucketPath[0]}${product.displayImgId && product.displayImgId[0]}`;
  product.price = product.price && product.price[0];
  product.pid = product.pid && product.pid[0];
  product.hostPageUrl = product.pip && product.pip[0];
  product.category = product.productCategory && product.productCategory[0];
  product.score = res.score_;
  return product;
};
