// var socket = io();

$(function(){

//FINDS USER'S CURRENT FRIENDS
var minlength = 3;

  $('#getfriends').keyup(function(e){
    e.preventDefault();
    var searchString = $(this).val();

      //appends empty li to fill with search results
      if (searchString.length === 1) {
        $('#my-friends').append('<li class="searching"></li>');
      };

      //searches and matches results on each keyup
      if (searchString.length >= minlength ) {
          console.log("getting searchString",  searchString);
        $.ajax({
            method: 'GET',
            url: '/json',
            data: { 'friends.name' : searchString }
        }).done(
        //success
        function(response) {

          //searches for users friends
          if( response.friends.length != 0 ) {
            for (var i = 0; i < response.friends.length; i++) {
              console.log(response.friends[i]);
              $('.searching').html(response.friends[i].name);
              $('.searching').attr('id', response.friends[i].id);
            }

          } //<-- if statement


          //WHEN FRIENDS.LENGTH == 0 ADDS A MESSAGE
          if( response.friends.length == 0 ){
            console.log('you have no friends');
            $('.searching').html("No match found. Make more friends");
            // $('ul').append('<li>No match found. Make more friends</li>');
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
  $('li').click(function(e) {
    console.log(this);
    console.log($(this).prop('id'));
    $friendId = $(this).prop('id');

    $.ajax({
      method: 'GET',
      url: '/json',
    }).done(
      //success
      function(response){
        findOrCreateUserConvo(response);
      },
      //error
      function(err){
        console.log(err);
      });

  });



//findOrCreateUserConvo
function findOrCreateUserConvo(response) {
  console.log('THIS IS THE RESPONSE', response);

  if(response.convo != null) {
    for (var i = 0; i < response.convo.length; i++) {
      if (response.convo[i].id == response.convo[i].id + $friendId.parsInt() || $friendId.parsInt() + response.convo[i].id) {
          console.log("freinds convo match!");
      }
    }
  }else {
    $.ajax ({
      method: POST,
      url: '/createNewConvo',
      data: { data : response }
    });
  }


}; //<--findOrCreateUserConvo



}); //<-- windowonload
