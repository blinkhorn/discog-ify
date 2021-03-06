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
let withoutMatches;
let addedCount = 0;
let adedArtistCount = 0;
let exportIsActive = false;
let usrID = '';
let usrCountry = '';
let usrNameSpotify = '';
let usrImageURL = '';
let usrImage = '';
let labelName = 'Better Listen';

let labelNameDiscogs;

/************************************
//                                  *
//        Class Definitions         *
//                                  *
//***********************************/
class Release {
  constructor(title, artistName, year) {
    this.title = title;
    this.artistName = artistName;
    this.year = year;
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
//      Global Class instance       *
//                                  *
//***********************************/
var theLabel = new Label(labelName, (releases = []));

/************************************
//                                  *
//      Function Expressions        *
//                                  *
//***********************************/

function requestAllWithDelay(urls, delay) {
  return urls.reduce((promise, url) => {
    return promise.then(responses => {
      return fetch(url)
        .then(res => res.json())
        .then(response => {
          return new Promise(resolve => {
            setTimeout(resolve, delay, responses.concat(response));
          });
        });
    });
  }, Promise.resolve([]));
}

//converts first letter of each word to uppercase
function toUpperCase(str) {
  return str
    .split(' ')
    .map(word => {
      return word[0].toUpperCase() + word.substr(1);
    })
    .join(' ');
}

// Gets parameters from the URL
function getURLParams() {
  let urlParams = {};
  let result;
  let regex = /([^&;=]+)=?([^&;]*)/g; //isolate sections of params separated by '='
  let totalParams = window.location.hash.substring(1); //get rid of hash from params
  while ((result = regex.exec(totalParams))) {
    //while exec finds regex in totalParams
    urlParams[result[1]] = decodeURIComponent(result[2]);
  }
  return urlParams;
}

const params = getURLParams();
// spotify_token = params.access_token;
spotify_token = params.access_token;

//takes the result returned from accessing all label releases from discogs and
//adds them to the global array (duplicate releases aren't allowed)
function identifyLabelResults(discogsResult) {
  const requestUrls = [];
  const releaseTitles = [];
  $.each(discogsResult.results, (pos, results) => {
    let resultType = results.type;
    let resultID = results.id;
    let resultTitle = results.title;

    // let releaseArtistName = releaseArtists[0].name;

    //Some artists on Discogs have a number in closing round
    //parenthesis behind their name — I prevent these here
    if (resultType === 'release') {
      //searches for the result on discogs using its ID if it's a release
      requestUrls.push(`https://api.discogs.com/releases/${resultID}`);
      releaseTitles.push(resultTitle);
    }
  });
  searchReleaseDiscogs(requestUrls);
}
/** Entry point for search function. Fetches the label entered from Discogs */
function searchReleaseDiscogs(reqUrls) {
  console.time('searchRelease');
  requestAllWithDelay(reqUrls, 3000)
    .then(results => {
      for (let item in results) {
        let releaseArtist = results[item].artists[0].name;
        let releaseYear = results[item].year;
        let releaseTitle = results[item].title;
        let theRelease = new Release(releaseTitle, releaseArtist, releaseYear);
        //push the release onto theLabel and increment totalReleases
        theLabel.releases.push(theRelease);
        totalReleases += 1;
      }

      labelNameDiscogs = toUpperCase(labelNameDiscogs);

      if (labelNameDiscogs.match(/s$/) == 's') {
        playlistName = labelNameDiscogs + "' Complete Discography";
      } else {
        playlistName = labelNameDiscogs + "'s Complete Discography";
      }

      $('#discographyFetchedText').html(
        'We fetched a total of ' +
          totalReleases +
          ' releases from the ' +
          labelNameDiscogs +
          ' discography.<br /><br />For the next step, we will create the playlist "' +
          playlistName +
          '" in your Spotify account and start filling it with the releases from the ' +
          labelNameDiscogs +
          ' discography.'
      );
      $('#discographyFetched').modal('show');
    })
    .catch(console.error);
  // $.ajax({
  //   url: 'https://api.discogs.com/releases/' + releaseID,
  //   type: 'GET',
  //   success: function(result) {
  // let releaseArtist = result.artists[0].name;
  // let releaseYear = result.year;
  // let theRelease = new Release(releaseTitle, releaseArtist, releaseYear);
  // //push the release onto theLabel and increment totalReleases
  // theLabel.releases.push(theRelease);
  // totalReleases += 1;

  // labelNameDiscogs = toUpperCase(labelNameDiscogs);

  // if (labelNameDiscogs.match(/s$/) == 's') {
  //   playlistName = labelNameDiscogs + "' Complete Discography";
  // } else {
  //   playlistName = labelNameDiscogs + "'s Complete Discography";
  // }

  // $('#discographyFetchedText').html(
  //   'We fetched a total of ' +
  //     totalReleases +
  //     ' releases from the ' +
  //     labelNameDiscogs +
  //     ' discography.<br /><br />For the next step, we will create the playlist "' +
  //     playlistName +
  //     '" in your Spotify account and start filling it with the releases from the ' +
  //     labelNameDiscogs +
  //     ' discography.'
  // );
  // $('#discographyFetched').modal('show');
  //   },
  //   error: function(xhr, data) {
  //     if (xhr.status == 404) {
  //       $('#errorModalText').html('Unknown Record Label. Please try again.');
  //       $('#errorModal').modal('show');
  //     } else if (xhr.status == 0) {
  //       $('#waiting').show();

  //       //Wait a 'few' seconds, then try again
  //       setTimeout(function() {
  //         searchLabelDiscogs(labelName);
  //       }, 61000);
  //     } else if (xhr.status == 401) {
  //       $('#errorModalText').html(
  //         "We couldn't fetch this Discography from Discogs. Please double check that the label is on Discogs."
  //       );
  //       $('#errorModal').modal('show');
  //     } else {
  //       $('#errorModalText').html(
  //         'Something went wrong while fetching the discography: ' +
  //           xhr.status +
  //           '. Please try again.'
  //       );
  //       $('#errorModal').modal('show');
  //     }
  //   }
  // });
  console.timeEnd('searchRelease');
}

function encodeURIfix(str) {
  return encodeURIComponent(str).replace(/!/g, '%21');
}

/** Creates a new playlist in the user's Spotify account, using the Discogs username */
function createPlaylist() {
  fetch(
    'https://api.spotify.com/v1/users/' + encodeURIfix(usrID) + '/playlists',
    {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + spotify_token
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // no-referrer, *client
      body: JSON.stringify({ name: playlistName, public: true }) // body data type must match "Content-Type" header
    }
  )
    .then(res => res.json())
    .then(response => {
      return new Promise(resolve => {
        // setTimeout(resolve, delay, responses.concat(response));
        console.log('response', response);
        playlistID = response.id;
        exportToSpotify();
      });
    })
    .catch(console.error);

  // $.ajax({
  //   url:
  //     'https://api.spotify.com/v1/users/' + encodeURIfix(usrID) + '/playlists',
  //   headers: {
  //     Authorization: 'Bearer ' + spotify_token
  //   },
  //   data: JSON.stringify({ name: playlistName, public: true }),
  //   type: 'POST',
  //   contentType: 'application/json; charset=utf-8',
  //   dataType: 'json',
  //   success: function(result) {
  //     playlistID = result.id;

  //     // updateProgressBar(20);

  //     exportToSpotify();
  //   },
  //   error: function(request, xhr, data) {
  //     errorJSON = request.responseJSON;
  //     message = errorJSON.error.message;

  //     $('#errorModalText').html(
  //       'Something went wrong while creating a Spotify playlist: ' +
  //         xhr.status +
  //         '. Please try again. (' +
  //         message +
  //         ')'
  //     );
  //     $('#errorModal').modal('show');
  //   }
  // })
}
/** Gets the next artist from the global array and exports the artist's releases to Spotify */
function exportToSpotify() {
  if (theLabel.releases.length > 0) {
    // var artist = globalArtists[0];
    // globalArtists.splice(0, 1);

    // var releases = artist.releases;

    $.each(theLabel.releases, function(pos, release) {
      console.log('In EACH release in exportToSpotify — RELEASE:', release);
      searchReleaseOnSpotify(release);
    });

    // adedArtistCount++;

    //Update Progress AND export next artist
    // updateProgress();
  } else {
    //   $('#releasesAddedText').empty();
    //   $('#releasesAddedText').append(addedCount + " releases were already added to your Spotify playlist automatically. ");
    //
    //   if (multipleMatches.length === 1) {
    //     $('#releasesAddedText').append("For the next release, we will need a little help from you.");
    //   } else if (multipleMatches.length >= 1) {
    //     $('#releasesAddedText').append("For the following " + multipleMatches.length + " releases, we will need a little help from you.");
    //   }
    //
    //   $("#releasesAdded").modal('show');
    //
  }
}
/** If there are releases with multiple possible matches, we display a modal to make the user decide
 * which is the right one */
// function exportMultipleMatches() {
//   if (multipleMatches.length > 0) {
//     var match = multipleMatches[0];

//     multipleMatches.splice(0, 1);

//     $('#bestMatchHeader').empty();
//     $('#spotifyDiv').empty();

//     var release = match.release;
//     var yearString = release.year != 0 ? ' (' + release.year + ')' : '';

//     $('#bestMatchHeader').html(
//       "<h4 class='modal-title'>Choose the best match for <b>" +
//         release.title +
//         '</b> by ' +
//         release.artistName +
//         yearString +
//         '</h4>'
//     );

//     var matches = match.matches;

//     $.each(matches, function(pos, album) {
//       var name = album.name;
//       var albumID = album.id;
//       var imageURL = '../record.png';

//       if (album.images.length !== 0) {
//         imageURL = album.images[0].url;
//       }

//       $('#spotifyDiv').append(
//         '<div><img src="' +
//           imageURL +
//           '" width="20%" style="display:inline-block; margin:10px; vertical-align:top"><div style="display:inline-block; width:70%"><h4>' +
//           album.name +
//           '</h4><button id="' +
//           albumID +
//           ' ' +
//           imageURL +
//           '" type="button" class="btn btn-success" onClick = "saveAlbumFromMulti(this.id)"><span class="icon-checkmark"></span> Choose this</button></div></div>'
//       );
//     });

//     $('#noMatchButton').html(
//       '<span class="icon-cancel-circle"></span> None of the above'
//     );

//     $('#bestMatch').modal('show');
//   } else {
//     updateProgressBar(90);
//     showNoMatch();
//   }
// }

/** Reacts to the button in the modal and saves the chosen release to the playlist */
function saveAlbumFromMulti(idAndURL) {
  $('#bestMatch').modal('hide');

  var seperated = idAndURL.split(' ');

  saveAlbumToPlaylist(seperated[0], seperated[1]);
}

/** Displays the modal with all releases without a match on Spotify. End of the export. */
function showNoMatch() {
  $('#noMatchDiv').empty();

  if (withoutMatches.length > 0) {
    $('#noMatchDiv').append('<ul>');

    $.each(withoutMatches, function(pos, release) {
      $('#noMatchDiv').append(
        '<li><b>' +
          release.artistName +
          '</b>: ' +
          release.title +
          ' (' +
          release.year +
          ')' +
          '  </li>'
      );
    });

    $('#noMatchDiv').append('</ul>');

    $('#noMatch').modal('show');
    exportIsActive = false;
  }
}

/** Start a search on Spotify and handle the result */
function searchReleaseOnSpotify(release) {
  var rTitle = release.title.replace(`${release.artistName} - `, '');

  console.log('rTitle is:', rTitle);
  console.log('artistName is:', release.artistName);

  if (rTitle.endsWith('EP') || rTitle.endsWith('LP')) {
    rTitle = rTitle.slice(0, -2).trim();
  }

  var query = 'album:"' + rTitle + '" artist:"' + release.artistName + '"';

  // console.log('IN searchReleaseOnSpotify. Release QUERY:', query);
  fetch(
    `https://api.spotify.com/v1/search?q=${query}&type=album&market=${usrCountry}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + spotify_token
      }
    }
  )
    .then(res => res.json())
    .then(response => {
      return new Promise(resolve => {
        // setTimeout(resolve, delay, responses.concat(response));
        console.log('response', response);
        handleResultFromSpotify(response, release);
      });
    })
    .catch(console.error);
  // $.ajax({
  //   url: 'https://api.spotify.com/v1/search',
  //   // url: 'https://api.spotify.com/v1/search?q=album:' + rTitle + '&artist:' + release.artistName + '&type=album',
  //   headers: {
  //     Authorization: 'Bearer ' + spotify_token
  //   },
  //   data: {
  //     q: query,
  //     type: 'album',
  //     market: usrCountry
  //   },
  //   type: 'GET',
  //   success: function(result, err) {
  //     console.log('about to handleResultFromSpotify. ERROR:', err);
  //     console.log('about to handleResultFromSpotify. RESULT:', result);
  //     // console.log('about to handleResultFromSpotify. RELEASE:', release);
  //     handleResultFromSpotify(result, release);
  //   },
  //   error: function(request, xhr, data) {
  //     $('#errorModalText').html(
  //       'Something went wrong while searching on Spotify: ' +
  //         xhr.status +
  //         '. Please try again.'
  //     );
  //     $('#errorModal').modal('show');
  //   },
  //   async: false
  // });
}

/** Decides if any album from the Spotify-result is a perfect match for the given release,
 * or if the user has to choose the right one manually */
function handleResultFromSpotify(result, release) {
  //Possible matches
  var items = result.albums.items;

  console.log(
    'In handleResultFromSpotify: result.albums.items (or items)',
    result
  );
  //nothing found
  if (items.length === 0) {
    withoutMatches.push(release);
    return;
  }

  var done = false;

  //Loop to find exact matches
  $.each(items, function(pos, album) {
    var name = album.name;

    //exact match
    if (!done && name.toLowerCase() === release.title.toLowerCase()) {
      done = true;

      var albumID = album.id;
      var imageURL = '../record.png';

      if (album.images.length !== 0) {
        imageURL = album.images[0].url;
      }

      saveAlbumToPlaylist(albumID, imageURL);

      return;
    }
  });

  //One and only match - hope it's the right one
  if (!done && items.length === 1) {
    done = true;
    var album = items[0];

    var albumID = album.id;
    var imageURL = '../record.png';

    if (album.images.length !== 0) {
      imageURL = album.images[0].url;
    }

    saveAlbumToPlaylist(albumID, imageURL);

    return;
  }

  //More than one possible match - let the user decide
  // if (!done && items.length > 1) {
  //   var m = new MultipleMatch(release, items);
  //   multipleMatches.push(m);

  //   done = true;
  //   return;
  // }
}

/** Gets an album's tracks and has them saved to the playlist. Adds the cover to the site */
function saveAlbumToPlaylist(albumID, imageURL) {
  console.log('saveAlbumToPlaylist: albumID', albumID);
  return fetch(
    `https://api.spotify.com/v1/albums/${albumID}/tracks?market=${usrCountry}`,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + spotify_token
      }
    }
  )
    .then(res => res.json())
    .then(response => {
      return new Promise(resolve => {
        // setTimeout(resolve, delay, responses.concat(response));
        saveAlbumTracks(response);
      });
    })
    .catch(console.error);
}

