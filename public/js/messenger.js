
var socket = io();


$(function(){
  var $convos = $('#convos');

var onlineUsers = [];

function onlineUsersChat(response){

  socket.on('allClients', function(allClients) {
    console.log(allClients);
    //defines online user's name
    var userName = response.userProfile.displayName;
    socket.emit('get-name', userName);
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
        console.log('ONLINE USER ID: ', onlineUserId);
        //the id from the clicked <li> 0 is equivilant to the user's current socket id
        //this id is used for the private messaging at /messenger
        var onlineUserSocketId = '/' + $(this).prop('id').split('/')[1];
        console.log('ONLINE USER SOCKET ID: ', onlineUserSocketId);
        var onlineUserName = $(this).text();
        //clears previous conversation's socket id from window.location url
        window.location.hash = '';
        //adds conversation's socket id into window.location url to be accessed later
        window.location.hash = onlineUserSocketId;

        $.ajax({
          method: 'GET',
          url: '/json'
        }).done(
          function(response) {
            //checks for convos
            if (response.convos.length == 0) {
              console.log('NO CONVOS!');
              addNewConvo(onlineUserSocketId, onlineUserId, onlineUserName);
            }else {
              matchOldConvoToIds(response.convos, response._id, onlineUserId);
            }
          },
          function(err) {
            // console.log(err);
          }
        );

        //sends the post request with user id and socket id to server to create a new convo for users
        function addNewConvo(onlineUserSocketId, onlineUserId, onlineUserName) {
          // sends data to server to find or create new conversation and redirect to /messenger
          $.ajax({
            method: 'POST',
            url: '/createNewConvo',
            data: {
                  'id': onlineUserId,
                  'socketId': onlineUserSocketId,
                  'name': onlineUserName
                  }
          });
        } //<--addNewConvo

        //populates current chat messanger with old conversation data;
        function matchOldConvoToIds(convo, myId, onlineUserId) {
          //empties chat box of messages from previous convos with other users
          $('#messages').empty();

          // sorts through old convos to find a match for the current speaking users
          for (var i = 0; i < convo.length; i++) {
            if (convo[i].newConvo._id == parseInt(myId) + parseInt(onlineUserId) || parseInt(myId) + parseInt(onlineUserId)) {
              console.log('matchy matchy!');
              //adds the users' old chat conversation id to the chat-container
              $('.chat-container').attr('id', '');
              $('.chat-container').attr('id', convo[i].newConvo._id);
              //sends the result to addOldMessegesToChat to append the messages to the chatbox
              convo[i].newConvo.messages.length != 0 ? addOldMessegesToChat(convo[i].newConvo) : false;
              return
            }
          }
        }; //<--matchOldConvoToIds


        //this should append old chats to chat box
        function addOldMessegesToChat(matchedConvo) {
          console.log("THESE ARE HTE MESSAGES: ", matchedConvo.messages);
          for (var i = 0; i < matchedConvo.messages.length; i++) {
            $('#messages').append('<li>'+ usersConvo[i].message + '</li>');
          }
        }; //<--addOldMessegesToChat


      });

    });

  });

}; //<--addName


//uses form input to send messages to specific users
  $('form').submit(function(e){
    e.preventDefault();
    var newMsg = $('#input-message').val();
    console.log(newMsg);

    if(window.location.hash) {
      var onlineUserSocketId = window.location.hash.substr(1);
     }

     //gets convoId for use in saving messages to database
     var previousUsersConvo = $(this).closest('div').attr('id');

    // emits on socket the message to the specifically clicked user
    socket.emit('new-message', {
      socketId: onlineUserSocketId,
      msg: newMsg,
      convoId: previousUsersConvo
    });

    $('#input-message').val('');
    return false;
  });


//adds message to chat-box and sends message to database to be saved
function addMessage(data) {
  // console.log("THIS IS addMessage DATA: ", data);
  //adds message to chat-box
  $('#messages').append('<li>' + data.name + ': ' + data.message + '</li>');


   //sends message to the server to be saved
   $.ajax({
     method: 'POST',
     url: '/saveMessage',
     data: {
           'message': data.message,
           'previousUsersConvo': data.convoId,
           'username': data.name
            }
   });


   //decrypts messages on hover and applies encrypted version on off hover
   var encryptedText = null;
   $('#messages > li').hover(

     function() {
        //setting this li to a variable to be used in 'Decrypt-Private'
        var $this = $(this);
         //saving the encrypted message to a variable so that we don't have to send it back from the server
         encryptedText = $(this).html();
         //gets username from current appeneded message
         var username = encryptedText.split(':')[0].trim();
         //removes inner text of hovered item to be replaced later
         $(this).html('');

         //gets the other user's socket id from window.location hash
         if(window.location.hash) {
           var onlineUserSocketId = window.location.hash.substr(1);
          }

         //emits the other user's socket id and the encrypted text to th eserver to be decrypted
         socket.emit('Decrypt-Msg', { 'socketId': onlineUserSocketId, 'msg': encryptedText });

         //listens for decrypted message from server
         socket.on('Decrypt-Private', function(data){
           console.log('decrypt-private: ', data.decryptedMsg);
           //sets username ane decrypted message to the inner text
           $this.html(username + ': ' + data.decryptedMsg);
           //clears data variable on front end
           data = null;
         });


       },
       function(e) {
         //on off hover replaces the decrypted message with previous encrypted message
         $(this).html(encryptedText);
       });



}; //<--addMessage



//listens for message from the private user
socket.on('Private', function(data){
  addMessage(data);
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
      onlineUsersChat(response);
    },
    //error
    function(err){
      // console.log(err);
    });



}















}) //<--windowonload
