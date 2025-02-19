const API_KEY = 'AIzaSyDjW_fZr3qwFxSpfKCwim3OnmZ0XY42KtI' // Define the chatbot API
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`

// Defines all the html elements
let promptInput = document.querySelector('input[name="prompt"]'); // User input
let output = document.querySelector('.output'); // Output div
let stop = false // For the stop button
// ID elements from HTML
const bot_prompt = 'You are a bot that is to be a professional doctor. You are called "Dok", you dont have to introduce yourself every time you answer, just the first time. So, answer anything as if you were treating a patient. Ask one follow up question about what the user(patient) is asking. Once there is enough information, give advice. Also give disclaimers that any advice you give should be re-consulted to a doctor. You only do disclaimer when you give advice and you always put it in the last.'
const chatMessages = document.getElementById("chat-messages"); // The chat messages div
const userInputBox = document.getElementById("user-input"); // The chat messages div
const historyContainer = document.getElementById("history"); // The history sidebar div
const newChatButton = document.getElementById("new-chat"); // The new chat button
const clearHistoryButton = document.getElementById("clear-history"); // The clear history button
const sendButton = document.getElementById("send-button"); // The send button
const stopButton = document.getElementById("stop-button"); // The send button
const scrollButton = document.getElementById('scroll-down'); // Scroll button
const prompt1Button = document.getElementById('prompt1'); // Prompt 1
const prompt2Button = document.getElementById('prompt2'); // Prompt 2
const prompt3Button = document.getElementById('prompt3'); // Prompt 3
const closeButton = document.getElementById('close'); // Close prompt button
const showPromptButton = document.getElementById('show-prompts'); // Show prompt button
const promptContainer = document.getElementById('super-container'); // Prompt container
let userInputMessage; // The user input value
let chatHistory; // Define the chat history
let currentChatIndex = -1; // Set the default chat index to -1 (no history)
let messages = ''; // Sets the current chat context to none at first

const divider = document.getElementById('vertical-divider'); // The slider to change the size of the div
const chatContainer = document.getElementById('chat-container'); // Div that contains the chat
const historySideBar = document.getElementById('history-sidebar'); // History div
const clearAllButton = document.getElementById('clear-all'); // Clear all button
const cancelButton = document.getElementById('cancel-button'); // Cancel clear button
// Dragging slider logic
// Initialize default settings
let isDragging = false; 
let initialX;
let initialWidth;
let chatContainerWidth;
// Set the logic for big screens
if (window.innerWidth >= 480) {
  // Event listener for when mouse is clicked
  divider.addEventListener('mousedown', (e) => {
    isDragging = true;
    initialX = e.clientX;
    initialWidth = chatContainer.offsetWidth;
    
  });
  // Changes the width of the div when the mouse is moved
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
  
    const parentWidth = chatContainer.parentElement.offsetWidth;
  
    //Set the max width for chatMessages div
    const minWidth = 0.2 * parentWidth;
    const maxWidth = 0.9 * parentWidth;
  
  
    const offsetX = e.clientX - initialX;
    let newWidth = initialWidth - offsetX;
  
    // Ensure newWidth does not go below 20% of parent width
    if (newWidth < minWidth) {
      newWidth = minWidth;
    }
  
    // Ensure newWidth does not go above the maxWidth
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
  
      // Change the buttons to images when maxWidth is reached
      newChatButton.innerHTML = ''; // Clear existing text
      newChatButton.innerHTML = '<img src="resources/images/newChatButton.png" alt="New Chat" style="width: 50%; height: auto;">';
  
      clearHistoryButton.innerHTML = ''; // Clear existing text
      clearHistoryButton.innerHTML = '<img src="resources/images/deleteChatButton.png" alt="Clear History" style="width: 50%; height: auto;">';
    } else { // Change back to text if less than maxWidth
      newChatButton.innerHTML = 'New Chat'; 
  
      clearHistoryButton.innerHTML = 'Delete History'; 
    }
  
    // Update css with the newWidth
    chatContainer.style.width = `${newWidth}px`;
    historySideBar.style.width = `calc(100% - ${newWidth}px - 5px)`; 
    scrollButton.style.marginLeft = `calc(${newWidth}px / 2 - 2%)`; 
    promptContainer.style.width = `calc(${newWidth}px - 5%)`;
  
    // Sets the new width
    chatContainerWidth = newWidth;
    checkContainerWidth(newWidth); // Checks the container width
  });
  // Sets the dragging to false when the mouse is not clicked
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
};
  
    // Adjust divider for smaller screens
  if (window.innerWidth < 480) {
      historySideBar.style.width = `100%`;
      chatContainer.style.width = `100%`;
      promptContainer.style.width = '80%';
      divider.style.visibility = 'hidden';
      
  }
  

// Function to start a new chat
function startNewChat() {
  // Show the prompts container for the new chat
  showPrompts();
  // Make the focus on the input field
  userInputBox.focus();

  const user = auth.currentUser;
  if (!user) {
    chatMessages.innerHTML = "Please sign in to start a new chat.";
    return;
  }

    // Get the total number of chats in Firebase to create a new chat
    db.ref(`users/${user.uid}/chats`).once('value', (snapshot) => {
      const newChatIndex = snapshot.numChildren();  

      const newChat = {
        sender: "bot",
        message: "<b>Dok: </b><br>Hello I am Dok! How can I assist you today? What would you like to ask?"
      };

      // Save the new chat to the database
      db.ref(`users/${user.uid}/chats/${newChatIndex}/messages`).push(newChat);

      // Update the currentChatIndex on the db
      db.ref(`users/${user.uid}/currentChatIndex`).set(newChatIndex);

      // Update the UI
      userInputBox.focus();
      chatMessages.innerHTML = `<div class="chatbot-message bot-message">${newChat.message}</div>`;

      const historyItem = document.createElement("a");
      historyItem.href = "#";
      historyItem.innerHTML = `<strong>Chat ${newChatIndex + 1}</strong>`;
      historyItem.classList.add("history-item");
      historyItem.addEventListener("click", () => {
        loadChat(newChatIndex);
        checkUserMessage();
        userInputBox.focus();
        chatMessages.scrollTop = chatMessages.scrollHeight;

      });
    historyContainer.appendChild(historyItem);
    db.ref(`users/${user.uid}/chatIndex`).push(newChatIndex);

    // Set and load the current chat
    currentChatIndex = newChatIndex;
    loadChat(currentChatIndex);
    historySideBar.scrollTop = historySideBar.scrollHeight;

  });
}

// Function to load a chat by index
function loadChat(index) {

  const user = auth.currentUser;
  if (!user) {
    chatMessages.innerHTML = "Please sign in to load your chat history.";
    return;
  }

  currentChatIndex = index; // Update current chat index
  chatMessages.innerHTML = ""; // Clear current chat

  const chatRef = db.ref(`users/${user.uid}/chats/${index}/messages`);
  // Replace some characters in the email so that it can be stored in the firebase
  const userEmailKey = user.email.replace(/[^a-zA-Z0-9]/g, ',');

  chatRef.on('value', (snapshot) => { // Shows the available chat on the html
    const messages = snapshot.val();
    if (!messages) {
      chatMessages.innerHTML = "No chat history available.";
      return;
    }

    chatMessages.innerHTML = ""; // Clear existing chat messages

    Object.values(messages).forEach((msg) => { // Shows each message in the html, identifying its sender to style accordingly
      const chat = document.createElement('div'); // Adds the styles for each messages div and also the profile picture of those messages
      chat.classList.add(`${msg.sender}-chat`); // Adds the style for the div that contains both messages and profile of each message
      const profile = document.createElement('div');
      profile.classList.add(`${msg.sender}-profile`);
      const messageDiv = document.createElement("div");
      messageDiv.classList.add(`${msg.sender}-message`);
      const name = msg.sender === "bot" ? "" : "You: <br>";
      messageDiv.innerHTML = `<b>${name} </b>${msg.message}`;
      if (msg.sender === 'bot') { // Append the profile and the message to the bigger div
        chat.appendChild(profile);
        chat.appendChild(messageDiv);
        
      } else {
        chat.appendChild(messageDiv);
        chat.appendChild(profile);
        // Fetch user data from the database
        db.ref(`users/${userEmailKey}/profilePicture`).once('value').then(snapshot => { // Gets the profile picture link from db
          const profilePicture = snapshot.val();
          // Sets the background image for the profile
          profile.style.backgroundImage = `url(${profilePicture})`;
          profile.style.backgroundSize = 'cover'; 
          profile.style.backgroundPosition = 'center'; 
          profile.style.backgroundRepeat = 'no-repeat'; 
        });
      }
      // Add the chat div to the message div
      chatMessages.appendChild(chat);
      
      // Adds a functional copy button for each bot message
      if (msg.sender === "bot") {
        const copyButton = document.createElement("button");
        copyButton.classList.add("copy");
        messageDiv.append(copyButton);
        copyButton.addEventListener("click", function () {
          const parentText = this.parentElement.textContent.replace("Dok: ", "").trim();
          navigator.clipboard
            .writeText(parentText)
            .then(() => {
              this.classList.add("copied");
              setTimeout(() => this.classList.remove("copied"), 2000);
            })
            .catch((err) => console.error("Failed to copy text: ", err));
        });
      }
    })
    // Set a timeout to ensure the scroll happens after the chat is loaded from db
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 100); 
    
  });
    // Call the function that changes the color of the active chat
    updateActiveHistoryItem();
    // Save the current chat index to the database
    db.ref(`users/${user.uid}/currentChatIndex`).set(currentChatIndex);
  }

  // Change color for the active chat
  function updateActiveHistoryItem() {
    const allHistoryItems = document.querySelectorAll(".history-item");
  
    // Remove active class from all items first
    allHistoryItems.forEach(item => {
        item.classList.remove("active-chat");
    });
  
    // Get the history item corresponding to the current chat index
    const activeItem = allHistoryItems[currentChatIndex];
  
    // Add the active-chat class to the current opened chat
    if (activeItem) {
        activeItem.classList.add("active-chat"); // The active-chat class adds the color blue
    }
  }

// Typing effect of the bot response
const showTypingEffect = (text, textElement, callback) => {
  // Split the words of the api response
  const generatingMessage = document.querySelector('.generating-message');
      if (generatingMessage) {
          generatingMessage.remove();
      }

  const words = text.split(' ');
  let currentWordIndex = 0;
  // Set the time between each word generation
  const typingInterval = setInterval(() => {
  // Add the text one by one to the chatbot response div
  textElement.innerHTML += (currentWordIndex === 0 ? '': ' ') + words[currentWordIndex++];

  // Stop once all the words are written in the div or the stop button is pressed
  if(currentWordIndex === words.length || stop === true) {
    clearInterval(typingInterval);
    userInputBox.focus();

    if (callback) callback(); // Execute the callback when typing is done

  }
  }, 75)
}
  

const generateAPIResponse = async () => {
  try { // Get a response from the chatbot API, and input the prompt for it to answer
      const response = await fetch(API_URL, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              contents: [{
                  role: 'user',
                  parts: [{ 
                      text: 'You are a professional chatbot doctor called "Dok". Dont start your answers with "Dok: ". Add follow up questions and disclaimers to reconsult with doctor after you give medical advice. You are to use the context I give you to answer the Patient Message. However, do not repeat any context that has no relation to the Patient Message. ' + 
                            'Context(not to be printed): [' + messages + ']' + 
                            'Patient Message(not to be printed): ' + promptInput.value + 
                            ' Give a proper and professional response. Only use * if you were to make a list.'
                  }]
              }]
          })
      });

      const data = await response.json();

      // Format response text
      const apiResponse = formatResponseText(
          data?.candidates[0].content.parts[0].text
      );
      const botChat = document.createElement('div');
      botChat.classList.add('bot-chat');
      const botProfile = document.createElement('div'); // Adds the bot profile div to add the bot profile picture
      botProfile.classList.add('bot-profile');
      // Create a container for the bot response
      const botResponseDiv = document.createElement('div');
      botResponseDiv.classList.add('bot-message');
      botChat.appendChild(botProfile);
      botChat.appendChild(botResponseDiv)
      
      // Append the botChat div which contains the message and the profile to the output div
      output.appendChild(botChat);
      // Add the 'Dok: ' text to the container
      botResponseDiv.innerHTML += `<b>Dok: </b><br>`;

      
      // Call the typing effect and input the text and the response div
      showTypingEffect(apiResponse, botResponseDiv, () => {
        // Re-enable UI elements after typing is done
        historyContainer.classList.remove('disabled');
        newChatButton.classList.remove('disabled');
        clearHistoryButton.classList.remove('disabled');
        stopButton.classList.add('hidden');
        sendButton.classList.remove('hidden');
        sendButton.classList.add('disabled');
        // Reset the stop generating response to false
        stop = false;

        // // Refresh UI
        refreshHistoryItem();
        updateActiveHistoryItem();
        
        // Formatted response of the current text in botResponseDiv
        const botResponse = botResponseDiv.innerHTML
        let formattedResponse;
        // Format the response
        formattedResponse = botResponse.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        const user = auth.currentUser; // Define the current user
        chatHistory = db.ref(`users/${user.uid}/chats/${currentChatIndex}/messages`) // Give the database reference
        // Save the formatted response to chat history
        const botMessageObj = { sender: "bot", message: botResponse };
        chatHistory.push(botMessageObj)

        // Scroll down
        chatContainer.scrollTop = chatContainer.scrollHeight;
        // Load the active chat
        loadChat(currentChatIndex);
      });
      // Scroll to the bottom
      chatContainer.scrollTop = chatContainer.scrollHeight;

  } catch (error) { // States if there is an error
      console.error(error);
  } 
};

// Format the initial response that is generated from the bot
const formatResponseText = (text) => {
  return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Removes markdown-style bold (**text**)
      .replace(/\n/g, '<br>')           // Create new line properly
      .trim();                         // Trims any extra whitespace
};


function sendMessage() {
    // Disable inputs while bot is generating a response
    historyContainer.classList.add('disabled');
    newChatButton.classList.add('disabled');
    clearHistoryButton.classList.add('disabled');
    stopButton.classList.remove('hidden');
    sendButton.classList.add('hidden');
    // Set the user input
    const userInput = promptInput.value;
    // Hide the prompts container when a message is sent
    hidePrompts();

    const user = auth.currentUser;
    chatHistory = db.ref(`users/${user.uid}/chats/${currentChatIndex}/messages`) // Defines the db reference

    const userEmailKey = user.email.replace(/[^a-zA-Z0-9]/g, ',');

    // Add the context of the current selected conversation to the bot
    chatHistory.on('value', (snapshot) => {
      const context = snapshot.val();
      let tempContext = '';  // Initialize tempContext as an empty string when first opening a history tab
      // Loop through each message and add it to tempContext
      Object.values(context).forEach((msg) => {
        tempContext += `${msg.sender}: ${msg.message}\n`;  // Append each message
      });
      // Now tempContext contains the full conversation
      messages = tempContext; // Assign the tempContext to the messages in order to pass it to the bot
    });

    // Add the user input to the conversation div
    userInputMessage = promptInput.value
    // Fetch user data from the database and show it on the html
    const generatingMessage = document.createElement('div');
    generatingMessage.innerHTML = 'Dok is Thinking...';
    generatingMessage.classList.add('generating-message');
    const userChat = document.createElement('div');
    userChat.classList.add('user-chat');
    const userProfile = document.createElement('div');
    userProfile.classList.add('user-profile');
    // Gets the link of the user profile picture
    db.ref(`users/${userEmailKey}/profilePicture`).once('value').then(snapshot => {
      const profilePicture = snapshot.val();
      // Set the background of the profile div of the user
      userProfile.style.backgroundImage = `url(${profilePicture})`;
      userProfile.style.backgroundSize = 'cover'; 
      userProfile.style.backgroundPosition = 'center'; 
      userProfile.style.backgroundRepeat = 'no-repeat'; 
    })
    .then(() => {
      userChat.innerHTML += `<div class='user-message'><b>You: </b><br>${userInput}</div>`;
      userChat.appendChild(userProfile);
      output.appendChild(userChat);
    
      // Set the user message format and sender to save
      const userMessage = { sender: "user", message: userInput};
      //save the user input to current chat index history
      chatHistory.push(userMessage);
      // Display "Generating..." below the user input before the typing effect is shown
      output.appendChild(generatingMessage);
      // Scroll to the bottom of the selected chat
      chatContainer.scrollTop = chatContainer.scrollHeight;
      // Call the generate bot response
      generateAPIResponse();
    // Clear the input box
      promptInput.value = '';
  
    })
}

// Update the chat history view from the database
function refreshHistoryItem() {
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not signed in. Cannot refresh chat history.");
    return;
  }
  // Define the db path
  const userChatsRef = db.ref(`users/${user.uid}/chats`);
  // Gets the chat history from db
  userChatsRef.once('value')
    .then((snapshot) => {
      const chats = snapshot.val();
      historyContainer.innerHTML = ''; // Clear the history container before updating

      if (!chats) {
        console.log("No chats available to display in history.");
        return;
      }
      // Adds the first user message if it exists to each history items
      Object.keys(chats).forEach((chatIndex) => {
        const chat = chats[chatIndex];
        const messages = chat.messages ? Object.values(chat.messages) : [];
        const firstUserMessage = messages.find(msg => msg.sender === "user")?.message || '';

        const historyItem = document.createElement("a");
        historyItem.innerHTML = firstUserMessage
          ? `<strong>Chat ${parseInt(chatIndex, 10) + 1}</strong>: ${firstUserMessage}`
          : `<strong>Chat ${parseInt(chatIndex, 10) + 1}</strong>`;

        historyItem.href = "#";
        historyItem.classList.add("history-item");

        // Add click event to load the chat when clicked
        historyItem.addEventListener("click", () => {
          loadChat(chatIndex);
          checkUserMessage();
          userInputBox.focus();        
        });

        historyContainer.appendChild(historyItem); // Append to the history container
        loadChat(currentChatIndex);
      });
    })
    .catch((error) => {
      console.error("Failed to refresh chat history:", error);
    });
}

const loadingBar = document.getElementById('loadingBar');
// Show loading bar until data is fetched
function showLoadingBar() {
  loadingBar.style.width = '20%';
  setTimeout(() => {
    loadingBar.style.width = '80%';
  }, 100); 
}

// Hide loading bar once data is fetched
function hideLoadingBar() {
  loadingBar.style.width = '100%';
  setTimeout(() => {
    loadingBar.style.width = '0%';
  }, 100)
}

function loadHistory() {
  // Initialize the loading dots
  let loadingDots = 1;
  // Display initial loading message
  chatMessages.innerHTML = "<strong>Loading Chat History.</strong>";
  historyContainer.innerHTML = "<strong>Loading Chat History.</strong>";

  // Start an interval to update the loading dots
  const loadingInterval = setInterval(() => {
    loadingDots = (loadingDots % 3) + 1; // Cycle through 1 to 3
    const dots = ".".repeat(loadingDots); // Generate dots dynamically
    chatMessages.innerHTML = `<strong>Loading Chat History${dots}</strong>`;
    historyContainer.innerHTML = `<strong>Loading Chat History${dots}</strong>`;
  }, 500); // Update every 500ms
  promptInput.classList.add('disabled')
  promptContainer.classList.add('invisible')
  showPromptButton.classList.add('disabled')

  showLoadingBar() // Show the loading bar as the db is being loaded

  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in, load chat history
      db.ref(`users/${user.uid}/currentChatIndex`).once('value')
        .then((snapshot) => {
          currentChatIndex = snapshot.val();
          refreshHistoryItem();
          // Load the saved chat index
          return loadChat(currentChatIndex);
        })
        .then(() => {
          // Remove loading text and stop the interval
          clearInterval(loadingInterval);
          chatMessages.innerHTML = ""; // Clear loading message
          historyContainer.innerHTML = ""; // Clear loading message
          promptInput.classList.remove('disabled')
          promptContainer.classList.remove('invisible')
          showPromptButton.classList.remove('disabled')
          hideLoadingBar() // Hides the loading bar

        })
        .catch((error) => {
          clearInterval(loadingInterval); // Stop the interval
          console.error("Error loading chat history:", error);
          chatMessages.innerHTML = "Failed to load chat history.";
          historyContainer.innerHTML = "Failed to load chat history.";
        });

      // Starts a new chat if there is no history
      db.ref(`users/${user.uid}/chats`).once('value')
        .then((snapshot) => {
          const totalChats = snapshot.numChildren();
          if (totalChats === 0) {
            startNewChat();
          }
        });

    } else {
      // User is not signed in, clear the history and show a message
      clearInterval(loadingInterval); // Stop the interval
      historyContainer.innerHTML = '';
      chatMessages.innerHTML = "Please sign in to view your chat history.";
      console.error("User is not signed in.");
    }
  });
}

// Delete chat history function
function clearChatHistory() {
  const user = auth.currentUser;

  // Tell the user to select a history item to delete
  const instruction = document.createElement('div');
  instruction.classList.add('instruction');
  instruction.innerText = 'Click on a chat history item to delete it or press Cancel to exit.';
  historyContainer.prepend(instruction);

  // Update the UI, hide and show the buttons
  cancelButton.classList.remove('hidden');
  clearHistoryButton.classList.add('hidden');
  clearAllButton.classList.remove('hidden');

  // Record the currentChatIndex when clearHistoryButton is pressed
  let previousChatIndex = currentChatIndex;

  // Add click event listeners to history items for deletion when in clear mode
  const allHistoryItems = document.querySelectorAll('.history-item');
  allHistoryItems.forEach((historyItem, index) => {
    historyItem.classList.add('deletable');

    historyItem.addEventListener('click', function deleteHistoryItem() {
      const chatsRef = db.ref(`users/${user.uid}/chats`);

      // Remove the chat and reorder remaining chats
      deleteChatAndReorder(chatsRef, index)
        .then(() => {
          return db.ref(`users/${user.uid}/chats`).once('value');
        })
        .then((snapshot) => {
          const totalChats = snapshot.numChildren(); 

          // Update currentChatIndex based on the relative position of the deleted chat
          if (previousChatIndex === index) {
            if (previousChatIndex > totalChats) {
              currentChatIndex = totalChats - 1; // Ensure max currentChatIndex does not exceed totalChats - 1
            } else {
              currentChatIndex = previousChatIndex -1 ;
            }
          } else if (previousChatIndex < index) {
            currentChatIndex = previousChatIndex; // No change if the deleted chat is after the selected one
          } else {
            currentChatIndex = previousChatIndex - 1; // Adjust index if the deleted chat was before
          }

          if (currentChatIndex < 0) { // Automatically create a new chat if all chat history is deleted
            currentChatIndex = 0
            if (totalChats === 0) {
              setTimeout(() => {
                startNewChat();
              }, 300); 
              
            }
          }
          // Update the UI
          loadChat(currentChatIndex);
          refreshHistoryItem();
          updateActiveHistoryItem();

          // Store the updated currentChatIndex in the database
          db.ref(`users/${user.uid}/currentChatIndex`).set(currentChatIndex);

          // Remove instruction and cancel button, re-enable the button
          instruction.remove();
          cancelButton.classList.add('hidden');
          clearAllButton.classList.add('hidden');

          // Remove the delete chat event listener from the history items after the item is deleted
          historyItem.removeEventListener('click', deleteHistoryItem);
          clearHistoryButton.classList.remove('hidden');
          historyItem.classList.remove('deletable');

        })
        .then(() => { // Refresh the history items after deletion
          refreshHistoryItem();
        })
        
        
        .catch((error) => {
          console.error('Error deleting chat or updating index:', error);
        });
    });
  })
  
  // Add event listener to the cancel button
  cancelButton.addEventListener('click', function cancelDeletionMode() {
    // Remove instruction and cancel button
    instruction.remove();
    cancelButton.classList.add('hidden');
    clearHistoryButton.classList.remove('hidden')
    clearAllButton.classList.add('hidden');
    
    //Update the UI
    loadChat(currentChatIndex);
    refreshHistoryItem();
    updateActiveHistoryItem();

    // Remove the click event listeners from history items
    allHistoryItems.forEach((historyItem) => {
        historyItem.replaceWith(historyItem.cloneNode(true)); // Clone and replace to remove listeners
        historyItem.classList.remove('deletable')
    });
});
}
// Helper function to delete a chat and reorder the remaining chats
function deleteChatAndReorder(chatsRef, index) {
  return chatsRef.once('value').then((snapshot) => {
    const chats = snapshot.val(); // Retrieve all chats as an object
    const updatedChats = {};

    // Rebuild the chats object with updated index
    let newIndex = 0;
    Object.keys(chats).forEach((key) => {
      if (parseInt(key, 10) !== index) {
        updatedChats[newIndex] = chats[key];
        newIndex++;
      }
    });

    // Replace the entire chats node with the updated chats object
    return chatsRef.set(updatedChats);
  });
}

// Delete all the chat history
function clearAllHistory() {
  const user = firebase.auth().currentUser;
    if (user) {
      // Delete user data from the database first
      db.ref(`users/${user.uid}/chats`).remove();
      db.ref(`users/${user.uid}/currentChatIndex`).remove();

      historyContainer.innerHTML = '';
      startNewChat() // Automatically start a new chat

      // Hide and Show the buttons
      cancelButton.classList.add('hidden');
      clearAllButton.classList.add('hidden');
      clearHistoryButton.classList.remove('hidden');

    } else {
      console.log('No History');
    }
}

// Check whether the send function should be available
function disableSend(){
  // Disable the send button by default (no input)
  sendButton.classList.add('disabled');
        // Event listener for send button click
  sendButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    sendMessage(ev); // Pass ev to sendMessage
    });
    
  // Event listener for Enter key press in the input field
  promptInput.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      if (promptInput.value.trim() !== '') {

      ev.preventDefault(); 
      sendMessage(ev);
    }}
  });
}
  // Prevent empty prompts by detecting input from the input box
  userInputBox.addEventListener('input', () => {
    if (promptInput.value.trim() !== ''){
      sendButton.classList.remove('disabled'); // Enable the send button if there is input
    } else {
      sendButton.classList.add('disabled'); // Disable the send button if there is no input
    }
  })

  stopButton.addEventListener('click', () => { // Add event listener for the stop button
    stop = true;
    userInputBox.focus();
  }
);



function isScrolledToBottom() { // Checks if the current chat is scrolled to the bottom
  return chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight - 100;
}

let checkScrollInterval
function checkScroll() { // Continuously check whether the current chat is scrolled to the bottom
  checkScrollInterval = setInterval(() => {
    if (isScrolledToBottom()) {
      // Hide the scroll button if scrolled to the bottom
      scrollButton.classList.add('hidden');
    } else {
      // Show the scroll button if not at the bottom
      scrollButton.classList.remove('hidden');
    }
  }, 100);
}

function checkUserMessage() {
  const user = auth.currentUser;
  if (!user) {
    console.error("User is not signed in.");
    return;
  }
  const userChatsRef = db.ref(`users/${user.uid}/chats/${currentChatIndex}/messages`);
  
  // Check if there are user messages
  userChatsRef.once('value')
    .then((snapshot) => {
      const messages = snapshot.val();
      let hasUserMessage = false;

      if (messages && Object.keys(messages).length > 0) {
        // Check if any message is from the user
        hasUserMessage = Object.values(messages).some(
          (message) => message.sender === "user"
        );
      } else {
        console.log("The messages are empty.");
      }

      // Show or hide prompts based on the result
      if (!hasUserMessage) {
        showPrompts();
      } else {
        hidePrompts();
      }
    })
    .catch((error) => {
      console.error("Error reading messages:", error);
    });
}




// Event listener for scroll events
chatContainer.addEventListener('scroll', () => {
  if (isScrolledToBottom()) {
    scrollButton.classList.add('hidden'); // Hide button if at bottom
  } else {
    scrollButton.classList.remove('hidden'); // Show button if not at bottom
  }
});

// Scrolls the current chat to the bottom when clicked
scrollButton.addEventListener('click', () => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}
);

// Event listener for new chat button
newChatButton.addEventListener("click", startNewChat);
// Event listener for clear history button
clearHistoryButton.addEventListener("click", clearChatHistory);
// Event listener for clear all button
clearAllButton.addEventListener('click', clearAllHistory)
// Check whether to show prompt based on the input

// Hide the prompt if the chat message container is too small
function checkContainerWidth(width){
  if (width < 550) {
    hidePrompts();
    showPromptButton.classList.add('hidden')
  } else {
    checkUserMessage();
    showPromptButton.classList.remove('hidden');
  }

};  

// Hide the prompt and edit the show prompt button text
function hidePrompts(){
  promptContainer.classList.add('invisible');
  showPromptButton.innerHTML = '?'
};
  // Show the prompt and edit the show prompt button text
function showPrompts(){
  promptContainer.classList.remove('invisible');
  showPromptButton.classList.remove('hidden')
  showPromptButton.innerHTML = 'X';
};
// Puts the selected prompt inside the input box
function insertPrompts(prompt){
  userInputBox.value = prompt.textContent;
};
// Close the prompt container
closeButton.addEventListener('click', () => {
  hidePrompts();
});

// Show prompt button event listener
showPromptButton.addEventListener('click', () => {
  if (showPromptButton.textContent === 'X') {
    hidePrompts(); // Hide prompts if the text is 'X'
  } else {
    showPrompts(); // Show the prompts if the text is '?'
  }
  });

// prompt 1 button event listener
prompt1Button.addEventListener('click', () => {
  insertPrompts(prompt1Button); // put prompt 1 in input box
  sendButton.classList.remove('disabled'); // Enable the send button
  userInputBox.focus(); // Focus on the input box
});
// prompt 2 button event listener
prompt2Button.addEventListener('click', () => {
  insertPrompts(prompt2Button); // put prompt 2 in input box
  sendButton.classList.remove('disabled'); // Enable the send button
  userInputBox.focus(); // Focus on the input box
});
// prompt 3 button event listener
prompt3Button.addEventListener('click', () => {
  insertPrompts(prompt3Button); // put prompt 3 in input box
  sendButton.classList.remove('disabled'); // Enable the send button
  userInputBox.focus(); // Focus on the input box
});

// Check the message container width to decide whether to show prompt
checkContainerWidth(chatContainerWidth);
// Check if the selected chat is scrolled to the bottom
checkScroll();
// Load history when the page is loaded
loadHistory();
// Check whether send should be enabled or not
disableSend();  
