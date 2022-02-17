var XLSX = require("xlsx");

export const parseExcel = function(file) {
  var reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = function(e) {
      var data = e.target.result;
      var workbook = XLSX.read(data, {
        type: "binary",
      });

      workbook.SheetNames.forEach(function(sheetName) {
        // Here is your object
        var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        var json_object = JSON.stringify(XL_row_object);
        resolve(json_object);
      });
    };
    reader.onerror = function(ex) {
      reject(ex);
    };
    reader.readAsBinaryString(file);
  });
};

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

export const toDataURL = (url) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

export async function encodeImageFileAsURL(file) {
  var reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onloadend = function(err) {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
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
  product.image = `${product.bucketPath && product.bucketPath[0]}${product.displayImgId && product.displayImgId[0]}`;
  product.price = product.price && product.price[0];
  product.pid = product.pid && product.pid[0];
  product.hostPageUrl = product.pip && product.pip[0];
  product.category = product.productCategory && product.productCategory[0];
  return product;
};
