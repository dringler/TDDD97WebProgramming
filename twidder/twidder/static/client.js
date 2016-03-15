//views of the web application
var welcome; //shows the welcome page with the sign-in and sign-up functionalities
var profile; //shows the user page

//token
var token = "";

//global password parameters
var minPwLength = 5;
var suInputOk = false;
var pwChangeOk = false;

//private key for hashing username and password
var privateKey = "myprivatekey";

//function to display the delivered view
displayView = function(view){
	// display a view
	document.getElementById("body").innerHTML = view.innerHTML;

};

/**
 * Init web page
 */
window.onload = function(){
	welcome = document.getElementById("welcomeview");
	profile = document.getElementById("profileview");

//check if user is already signed in
	token = localStorage.getItem("token");
	if (token != "" && token != null) {
		//user is already signed in
		displayView(profile);
		getUserData();
		getUserMessages();
	} else {
		//user is not signed in
		displayView(welcome);	
	}
};

//
// function checkLoginInput() {
// 	var loginEmail = document.getElementById('loginEmail').value;
// 	var loginPassword = document.getElementById('loginPassword').value;
// };

/**
 * hash function to hash the username and password
 * @param {String} username
 * @param {String} password
 * @return {String} hashedCombination
 */
function hashFunction(username, password) {
	var serverRequest = username + password;
	var hash = CryptoJS.HmacSHA256(serverRequest, privateKey);
  	var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
  	return hashInBase64;
}

/**
 * submit the login when Login-Button is pressed
 */
function submitLogin() {
	var username = document.getElementById('loginEmail').value;
	var password = document.getElementById('loginPassword').value;

	//hash username and password
	var hashedServerRequest = hashFunction(username, password);

	//FUNCTION TO CHECK IF SERVER CREATES THE SAME HASH OUT OF THE VARIABLES
	// var pwReq = new XMLHttpRequest();
	// pwReq.open("GET", "get_HMAC/" + username + "/"+ password, true);
	// pwReq.send();

	// pwReq.onreadystatechange = function() {
	// 	if (pwReq.readyState == 4 && pwReq.status == 200) {
	// 		var pwReqData = JSON.parse(pwReq.responseText);
	// 		console.log("SERVER RESPONSE pwReqData");
	// 		console.log(pwReqData);
	// 	}
	// }

	//create formData object
	var loginFormData = new FormData();
	//append all form data to the object that should be send to the server
	loginFormData.append("username", username);
	loginFormData.append("password", password);
	loginFormData.append("hashedServerRequest", hashedServerRequest);
	
	//create new XMLHttpRequest object
	var loginReq = new XMLHttpRequest();
	loginReq.open("POST", "/sign_in", true);
	//send it to the server
	loginReq.send(loginFormData);

	//wait until the request is returned successfully
	loginReq.onreadystatechange = function() {
		if (loginReq.readyState == 4 && loginReq.status == 200) {
			//parse text of loginRequest object
			var loginReqData = JSON.parse(loginReq.responseText);
			// console.log("LOGIN ANSWER loginReqData");
			// console.log(loginReqData);
			//check status of server answer
			if (loginReqData.success == "true") {
				//save token to local storage
				localStorage.setItem("token", loginReqData.data);
				connectSocket(username); //new socket connection
				displayView(profile);
				getUserData();
				getUserMessages();
			} else {
				//display wrong input text
				document.getElementById('wrongLoginText').style.display = "block";	
			}
		}
	}
};

/**
 * check input of sign-up fields
 */
function checkSuInput() {
	//get user input variables
	var suEmail = document.getElementById('signUpEmail').value;
	var suPassword = document.getElementById('signUpPassword').value;
	var suPassword2 = document.getElementById('confirmSignUpPassword').value;
	var suFirstName = document.getElementById('signUpFirstName').value;
	var suLastName = document.getElementById('signUpLastName').value;
	var suGender = document.getElementById('signUpGender').value;
	var suCity = document.getElementById('signUpCity').value;
	var suCountry = document.getElementById('signUpCountry').value;

	if (suEmail != "" && suPassword != "" && suPassword2 != "" && suFirstName != "" && suLastName != "" && suCity != "" && suCountry != "") {
		// input fields are missing
		document.getElementById('missingFields').style.display = "none";	
		if(suPassword == suPassword2 && suPassword.length >= minPwLength ) {
			// user input not missing, password fields match and password is longer than minimum password length
			suInputOk = true;
		} else {
		// two password fields do not match
		document.getElementById('pwNotMatch').style.display = "block";	
		}
	} else {
		//show missing fields text
		document.getElementById('missingFields').style.display = "block";	
	}

};
/**
 * submit the sign up, triggered when Sign Up-Button is pressed
 */
