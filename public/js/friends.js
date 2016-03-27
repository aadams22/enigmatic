$(function(){

//FINDS USER'S CURRENT FRIENDS
  var minlength = 3;
  $('#getfriends').keyup(function(){
    var value = $(this).val();

      if (value.length >= minlength ) {
          console.log("getting value",  value);
        // $.ajax({
        //     type: 'GET',
        //     url: '/getfriends',
        //     data: { 'users.friends' : value }
        // }).done(
        // //SUCCESS
        // function(response) {
        //   console.log(response);
        // },
        // //ERROR
        // function(err){
        //   console.log(err);
        // });

      };

  });





}); //<-- windowonload
