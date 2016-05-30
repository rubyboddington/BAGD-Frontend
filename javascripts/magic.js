(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;
var model = require("./models.js");

// The collections of data that we import in from the wordpress server.
var collection = Backbone.Collection.extend({
	model: model,
	// url: "http://2016.csmgraphicdesign.com/wp-json/wp/v2/student_info"
	url: "http://localhost/wordpress/wp-json/wp/v2/student_info",

	comparator: "name"
});

students_data = new collection();

module.exports = students_data;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./models.js":3}],2:[function(require,module,exports){
(function (global){
// Bunch of imports
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;
var students_data = require("./collection.js");
var singleView = require("./singleView.js");
var magic = magic || {};

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
		if (el.get("tags").length > 7){
			el.get("tags").splice(7);
		}
	});



	// students_display is the single view object meant to render info for one student
	var students_display = new singleView({model: students_data.at(0)});
	// $("#page-content #wrapper").html(students_display.render().$el);



	// Now you can be ready, everything's loaded in and displayed!
	$.holdReady(false);
	$("#page-content").css('display', 'inline');
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


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./collection.js":1,"./singleView.js":4}],3:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;

// Initialization for model (probably will not need changing ever)
var model = Backbone.Model.extend({
	defaults:{
		email: "placeholder@generic.com",
		name: "David Bowie",
		website: "www.google.com"
	}
});

module.exports = model;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;

_.templateSettings = {
	interpolate: /\(:(.+?):\)/g,
	evaluate: /\):(.+?):\(/g
};

// The view renderer that only render once instance of a model
// ie. for displaying a single student's info
module.exports = Backbone.View.extend({
	tagName: "article",
	className: "studentWrapper",

	template: _.template($("#wrapper").html()),

	render: function(){
		var singleTemplate = this.template(this.model.toJSON());
		this.$el.html(singleTemplate);
		return this;
	}
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY3VzdG9tLmpzIiwiamF2YXNjcmlwdHMvbW9kZWxzLmpzIiwiamF2YXNjcmlwdHMvc2luZ2xlVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcbnZhciBtb2RlbCA9IHJlcXVpcmUoXCIuL21vZGVscy5qc1wiKTtcblxuLy8gVGhlIGNvbGxlY3Rpb25zIG9mIGRhdGEgdGhhdCB3ZSBpbXBvcnQgaW4gZnJvbSB0aGUgd29yZHByZXNzIHNlcnZlci5cbnZhciBjb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHRtb2RlbDogbW9kZWwsXG5cdC8vIHVybDogXCJodHRwOi8vMjAxNi5jc21ncmFwaGljZGVzaWduLmNvbS93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mb1wiXG5cdHVybDogXCJodHRwOi8vbG9jYWxob3N0L3dvcmRwcmVzcy93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mb1wiLFxuXG5cdGNvbXBhcmF0b3I6IFwibmFtZVwiXG59KTtcblxuc3R1ZGVudHNfZGF0YSA9IG5ldyBjb2xsZWN0aW9uKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1ZGVudHNfZGF0YTtcbiIsIi8vIEJ1bmNoIG9mIGltcG9ydHNcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xudmFyIHN0dWRlbnRzX2RhdGEgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uLmpzXCIpO1xudmFyIHNpbmdsZVZpZXcgPSByZXF1aXJlKFwiLi9zaW5nbGVWaWV3LmpzXCIpO1xudmFyIG1hZ2ljID0gbWFnaWMgfHwge307XG5cbi8vIEhvbGQgdGhhdCByZWFkeSwgbWFnaWMgbmVlZHMgdG8gaGFwcGVuIGZpcnN0IVxuJC5ob2xkUmVhZHkodHJ1ZSk7XG4kKFwiI3BhZ2UtY29udGVudFwiKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuXG4vLyBBbnl0aGluZyB0aGF0IG5lZWRzIGRvaW5nIGJlZm9yZSBkYXRhIGlzIGxvYWRlZCBzaG91bGQgZ28gaGVyZS5cbnZhciByZWNlaXZlZERhdGEgPSBuZXcgRXZlbnQoXCJyZWNlaXZlZERhdGFcIik7XG5cbi8vIEZldGNoIGRhdGEgZnJvbSB0aGUgYmFja2VuZC5cbnN0dWRlbnRzX2RhdGEuZmV0Y2goe1xuXHQvLyBEaXNwYXRjaCB0aGUgcmVjZWl2ZWQgZGF0YSBldmVudCBhZnRlciB0aGUgZGF0YSBpcyBzdWNjZXNmdWxseSBsb2FkZWQuXG5cdHN1Y2Nlc3M6IGZ1bmN0aW9uKCl7XG5cdFx0d2luZG93LmRpc3BhdGNoRXZlbnQocmVjZWl2ZWREYXRhKTtcblx0fVxufSk7XG5cblxuLy8gVGhlIHBhZ2UgbG9naWMgc2hvdWxkIGdvIGluIHRoaXMgY2FsbGJhY2sgZnVuY3Rpb24gKHJlbmRlcmluZyBldGMuKVxuLy8gVHJlYXQgdGhpcyBhcyB0aGUgcmVndWxhciBkb2N1bWVudC5yZWFkeSB0aGluZyB1bmxlc3MgdGhlcmUgYXJlIHN0dWZmIHRvIGJlXG4vLyBkb25lIGJlZm9yZSBsb2FkaW5nIGluIHRoZSBkYXRhLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZWNlaXZlZERhdGFcIiwgZnVuY3Rpb24oKXtcblx0Ly8gc3R1ZGVudHNfZGF0YSBpcyB0aGUgY29sbGVjdGlvbiBvYmplY3Rcblx0Y29uc29sZS5sb2coc3R1ZGVudHNfZGF0YS5tb2RlbHMpO1xuXHQvLyBNYWtlIHRoZW0gZGF0YSBwcmV0dHkhXG5cdHN0dWRlbnRzX2RhdGEuZWFjaChmdW5jdGlvbihlbCwgaSl7XG5cdFx0Ly8gVmFsaWRhdGUgYW5kIGZpeCB3ZWJzaXRlIGFkZHJlc3Nlc1xuXHRcdG1hZ2ljLnZhbGlkYXRlV2ViQWRkcmVzcyhlbCwgW1xuXHRcdFx0XCJsaW5rX3RvX3BlcnNvbmFsX3dlYnNpdGVcIixcblx0XHRcdFwieW91dHViZVwiLFxuXHRcdFx0XCJ2aW1lb1wiLFxuXHRcdFx0XCJoZXJvX3ZpZGVvXCIsXG5cdFx0XHRcInZpZGVvXzFcIixcblx0XHRcdFwidmlkZW9fMlwiXG5cdFx0XSk7XG5cblx0XHQvLyBDb252ZXJ0IHN0dWRlbnQgSUQgdG8gdXBwZXIgY2FzZVxuXHRcdGVsLnNldChcInN0dWRlbnRfbnVtYmVyXCIsIGVsLmdldChcInN0dWRlbnRfbnVtYmVyXCIpLnRvVXBwZXJDYXNlKCkpO1xuXG5cdFx0Ly8gVHJpbSB0YWdzIHRvIDcgaXRlbXMgb25seVxuXHRcdGlmIChlbC5nZXQoXCJ0YWdzXCIpLmxlbmd0aCA+IDcpe1xuXHRcdFx0ZWwuZ2V0KFwidGFnc1wiKS5zcGxpY2UoNyk7XG5cdFx0fVxuXHR9KTtcblxuXG5cblx0Ly8gc3R1ZGVudHNfZGlzcGxheSBpcyB0aGUgc2luZ2xlIHZpZXcgb2JqZWN0IG1lYW50IHRvIHJlbmRlciBpbmZvIGZvciBvbmUgc3R1ZGVudFxuXHR2YXIgc3R1ZGVudHNfZGlzcGxheSA9IG5ldyBzaW5nbGVWaWV3KHttb2RlbDogc3R1ZGVudHNfZGF0YS5hdCgwKX0pO1xuXHQvLyAkKFwiI3BhZ2UtY29udGVudCAjd3JhcHBlclwiKS5odG1sKHN0dWRlbnRzX2Rpc3BsYXkucmVuZGVyKCkuJGVsKTtcblxuXG5cblx0Ly8gTm93IHlvdSBjYW4gYmUgcmVhZHksIGV2ZXJ5dGhpbmcncyBsb2FkZWQgaW4gYW5kIGRpc3BsYXllZCFcblx0JC5ob2xkUmVhZHkoZmFsc2UpO1xuXHQkKFwiI3BhZ2UtY29udGVudFwiKS5jc3MoJ2Rpc3BsYXknLCAnaW5saW5lJyk7XG5cdC8vIEFmdGVyIHRoaXMgcG9pbnQgeW91IHNob3VsZCB0aGVuIGJpbmQgZXZlbnRzLCBhbmltYXRpb25zLCBldGMuXG5cdC8vICh3aGljaCB3aWxsIGhhcHBlbiBpbiBzY3JpcHQuanMgaW4gZG9jdW1lbnQucmVhZHkpXG59KTtcblxuXG5tYWdpYy52YWxpZGF0ZVdlYkFkZHJlc3MgPSBmdW5jdGlvbihlbCwgbmFtZXMpe1xuXHR2YXIgc3RhcnQgPSAvXmh0dHBzPzpcXC9cXC8vZztcblxuXHRfLmVhY2gobmFtZXMsIGZ1bmN0aW9uKG5hbWUsIGkpIHtcblx0XHRpZiAoZWwuZ2V0KG5hbWUpICE9PSBcIlwiICYmIHR5cGVvZiBlbC5nZXQobmFtZSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHQvLyBBZGQgaHR0cDovLyBwcmVmaXggaWYgaXQgZG9lc24ndCBhbHJlYWR5IGhhdmUgaXQsXG5cdFx0XHQvLyByZXF1aXJlZCB0byBtYWtlIHN1cmUgbGlua3MgYXJlIGFic29sdXRlXG5cdFx0XHRpZiAoIXN0YXJ0LnRlc3QoZWwuZ2V0KG5hbWUpKSl7XG5cdFx0XHRcdHZhciBvbGQgPSBlbC5nZXQobmFtZSk7XG5cdFx0XHRcdGVsLnNldChuYW1lLCBcImh0dHA6Ly9cIiArIG9sZCk7XG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHQvLyBVc2VyIGRpZCBub3QgcHJvdmlkZSBsaW5rIHRvIHdlYnNpdGVcblx0XHR9XG5cdH0pO1xufTtcblxuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIEluaXRpYWxpemF0aW9uIGZvciBtb2RlbCAocHJvYmFibHkgd2lsbCBub3QgbmVlZCBjaGFuZ2luZyBldmVyKVxudmFyIG1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6e1xuXHRcdGVtYWlsOiBcInBsYWNlaG9sZGVyQGdlbmVyaWMuY29tXCIsXG5cdFx0bmFtZTogXCJEYXZpZCBCb3dpZVwiLFxuXHRcdHdlYnNpdGU6IFwid3d3Lmdvb2dsZS5jb21cIlxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RlbDsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuXHRpbnRlcnBvbGF0ZTogL1xcKDooLis/KTpcXCkvZyxcblx0ZXZhbHVhdGU6IC9cXCk6KC4rPyk6XFwoL2dcbn07XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgb25seSByZW5kZXIgb25jZSBpbnN0YW5jZSBvZiBhIG1vZGVsXG4vLyBpZS4gZm9yIGRpc3BsYXlpbmcgYSBzaW5nbGUgc3R1ZGVudCdzIGluZm9cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcImFydGljbGVcIixcblx0Y2xhc3NOYW1lOiBcInN0dWRlbnRXcmFwcGVyXCIsXG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiN3cmFwcGVyXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzaW5nbGVUZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC50b0pTT04oKSk7XG5cdFx0dGhpcy4kZWwuaHRtbChzaW5nbGVUZW1wbGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pOyJdfQ==
