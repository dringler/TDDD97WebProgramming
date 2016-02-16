var welcome;
var profile;
var loginObject;
var token;
var minPwLength = 5;


displayView = function(view){
	// the code required to display a view
	document.getElementById("body").innerHTML = view.innerHTML;

};

window.onload = function(){
	welcome = document.getElementById("welcomeview");
	profile = document.getElementById("profileview");

//change later: check if user is already signed in
	token = localStorage.getItem("token");
	if (token != "") {
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

	if (loginEmail != "" && loginPassword != "") {
		document.getElementById('loginButtonID').disabled = false;
	} else {
		document.getElementById('loginButtonID').disabled = true;
	}

};

function submitLogin() {
	var username = document.getElementById('loginEmail').value;
	var password = document.getElementById('loginPassword').value;
	loginObject = serverstub.signIn(username, password);
	if (loginObject.success == true) {
		localStorage.setItem("token", loginObject.data);
		displayView(profile);
		getUserData();
		getUserMessages();
	} else {
		window.alert(loginObject.message);
	}
}

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
		if(suPassword == suPassword2 && suPassword.length >= minPwLength ) {
			document.getElementById('signUpButtonID').disabled = false;
		} else {
		document.getElementById('signUpButtonID').disabled = true;
	}
	} else {
		document.getElementById('signUpButtonID').disabled = true;
	}

};

function submitSignUp() {
	var dataObject = {};
	dataObject.email = document.getElementById('signUpEmail').value;
	dataObject.password = document.getElementById('signUpPassword').value;
	dataObject.firstname = document.getElementById('signUpFirstName').value;
	dataObject.familyname = document.getElementById('signUpLastName').value;
	dataObject.gender = document.getElementById('signUpGender').value;
	dataObject.city = document.getElementById('signUpCity').value;
	dataObject.country = document.getElementById('signUpCountry').value;


	var returnObject = serverstub.signUp(dataObject);

	if (returnObject.success == true) {
		window.alert('Sign-up successful.');
		displayView(profile);
		getUserDate();
		getUserMessages();
	} else {
		window.alert(returnObject.message);
		document.getElementById('signUpButtonID').disabled = true;
	}
};

function signOut() {
	serverstub.signOut(token);
	localStorage.setItem("token", "");
	displayView(welcome);
};

function checkPwChangeInput() {
	var oldPW = document.getElementById('oldPasswordChangeID').value;
	var newPW = document.getElementById('newPasswordChangeID').value;
	var newPW2 = document.getElementById('newPasswordChange2ID').value;

	if (oldPW != "" && newPW != "" && newPW2 != "") {
		if(newPW == newPW2 && newPW.length >= minPwLength ) {
			document.getElementById('changePasswordSubmitButton').disabled = false;
		}  else {
		document.getElementById('changePasswordSubmitButton').disabled = true;
	}
	} else {
		document.getElementById('changePasswordSubmitButton').disabled = true;
	}
};


function showChangePassword() {
	var changePwForm = document.getElementById('changePwForm');
	if (changePwForm.style.display != "none") {
		changePwForm.style.display = "none";
	} else {
		changePwForm.style.display = "block";
	}

};

function changePasswordSubmit() {
	var oldPW = document.getElementById('oldPasswordChangeID').value;
	var newPW = document.getElementById('newPasswordChangeID').value;
	token = localStorage.getItem("token");
	
	var returnObject = serverstub.changePassword(token, oldPW, newPW);

	if (returnObject.success == true) {
		window.alert('Password changed.');
	} else {
		window.alert(returnObject.message);
	}
};

function getUserData() {
		token = localStorage.getItem("token");
		var returnObject = serverstub.getUserDataByToken(token);

		document.getElementById('mdUsername').innerHTML = returnObject.data.email;
		document.getElementById('mdFirstName').innerHTML  = returnObject.data.firstname;
		document.getElementById('mdLastName').innerHTML = returnObject.data.familyname;
		document.getElementById('mdGender').innerHTML = returnObject.data.gender;
		document.getElementById('mdCity').innerHTML = returnObject.data.city;
		document.getElementById('mdCountry').innerHTML = returnObject.data.country;		
};

function getUserMessages() {
	token = localStorage.getItem("token");
	var returnObject = serverstub.getUserMessagesByToken(token);
	var userMessagesArray = returnObject.data;
	var userMessages = [];
	if (userMessagesArray.length>0) {
		for (i=0; i<userMessagesArray.length; i++) {
			userMessages = userMessages + "<p>" + userMessagesArray[i].content + "(by " + userMessagesArray[i].writer + ")</p>";
		}

		document.getElementById('wall').innerHTML = userMessages;
	}
};
function getUserMessagesByMail(mail) {
	var email = mail;
	token = localStorage.getItem("token");
	var returnObject = serverstub.getUserMessagesByEmail(token, email);
	var userMessagesArray = returnObject.data;
	var userMessages = [];
	if (userMessagesArray.length>0) {
		for (i=0; i<userMessagesArray.length; i++) {
			userMessages = userMessages + "<p>" + userMessagesArray[i].content + "(by " + userMessagesArray[i].writer + ")</p>";
		}

		document.getElementById('oWall').innerHTML = userMessages;
	}
};

function postButton() {
	token = localStorage.getItem("token");
	var message = document.getElementById('postarea').value;
	var returnObject = serverstub.getUserDataByToken(token);
	var email = returnObject.data.email;

	serverstub.postMessage(token, message, email);
	document.getElementById('postarea').value = "";
};

function refreshWall() {
	getUserMessages();
};

function postButtonBrowse() {
	token = localStorage.getItem("token");
	var message = document.getElementById('postareaBrowse').value;
	var returnObject = serverstub.getUserDataByToken(token);
	var email = document.getElementById('searchUserID').value;

	serverstub.postMessage(token, message, email);
	document.getElementById('postareaBrowse').value = "";
};

function refreshWallBrowse() {
	getUserMessagesByMail(document.getElementById('searchUserID').value);
};



function searchUser() {
	// localStorage.setItem('lastTab', 
	
	token = localStorage.getItem("token");
	var email = document.getElementById('searchUserID').value;

	var returnObject = serverstub.getUserDataByEmail(token,email);

	if (returnObject.success == true) {
		document.getElementById('userWall').style.display = "block";

		document.getElementById('userWallHeader').innerHTML = "Wall of " + returnObject.data.email;

		document.getElementById('oUsername').innerHTML = returnObject.data.email;
		document.getElementById('oFirstName').innerHTML  = returnObject.data.firstname;
		document.getElementById('oLastName').innerHTML = returnObject.data.familyname;
		document.getElementById('oGender').innerHTML = returnObject.data.gender;
		document.getElementById('oCity').innerHTML = returnObject.data.city;
		document.getElementById('oCountry').innerHTML = returnObject.data.country;	

		getUserMessagesByMail(returnObject.data.email);


	} else {
		document.getElementById('userWall').style.display = "none";
		window.alert(returnObject.message);
	}
};

