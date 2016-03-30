  // console.log('messanger.js');
var socket = io();


$(function(){
  var $convos = $('#convos');



function addName(name){

  socket.on('allClients', function(allClients) {
    console.log(allClients);
    console.log(name);
    var userName = name;
    $(allClients).each(function(index, value) {
      $convos.append('<li id='+ value + '>' + userName + '</li>');

      $('#my-friends > li').click(function() {
        // console.log($(this).prop('id'));
        socket.emit('socket-id', $(this).prop('id'));
      });

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
      timeout: 4000
    }).done(
    //success
    function(response){
      console.log(response);
      console.log('THIS IS THE NAME FROM getNAME: ', response.userProfile.displayName);
      addName(response.userProfile.displayName);
    },
    //error
    function(err){
      console.log(err);
    });



}






















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
