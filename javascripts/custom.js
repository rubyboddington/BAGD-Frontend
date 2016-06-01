// Bunch of imports
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var students_data = require("./collection.js");
var singleView = require("./singleView.js");
var magic = magic || {};

// Hold that ready, magic needs to happen first!
$.holdReady(true);
// This should be the loading screen
$("#page-content").css('display', 'none');

// Anything that needs doing before data is loaded should go here.
var receivedData = new Event("receivedData");

// Fetch data from the backend.
students_data.fetch({
	// Dispatch the received data event after the data is succesfully loaded.
	success: function(){
		window.dispatchEvent(receivedData);
	}
});


// The page logic should go in this callback function (rendering etc.)
// Treat this as the regular document.ready thing unless there are stuff to be
// done before loading in the data.
window.addEventListener("receivedData", function(){
	// students_data is the collection object
	console.log(students_data.models);
	// Make them data pretty!
	students_data.each(function(el, i){
		// Validate and fix website addresses
		magic.validateWebAddress(el, [
			"link_to_personal_website",
			"youtube",
			"vimeo",
			"hero_video",
			"video_1",
			"video_2"
		]);

		// Convert student ID to upper case
		el.set("student_number", el.get("student_number").toUpperCase());

		// Trim tags to 7 items only
		if (el.get("tags") !== null){
			if (el.get("tags").length > 7){
				el.get("tags").splice(7);
			}
		}
	});



	// students_display is the single view object meant to render info for one student
	var students_display = new singleView({model: students_data.at(0)});
	// $("#page-content #wrapper").html(students_display.render().$el);



	// Now you can be ready, everything's loaded in and displayed!
	$.holdReady(false);
	$("#page-content").css("display", "inline");
	$("#loading").css("opacity", "0");
	setTimeout(function(){
		$("#loading").css("display", "none");
	}, 500);
	// After this point you should then bind events, animations, etc.
	// (which will happen in script.js in document.ready)
});


magic.validateWebAddress = function(el, names){
	var start = /^https?:\/\//g;

	_.each(names, function(name, i) {
		if (el.get(name) !== "" && typeof el.get(name) != "undefined"){
			// Add http:// prefix if it doesn't already have it,
			// required to make sure links are absolute
			if (!start.test(el.get(name))){
				var old = el.get(name);
				el.set(name, "http://" + old);
			}
		}else{
			// User did not provide link to website
		}
	});
};

