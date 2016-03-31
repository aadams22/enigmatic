// var socket = io();

$(function(){

//FINDS USER'S CURRENT FRIENDS
var minlength = 3;

  $('#getfriends').keyup(function(e){
    e.preventDefault();
    var searchString = $(this).val();

      //appends empty li to fill with search results
      if (searchString.length === 3) {
        $('#my-friends').append('<li class="searching"></li>');
      };

      //for the search input searches and matches results on each keyup
      if (searchString.length >= minlength ) {
          console.log("getting searchString",  searchString);
        $.ajax({
            method: 'GET',
            url: '/json',
        }).done(
        //success
        function(response) {

          //searches for currnet user's facebook friends who have liked the app
          if( response.friends.length != 0 ) {
            for (var i = 0; i < response.friends.length; i++) {
              console.log(response.friends[i]);

              $('.searching').html(' ');
              $('.searching').attr(' ');
              if(response.friends[i].name.indexOf(searchString) >= 0){
                $('.searching').html(response.friends[i].name);
                $('.searching').attr('id', response.friends[i].id);
              }else {
                $('.searching').html("No match found. Make more friends");
              }

            }

          } //<-- if statement


          //WHEN FRIENDS.LENGTH == 0 ADDS A MESSAGE
          if( response.friends.length == 0 ){
            console.log('you have no friends');
            $('.searching').html("No match found. Make more friends");
            return false;
          }

        },
        //error
        function(err){
          console.log(err);
        });

      };

  });


  //FINDS OR CREATES NEW USER CONVO
  //this will get information from the json page in order to find if the user
  //already has a conversation with the person.
  $('#my-friends > li').click(function(e) {
    console.log($(this).prop('id'));
    $friendId = $(this).prop('id');

    $.ajax({
      method: 'GET',
      url: '/json',
    }).done(
      //success
      function(response){
        //sends response to findOrCreateUserConvo function to sort through the data
        findOrCreateUserConvo(response);
      },
      //error
      function(err){
        console.log(err);
      });

  });



//this will send data to the server to find or create a new conversation
function findOrCreateUserConvo(response) {
  // console.log('THIS IS THE RESPONSE', response);
  // console.log(response.friends[0]);

  //if the data from the ajax call returns convos then search
  //through them and find one that matches friend's id and current users id
  if(response.convo != null) {
    for (var i = 0; i < response.convo.length; i++) {
      if (response.convo[i].id == response._id + $friendId.parsInt() || $friendId.parsInt() + response._id) {
          console.log("freinds convo match!");
      }
    }
  //if convo doesn't currenlty exist between the two users then send a post request
  //to create one on in the server and save to database.
  }else {
    $.ajax ({
      method: 'POST',
      url: '/createNewConvo',
      data: response.friends[0]
    });
  }


}; //<--findOrCreateUserConvo



}); //<-- windowonload