/** Saves tracks to the playlist */
function saveAlbumTracks(tracks) {
  console.log('IN saveAlbumTracks: TRACKS', tracks);

  var spotifyURIs = [];

  $.each(tracks.items, function(pos, item) {
    spotifyURIs.push(item.uri);
  });
  return fetch(
    `https://api.spotify.com/v1/users/${encodeURIfix(
      usrID
    )}/playlists/${playlistID}/tracks?uris=${spotifyURIs}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + spotify_token
      }
    }
  )
    .then(res => res.json())
    .then(response => {
      return new Promise(resolve => {
        // setTimeout(resolve, delay, responses.concat(response));
        addedCount++;
      });
    })
    .catch(console.error);
  // return $.ajax({
  //   url:
  //     'https://api.spotify.com/v1/users/' +
  //     encodeURIfix(usrID) +
  //     '/playlists/' +
  //     playlistID +
  //     '/tracks',
  //   headers: {
  //     Authorization: 'Bearer ' + spotify_token
  //   },
  //   data: JSON.stringify({ uris: spotifyURIs }),
  //   type: 'POST',
  //   contentType: 'application/json; charset=utf-8',
  //   dataType: 'json',
  //   success: function(result) {
  //     addedCount++;
  //   },
  //   error: function(request, xhr, data) {
  //     $('#errorModalText').html(
  //       'Something went wrong while saving the tracks to your playlist: ' +
  //         xhr.status +
  //         '. Please try again.'
  //     );
  //     $('#errorModal').modal('show');
  //   },
  //   async: false
  // });
}

/** Gets parameters from the hash of the URL */
function getHashParams() {
  var hashParams = {};
  var e,
    r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
  while ((e = r.exec(q))) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
}

/** Update the progressbar to the given number in percent */
function updateProgressBar(percent) {
  percent = Math.round(percent);

  $('.progress-bar')
    .css('width', percent + '%')
    .attr('aria-valuenow', percent);
  $('#progressNumber').html(percent + '%');
}

/** Entry point for search function. Fetches the label entered from Discogs */
function searchLabelDiscogs(labelName, page) {
  fetch(
    `https://api.discogs.com/database/search?label=${labelName}&page=${page}&per_page=100&key=lBpUvlqVdhpEmETyEQET&secret=rIRyCFQWBchoSLrneGdbHSADEbytHkKU`
  )
    .then(res => res.json())
    .then(response => {
      return new Promise(resolve => {
        identifyLabelResults(response);

        var currentPage = response.pagination.page;
        var pages = response.pagination.pages;

        //next page
        if (currentPage < pages) {
          console.log('length', pages.length);
          console.log('pages', pages);

          var currentProgress = (currentPage / pages) * 20;
          updateProgressBar(currentProgress);

          var nextPage = currentPage + 1;

          //Continue after a timeout so the progress gets updated
          setTimeout(searchLabelDiscogs, 500, labelName, nextPage);
        } else {
          //When all pages are loaded, the progress must be 20%
          updateProgressBar(20);

          if (labelNameDiscogs.match(/s$/) == 's') {
            playlistName = labelNameDiscogs + "' Complete Discography";
          } else {
            playlistName = labelNameDiscogs + "'s Complete Discography";
          }

          $('#discographyFetchedText').html(
            'We fetched a total of ' +
              totalReleases +
              ' releases from the ' +
              labelNameDiscogs +
              ' discography.<br /><br />For the next step, we will create the playlist "' +
              playlistName +
              '" in your Spotify account and start filling it with the releases from the ' +
              labelNameDiscogs +
              ' discography.'
          );
          $('#discographyFetched').modal('show');
        }
      });
    })
    .catch(console.error);
  // $.ajax({
  //   url:
  //     'https://api.discogs.com/database/search?label=' +
  //     labelName +
  //     '&page=' +
  //     page +
  //     '&per_page=100&key=lBpUvlqVdhpEmETyEQET&secret=rIRyCFQWBchoSLrneGdbHSADEbytHkKU',
  //   type: 'GET',
  //   success: function(result) {
  //     identifyLabelResults(result);

  //     var currentPage = result.pagination.page;
  //     var pages = result.pagination.pages;

  //     //next page
  //     if (currentPage < pages) {
  //       console.log('length', pages.length);
  //       console.log('pages', pages);

  //       var currentProgress = (currentPage / pages) * 20;
  //       updateProgressBar(currentProgress);

  //       var nextPage = currentPage + 1;

  //       //Continue after a timeout so the progress gets updated
  //       setTimeout(searchLabelDiscogs, 500, labelName, nextPage);
  //     } else {
  //       //When all pages are loaded, the progress must be 20%
  //       updateProgressBar(20);

  //       if (labelNameDiscogs.match(/s$/) == 's') {
  //         playlistName = labelNameDiscogs + "' Complete Discography";
  //       } else {
  //         playlistName = labelNameDiscogs + "'s Complete Discography";
  //       }

  //       $('#discographyFetchedText').html(
  //         'We fetched a total of ' +
  //           totalReleases +
  //           ' releases from the ' +
  //           labelNameDiscogs +
  //           ' discography.<br /><br />For the next step, we will create the playlist "' +
  //           playlistName +
  //           '" in your Spotify account and start filling it with the releases from the ' +
  //           labelNameDiscogs +
  //           ' discography.'
  //       );
  //       $('#discographyFetched').modal('show');
  //     }
  //   },
  //   error: function(xhr, data) {
  //     if (xhr.status == 404) {
  //       $('#errorModalText').html('Unknown Record Label. Please try again.');
  //       $('#errorModal').modal('show');
  //     } else if (xhr.status == 0) {
  //       $('#waiting').show();

  //       //Wait a 'few' seconds, then try again
  //       setTimeout(searchLabelDiscogs, 61000, labelName, page);
  //     } else if (xhr.status == 401) {
  //       $('#errorModalText').html(
  //         "We couldn't fetch this Discography from Discogs. Please double check that the label is on Discogs."
  //       );
  //       $('#errorModal').modal('show');
  //     } else {
  //       $('#errorModalText').html(
  //         'Something went wrong while fetching the discography: ' +
  //           xhr.status +
  //           '. Please try again.'
  //       );
  //       $('#errorModal').modal('show');
  //     }
  //   }
  // });
}
/************************************
//                                  *
//          Functionality           *
//                                  *
//***********************************/

