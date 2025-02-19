// Database config
const firebaseConfig = {
    apiKey: "AIzaSyD9lP6HWENT1eoaPubNdc2BJKAZP6uEtgs",
    authDomain: "login-93b7c.firebaseapp.com",
    databaseURL: "https://login-93b7c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "login-93b7c",
    storageBucket: "login-93b7c.firebasestorage.app",
    messagingSenderId: "1071407429197",
    appId: "1:1071407429197:web:6c88dda674de5d2dae8e04",
    measurementId: "G-HR35VE9TZ5"
  };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

//register button
const getin = document.getElementById('getin');
getin.addEventListener("click", function(event){
    event.preventDefault()
    //get the user inputs
    const email = document.getElementById('email-signin').value;
    const password = document.getElementById('password-signin').value;
    auth.signInWithEmailAndPassword(email, password) // Checks the email and password according to the one stored in db
    .then(() => {
      // Signed in 
      alert("Logging in...")
      window.location.href="dashboard.html"; // Go to the dashbord html after loggin in
    })
    .catch(() => {
      const errorMessage = 'Wrong Password or Username'; // Alert that the user input wrong password or username
      alert(errorMessage)
    });
})

//register button
const enlist = document.getElementById('enlist');
enlist.addEventListener("click",function(event){
    event.preventDefault()
    //inputs
    const email = document.getElementById('email-signup').value;
    const password = document.getElementById('password-signup').value;
    const username = document.getElementById('username-signup').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
        // Signed up 
        alert("Creating Account...")
        
        const userEmail = userCredential.user.email.replace(/[^a-zA-Z0-9]/g, ','); // Store the email in database
        db.ref(`users/${userEmail}/username`).set(username)    
    })
    .then(()=>{
        container.classList.remove("active");

    })
    .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage)
    });
})

// Sign in with google
// Initialize the google auth
const googleProvider = new firebase.auth.GoogleAuthProvider();
// Shows the google sign in when clicking the button
const googleSignInBtn = document.getElementById('signin-google');
googleSignInBtn.addEventListener('click', () => {
  firebase.auth().signInWithPopup(googleProvider)
    .then((result) => {
      const user = result.user; // Gets the user data from the google account
      const userEmail = user.email;
      console.log("User's email:", userEmail);
    })
    .then(() => {
      // Signed in alert
      alert("Logging in...")
      window.location.href="dashboard.html";
    })
    .catch((error) => {
      console.error(error);
    });
});

 
