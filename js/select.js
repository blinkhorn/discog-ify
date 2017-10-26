$(document).ready(() => {

  // Gets parameters from the URL
  const urlParams = function getURLParams() {
    let urlParams = {};
    let result;
    let regex = /([^&;=]+)=?([^&;]*)/g;
    let q = window.location.hash.substring(1); //get rid of hash from
    while (result = regex.exec(q)) {
      urlParams[result[1]] = decodeURIComponent(result[2]);
    }
    return urlParams;
  }

  const params = getURLParams();

});
