//jQuery for calendar
(function($) {
	"use strict";
	document.addEventListener('DOMContentLoaded', function() {

        // Initialize variables
        var today = new Date(),
            year = today.getFullYear(),
            month = today.getMonth(),
            monthTag =["January","February","March","April","May","June","July","August","September","October","November","December"],
            day = today.getDate(),
            days = document.getElementsByTagName('td'),
            selectedDay;
                    
        // To declare the calendar
        function Calendar() {
            this.draw();
        }

        // Drawing the calendar
        Calendar.prototype.draw  = function() {
            this.getCookie('selected_day');
            this.drawDays();
            var that = this,
                reset = document.getElementById('reset'),
                pre = document.getElementById('prev-month'),
                next = document.getElementById('next-month');
            pre.addEventListener('click', function(){that.preMonth(); });
            next.addEventListener('click', function(){that.nextMonth(); });
            reset.addEventListener('click', function(){that.reset(); });
            for (var i = 0; i < days.length; i++) {
                if (days[i].id === "enabled") { // Ensures the enabled dates are clickable
                    days[i].onclick = function() { 
                        that.clickDay(this);
                    };
                }
            }
        };

        // Drawing the calendar header
        Calendar.prototype.drawHeader = function(e) {
            var headDay = document.getElementsByClassName('head-day'),
                headMonth = document.getElementsByClassName('head-month');
            headMonth[0].innerHTML = monthTag[month] + "  " + year;     
            $("#date").text(monthTag[month] + " " + (e ? e : headDay[0].innerHTML = day) + ", " + year);
        };
        
        // Drawing the calendar dates (in respective to the month and year)
        Calendar.prototype.drawDays = function() {
            var startDay = new Date(year, month, 1).getDay(),
                nDays = new Date(year, month + 1, 0).getDate(),
                n = startDay;

            for (var k = 0; k < 42; k++) { // Resets whole calendar dates
                days[k].innerHTML = '';
                days[k].id = '';
                days[k].className = 'date-numbers';
                days[k].onclick = null;
            }

            for (var i = 1; i <= nDays; i++) { // Selecting dates for the month (and year)
                days[n].innerHTML = i;
                days[n].id = "enabled";
                days[n].onclick = this.clickDay.bind(this, days[n])
                n++;
            }

            for (var j = 0; j < 42; j++) {
                if (days[j].innerHTML === "") { // Differentiating empty dates
                    days[j].id = "disabled";

                } else if (j === day + startDay - 1) { // Selecting the date today
                    if ((month === today.getMonth()) && (year ===today.getFullYear())){
                        this.drawHeader(day);
                        days[j].id = "today";
                    }
                } 

                if (selectedDay) { // If a date is selected, header is redrawn to the date
                    if((j === selectedDay.getDate() + startDay - 1) && (month === selectedDay.getMonth()) && (year === selectedDay.getFullYear())) {
                        days[j].className = "selected";
                        this.drawHeader(selectedDay.getDate());
                    }
                }
            }
        };

        // Handles user input (clicking dates)
        Calendar.prototype.clickDay = function(o) {
            var selected = document.getElementsByClassName("selected"),
                len = selected.length;

            if (len !== 0) { // Ensures date exists
                selected[0].className = "date-numbers";
            }

            o.className = "selected";
            selectedDay = new Date(year, month, o.innerHTML);
            this.drawHeader(o.innerHTML);
            this.setCookie('selected_day', 1);
        };
        
        // Switches to the previous month
        Calendar.prototype.preMonth = function() {
            if (month < 1) { 
                month = 11;
                year = year - 1; 
            } else {
                month = month - 1;
            }
            
            if (month !== today.getMonth()) {
                selectedDay = new Date(year, month, 1); // Sets date to the first day of the month
            } else {
                selectedDay = today;
            }
            this.drawHeader(1);
            this.drawDays();
            this.setCookie('selected_day', 1);
        };

        // Switches to the next month
        Calendar.prototype.nextMonth = function() {
            if (month >= 11) {
                month = 0;
                year =  year + 1; 
            } else{
                month = month + 1;
            }

            if (month !== today.getMonth()) {
                selectedDay = new Date(year, month, 1);
            } else {
                selectedDay = today;
            }
            this.drawHeader(1);
            this.drawDays();
            this.setCookie('selected_day', 1);
        };
        
        // Handles today button function
        Calendar.prototype.reset = function() {
            month = today.getMonth();
            year = today.getFullYear();
            day = today.getDate();
            selectedDay = today;
            this.drawDays();
            this.setCookie('selected_day', 1);
        };
        
        // Stores selected date in a cookie
        Calendar.prototype.setCookie = function(name, expireddays) {
            if (expireddays) {
                var date = new Date();
                date.setTime(date.getTime() + (expireddays * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
            } else{
                var expires = "";
            }
            document.cookie = name + "=" + selectedDay + expires + "; path=/";
        };

        document.cookie = "selected_day=" + new Date() + "; path=/";

        // Gets selected date from the cookie
        Calendar.prototype.getCookie = function(name) {
            if (document.cookie.length) {
                var arrCookie  = document.cookie.split(';'),
                    nameEQ = name + "=";
                for (var i = 0, cLen = arrCookie.length; i < cLen; i++) {
                    var c = arrCookie[i];
                    while (c.charAt(0)==' ') {
                        c = c.substring(1,c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        selectedDay =  new Date(c.substring(nameEQ.length, c.length));
                    }
                }
            }
        };

        new Calendar(); // Initializes the calendar
    }, false);
})(jQuery);

// Initializing firebase (authentication and real-time database)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const dbConfig = { // configuration for real-time database
    apiKey: "AIzaSyCepN1r_bYYwR-s0jdv2A4gH5hJbWojTes",
    authDomain: "hci-final-e2c95.firebaseapp.com",
    projectId: "hci-final-e2c95",
    storageBucket: "hci-final-e2c95.firebasestorage.app",
    messagingSenderId: "260974227471",
    appId: "1:260974227471:web:f07db35c7e81234455b37a",
    measurementId: "G-SQY9PH3PWZ",
    databaseURL: "https://hci-final-e2c95-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

const authConfig = { // configuration for authentication
    apiKey: "AIzaSyD9lP6HWENT1eoaPubNdc2BJKAZP6uEtgs",
    authDomain: "login-93b7c.firebaseapp.com",
    databaseURL: "https://login-93b7c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "login-93b7c",
    storageBucket: "login-93b7c.firebasestorage.app",
    messagingSenderId: "1071407429197",
    appId: "1:1071407429197:web:6c88dda674de5d2dae8e04",
    measurementId: "G-HR35VE9TZ5"
  };

// Initialize Firebase Authentication
const authApp = initializeApp(authConfig);
const auth = getAuth(authApp);

// Initialize Firebase Realtime Database
const dbApp = initializeApp(dbConfig, "db");
const database = getDatabase(dbApp);

// Function to get userid before executing the rest of the code
function getUserId() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve(user.uid); // Resolve promise with user ID
        }
      });
    });
  }

