// ===========================================
// Sockets functionality
// ===========================================
$(function(){
  // console.log('messanger.js is accessed');


  var socket = io();
  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
  });


}) //<--windowonload
