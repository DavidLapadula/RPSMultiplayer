$(document).ready(function () {
      
    // Initialize Firebase 
    var config = {
      apiKey: "AIzaSyAYu99F7dk_r5fh8CWkBbqrAh5YNw1SAkY",
      authDomain: "rps-database-81187.firebaseapp.com",
      databaseURL: "https://rps-database-81187.firebaseio.com",
      projectId: "rps-database-81187",
      storageBucket: "rps-database-81187.appspot.com", 
      messagingSenderId: "359029810871"
    }; 
    firebase.initializeApp(config);
   
    // Database reference
    var rpsDatabase = firebase.database();   
    
    //Selectors

      // Used to keep name of specific player for personal diisplay features on each players interface
      var activePlayer= null; 
      var playerTurn = null; 
      var gameLive = null; 

      //Selectors for what is displayed above the gameplay section
      var promptSection = $("#prompt-section"); 
      var addPlayerInput = $("#add-player-input"); 
      var addPlayerButton = $("#add-player-button"); 
      var topMessage = $("#top-message");

      //Selectors for play during the game
      var gamePlaySection = $("#gameplay-section"); 
      var messagingSection = $("#messaging-section"); 
      var player1MessageForm = $("#player1-msg-form"); 
      var player2MessageForm = $("#player2-msg-form"); 
      var tempGameAnswer = $("#temp-game-answer");  
      var gameResultMessage = $("#game-result-message"); 
      var messageBoard = $("#message-board");  

      // Variables and element selectors for player 1
      var player1 = null; 
      var currentP1 = null; 
      var player1Move = null; 
      var player1Active = $("#player1-active"); 
      var player1Div = $("#player1-div"); 
      var player1Waiting = $("#player1-waiting"); 
      var player1Name = $("#player1-name"); 
      var player1Buttons = $("#player1-button-row");  
      var player1Wins = $("#player1-wins"); 
      var player1Losses = $("#player1-losses"); 
      var player1Ties = $("#player1-ties"); 
      var player1ImgChoice = $("#player1-img-choice"); 
      var player1MsgText = $("#player1-msg-text"); 
      var player1MsgBtn = $("#player1-msg-btn"); 

      // Variables and element selectors for player 1 
      var player2 = null; 
      var currentP2 = null;  
      var player2Move  = null; 
      var player2Active = $("#player2-active"); 
      var player2Div = $("#player2-div");  
      var player2Waiting = $("#player2-waiting"); 
      var player2Name = $("#player2-name");  
      var player2Buttons = $("#player2-button-row");  
      var player2Wins = $("#player2-wins");  
      var player2Losses = $("#player2-losses");  
      var player2Ties = $("#player2-ties"); 
      var player2ImgChoice = $("#player2-img-choice"); 
      var player2MsgText = $("#player2-msg-text"); 
      var player2MsgBtn = $("#player2-msg-btn");


// Initial display condition on page load. Later modified by database references
player1Active.removeClass('d-flex').hide(); 
player1MessageForm.children().removeClass('d-flex').hide(); 
player2Active.removeClass('d-flex').hide(); 
player2MessageForm.children().removeClass('d-flex').hide(); 
topMessage.removeClass('d-flex').hide();   
  
// Logic of the game 
var gameLogic = function () {
  player1Buttons.children('.player1-button').removeClass('bg-dark'); 
  player2Buttons.children('.player2-button').removeClass('bg-dark'); 
    switch (player1.choice) {
      case 'rock':
          switch (player2.choice) {
            case 'paper':
            case 'scissors':
            case 'rock': 
          }
        break; 
      case 'paper':
          switch (player2.choice) {
            case 'rock':
            case 'scissors':
            case 'paper':
          }
        break; 
      case 'scissors':
          switch (player2.choice) {
            case 'paper':
            case 'rock':
            case 'scissors':
          }
    }

}    
  
// Database references used during the game

    //Listen for changes to the presence of player
    rpsDatabase.ref("/players/").on("value", function(snapshot) {
      // Player 1 check 
      if (snapshot.child("player1").exists()) {
        player1 = snapshot.val().player1;
        currentP1 = player1.name; 
        player1Waiting.removeClass('d-flex').hide(); 
        player1Active.show(); 
        player1Name.text(currentP1); 
        player1Wins.text(player1.wins);
        player1Losses.text(player1.losses); 
        player1Ties.text(player1.ties); 
  
      } else {   
        player1 = null;
        currentP1 = null; 
        player1Active.hide(); 
        player1Waiting.addClass('d-flex').show(); 
        player1Name.text("");   
        rpsDatabase.ref("/outcome/").remove();
      }
     
      // Player 2 check
      if (snapshot.child("player2").exists()) {
        player2 = snapshot.val().player2;
        currentP2 = player2.name; 
        player2Waiting.removeClass('d-flex').hide();   
        player2Active.show();  
        player2Name.text(currentP2);    
        player2Wins.text(player2.wins);  
        player2Losses.text(player2.losses);  
        player2Ties.text(player2.ties); 
      } else {  
        player2 = null;
        currentP2 = null;  
        player2Active.hide();  
        player2Waiting.addClass('d-flex').show(); 
        player2Name.text("");  
        rpsDatabase.ref("/outcome/").remove();
      }  

      if (!player1 || !player2) {
        player1Div.removeClass('border-success'); 
        player2Div.removeClass('border-success'); 
        gameResultMessage.children().text(''); 
        tempGameAnswer.children().text('Game Queue Open')
      }

      // Game and database resets if both players leave the game
      if (!player1 && !player2) {
        rpsDatabase.ref("/messenger/").remove();
        rpsDatabase.ref("/results/").remove();
        rpsDatabase.ref("/turn/").remove();
      }; 

      if (player1 && player2) {
        gameResultMessage.children().text(`${currentP1}\'s turn to choose`); 
        player1Div.addClass('border-success'); 
      }; 

      //Specialized Display for each player
      if  (activePlayer === currentP1 && currentP1 !== null) {
        player1MessageForm.children().addClass('d-flex').show();  
        player2MessageForm.children().removeClass('d-flex').hide();
        promptSection.hide();
        topMessage.show().children().text(`${currentP1}, you are Player 1`);
      }
      if (activePlayer === currentP2 && currentP2 !== null) { 
        player1MessageForm.children().removeClass('d-flex').hide();  
        player2MessageForm.children().addClass('d-flex').show(); 
        promptSection.hide();    
        topMessage.show().children().text(`${currentP2}, you are Player 2`);      
      }
});     


    // Listener to determine whos turn it is
    rpsDatabase.ref("/turn/").on("value", function(snapshot) {
      // Only allow the page to be seen if there is an open spot  
      if (snapshot.val() !== null && activePlayer === null && player1 && player2) {
        promptSection.hide();   
        gamePlaySection.removeClass('d-flex').hide(); 
        messagingSection.removeClass('d-flex').hide(); 
        topMessage.show().children().text('All players occupied. Wait and then refresh the page')
      }      
        if (snapshot.val() === 1) {
            playerTurn = 1;
              if (player1 && player2) {
              gameResultMessage.children().text(`${currentP1} needs to choose`); 
              player1Div.addClass('border-success'); 
              player2Div.removeClass('border-success'); 
              } 
        } else if (snapshot.val() === 2) {
            playerTurn = 2;
              if (player1 && player2) {   
                gameResultMessage.children().text(`${currentP2} needs to choose`); 
                player2Div.addClass('border-success'); 
                player1Div.removeClass('border-success');  
              }
          }    
    });    
    

    // Database reference to update the game result div
    rpsDatabase.ref("/results/").on("value", function(snapshot) {
      gameResultMessage.children().text(snapshot.val()); 
    });  

    // Any new messages handled by this listener
    rpsDatabase.ref("/messenger/").on("child_added", function(snapshot) {
      newMsg = snapshot.val();
      newMsgEl= $("<p>").addClass('m-0').html(newMsg);  
      // Change the color of the chat message. Change it for the color of the player and connect/disconnect events
      if (newMsg.includes("left")) {
        newMsgEl.addClass("text-dark");
      } else if (newMsg.includes("added")) {
        newMsgEl.addClass("text-success");
      } else if(newMsg.includes(currentP1)) {
        newMsgEl.addClass('text-danger');
      } else if(newMsg.includes(currentP2)) { 
        newMsgEl.addClass('text-primary');
      }    
      messageBoard.append(newMsgEl);
      messageBoard.scrollTop(messageBoard[0].scrollHeight); 
    });
 
    // Message display for whenever a player leaves the game
    rpsDatabase.ref("/players/").on("child_removed", function(snapshot) {
      playerDisconnectMsg = snapshot.val().name + " has left the game"; 
      disconnectMsgEntry = rpsDatabase.ref().child("/chat/").push().key;  
      rpsDatabase.ref("/messenger/" + disconnectMsgEntry).set(playerDisconnectMsg);
      player1ImgChoice.removeAttr('src');  
      player2ImgChoice.removeAttr('src');  
      gameResultMessage.children().text('');  
      player2Div.removeClass('border-success'); 
      player1Div.removeClass('border-success'); 
      tempGameAnswer.children().text('Game Queue Open');  
    });    


// All click events for the game

    //Submit Button
    addPlayerButton.on('click', function () {
      event.preventDefault(); 
      if (addPlayerInput.val() === "") {
        alert('Your character needs a name');  
      }  else {
            if (player1 === null && addPlayerInput.val() !== '') {
              activePlayer = addPlayerInput.val().trim();
              player1 = {
                name: activePlayer,
                wins: 0, 
                losses: 0,  
                ties: 0,      
                move: ""    
              };  
              rpsDatabase.ref().child("/players/player1").set(player1);   
              rpsDatabase.ref("/players/player1").onDisconnect().remove(); 
                if (!player2) {
                  rpsDatabase.ref().child("/turn").set(1);   
                } 
            }  else if (player2 === null && addPlayerInput.val() !== '') {
              activePlayer = addPlayerInput.val().trim();
              player2 = { 
                name: activePlayer,  
                wins: 0,  
                losses: 0, 
                ties: 0,      
                move: ""  
              };   
              rpsDatabase.ref().child("/players/player2").set(player2);  
              rpsDatabase.ref("/players/player2").onDisconnect().remove(); 
            }  
      playerConnectMsg = activePlayer + " has been added to the game";
      connectMsgEntry = rpsDatabase.ref().child("/messenger/").push().key; 
      rpsDatabase.ref("/messenger/" + connectMsgEntry).set(playerConnectMsg);
      addPlayerInput.val('').attr('placeholder', 'Enter Player Name');  
      }
    });    

  // Messenger Button controls for each of the players' independant form
    player1MsgBtn.on("click", function(event) {
      event.preventDefault();
      if (player1MsgText.val() !== "") {
        player1Msg = `${player1.name} says: ${player1MsgText.val()}`; 
        player1MsgEntry = rpsDatabase.ref().child("/messenger/").push().key; 
        rpsDatabase.ref("/messenger/" + player1MsgEntry).set(player1Msg); 
        player1MsgText.val('');   
      } 
    });   
    player2MsgBtn.on("click", function(event) {
      event.preventDefault();
      if (player2MsgText.val() !== "") { 
        player2Msg = `${player2.name} says: ${player2MsgText.val()}`; 
        player2MsgEntry = rpsDatabase.ref().child("/messenger/").push().key; 
        rpsDatabase.ref("/messenger/" + player2MsgEntry).set(player2Msg); 
        player2MsgText.val('');   
      }
    });  

    //Get the choice of each player from the button click. Only allow if both players are in the game, active user is the current player, and a choice has yet to be made.
    player1Buttons.on("click", ".player1-button" , function() {
      event.preventDefault();   
      if (player1 && player2 && playerTurn === 1 && (activePlayer === currentP1) && player1.move === "") {
        event.preventDefault();   
        player1Move = $(this); 
        player1Move.addClass('bg-dark'); 
        rpsDatabase.ref('/players/').child('/player1/move').set(player1Move.data('choice'))
        playerTurn = 2; 
      }   
    });      
    player2Buttons.on("click", ".player2-button" , function(event) {
      event.preventDefault(); 
      if (player1 && player2 && playerTurn === 2 && (activePlayer === currentP2) && player2.move === ""){  
        event.preventDefault();  
        player2Move = $(this); 
        player2Move.addClass('bg-dark'); 
        rpsDatabase.ref('/players/').child('/player2/move').set(player2Move.data('choice'))
        gameLogic(); 
      }       
    });  
 
});   

/*  Change the display after game being won
 var timeClock = function () {
     timerSeconds = 20; 
     timer.text('Time Remaining: ' + timerSeconds)
     timedInterval = setInterval(timeCountdown, 1000) 
 } 
   
 var timeCountdown = function () {
     timerSeconds--; 
     timer.text('Time Remaining: ' + timerSeconds)
     if (timerSeconds < 1) {
         clearInterval(timedInterval) 
         userResults() 
     } 
   
 } 
*/ 