function submitSignUp() {
	//check is user input is valid
	if (suInputOk==true) {
		//get user input variables
		var username = document.getElementById('signUpEmail').value;
		var password = document.getElementById('signUpPassword').value;
		var firstname = document.getElementById('signUpFirstName').value;
		var familyname = document.getElementById('signUpLastName').value;
		var gender = document.getElementById('signUpGender').value;
		var city = document.getElementById('signUpCity').value;
		var country = document.getElementById('signUpCountry').value;
		//create formData object
		var signupFormData = new FormData();
		//add signup data to formData object
		signupFormData.append("username", username);
		signupFormData.append("password", password);
		signupFormData.append("firstName", firstname);
		signupFormData.append("familyName", familyname);
		signupFormData.append("gender", gender);
		signupFormData.append("city", city);
		signupFormData.append("country", country);

		//create formData object
		var loginFormData = new FormData();
		loginFormData.append("username", username);
		loginFormData.append("password", password);

		//create and send signup XMLHttpRequest object
		var signupReq = new XMLHttpRequest();
		signupReq.open("POST", "/sign_up", true);
		signupReq.send(signupFormData);

		//create and send login XMLHttpRequest object
		var loginReq = new XMLHttpRequest();
		loginReq.open("POST", "/sign_in", true);
		loginReq.send(loginFormData);

		signupReq.onreadystatechange = function() {
			if (signupReq.readyState == 4 && signupReq.status == 200) {
				//signupReq is successful
				//parse text of signupRequest object
				var signupReqData = JSON.parse(signupReq.responseText);

				loginReq.onreadystatechange = function() {
					if (loginReq.readyState == 4 && loginReq.status == 200) {
						//login successful
						//parse text of loginRequest object
						var loginReqData = JSON.parse(loginReq.responseText);

						//if both request objects are successfully returned
						if (signupReqData.success == "true" && loginReqData.success == "true") {
							localStorage.setItem("token", loginReqData.data); //save token to local storage
							displayView(profile); //display user page
							getUserData();
							getUserMessages();
						} else {
							// not both request objects are returned successfull, show message
							document.getElementById('suFail').style.display = "block";	
						}
					} 
				}
			}
		}
	} else {
		//user input is not valid
		document.getElementById('suFail').style.display = "block";
	}
};

/**
 * sign out functionality
 */
function signOut() {
	//get tokem from local storage
	token = localStorage.getItem("token");

	//new XMLHttpRequest object
	var signoutReq = new XMLHttpRequest();
	//get user data (send token to get request)
	signoutReq.open("POST", "/sign_out/"+token, true);
	signoutReq.send();
	//wait for request answer
	signoutReq.onreadystatechange = function() {
		if (signoutReq.readyState == 4 && signoutReq.status == 200) {
			//delete token from local storage
			localStorage.setItem("token", "");
			displayView(welcome); //display welcome page
		}
	}
};

/**
 * check password fields for password change
 */
function checkPwChangeInput() {
	document.getElementById('pwChangeSucc').style.display = "none";

	//get user variables
	var oldPW = document.getElementById('oldPasswordChangeID').value;
	var newPW = document.getElementById('newPasswordChangeID').value;
	var newPW2 = document.getElementById('newPasswordChange2ID').value;

	//check if all fields are filled
	if (oldPW != "" && newPW != "" && newPW2 != "") {
		document.getElementById('pwWrong').style.display = "none";
		//check new password against min. length and repetition
		if(newPW == newPW2 && newPW.length >= minPwLength ) {
			document.getElementById('pwChangeFail').style.display = "none";
			// document.getElementById('changePasswordSubmitButton').disabled = false;
			pwChangeOk = true;
		} else {
		// document.getElementById('changePasswordSubmitButton').disabled = true;
		//new passwords do not match or min length is not statisfied
		pwChangeOk = false;
	}
	} else {
		// document.getElementById('changePasswordSubmitButton').disabled = true;
		//not all fields are filled
		pwChangeOk = false;
	}
};

/**
 * show input fields for changing the password, triggered when clicking the "change password"-button
 */
