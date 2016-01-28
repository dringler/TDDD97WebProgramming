var welcome;
var profile;
var loginObject;
var token;

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
	} else {
		window.alert(loginObject.message);
	}
}

function checkSuInput() {
	var suEmail = document.getElementById('signUpEmail').value;
	var suPassword = document.getElementById('signUpPassword').value;
	var suFirstName = document.getElementById('signUpFirstName').value;
	var suLastName = document.getElementById('signUpLastName').value;
	var suGender = document.getElementById('signUpGender').value;
	var suCity = document.getElementById('signUpCity').value;
	var suCountry = document.getElementById('signUpCountry').value;

	if (suEmail != "" && suPassword != "" && suFirstName != "" && suLastName != "" && suCity != "" && suCountry != "") {
		document.getElementById('signUpButtonID').disabled = false;
	} else {
		document.getElementById('signUpButtonID').disabled = true;
	}

};

function checkPassword() {
	var first = document.getElementById('signUpPassword').value;
	var second = document.getElementById('confirmSignUpPassword').value;
	var minPwLength = 5;
	
	if(first == second &&
		first.length >= minPwLength ) {
		document.getElementById('signUpButtonID').disabled = false;
		//window.alert('Form has been submitted.');
	} else if (first != second) {
		document.getElementById('signUpButtonID').disabled = true;
		// window.alert('Passwords do not match.');
	} else if (first.length < minPwLength || second.length < minPwLength) {
		document.getElementById('signUpButtonID').disabled = true;
		// window.alert('Password must be at least ' + minPwLength + " characters long.");
	} else {
		document.getElementById('signUpButtonID').disabled = true;
		// window.alert('Something went wrong. Please try again.');
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
	} else {
		window.alert(returnObject.message);
		document.getElementById('signUpButtonID').disabled = true;
	}
};
