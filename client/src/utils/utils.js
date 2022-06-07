var XLSX = require("xlsx");
import { singleColors } from "../constants/constants";
import { excelMetaData } from "./excelMetaData";

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

export async function createJsonFileAndDownload(content, filename = `${Date.now()}_Visual_Meta.json`) {
  var element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(content)));
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export const convertApprovedItemsToBinaryObjects = (approvedItems) => {
  let xlsxPayload = [];
  let excelArray = [];
  for (const [index, [key, value]] of Object.entries(Object.entries(approvedItems))) {
    let columns = excelMetaData.map((e) => e.columnName);
    // console.log(columns);
    // throw "lets stop here";
    excelArray.push(columns);
    // let values = [];
    debugger;
    let skus;
    value.map((element) => {
      skus = !skus ? element.data[0].skuid : `${skus} | ${element.data[0].skuid}`;
      // element.data.map((element) => {

      //   if(skus){

      //   }
      // });
    });
    let assetPath = [
      `/content/dam/west-elm/production/testing/2022-06-02-metadatatesting-tpurdy/8886231-Olive-Trre-151-450x450`,
      `/content/dam/west-elm/production/testing/2022-06-02-metadatatesting-tpurdy/pdi-709193-mp-cold-brew-sustainable-coffee-press-8-cup-34oz-with-yohki-lid-ho21-main-011-450x450`,
    ];
    let element = { skus ,assetPath: assetPath[index] };
    console.log(element);
    // excelArray.push(excelMetaData.map((e) => (element[e.propertyName] ? element[e.propertyName].toString() : "-")));
    excelArray.push(excelMetaData.map((e) => (element[e.propertyName] ? element[e.propertyName].toString() : "-")));
  }
  xlsxPayload.push({ excelArray });
  return xlsxPayload;
};

export const exportExcel = (xlsxPayload) => {
  // On Click Excel download button

  // export json to Worksheet of Excel
  // only array possible

  var wb = XLSX.utils.book_new();

  xlsxPayload.forEach((xpl) => {
    var WS = XLSX.utils.aoa_to_sheet(xpl.excelArray);
    //  XLSX.utils.json_to_sheet(jsonObject);

    // A workbook is the name given to an Excel file
    // make Workbook of Excel

    // add Worksheet to Workbook
    // Workbook contains one or more worksheets
    XLSX.utils.book_append_sheet(wb, WS, "QiunnMetaData");
  });

  // sheetAName is name of Worksheet
  // XLSX.utils.book_append_sheet(wb, pokemonWS, "pokemons");

  // export Excel file
  XLSX.writeFile(wb, `${Date.now()}_Approved_Items.csv`); // name of the file is 'book.xlsx'
};

export const createSpotsFromBoundaries = (objectBoundaries, height, width) => {
  let colorIndex = 0;
  const hotspotButtons = objectBoundaries.map((bd) => {
    const top = ((bd.bbox[1] + bd.bbox[3]) / 2 / height) * 100;
    const left = ((bd.bbox[0] + bd.bbox[2]) / 2 / width) * 100;

    if (!bd.bgColor) colorIndex++;
    return {
      btnStyle: {
        top: `calc(${top}% - 13px)`,
        left: `calc(${left}% - 11px)`,
        background: bd.bgColor || singleColors[colorIndex],
      },
      cropperCoordinates: {
        x: bd.bbox[0],
        y: bd.bbox[1],
        width: bd.bbox[2] - bd.bbox[0],
        height: bd.bbox[3] - bd.bbox[1],
      },
      categoryId: bd.mappedPrId,
      id: bd.id,
      sno: bd.sno,
      // boundingPolyIndex: bd.boundingPolyIndex,
    };
  });

  return hotspotButtons;
};

export const setSNoAndBgColorToBoundaries = (objectBoundaries) => {
  let categorySnoMapper = {},
    currentSno = 1;
  return objectBoundaries.map((bd, index) => {
    if (!bd.bgColor) {
      bd.bgColor = bd.bgColor = singleColors[index];
    }
    if (categorySnoMapper[bd.mappedPrId]) {
      bd.sno = categorySnoMapper[bd.mappedPrId];
    } else {
      categorySnoMapper[bd.mappedPrId] = currentSno;
      bd.sno = currentSno;
      currentSno++;
    }
    return bd;
  });
};
