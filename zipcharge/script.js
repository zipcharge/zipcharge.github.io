var form;
var inputs;
var value_labels = ["start_mileage","charge_mileage","charge_kwh","end_mileage"];
var commentBox;
var request;
var formData;
var row = 0; //row in database returned
var driverName;

modal = function(on) {
	if (on) {
		document.querySelector("#modal").style.display = "block";
	} else {
		document.querySelector("#modal").style.display = "none";
	}
	
}
onLoad = function() {
	checkName();
	document.querySelector("#userID").addEventListener('click',getNewUser);
	form = document.forms[0];
	inputs = form.querySelectorAll('input');
	commentBox = form.querySelector('textarea');
	Array.prototype.forEach.call(inputs, function(el, i){
		el.disabled = true;
		el.addEventListener('change', formSubmit);
	});
	inputs[0].disabled = false;
	commentBox.disabled = true;
	addAjax();
};

addAjax = function () {
	// Listen for the form being submitted
	form.addEventListener('submit', formSubmit);
	};
	
formSubmit = function (evt) {
	evt.preventDefault();
	// Set up the AJAX request
	formData = new FormData(form);
	formData.append("row", row);
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onPosition);
		} else {
		onPosition({coords:{latitude:0,longitude:0}});
		}
	};

onPosition = function(pos) {
	form.disabled = true;
	formData.append("lat", pos.coords.latitude);
	formData.append("lon", pos.coords.longitude);
	formData.append("name", driverName);
	var object = {};
	formData.forEach(function(value, key){
		object[key] = value;
		});
	request = new XMLHttpRequest();
	request.open('POST', 'https://script.google.com/macros/s/AKfycbwkOQwp_eSNKGqkcrg6J_AOh1UMGI7oXjoIn7Pjzu-43NIXLN_H/exec', true);
	request.setRequestHeader('accept', 'application/json');
	request.onreadystatechange = function () {
	    // <4 =  waiting on response from server
	    if (request.readyState < 4){
	        /*statusMessage.innerHTML = message.loading;*/
			}
	    // 4 = Response from server has been completely loaded.
	    else if (request.readyState === 4) {
	        // 200 - 299 = successful
			form.disabled = false;
	        if (request.status == 200 && request.status < 300) {
	            modal(false);
				onAnswer(request.response);
				}
	        }
	    };
	modal(true);
	request.send(formData);
	};

onAnswer = function(response) {
	response=JSON.parse(response);
	if (response.row) {
		row = response.row;
		Array.prototype.forEach.call(value_labels, function(el, i){
			if(response[el]) {
			form.querySelector("#" + el).value = response[el];
			}
		});
		if (response["comment"]) {
			commentBox.value = response["comment"];
		}
	}
	Array.prototype.forEach.call(inputs, function(el, i){
		el.disabled = !(el.value == "");
		});
	if(form.querySelector("#end_mileage").disabled) {
		commentBox.disabled = true;
		form.querySelector("button").style.display="none";
		form.disabled = true;
	} else {
	commentBox.disabled = false;
	}
};

document.addEventListener('DOMContentLoaded', onLoad);

checkName = function() {
	driverName = "";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf("driverName") == 0) {
			driverName = c.substring(11,c.length);
			showUser();
		}
	}
	if (driverName=="") {
		getNewUser();
	}
}

getNewUser = function() {
	modal(true);
	var dN;
	dN = prompt("Please enter your name",driverName);
	while (dN == null||dN =="") {
		dN = prompt("Please enter your name",driverName);	
	}
	driverName = dN;	
    modal(false);
	var date = new Date();
    date.setTime(date.getTime() + (120*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
    document.cookie = "driverName=" + driverName  + expires + "; path=/";
	showUser();
}

showUser = function() {
	document.querySelector("#userID").innerHTML = driverName;
}