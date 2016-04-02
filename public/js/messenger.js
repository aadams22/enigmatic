
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
        console.log();

        $.ajax({
          method: 'GET',
          url: '/json'
        }).done(
          function(response) {
            console.log(response.convos)
            //checks for convos
            if (response.convos.length == 0) {
              console.log('NO CONVOS!');
              addNewConvo(onlineUserSocketId, onlineUserId, onlineUserName);
            }else {
              matchOldConvoToIds(response.convos, response._id, onlineUserId);
            }
          },
          function(err) {
            console.log(err);
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


//THIS SHOULD BE AN EDIT FORM BECAUSE YOU'RE EDITING AN EXISTING CONVO
  $('form').submit(function(){
    console.log('form submitting huzzah');
    // console.log("THIS IS THE SUBMITTING onlineUserSocketId: ", onlineUserSocketId);
    var newMsg = $('#m').val('');
    // sends message to the server to be saved
    $.ajax({
      method: 'POST',
      url: '/saveMessage',
      data: { 'message': newMsg }
    });
    console.log("THIS IS THE SUBMITTING onlineUserSocketId: ", onlineUserSocketId);
    //emits on socket the message to the specifically clicked user
    // socket.emit('new-message', {
    //   socketId: onlineUserSocketId,
    //   msg: newMsg
    // });

    // $('#m').val('');
    // return false;
  });

function addMessage(data) {

}

  socket.on('Private', function(data){
    console.log('THIS IS PRIVATE MESSAGE: ', data);
    // $('#messages').append($('<li>').text(data));
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
      console.log(err);
    });



}















}) //<--windowonload
