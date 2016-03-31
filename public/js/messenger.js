
var socket = io();


$(function(){
  var $convos = $('#convos');

var onlineUsers = [];

function addName(response){

  socket.on('allClients', function(allClients) {
    console.log(allClients);
    //defines online user's name
    var userName = response.userProfile.displayName;

    //need to make sure a person isn't allowed to be added twice to either client array
      $(allClients).each(function(index, value) {

        //gives online user's id: userId and current socket.id
        var newId = response._id + value;
        if($.inArray(userName, onlineUsers) == -1) {

        //adds user to online user list with socket id as id
        $convos.append('<li id='+ newId + '>' + userName + '</li>');
        onlineUsers.push(userName);
        // console.log("THIS IS SECOND onlineUsers", onlineUsers);
      }

      $('#convos > li').click(function() {
        //the id from the clicked <li> 0 is equivilant to the user's personal id
        //this id will be sent to server side to find if the user already has a conversation
        //or to make a new conversation
        var onlineUserId = $(this).prop('id').split('/')[0];

        //the id from the clicked <li> 0 is equivilant to the user's current socket id
        //this id is used for the private messaging at /messenger
        var onlineUserSocketId = '/' + $(this).prop('id').split('/')[1];

        //THIS IS FOR TESTING PURPOSES ONLY IN ORDER TO NOT OVERPOPULATE MY DATABASE
        window.location.assign("http://localhost:8080/messanger#" + onlineUserSocketId);

        //sends data to server to find or create new conversation and redirect to /messenger
        $.ajax({
          method: 'POST',
          url: '/createNewConvo',
          data: { id: onlineUserId,  socketId: onlineUserSocketId }
        });


      });

    });
  });
}; //<--addName

  var onlineUserSocketId = window.location.hash.substring(1);

  $('form').submit(function(){
    socket.emit('socket-id', onlineUserSocketId, $('#m').val());
    $('#m').val('');
    return false;
  });


  socket.on('Private', function(msg){
    console.log('THIS IS PRIVATE MESSAGE: ', msg);
    $('#messages').append($('<li>').text(msg));
  });


//an ajax call set on a timeout to refresh online user list
if(true) {
    $.ajax({
      method: 'GET',
      url: '/json',
      timeout: 1000
    }).done(
    //success
    function(response){
      //sends response to addName to be handled
      addName(response);
    },
    //error
    function(err){
      console.log(err);
    });



}















}) //<--windowonload
