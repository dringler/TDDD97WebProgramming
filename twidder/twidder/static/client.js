var welcome;
var profile;
var loginObject;
var token = "";
var minPwLength = 5;
var suInputOk = false;
var pwChangeOk = false;


displayView = function(view){
	// the code required to display a view
	document.getElementById("body").innerHTML = view.innerHTML;

};

window.onload = function(){
	welcome = document.getElementById("welcomeview");
	profile = document.getElementById("profileview");

//check if user is already signed in
	token = localStorage.getItem("token");
	if (token != "" && token != null) {
		displayView(profile);
		getUserData();
		getUserMessages();
	} else {
		displayView(welcome);	
	}
};

function checkLoginInput() {
	var loginEmail = document.getElementById('loginEmail').value;
	var loginPassword = document.getElementById('loginPassword').value;
};

function submitLogin() {
	var username = document.getElementById('loginEmail').value;
	var password = document.getElementById('loginPassword').value;

	//create formData object
	var loginFormData = new FormData();
	loginFormData.append("username", username);
	loginFormData.append("password", password);
	
	//new XMLHttpRequest object
	var loginReq = new XMLHttpRequest();
	loginReq.open("POST", "/sign_in", true);
	loginReq.send(loginFormData);

	loginReq.onreadystatechange = function() {
		if (loginReq.readyState == 4 && loginReq.status == 200) {
			//parse text of loginRequest object
			var loginReqData = JSON.parse(loginReq.responseText);
			if (loginReqData.success == "true") {
				localStorage.setItem("token", loginReqData.data);
				connectSocket(username);
				displayView(profile);
				getUserData();
				getUserMessages();
			} else {
				document.getElementById('wrongLoginText').style.display = "block";	
			}
		}
	}
};

function checkSuInput() {
	var suEmail = document.getElementById('signUpEmail').value;
	var suPassword = document.getElementById('signUpPassword').value;
	var suPassword2 = document.getElementById('confirmSignUpPassword').value;
	var suFirstName = document.getElementById('signUpFirstName').value;
	var suLastName = document.getElementById('signUpLastName').value;
	var suGender = document.getElementById('signUpGender').value;
	var suCity = document.getElementById('signUpCity').value;
	var suCountry = document.getElementById('signUpCountry').value;

	if (suEmail != "" && suPassword != "" && suPassword2 != "" && suFirstName != "" && suLastName != "" && suCity != "" && suCountry != "") {
		document.getElementById('missingFields').style.display = "none";	
		if(suPassword == suPassword2 && suPassword.length >= minPwLength ) {
			suInputOk = true;
		} else {
		document.getElementById('pwNotMatch').style.display = "block";	
		}
	} else {
		document.getElementById('missingFields').style.display = "block";	
	}

};

function submitSignUp() {
	if (suInputOk==true) {
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

		//new signup XMLHttpRequest object
		var signupReq = new XMLHttpRequest();
		signupReq.open("POST", "/sign_up", true);
		signupReq.send(signupFormData);

		//new login XMLHttpRequest object
		var loginReq = new XMLHttpRequest();
		loginReq.open("POST", "/sign_in", true);
		loginReq.send(loginFormData);

		signupReq.onreadystatechange = function() {
			if (signupReq.readyState == 4 && signupReq.status == 200) {
				//parse text of signupRequest object
				var signupReqData = JSON.parse(signupReq.responseText);

				loginReq.onreadystatechange = function() {
					if (loginReq.readyState == 4 && loginReq.status == 200) {
						//parse text of loginRequest object
						var loginReqData = JSON.parse(loginReq.responseText);


						if (signupReqData.success == "true" && loginReqData.success == "true") {
							localStorage.setItem("token", loginReqData.data);
							displayView(profile);
							getUserData();
							getUserMessages();
						} else {
							document.getElementById('suFail').style.display = "block";	
						}
					} 

				}

			}
		}
	} else {
		document.getElementById('suFail').style.display = "block";
	}
};

