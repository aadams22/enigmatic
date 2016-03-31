  // console.log('messanger.js');
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
        var onlineUserListId = $(this).prop('id').split('/');
        var onlineUserId = onlineUserListId[0];
        console.log(onlineUserId)
        var onlineUserSocketId = '/' + onlineUserListId[1];
        console.log(onlineUserSocketId)
        // window.location.assign("http://localhost:8080/messanger#" + onlineUserSocketId);
        $.ajax({
          method: 'POST',
          url: '/createNewConvo',
          data: { id: onlineUserId }
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



if(true) {
    $.ajax({
      method: 'GET',
      url: '/json',
      timeout: 1000
    }).done(
    //success
    function(response){
      addName(response);
    },
    //error
    function(err){
      console.log(err);
    });



}









// // ===========================================






}) //<--windowonload
