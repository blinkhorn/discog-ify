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
let playlistID = null;
let multipleMatches;
let withoutMatches;
let addedCount = 0;
let adedArtistCount = 0;

let userNameDiscogs;

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

// ************WILL IMPLEMENT AFTER MVP COMPLETE *********************
// class Artist {
//   constructor(name, releases) {
//     this.name = name;
//     this.releases = releases;
//   }
// }

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
  console.log(urlParams);
  return urlParams;
};

const params = getURLParams();
spotify_token = params.access_token;
console.log('spotify token:', spotify_token)

// ************WILL IMPLEMENT AFTER MVP COMPLETE *********************
//prevents duplicate artists from being in the global array. If the array contains
//the artist's name, it returns the position in the array; otherwise it returns null
// const containsName = function artistsContainsName(name) {
//   for (var i = 0; i < globalArtists.length; i += 1) {
//     if (globalArtists[i].name === name) {
//       return i;
//     }
//   }
//   return null;
// };

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

// $(document).ready(() => {
//
//   $('.generate-playlist').hover(function () {
//        $(this).css('cursor', 'pointer');
//    });
//
//   const params = getURLParams();
//   spotify_token = params.access_token;
//   //Set exportIsActive to false on page load in the event that the previous
//   //export did not complete
//   exportIsActive = false;
//
//   ///////////REWORK /////////
//   // Check the login state; set usrID, usrCountry, and usrNameSpotify
//   if (spotify_token) {
//     $.ajax({
//       url: 'https://api.spotify.com/v1/me',
//       headers: {
//         'Authorization': 'Bearer ' + spotify_token
//       },
//       success: (response) => {
//
//         // $('#login').hide();
//         // $('#loggedin').show();
//
//         usrID = response.id;
//         usrCountry = response.country;
//         usrNameSpotify = response.display_name;
//         usrImageURL = '';
//         usrImage = '';
//
//         if (response.images[0] != null) {
//           usrImageURL = response.images[0].url;
//         }
//
//         if (usrImageURL !== '') {
//           usrImage = '<img src=""' + usrImageURL + '>'
//         }
//
//         ////BRING BACK vvvvv
//
//         // if (usrNameSpotify === null) {
//         //   $('#loggedin').html(usrImage + '<p> Spotify User: ' + usrID + '</p>');
//         // } else {
//         //   $('#loggedin').html(usrImage + '<p> Spotify User: ' + usrNameSpotify + '</p>');
//         // }
//
//       },
//       error: (xhr, data) => {
//         window.location = 'https://blinkhorn.github.io/discog-ify/select.html';
//       }
//     });
//   } else {
//     window.location = 'https://blinkhorn.github.io/discog-ify/select.html';
//   }
//
//   // Start-Button
//   $('.generate-playlist').click(function() {
//
//     //Prevent starting the export twice
//     if (exportActive == true) {
//       return;
//     } else(exportActive = true);
//
//       //Reset some of the global values when the start-button is clicked
//       globalArtists = [];
//       playlistID = null;
//       multipleMatches = [];
//       withoutMatches = [];
//       addedCount = 0;
//       totalReleases = 0;
//       adedArtistCount = 0;
//
//       labelNameDiscogs = $('.generate-playlist-input').val();
//
//       $('#imageDiv').empty();
//       // $('#progressDiv').removeClass('hide');
//       // updateProgressBar(0);
//
//       //Start after a timeout so the Browser has time to display the changes
//       setTimeout(getCollection, 10, userNameDiscogs, 1);
//     });
//
//     $('.generate-playlist').hover(function() {
//       $(this).css('cursor', 'pointer');
//     });
//
//     // Make the user choose the right release
//     $('#releasesAdded').on('hidden.bs.modal', function(e) {
//       exportMultipleMatches();
//     });
//
//     // And again after the modal has been hidden
//     $('#bestMatch').on('hidden.bs.modal', function(e) {
//       exportMultipleMatches();
//     });
//
//     // Create Playlist
//     $('#collectionFetched').on('hidden.bs.modal', function(e) {
//       createPlaylist();
//     });
//
//     // Set the progress bar to 100% in the end
//     $('#noMatch').on('hidden.bs.modal', function(e) {
//       updateProgressBar(100);
//     });
//   });