function signOut() {
	//get tokem from local storage
	token = localStorage.getItem("token");

	//new XMLHttpRequest object
	var signoutReq = new XMLHttpRequest();
	//get user data (send token to get request)
	signoutReq.open("POST", "/sign_out/"+token, true);
	signoutReq.send();

	signoutReq.onreadystatechange = function() {
		if (signoutReq.readyState == 4 && signoutReq.status == 200) {
			localStorage.setItem("token", "");
			displayView(welcome);
		}
	}
	
};

function checkPwChangeInput() {
	document.getElementById('pwChangeSucc').style.display = "none";

	var oldPW = document.getElementById('oldPasswordChangeID').value;
	var newPW = document.getElementById('newPasswordChangeID').value;
	var newPW2 = document.getElementById('newPasswordChange2ID').value;

	if (oldPW != "" && newPW != "" && newPW2 != "") {
		document.getElementById('pwWrong').style.display = "none";
		if(newPW == newPW2 && newPW.length >= minPwLength ) {
			document.getElementById('pwChangeFail').style.display = "none";
			// document.getElementById('changePasswordSubmitButton').disabled = false;
			pwChangeOk = true;
		}  else {
		// document.getElementById('changePasswordSubmitButton').disabled = true;
		pwChangeOk = false;
	}
	} else {
		// document.getElementById('changePasswordSubmitButton').disabled = true;
		pwChangeOk = false;
	}
};


function showChangePassword() {
	var changePwForm = document.getElementById('changePwForm');
	if (changePwForm.style.display != "none") {
		changePwForm.style.display = "none";
	} else {
		changePwForm.style.display = "block";
		document.getElementById('pwChangeSucc').style.display = "none";
	}

};

function changePasswordSubmit() {
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

			var userMessagesObject = returnObject.data;
			var userMessages = [];
			if (userMessagesObject.messageContent != undefined) {
				for (i=0; i<userMessagesObject.messageContent.length; i++) {
					userMessages = userMessages + "<p>" + userMessagesObject.messageContent[i] + "(by " + userMessagesObject.fromUser[i] + ")</p>";
				}
			document.getElementById('wall').innerHTML = userMessages;
			}
		}
	}
};
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
					userMessages = userMessages + "<p>" + userMessagesObject.messageContent[i] + "(by " + userMessagesObject.fromUser[i] + ")</p>";
				}
			document.getElementById(wallid).innerHTML = userMessages;
			}
		}
	}
};

//post on own wall
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
							document.getElementById('postarea').value = "";
						}
					}
				}
			}
		}
	}
};

function refreshWall() {
	getUserMessages();
};

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
				document.getElementById('postareaBrowse').value = "";
			}
		}
	}
};

function refreshWallBrowse() {
	getUserMessagesByMail(document.getElementById('searchUserID').value, 'oWall');
};



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
				document.getElementById('searchUserFail').style.display = "none";

				document.getElementById('userWallHeader').innerHTML = "Wall of " + returnObject.data.email;

				document.getElementById('oUsername').innerHTML = returnObject.data.email;
				document.getElementById('oFirstName').innerHTML  = returnObject.data.firstname;
				document.getElementById('oLastName').innerHTML = returnObject.data.familyname;
				document.getElementById('oGender').innerHTML = returnObject.data.gender;
				document.getElementById('oCity').innerHTML = returnObject.data.city;
				document.getElementById('oCountry').innerHTML = returnObject.data.country;

				getUserMessagesByMail(returnObject.data.email, 'wall');
			} else {
				document.getElementById('userWall').style.display = "none";
				document.getElementById('searchUserFail').style.display = "block";
			}

		}
	}
};
// Web Socket
function connectSocket(email) {
    var ws = new WebSocket("ws://localhost:5000/connect_socket");

    ws.onopen = function() {
        ws.send(email);
    };

    ws.onmessage = function(response) {
        if (response.data == "sign_out") {
            signOut();
        };
    };

    ws.onclose = function() {
        console.log("WebSocket closed");
    };

    ws.onerror = function() {
        console.log("WebSocket error!");
    };
}


