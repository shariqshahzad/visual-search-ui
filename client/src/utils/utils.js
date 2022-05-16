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

export const generateUUID = () => {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 = (typeof performance !== "undefined" && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

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

/**
 * Attempts to determine the mime type of a file or blob
 *
 * @param file
 * @returns {Promise<unknown>}
 */
export async function getMimeTypeOfFile(file) {
  const getMimeType = (signature) => {
    switch (signature) {
      case "89504E47":
        return "image/png";
      case "47494638":
        return "image/gif";
      case "25504446":
        return "application/pdf";
      case "FFD8FFDB":
      case "FFD8FFE0":
      case "FFD8FFE1":
        return "image/jpeg";
      case "504B0304":
        return "application/zip";
      default:
        return "Unknown filetype";
    }
  };

  return await new Promise((resolve) => {
    let fileReader = new FileReader();

    fileReader.onloadend = function(evt) {
      if (evt.target.readyState === FileReader.DONE) {
        const uint = new Uint8Array(evt.target.result);
        let bytes = [];

        uint.forEach((byte) => {
          bytes.push(byte.toString(16));
        });

        const hex = bytes.join("").toUpperCase();
        const mimeType = getMimeType(hex);

        resolve(mimeType);
      }
    };

    fileReader.readAsArrayBuffer(file.slice(0, 4));
  });
}

export async function createJsonFileAndDownload(content,filename = `${Date.now()}_Visual_Meta.json`) {
  var element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(content)));
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