function showChangePassword() {
	var changePwForm = document.getElementById('changePwForm');
	if (changePwForm.style.display != "none") {
		//hide input fields
		changePwForm.style.display = "none";
	} else {
		//show input fields
		changePwForm.style.display = "block";
		//hide text for successfully changing the password
		document.getElementById('pwChangeSucc').style.display = "none";
	}
};

/**
 * submit password change, triggered when pressing the submit-button
 */
function changePasswordSubmit() {
	//check user input
	if (pwChangeOk == true) {
		token = localStorage.getItem("token");
		var oldPW = document.getElementById('oldPasswordChangeID').value;
		var newPW = document.getElementById('newPasswordChangeID').value;
		
		//create formData object
		var pwFormData = new FormData();
		pwFormData.append("token", token)
		pwFormData.append("oldPassword", oldPW);
		pwFormData.append("newPassword", newPW);
		
		//new XMLHttpRequest object
		var pwReq = new XMLHttpRequest();
		pwReq.open("POST", "/change_password", true);
		pwReq.send(pwFormData);

		pwReq.onreadystatechange = function() {
			if (pwReq.readyState == 4 && pwReq.status == 200) {
				//parse text of loginRequest object
				var pwReqData = JSON.parse(pwReq.responseText);
				if (pwReqData.success == "true") {
					//pw change successful
					document.getElementById('pwChangeSucc').style.display = "block";
					document.getElementById('oldPasswordChangeID').value = "";
					document.getElementById('newPasswordChangeID').value = "";
					document.getElementById('newPasswordChange2ID').value = "";
				} else {
					//inorrect password
					document.getElementById('pwWrong').style.display = "block";
					//reset all fields
					document.getElementById('oldPasswordChangeID').value = "";
					document.getElementById('newPasswordChangeID').value = "";
					document.getElementById('newPasswordChange2ID').value = "";
				}
			}
		}
	} else {
		//waiting for correct input
		document.getElementById('pwChangeFail').style.display = "block";
		//reset new password fields
		document.getElementById('newPasswordChangeID').value = "";
		document.getElementById('newPasswordChange2ID').value = ""
	}
};

/**
 * get user data from DB
 */
function getUserData() {
		//get tokem from local storage
		token = localStorage.getItem("token");

		//new XMLHttpRequest object
		var getUserDataReq = new XMLHttpRequest();
		//get user data (send token to get request)
		getUserDataReq.open("GET", "/get_user_data_by_token/"+token, true);
		getUserDataReq.send();

		getUserDataReq.onreadystatechange = function() {
		if (getUserDataReq.readyState == 4 && getUserDataReq.status == 200) {
			//parse returned data to JSNON		
			var returnObject = JSON.parse(getUserDataReq.responseText);
			//display user information
			document.getElementById('mdUsername').innerHTML = returnObject.data.email;
			document.getElementById('mdFirstName').innerHTML  = returnObject.data.firstname;
			document.getElementById('mdLastName').innerHTML = returnObject.data.familyname;
			document.getElementById('mdGender').innerHTML = returnObject.data.gender;
			document.getElementById('mdCity').innerHTML = returnObject.data.city;
			document.getElementById('mdCountry').innerHTML = returnObject.data.country;	
			}
		}
};

/**
 * Get user messages from DB
 */
function getUserMessages() {
	token = localStorage.getItem("token");

	//new XMLHttpRequest object
	var getUserMsgReq = new XMLHttpRequest();
	//get user data (send token to get request)
	getUserMsgReq.open("GET", "/get_user_messages_by_token/"+token, true);
	getUserMsgReq.send();

	getUserMsgReq.onreadystatechange = function() {
		if (getUserMsgReq.readyState == 4 && getUserMsgReq.status == 200) {
			//parse returned data to JSNON		
			var returnObject = JSON.parse(getUserMsgReq.responseText);
			//show user messages
			var userMessagesObject = returnObject.data;
			var userMessages = [];
			if (userMessagesObject.messageContent != undefined) {
				for (i=0; i<userMessagesObject.messageContent.length; i++) {
					//fill array with messages from returnedObject
					userMessages = userMessages + "<p>" + userMessagesObject.messageContent[i] + "(by " + userMessagesObject.fromUser[i] + ")</p>";
				}
			//show all user messages on the page
			document.getElementById('wall').innerHTML = userMessages;
			}
		}
	}
};

/**
 * get user messages by mail
 * @param {String} mail 
 * @param {String} wallid: ElementID of the wall (home or browse page)
 */
