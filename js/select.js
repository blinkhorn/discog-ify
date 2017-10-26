/************************************
//                                  *
//      select.js variables         *
//                                  *
//***********************************/

let spotify_token = null;
let globalArtists = [];
let globalLabels = [];
let totalReleases = 0;
let totalLabels = 0;

/************************************
//                                  *
//         Release Class            *
//                                  *
//***********************************/
class Release {
  constructor(title, artistName, year, label) {
    this.title = title;
    this.artistName = artistName;
    this.year = year;
    this.label;
  }
}

class Artist {
  constructor(name, releases) {
    this.name = name;
    this.releases = releases;
  }
}

class Label {
  constructor(name, releases) {
    this.name = name;
    this.releases = releases;
  }
}
/************************************
//                                  *
//      Function Expressions        *
//                                  *
//***********************************/

// Gets parameters from the URL
function getURLParams() {
  let urlParams = {};
  let result;
  let regex = /([^&;=]+)=?([^&;]*)/g; //isolate sections of params separated by '='
  let totalParams = window.location.hash.substring(1); //get rid of hash from params
  while (result = regex.exec(totalParams)) { //while exec finds regex in totalParams
    urlParams[result[1]] = decodeURIComponent(result[2]);
  }
  return urlParams;
};

//prevents duplicate artists from being in the global array. If the array contains
//the artist's name, it returns the position in the array; otherwise it returns null
const containsName = function artistsContainsName(name) {
    for (var i = 0; i < globalArtists.length; i += 1) {
        if (globalArtists[i].name === name) {
            return i;
        }
    }
    return null;
};

//prevents duplicate labels from being in the global array. If the array contains
//the label's name, it returns the position in the array; otherwise it returns null
const containsLabel = function labelsContainsName(name) {
    for (var i = 0; i < globalLabels.length; i += 1) {
        if (globalLabels[i].name === name) {
            return i;
        }
    }
    return null;
};

//takes the result returned from accessing all label releases from discogs and
//adds them to the global array (duplicate releases aren't allowed)
const aLReleases = function addLabelReleases(discogsResult) {

    $.each(discogsResult.releases, (release) => {

        let releaseTitle = release.title;
        let releaseYear = release.year;
        let releaseArtists = release.artists;
        let releaseArtistName = releaseArtists[0].name;
        let releaseLabelName = release.label;

        //Some artists/labels on Discogs have a number in closing round
        //parenthesis behind their name — we prevent these here
        let splitName = releaseArtistName.split(/([(]\d+[)].*)/);
        let artistName = splitName[0];
        let splitLabel = releaseLabelName.split(/([(]\d+[)].*)/);
        let releaseLabel = splitLabel[0];

        let theRelease = new Release(releaseTitle, artistName, releaseYear, label);

        //find the position of the
        let globalArrayPosition = labelsContainsName(releaseLabelName);

        if (globalArrayPosition === null) {

          //Create new label with new label-array and add artist to the global array
          globalLabels.push(new Label(releaseLabel, new Array(theRelease)));
          totalReleases += 1;
          totalLabels += 1;


        } else {
            //Access label from the global array
            let theLabel = globalLabels[globalArrayPosition];

            //Add this release to the label's releases
                theLabel.releases.push(theRelease);
                totalReleases += 1;
        }
    });
};

/************************************
//                                  *
//          Functionality           *
//                                  *
//***********************************/

$(document).ready(() => {

  const params = getURLParams();
  spotify_token = params.access_token;

});
