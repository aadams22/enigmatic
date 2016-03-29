  // console.log('messanger.js');
var socket = io();


$(function(){
  var $convos = $('#convos');

socket.on('allClients', function(allClients) {
  console.log(allClients);

  $(allClients).each(function(index, value) {
    $convos.append('<li id='+ value + '>' + value + '</li>');
    $('li').click(function() {
      console.log($(this).prop('id'));
      socket.emit('socket-id', $(this).prop('id'));
    });

  });

  socket.on('Private', function(msg) {
    console.log(msg);
  });


});




// // ===========================================
//
//   $('form').submit(function(){
//     socket.emit('chat message', $('#m').val());
//     $('#m').val('');
//     return false;
//   });
//   socket.on('chat message', function(msg){
//     $('#messages').append($('<li>').text(msg));
//   });
//



}) //<--windowonload