$(document).ready(() => {
  $('#search-labels').hover(function() {
    $(this).css('cursor', 'pointer');
  });

  const params = getURLParams();
  spotify_token = params.access_token;

  //Set exportIsActive to false on page load in the event that the previous
  //export did not complete
  exportIsActive = false;

  // Check the login state; set usrID, usrCountry, and usrNameSpotify
  if (spotify_token) {
    fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + spotify_token
      }
    })
      .then(res => res.json())
      .then(response => {
        return new Promise(resolve => {
          usrID = response.id;
          usrCountry = response.country;
          usrNameSpotify = response.display_name;
          usrImageURL = '';
          usrImage = '';

          if (response.images[0] != null) {
            usrImageURL = response.images[0].url;
          }

          if (usrImageURL !== '') {
            usrImage = '<img src=""' + usrImageURL + '>';
          }
        });
      })
      .catch(console.error);

    // $.ajax({
    //   url: 'https://api.spotify.com/v1/me',
    //   headers: {
    //     Authorization: 'Bearer ' + spotify_token
    //   },
    //   success: response => {
    //     // $('#login').hide();
    //     // $('#loggedin').show();

    //     usrID = response.id;
    //     usrCountry = response.country;
    //     usrNameSpotify = response.display_name;
    //     usrImageURL = '';
    //     usrImage = '';

    //     if (response.images[0] != null) {
    //       usrImageURL = response.images[0].url;
    //     }

    //     if (usrImageURL !== '') {
    //       usrImage = '<img src=""' + usrImageURL + '>';
    //     }

    ////BRING BACK

    // if (usrNameSpotify === null) {
    //   $('#loggedin').html(usrImage + '<p> Spotify User: ' + usrID + '</p>');
    // } else {
    //   $('#loggedin').html(usrImage + '<p> Spotify User: ' + usrNameSpotify + '</p>');
    // }
    //   },
    //   error: (xhr, data) => {
    //     // window.location = 'https://blinkhorn.github.io/discog-ify/select.html';
    //     console.error(data);
    //   }
    // });
  } else {
    window.location = 'https://blinkhorn.github.io/discog-ify/select.html';
  }

  //Search Start Button
  $('#search-labels').click(function(e) {
    e.preventDefault();
    // console.log('clicked');
    //Prevent starting the export twice
    if (exportIsActive === true) {
      return;
    } else {
      exportIsActive = true;

      //Reset some of the global values when the start-button is clicked
      globalArtists = [];
      playlistID = null;
      // multipleMatches = [];
      withoutMatches = [];
      addedCount = 0;
      totalReleases = 0;
      adedArtistCount = 0;

      labelNameDiscogs = $('#GET-label-search')
        .val()
        .toLowerCase();

      // $('#imageDiv').empty();
      // $('#progressDiv').removeClass('hide');
      // updateProgressBar(0);

      //Start after a timeout so the Browser has time to display the changes
      setTimeout(function() {
        searchLabelDiscogs(labelNameDiscogs);
      }, 1000);
    }
  });

  // // Make the user choose the right release
  // $('#releasesAdded').on('hidden.bs.modal', function(e) {
  //   exportMultipleMatches();
  // });

  // // And again after the modal has been hidden
  // $('#bestMatch').on('hidden.bs.modal', function(e) {
  //   exportMultipleMatches();
  // });

  // Create Playlist
  $('#discographyFetched').on('hidden.bs.modal', function(e) {
    createPlaylist();
  });

  // Set the progress bar to 100% in the end
  $('#noMatch').on('hidden.bs.modal', function(e) {
    updateProgressBar(100);
  });
});