function getUserMessagesByMail(mail, wallid) {
	var email = mail;
	token = localStorage.getItem("token");
	//new XMLHttpRequest object
	var getUserMsgReq = new XMLHttpRequest();
	//get user data (send token to get request)
	getUserMsgReq.open("GET", "/get_user_messages_by_email/"+token+"/"+email, true);
	getUserMsgReq.send();

	getUserMsgReq.onreadystatechange = function() {
		if (getUserMsgReq.readyState == 4 && getUserMsgReq.status == 200) {
			//parse returned data to JSNON		
			var returnObject = JSON.parse(getUserMsgReq.responseText);

			var userMessagesObject = returnObject.data;
			var userMessages = [];
			if (userMessagesObject.messageContent != undefined) {
				for (i=0; i<userMessagesObject.messageContent.length; i++) {
					//fill array with messages from returnObject
					userMessages = userMessages + "<p>" + userMessagesObject.messageContent[i] + "(by " + userMessagesObject.fromUser[i] + ")</p>";
				}
			//show messages on the wall
			document.getElementById(wallid).innerHTML = userMessages;
			}
			return true;
		} else {
			return false;
		}
	}
};

/**
 * Post message on own wall
 */
function postButton() {
	token = localStorage.getItem("token");
	var message = document.getElementById('postarea').value;
	var email = "";

	//get email from user
	//new XMLHttpRequest object
	var getUserDataReq = new XMLHttpRequest();
	//get user data (send token to get request)
	getUserDataReq.open("GET", "/get_user_data_by_token/"+token, true);
	getUserDataReq.send();

	getUserDataReq.onreadystatechange = function() {
		if (getUserDataReq.readyState == 4 && getUserDataReq.status == 200) {
			//parse returned data to JSNON		
			var returnObject = JSON.parse(getUserDataReq.responseText);
			//display user information
			if (returnObject.success == "true") {
				email = returnObject.data.email;
				//create formData object
				var postFormData = new FormData();
				postFormData.append("token", token);
				postFormData.append("message", message);
				postFormData.append("toUser", email);
				
				//new XMLHttpRequest object
				var postReq = new XMLHttpRequest();
				postReq.open("POST", "/post_message", true);
				postReq.send(postFormData);

				postReq.onreadystatechange = function() {
					if (postReq.readyState == 4 && postReq.status == 200) {
						//parse text of loginRequest object
						var loginReqData = JSON.parse(postReq.responseText);
						if (loginReqData.success == "true") {
							//clear post field
							document.getElementById('postarea').value = "";
							//refresh the user wall to show new message
							refreshWall();
						}
					}
				}
			}
		}
	}
};

/**
 * refresh the user wall
 */
function refreshWall() {
	getUserMessages();
};

/**
 * post a message to different user wall
 */
function postButtonBrowse() {
	token = localStorage.getItem("token");
	var message = document.getElementById('postareaBrowse').value;
	var email = document.getElementById('searchUserID').value;

	//create formData object
	var postFormData = new FormData();
	postFormData.append("token", token);
	postFormData.append("message", message);
	postFormData.append("toUser", email);
				
	//new XMLHttpRequest object
	var postReq = new XMLHttpRequest();
	postReq.open("POST", "/post_message", true);
	postReq.send(postFormData);

	postReq.onreadystatechange = function() {
		if (postReq.readyState == 4 && postReq.status == 200) {
			//parse text of loginRequest object
			var loginReqData = JSON.parse(postReq.responseText);
			if (loginReqData.success == "true") {
				//clear input field
				document.getElementById('postareaBrowse').value = "";
				refreshWallBrowse();
			}
		}
	}
};

/**
 * refresh wall from user in browse tab
 */
function refreshWallBrowse() {
	getUserMessagesByMail(document.getElementById('searchUserID').value, 'oWall');
};

/**
 * search for a user in the browse tab
 */