// Executes on program load
document.addEventListener("DOMContentLoaded", async () => {
    const userid = await getUserId(); // Waits for userid

    // Function to get cookie content (selected date)
    function getCookie(name) {
        if (document.cookie.length) {
            var arrCookie = document.cookie.split(';'),
                nameEQ = name + "=";
            for (var i = 0, cLen = arrCookie.length; i < cLen; i++) {
                var c = arrCookie[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1, c.length);  // Trim whitespace
                }
                if (c.indexOf(nameEQ) === 0) {
                    return new Date(c.substring(nameEQ.length, c.length)); // Return the selected date
                }
            }
        }
        return null; // Return null if the cookie is not found
    }

    // Function to get current date string
    function getCurrentDateString(selectedDate) {
        const date = selectedDate || new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Months are 0-indexed
        const day = date.getDate();
        return `${day}-${month}-${year}`;
    }

    // Retrieve the selected date from the cookie
    let dateString = getCurrentDateString(getCookie('selected_day'));

    // Chart values
    const xValues = [ "sun", "mon", "tues", "wed", "thurs", "fri", "sat"];
    let healthvalues0 = [],
        healthvalues1 = [],
        healthvalues2 = [],
        healthvalues3 = [],
        healthvalues4 = [];

    // Initialize chart
    let myChart = new Chart("myChart", {
        type: "line",
        data: {
            labels: xValues,
            datasets: [
                {
                    label: "blood pressure",
                    backgroundColor: "#648FFF",
                    borderColor: "#648FFF",
                    data: healthvalues0
                },
                {
                    label: "heart rate",
                    backgroundColor: "#785EF0",
                    borderColor: "#785EF0",
                    data: healthvalues1
                },
                {
                    label: "oxygen levels",
                    backgroundColor: "#DC267F",
                    borderColor: "#DC267F",
                    data: healthvalues2
                },
                {
                    label: "glucose levels",
                    backgroundColor: "#FE6100",
                    borderColor: "#FE6100",
                    data: healthvalues3
                },
                {
                    label: "respiratory rate",
                    backgroundColor: "#FFB000",
                    borderColor: "#FFB000",
                    data: healthvalues4
                },
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: function(context) {
                                const width = context.chart.width;
                                return Math.max(Math.round(width / 64), 9); // Calculates font size according to chart width
                            }
                        }
                    }
                }
            }
        }
    });

    // Function to get the start of the week (Sunday) for the selected date
    function getStartOfWeek(date) {
        const dayOfWeek = date.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const diff = date.getDate() - dayOfWeek; // Calculate the difference between the selected date and the previous Sunday
        const startOfWeek = new Date(date.setDate(diff)); // Set the date to the previous Sunday
        return startOfWeek;
    }

    // Function to update the weekly graph
    function updateGraphForWeek(selectedDate) {
        let startOfWeek = getStartOfWeek(selectedDate);
        const healthMetrics = ["bloodPressure", "heartRate", "glucoseLevel", "oxygenLevel", "respiratoryRate"];
        const listeners = []; // Keep track of listeners for cleanup later if needed

        // Loop through each health metric
        for (let j = 0; j < healthMetrics.length; j++) {
            let yValues = Array(7).fill(null); // Start with empty values for each day of the week
            // Set up real-time listener for each day's data
            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dayString = getCurrentDateString(date);
                const dataRef = ref(database, `health-data/${userid}/${dayString}/${healthMetrics[j]}`);
                const unsubscribe = onValue(dataRef, (snapshot) => {
                    const value = snapshot.exists() ? snapshot.val() : null;
                    yValues[i] = value !== "-" ? value : null; // Handle missing or invalid values
                    myChart.data.datasets[j].data = yValues; // Update the chart with new values
                    myChart.update();
                });
                listeners.push(unsubscribe);
            }
        }

        // Updates the week above the chart
        document.getElementById("week").innerText = getCurrentDateString(startOfWeek).split("-").join("/") + " - " +
                                                    getCurrentDateString(new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6)).split("-").join("/");
        
        // Cleanup listeners if they exist
        window.cleanupListeners = function() {
            listeners.forEach(unsub => unsub());
        };
    }

    // Function to update the whole page if a new date is selected
    document.getElementById("calendar").addEventListener("click", function () {
        dateString = getCurrentDateString(getCookie('selected_day'))
        editSlideContent("-1", "none", dateString);
    });
    
    // Function to enhance carousel by cloning slides (allows 4 slides to be shown at a time)
    const enhanceCloningLogic = () => {
        const items = document.querySelectorAll('#recipeCarousel .carousel-item');
        items.forEach((el) => {
            let minPerSlide = 4;
            let next = el.nextElementSibling;
            // Loop to create additional clones
            for (let i = 1; i < minPerSlide; i++) {
                if (!next) {
                    // Wrap carousel by using the first child (creating a loop)
                    next = items[0];
                }
                // Clone the next sibling
                let cloneChild = next.cloneNode(true);
                cloneChild.classList.remove('active'); // Remove the active class from the cloned slide
                // Insert the cloned slide correctly by appending its child
                el.appendChild(cloneChild.children[0]); // Append only the child content
                next = next.nextElementSibling; // Move to the next sibling
            }
        });
        editSlideContent("-1", "none", dateString);
    };
    
    getCurrentDateString(new Date());
    let isEditing = false; // Track editing state

    // Controls the element when being edited
    document.addEventListener("focusin", function (event) {
        if (event.target.classList.contains("editable") || event.target.getAttribute("contenteditable")) {
            isEditing = true; // Editing has started
            event.target.addEventListener("input", () => {
                const text = event.target.innerText; // Get the text content of the element
                if (event.target.getAttribute('data-id') == "bloodPressure") {
                    event.target.textContent = event.target.textContent.replace(/[^0-9/]/g, "");
                    if (text.length == 4 && !text.includes("/")) {
                        event.target.innerText = text.slice(0, 3) + "/" + text.slice(3);
                    }
                    if (text.length > 5) {
                        event.target.innerText = text.slice(0, 6); // Truncate text
                    }
                } else if (event.target.getAttribute('data-id') == "respiratoryRate") {
                    event.target.textContent = event.target.textContent.replace(/[^0-9]/g, "");
                    if (text.length > 1) {
                        event.target.innerText = text.slice(0, 2); // Truncate text
                    }
                } else if (event.target.getAttribute('data-id') == "oxygenLevel" || event.target.getAttribute('data-id') == "heartRate" || event.target.getAttribute('data-id') == "glucoseLevel") {
                    event.target.textContent = event.target.textContent.replace(/[^0-9]/g, "");
                    if (text.length > 2) {
                        event.target.innerText = text.slice(0, 3); // Truncate text
                    }
                } else {
                    if (text.length > 19) {
                        event.target.innerText = text.slice(0, 20); // Truncate text
                    }
                }
                placeCaretAtEnd(event.target);
            });
        }
    });

    // Function that will place caret at the end when editing
    function placeCaretAtEnd(element) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false); // Collapse to the end
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Reset the editing state on focus out
    document.addEventListener("focusout", function (event) {
        if (event.target.classList.contains("editable")) {
            isEditing = false; // Editing has stopped
        }
        editSlideContent(event.target.getAttribute('data-id'), event.target.innerText, dateString); // Update the slide content
    });

    // Function to update the content on all slides (including inactive ones)
    function updateSlideContent(dateString) {
        if (isEditing) return; // Skip updates while editing
        document.querySelectorAll('.carousel-item').forEach((slide) => {
            const editableElements = slide.querySelectorAll('.editable'); // Find all editable elements within the slide
            editableElements.forEach((editableElement) => {
                const dataid = editableElement.getAttribute('data-id'); // Get the data-id attribute
                get(ref(database, `health-data/${userid}/${dateString}/${dataid}`)).then((snapshot) => {
                    editableElement.innerText = snapshot.val();
                });
            });
        });
        updateGraphForWeek(getCookie('selected_day'));
    };

    // Function to handle the content editing
    let updateTimeout;
    function editSlideContent(dataid, newText, dateString) {
        if (updateTimeout) clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            get(ref(database, `health-data/${userid}/${dateString}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    if (dataid != "-1") {
                        if (newText.trim() != "") {
                            update(ref(database, `health-data/${userid}/${dateString}`), {
                                [dataid]: newText,
                            });
                        } else {
                            update(ref(database, `health-data/${userid}/${dateString}`), {
                                [dataid]: "-",
                            });
                        }
                    }
                } else {
                    set(ref(database, `health-data/${userid}/${dateString}`), {
                        bloodPressure: "-",
                        heartRate: "-",
                        oxygenLevel: "-",
                        glucoseLevel: "-",
                        respiratoryRate: "-",
                    });
                }
                updateSlideContent(dateString); // Sync once after the update
            });
        }, 300); // Debounce by 300ms (ensures that there will be no collision of multiple values)
    }

    // Initialize the carousel by cloning and syncing content
    enhanceCloningLogic();

    // Carousel controls
    document.querySelector('.carousel-control-next').addEventListener('click', function () {
        $('#recipeCarousel').carousel('next');
        updateSlideContent(dateString); // Re-sync after moving next
    });
    document.querySelector('.carousel-control-prev').addEventListener('click', function () {
        $('#recipeCarousel').carousel('prev');
        updateSlideContent(dateString); // Re-sync after moving previous
    });

    // Calendar controls
    document.querySelector('#next-month').addEventListener('click', function () {
        dateString = getCurrentDateString(getCookie('selected_day'))
        editSlideContent("-1", "none", dateString);
    });
    document.querySelector('#prev-month').addEventListener('click', function () {
        dateString = getCurrentDateString(getCookie('selected_day'))
        editSlideContent("-1", "none", dateString);
    });
    document.querySelector('#reset').addEventListener('click', function () {
        dateString = getCurrentDateString(getCookie('selected_day'))
        editSlideContent("-1", "none", dateString);
    });

    // Button initialization
    const addReminderButton = document.getElementById('add-reminder');
    const remindersList = document.getElementById('reminders-list');

    // Load reminders from Firebase
    function loadReminders() {
        get(ref(database, `health-data/${userid}/reminders`)).then((snapshot) => {
            if (snapshot.exists()) {
                remindersList.innerHTML = ''; // Clear the list
                snapshot.forEach((childSnapshot) => {
                    const reminderId = childSnapshot.key;
                    const reminderData = childSnapshot.val();
                    addReminderToDOM(reminderId, reminderData.text, reminderData.isChecked);
                });
            }
        });
    }

    // Add a reminder to the DOM
    function addReminderToDOM(id, text = 'New Reminder', isChecked = false) {
        const reminder = document.createElement('div');
        reminder.classList.add('reminder');
        reminder.id = id; // Use `id` attribute to store the reminder ID

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;

        // Update Firebase when checkbox is toggled
        checkbox.addEventListener('change', () => {
            update(ref(database, `health-data/${userid}/reminders/${id}`), {
                isChecked: checkbox.checked,
            });
        });

        // Reminder text
        const reminderText = document.createElement('span');
        reminderText.textContent = text;
        reminderText.setAttribute('contenteditable', 'true');

        // Update Firebase when reminder text is edited
        reminderText.addEventListener('blur', () => {
            update(ref(database, `health-data/${userid}/reminders/${id}`), {
                text: reminderText.textContent,
            });
        });

        // Delete button (trashcan icon)
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = '&#128465;'; // Trashcan emoji

        // Delete the reminder from Firebase and DOM
        deleteButton.addEventListener('click', () => {
            remove(ref(database, `health-data/${userid}/reminders/${id}`)).then(() => {
                remindersList.removeChild(reminder);
            });
        });

        // Append elements to the reminder div
        reminder.appendChild(checkbox);
        reminder.appendChild(reminderText);
        reminder.appendChild(deleteButton);

        // Append reminder to the list
        remindersList.appendChild(reminder);
    }

    // Add a new reminder to Firebase and instantly show it
    addReminderButton.addEventListener('click', () => {
        // Generate a temporary ID for the reminder
        const tempId = `${Date.now()}`;

        // Add reminder to the DOM immediately
        addReminderToDOM(tempId, 'New Reminder', false);

        // Save the reminder to Firebase
        const newReminderRef = push(ref(database, `health-data/${userid}/reminders`));
        const newReminder = {
            text: 'New Reminder',
            isChecked: false,
        };

        set(newReminderRef, newReminder).then(() => {
                // Update the reminder's ID in the DOM after Firebase assigns the ID
                const reminder = document.getElementById(tempId);
                reminder.id = newReminderRef.key;
        });
    });
    
    // Load all reminders on page load
    loadReminders();
});

    