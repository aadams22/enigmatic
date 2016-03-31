  // console.log('messanger.js');
var socket = io();


$(function(){
  var $convos = $('#convos');

var onlineUsers = [];

function addName(name){

  socket.on('allClients', function(allClients) {
    console.log(allClients);
    //defines online user's name
    var userName = name;
    console.log("THIS IS ONLINE USERS", onlineUsers);

    //need to make sure a person isn't allowed to be added twice to either client array
      $(allClients).each(function(index, value) {
        if($.inArray(userName, onlineUsers) == -1) {
        //adds user to online user list with socket id as id
        $convos.append('<li id='+ value + '>' + userName + '</li>');
        onlineUsers.push(userName);
        console.log("THIS IS SECOND onlineUsers", onlineUsers);
      }

      $('#convos > li').click(function() {
        var onlineUserSocketId = $(this).prop('id');
        window.location.assign("http://localhost:8080/messanger#" + onlineUserSocketId);
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
      addName(response.userProfile.displayName);
    },
    //error
    function(err){
      console.log(err);
    });



}









// // ===========================================






}) //<--windowonload
