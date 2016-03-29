$(function(){

//FINDS USER'S CURRENT FRIENDS
  var minlength = 3;
  $('#getfriends').keyup(function(e){
    e.preventDefault();
    var searchString = $(this).val();

      if (searchString.length >= minlength ) {
          console.log("getting searchString",  searchString);
        $.ajax({
            type: 'GET',
            url: '/json',
            data: { 'friends.name' : searchString }
        }).done(
        //success
        function(response) {

          //searches for users friends
          if( response.friends.length != 0 ) {
            for (var i = 0; i < response.friends.length; i++) {
              console.log(response.friends[i]);
              $('ul').append('<li>' + response.friends[i].name + '</li>');
            }.one('click', function(){
              console.log('clicked one');
              //!!need to grab value of the clicked item
              //click creates chat or finds past chat
              findChatOrCreateNew(friend);

              for (var i = 0; i < response.convo.length; i++) {
                console.log('this is convo response: ', response.convo[i])
              }

            });

          } //<-- if statement.


          //==========================================
          //ONLY WORKS FOR SUBMIT, IT APPENDS DURRING KEYUP
          // if( response.friends.length == 0 ){
          //   console.log('you have no friends');
          //
          //   $('ul').append('<li>No match found. Make more friends</li>');
          //   return false;
          // }
          //==========================================


        },
        //error
        function(err){
          console.log(err);
        });

      };

  });



// function findChatOrCreateNew(friend) {
//   console.log('findChatOrCreateNew has been accessed: ', friend);
//
//
// } //<--findChatOrCreateNew



}); //<-- windowonload
