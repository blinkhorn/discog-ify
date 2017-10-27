$(document).ready(() => {

  //turns cursor into hand when hovers over Spotify login button
  $('#login-button').hover(function () {
       $(this).css('cursor', 'pointer');
   });
  // Login
  $('#login-button').click( () => {

    let mykey = d130bae62ec14aedaa24895e76ced81b;
    let redirect_uri = 'https://blinkhorn.github.io/discog-ify/select.html';

    //add state

    let scope = 'playlist-modify-public playlist-modify-private user-read-private';
    let url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(mykey);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    window.location = url;

  });

});
