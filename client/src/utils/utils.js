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

export const searchResultsReducer = (finalResult, tag) => {
  const actionWithVisualSearchResults = tag.actions?.find(
    (action) =>
      action.actionType == `ProductVisualSearch` ||
      action.actionType == "VisualSearch"
  );
  return actionWithVisualSearchResults?.data
  ? actionWithVisualSearchResults?.data.value.filter(value => {
    return value.hostPageUrl.includes("product")
 })
    : finalResult;
};

export const isInt = (data) => {
  return data === parseInt(data, 10);
}

function saveInput(){
  console.log('Saving data');
}