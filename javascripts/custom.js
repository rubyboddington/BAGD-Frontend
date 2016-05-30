// Bunch of imports
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var students_data = require("./collection.js");
var singleView = require("./singleView.js");

// Hold that ready, magic needs to happen first!
$.holdReady(true);
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
	// students_data.models is the array-like object of all the students data
	console.log(students_data.models);
	// Make them data pretty!
	// students_data.each(function(el, i){
	// 	console.log(el);
	// });

	// students_display is the single view object meant to render info for one student
	var students_display = new singleView({model: students_data.at(0)});
	// $("#page-content #wrapper").html(students_display.render().$el);

	// Now you can be ready, everything's loaded in and displayed!
	$.holdReady(false);
	$("#page-content").css('display', 'inline');
	// After this point you should then bind events, animations, etc.
	// (which will happen in script.js)
});


