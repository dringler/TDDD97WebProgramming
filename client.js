var welcome;
var profile;

displayView = function(view){
	// the code required to display a view
	document.getElementById("body").innerHTML = view.innerHTML;

};

window.onload = function(){
	welcome = document.getElementById("welcomeview");
	profile = document.getElementById("profileview");

//change later: check if user is already signed in
	displayView(welcome);

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

