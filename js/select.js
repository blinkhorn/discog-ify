/************************************
//                                  *
//      select.js variables         *
//                                  *
//***********************************/

const spotify_token;

/************************************
//                                  *
//         Release Class            *
//                                  *
//***********************************/
class Release {
  constructor(title, artistName, year) {
    this.title = title;
    this.artistName = artistName;
    this.year = year;
  }
}

/************************************
//                                  *
//      Function Expressions        *
//                                  *
//***********************************/

// Gets parameters from the URL
const urlParams = function getURLParams() {
  let urlParams = {};
  let result;
  let regex = /([^&;=]+)=?([^&;]*)/g; //isolate sections of params separated by '='
  let totalParams = window.location.hash.substring(1); //get rid of hash from params
  while (result = regex.exec(totalParams)) { //while exec finds regex in totalParams
    urlParams[result[1]] = decodeURIComponent(result[2]);
  }
  return urlParams;
}

//prevents duplicate artists from being in the global array. If the array contains
//the artist's name, it returns the position in the array; otherwise it returns null
const containsName = function artistsContainsName(name) {
    for (var i = 0; i < globalArtists.length; i += 1) {
        if (globalArtists[i].name === name) {
            return i;
        }
    }
    return null;
}

//takes the result returned from accessing all label releases from discogs and
//adds them to the global array (duplicate releases aren't allowed)
const aLReleases = function addLabelReleases(discogsResult) {

    $.each(discogsResult.releases, (pos, release) => {

        let releaseTitle = release.basic_information.title;
        let releaseYear = release.basic_information.year;
        let releaseArtists = release.basic_information.artists;
        let releaseArtistName = releaseArtists[0].name;

        //Some artists on Discogs have a number in closing round parenthesis behind their name. We don't want these.
        let splitName = releaseArtistName.split(/([(]\d+[)].*)/);
        let artistName = splitName[0];

        let theRelease = new Release(releaseTitle, artistName, releaseYear);

        let globalArrayPosition = artistsContainsName(releaseArtistName);

        if (globalArrayPosition !== -1) {

            //Get the artist from the global array
            let theArtist = globalArtists[globalArrayPosition];

            //Add this release to the artist's releases, if it's not in the array already
            if (!releasesContainsTitle(theArtist.releases, theRelease.title)) {
                theArtist.releases.push(theRelease);
                totalReleases += 1;
            }

        } else {

            //Create new artist with new release-array and add artist to the global array
            globalArtists.push(new artist(releaseArtistName, new Array(thisRelease)));
            totalReleases += 1;
            totalArtists += 1;

        }

    });
}

/************************************
//                                  *
//          Functionality           *
//                                  *
//***********************************/

$(document).ready(() => {

  const params = getURLParams();
  spotify_token = params.access_token;

});
