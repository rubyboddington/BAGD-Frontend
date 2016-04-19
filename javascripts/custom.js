// Bunch of imports
var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var students_data = require("./collection.js");
var singleView = require("./singleView.js");

// Fetch data from the backend
var receivedData = new Event("receivedData");
$(document).ready(function() {
	students_data.fetch({
		// Dispatch the received data event after the data is succesfully loaded
		success: function(){
			window.dispatchEvent(receivedData);
		}
	});
});

// The page logic should go in this callback function (rendering etc.)
window.addEventListener("receivedData", function(){
	console.log(students_data.models);

	var students_display = new singleView({model: students_data.at(0)});
	$("#page-content").html(students_display.render().$el);
});