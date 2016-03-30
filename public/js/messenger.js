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
        var onlineUserId = $(this).prop('id');
        window.location.assign("http://localhost:8080/messanger#chatOnMessanger(" + onlineUserId + ")");
      });

      if(window.location.hash) {
        console.log("this is the window.location.hash sub: ", window.location.hash.substr(1))
        eval(window.location.hash.substr(1));
      }


      function chatOnMessanger(onlineUserId){
        console.log('chatOnMessanger accessed');

        console.log('chatOnMessanger accessed after location');
        console.log("this is online user's id from onclcik", onlineUserId);
        socket.emit('socket-id', onlineUserId);

        $('form').submit(function(){
          socket.emit('chat message', $('#m').val());
          $('#m').val('');
          return false;
        });
        socket.on('chat message', function(msg){
          $('#messages').append($('<li>').text(msg));
        });

      }


    });

    socket.on('Private', function(msg) {
      console.log(msg);
    });

  });

}; //<--addName





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
