$(document).ready(() => {

  //turns cursor into hand when hovers over Spotify login button
  $('#login-button').hover(() => {
    css('cursor', 'pointer');
  });

  // Login
  $("#login").click(function() {

    let mykey = config.MY_KEY;
    let redirect_uri = '#';

    //add state

    let scope = 'playlist-modify-public playlist-modify-private user-read-private';
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(mykey);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    window.location = url;

  });

});
