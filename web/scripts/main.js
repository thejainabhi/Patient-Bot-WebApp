/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.micButton = document.getElementById('speech');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.micButton.addEventListener('click', this.startSpeech.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function (e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function () {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function () {
  if (this.user) {
    // Reference to the /messages/ database path.
    this.messagesRef = this.database.ref('messages/' + this.user.uid);
    // Make sure we remove all previous listeners.
    this.messagesRef.off();

    // Loads the last 12 messages and listen for new ones.
    var setMessage = function (data) {
      var val = data.val();
      this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
    }.bind(this);
    this.messagesRef.limitToLast(12).on('child_added', setMessage);
    this.messagesRef.limitToLast(12).on('child_changed', setMessage);
  }
};

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function (e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    // Add a new message entry to the Firebase Database.
    this.chatWithBot(this.messageInput.value);
  }
};


var k=0;
var ContentLocationInDOM = null;
var sendButtonClicked = false;
var multipleButtonsClicked = false;
var externalURL = "patient.info/health/hay-fever-leaflet";

FriendlyChat.prototype.chatWithBot = function (message) {
  var currentUser = this.auth.currentUser;
  var action = 0;
  this.messagesRef.push({
    name: currentUser.displayName,
    text: message,
    photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
  }).then(function () {
      var xhttp = new XMLHttpRequest();
      xhttp.open("POST", "https://api.api.ai/v1/query?v=20150910", false);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.setRequestHeader("Authorization", "Bearer 09744aa8a2a04880bd0120c8da49e3d5 ");
      xhttp.send(JSON.stringify({"query": message, "lang": "en", "sessionId": "abcdefghi"}));

      var response = JSON.parse(xhttp.responseText);
      console.log(response);


      this.messagesRef.push({
          name: "Patient bot",
          text: response.result.fulfillment.speech,
          photoUrl: '/images/patient_bot_logo.jpg'
      }).then(function () {
      }.bind(this)).catch(function (error) {
          console.error('Error writing new message to Firebase Database', error);
      });

      /*
      if (response.result.parameters.SearchTerm == "Hay Fever") {
       //   alert('hi');
          //$.get('https://webknox-question-answering.p.mashape.com/questions/converse?mashape-key=' + apiKey + '&contextId=' + contextId + '&text=' + encodeURIComponent(query), function (data) {
/*
          $.get('https://patient.info/health/hay-fever-leaflet', {}, function (data) {
              alert('hello');
              alert(data);
          });*/
        //  var jq = jQuery.noConflict();
    /*      $.get('google.php', function (data) {
              alert('hello');
              alert(data);
          });
$.ajax({
    url: '//patient.info/health/hay-fever-leaflet',
    dataType: 'jsonP',
    success: function(data){
alert(data);
        }
    }
);*/




          /*
           var data ="hello";
           $.get("https://patient.info/health/hay-fever-leaflet",function (response) {
           data = response;

           var doc = document.implementation.createHTMLDocument("example");
           doc.documentElement.innerHTML = response.responseText;

           //window.location = "https://patient.info/health/hay-fever-leaflet";


           $.get("https://patient.info/health/hay-fever-leaflet").success(function (data) {
           alert(data);
           }); */

         // $(document).ready(loadContent);
      //}

     // if (response.result.action == "user.fever" || response.result.action == "fever.fever-custom") {
      var stringList = response.result.parameters.SymptomList.toString();
      if (stringList) {
          var buttons = stringList.split(',');
          var buttonContainer = document.getElementById('messages');

          for (var j = 0;j < buttons.length; j++) {

              var newButton = document.createElement('input');
              newButton.type = 'button';
              Object.assign(newButton.style, {
                  left: "20%", right: "20%", backgroundColor: "cyan", top: "20%", width: "20%", height: "40px", borderColor: "black",
                  position: "center", marginLeft: "25px", borderRadius: "25px", whiteSpace: "normal", cursor: "pointer", fontsize: "12"
              });

              newButton.id = k;
              newButton.value = buttons[j].toString().toUpperCase();
              buttonContainer.appendChild(newButton);
              newButton.addEventListener('mouseover',mouseHover.bind(this,newButton.id));
              newButton.addEventListener('mouseout',mouseOut.bind(this,newButton.id));
              newButton.addEventListener('click', buttonClick.bind(this, buttons[j].toString(),newButton.id));
              k = k+1;
          }
          action = 1;
      }

      // Clear message text field and SEND button state.
      if (action == 0) {
        FriendlyChat.resetMaterialTextfield(this.messageInput);
        this.toggleButton();

       }
       else {
        this.toggleButton();
        FriendlyChat.resetMaterialTextfield(this.messageInput);
      }

  }.bind(this)).catch(function (error) {
    console.error('Error writing new message to Firebase Database', error);
  });
};

function buttonClick(text, id) {
    if (multipleButtonsClicked == true && sendButtonClicked == false ) {
        this.messageInput.value += ',' + text;

    }
    else if(sendButtonClicked == false && multipleButtonsClicked == false) {
        this.messageInput.value = text;
        //var button = document.getElementById(id);
        multipleButtonsClicked = true;
    }
}

function mouseHover(id) {
    //var element = document.getElementById(id);
    var element = document.getElementById(id);
    element.style.backgroundColor = "yellow";
}

function mouseOut(id){
    var element = document.getElementById(id);
    element.style.backgroundColor = "cyan";
}


function buttonStyle(buttonId) {
    var elem = document.getElementById(buttonId);
    elem.style.top = "20%";
    elem.style.left ="20%";
    elem.style.width = "80px";
    elem.style.borderColor = "black"
    elem.style.position = "center";
    elem.style.marginLeft = "25px";
    elem.style.backgroundColor="cyan";
    elem.style.borderRadius="10px";
    elem.style.whiteSpace="normal";
    //newButton.value = buttons[i].toString();
}

FriendlyChat.prototype.startSpeech = function (e) {
  e.preventDefault();
  if (!('webkitSpeechRecognition' in window)) {
    alert('Upgrade ur browser');
  } else {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.start();

    var final_transcript = '';
    recognition.onresult = function (event) {
      var interim_transcript = '';
      if (typeof (event.results) == 'undefined') {
        recognition.onend = null;
        recognition.stop();
        upgrade();
        return;
      }
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      friendlyChat.chatWithBot(final_transcript);
    };
  }
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
FriendlyChat.prototype.setImageUrl = function (imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function (metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function (event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function (data) {

      // Upload the image to Cloud Storage.
      var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
      return this.storage.ref(filePath).put(file).then(function (snapshot) {

        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        return data.update({ imageUrl: this.storage.ref(fullPath).toString() });
      }.bind(this));
    }.bind(this)).catch(function (error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });
  }
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function () {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function () {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function (user) {
  this.user = user;
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();

    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function () {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves the messaging device token to the datastore.
FriendlyChat.prototype.saveMessagingDeviceToken = function () {
  firebase.messaging().getToken().then(function (currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function (error) {
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
FriendlyChat.prototype.requestNotificationsPermissions = function () {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function () {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function (error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function (element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
  '<div class="message-container">' +
  '<div class="spacing"><div class="pic"></div></div>' +
  '<div class="message"></div>' +
  '<div class="name"></div>' +
  '</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function (key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function () {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function () { div.classList.add('visible') }, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function () {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
      sendButtonClicked = true;
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function () {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions and make ' +
      'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function () {
  window.friendlyChat = new FriendlyChat();
};