function searchUser() {	
	token = localStorage.getItem("token");
	var email = document.getElementById('searchUserID').value;

	//new XMLHttpRequest object 
	var getUserDataReq = new XMLHttpRequest();
	//get user data (send token to get request)
	getUserDataReq.open("GET", "/get_user_data_by_email/"+token+"/"+email, true);
	getUserDataReq.send();

	getUserDataReq.onreadystatechange = function() {
		if (getUserDataReq.readyState == 4 && getUserDataReq.status == 200) {

			var returnObject = JSON.parse(getUserDataReq.responseText);
			if (returnObject.success == "true") {

				//display user information
				document.getElementById('userWall').style.display = "block";
				// document.getElementById('searchUserFail').style.display = "none";
				document.getElementById('searchUserFail').className = "collapse";

				document.getElementById('userWallHeader').innerHTML = "Wall of " + returnObject.data.email;
				//show user information
				document.getElementById('oUsername').innerHTML = returnObject.data.email;
				document.getElementById('oFirstName').innerHTML  = returnObject.data.firstname;
				document.getElementById('oLastName').innerHTML = returnObject.data.familyname;
				document.getElementById('oGender').innerHTML = returnObject.data.gender;
				document.getElementById('oCity').innerHTML = returnObject.data.city;
				document.getElementById('oCountry').innerHTML = returnObject.data.country;

				var wasSucc = getUserMessagesByMail(returnObject.data.email, 'wall');
				//show user messages
				refreshWallBrowse();

				if (wasSucc == false) {
					document.getElementById('userWall').style.display = "none";
					document.getElementById('searchUserFail').className = "";
				}
			} else {
				document.getElementById('userWall').style.display = "none";
				document.getElementById('searchUserFail').className = "";
			}
		} else {
			document.getElementById('userWall').style.display = "none";
			document.getElementById('searchUserFail').className = "";
		}
	}
};

//D3 Live Data
var nPosts;
var nUsers;
var nMap;

/**
 * initalize live data
 */
function initLiveData() {

	token = localStorage.getItem("token");

	//new XMLHttpRequest object 
	var getLiveDataReq = new XMLHttpRequest();
	//get user data (send token to get request)
	// getLiveDataReq.open("GET", "/get_live_data", true);
	getLiveDataReq.open("GET", "/get_live_data/"+token, true);
	getLiveDataReq.send();

	getLiveDataReq.onreadystatechange = function() {
		// console.log("getLiveDataReq");
		// console.log(getLiveDataReq);
		if (getLiveDataReq.readyState == 4 && getLiveDataReq.status == 200) {
			//parse text of loginRequest object
			var liveData = JSON.parse(getLiveDataReq.responseText);
			if (liveData.success == "true") {
								
				//USER MESSAGES CHART
				//create array and add all returned data to it
				var piePostDataArray = new Array();
				for (var i = 0; i<liveData.data.total_user_messages.length; i++) {
					var obj = new Object();
					obj.fromUser = liveData.data.total_user_messages[i][0];
					obj.count = liveData.data.total_user_messages[i][1];
					piePostDataArray.push(obj);
				}
				//parse array to JSON for D3
				var piePostDataJSON = JSON.parse(JSON.stringify(piePostDataArray));
				//create chart with data
				nPosts = new piePosts(piePostDataJSON);

				//CURRENT ONLINE/OFFLINE USERS
				//create array and add returned data
				pieUserDataArray = new Array();
				var onlineObject = new Object();
				onlineObject.status = "online";
				onlineObject.count = liveData.data.curr_online_users;
				pieUserDataArray.push(onlineObject);
				var userObject = new Object();
				userObject.status = "offline";
				userObject.count = liveData.data.total_users - liveData.data.curr_online_users;
				pieUserDataArray.push(userObject);

				//parse array to JSON 
				var pieUserDataJSON = JSON.parse(JSON.stringify(pieUserDataArray));
				//create chart with data
				nUsers = new pieUsers(pieUserDataJSON);

				//USER COUNTRY DISTRIBUTION
				//create array for data
				var mapDataArray = new Array();
				//add retrieved data to array
				for (var i = 0; i<liveData.data.user_countries.length; i++) {
					var obj = new Object();
					obj.countryName = liveData.data.user_countries[i][0];
					obj.count = liveData.data.user_countries[i][1];
					mapDataArray.push(obj);
				}
				//parse array to JSON
				var mapDataJSON = JSON.parse(JSON.stringify(mapDataArray));
				//create chart with JSON data
				nMap = new map(mapDataJSON);
			}
		}
	}
}

/**
 * Web Socket
 * @param {String} email
 */
function connectSocket(email) {
	//create new web socket
    var ws = new WebSocket("ws://localhost:5000/connect_socket");

    //open new websocket for user
    ws.onopen = function() {
        ws.send(email);
    };

    //check message
    ws.onmessage = function(response) {
    	//sign out user when new session is started
        if (response.data == "sign_out") {
            signOut();
        };
    };
    //close web socket
    ws.onclose = function() {
        console.log("WebSocket closed");
    };
    //web socket error
    ws.onerror = function() {
        console.log("WebSocket error!");
    };
}
