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
	url: "http://info.csmgraphicdesign.com/wp-json/wp/v2/student_info?filter[posts_per_page]=-1",
	// url: "http://localhost/wordpress/wp-json/wp/v2/student_info",
	// url: "./response.json",

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY3VzdG9tLmpzIiwiamF2YXNjcmlwdHMvbW9kZWxzLmpzIiwiamF2YXNjcmlwdHMvc2luZ2xlVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcbnZhciBtb2RlbCA9IHJlcXVpcmUoXCIuL21vZGVscy5qc1wiKTtcblxuLy8gVGhlIGNvbGxlY3Rpb25zIG9mIGRhdGEgdGhhdCB3ZSBpbXBvcnQgaW4gZnJvbSB0aGUgd29yZHByZXNzIHNlcnZlci5cbnZhciBjb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHRtb2RlbDogbW9kZWwsXG5cdHVybDogXCJodHRwOi8vaW5mby5jc21ncmFwaGljZGVzaWduLmNvbS93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mbz9maWx0ZXJbcG9zdHNfcGVyX3BhZ2VdPS0xXCIsXG5cdC8vIHVybDogXCJodHRwOi8vbG9jYWxob3N0L3dvcmRwcmVzcy93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mb1wiLFxuXHQvLyB1cmw6IFwiLi9yZXNwb25zZS5qc29uXCIsXG5cblx0Y29tcGFyYXRvcjogXCJuYW1lXCJcbn0pO1xuXG5zdHVkZW50c19kYXRhID0gbmV3IGNvbGxlY3Rpb24oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdHVkZW50c19kYXRhO1xuIiwiLy8gQnVuY2ggb2YgaW1wb3J0c1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgc3R1ZGVudHNfZGF0YSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb24uanNcIik7XG52YXIgc2luZ2xlVmlldyA9IHJlcXVpcmUoXCIuL3NpbmdsZVZpZXcuanNcIik7XG52YXIgbWFnaWMgPSBtYWdpYyB8fCB7fTtcblxuLy8gSG9sZCB0aGF0IHJlYWR5LCBtYWdpYyBuZWVkcyB0byBoYXBwZW4gZmlyc3QhXG4kLmhvbGRSZWFkeSh0cnVlKTtcbiQoXCIjcGFnZS1jb250ZW50XCIpLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbi8vIEFueXRoaW5nIHRoYXQgbmVlZHMgZG9pbmcgYmVmb3JlIGRhdGEgaXMgbG9hZGVkIHNob3VsZCBnbyBoZXJlLlxudmFyIHJlY2VpdmVkRGF0YSA9IG5ldyBFdmVudChcInJlY2VpdmVkRGF0YVwiKTtcblxuLy8gRmV0Y2ggZGF0YSBmcm9tIHRoZSBiYWNrZW5kLlxuc3R1ZGVudHNfZGF0YS5mZXRjaCh7XG5cdC8vIERpc3BhdGNoIHRoZSByZWNlaXZlZCBkYXRhIGV2ZW50IGFmdGVyIHRoZSBkYXRhIGlzIHN1Y2Nlc2Z1bGx5IGxvYWRlZC5cblx0c3VjY2VzczogZnVuY3Rpb24oKXtcblx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChyZWNlaXZlZERhdGEpO1xuXHR9XG59KTtcblxuXG4vLyBUaGUgcGFnZSBsb2dpYyBzaG91bGQgZ28gaW4gdGhpcyBjYWxsYmFjayBmdW5jdGlvbiAocmVuZGVyaW5nIGV0Yy4pXG4vLyBUcmVhdCB0aGlzIGFzIHRoZSByZWd1bGFyIGRvY3VtZW50LnJlYWR5IHRoaW5nIHVubGVzcyB0aGVyZSBhcmUgc3R1ZmYgdG8gYmVcbi8vIGRvbmUgYmVmb3JlIGxvYWRpbmcgaW4gdGhlIGRhdGEuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlY2VpdmVkRGF0YVwiLCBmdW5jdGlvbigpe1xuXHQvLyBzdHVkZW50c19kYXRhIGlzIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuXHRjb25zb2xlLmxvZyhzdHVkZW50c19kYXRhLm1vZGVscyk7XG5cdC8vIE1ha2UgdGhlbSBkYXRhIHByZXR0eSFcblx0c3R1ZGVudHNfZGF0YS5lYWNoKGZ1bmN0aW9uKGVsLCBpKXtcblx0XHQvLyBWYWxpZGF0ZSBhbmQgZml4IHdlYnNpdGUgYWRkcmVzc2VzXG5cdFx0bWFnaWMudmFsaWRhdGVXZWJBZGRyZXNzKGVsLCBbXG5cdFx0XHRcImxpbmtfdG9fcGVyc29uYWxfd2Vic2l0ZVwiLFxuXHRcdFx0XCJ5b3V0dWJlXCIsXG5cdFx0XHRcInZpbWVvXCIsXG5cdFx0XHRcImhlcm9fdmlkZW9cIixcblx0XHRcdFwidmlkZW9fMVwiLFxuXHRcdFx0XCJ2aWRlb18yXCJcblx0XHRdKTtcblxuXHRcdC8vIENvbnZlcnQgc3R1ZGVudCBJRCB0byB1cHBlciBjYXNlXG5cdFx0ZWwuc2V0KFwic3R1ZGVudF9udW1iZXJcIiwgZWwuZ2V0KFwic3R1ZGVudF9udW1iZXJcIikudG9VcHBlckNhc2UoKSk7XG5cblx0XHQvLyBUcmltIHRhZ3MgdG8gNyBpdGVtcyBvbmx5XG5cdFx0aWYgKGVsLmdldChcInRhZ3NcIikgIT09IG51bGwpe1xuXHRcdFx0aWYgKGVsLmdldChcInRhZ3NcIikubGVuZ3RoID4gNyl7XG5cdFx0XHRcdGVsLmdldChcInRhZ3NcIikuc3BsaWNlKDcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblxuXG5cdC8vIHN0dWRlbnRzX2Rpc3BsYXkgaXMgdGhlIHNpbmdsZSB2aWV3IG9iamVjdCBtZWFudCB0byByZW5kZXIgaW5mbyBmb3Igb25lIHN0dWRlbnRcblx0dmFyIHN0dWRlbnRzX2Rpc3BsYXkgPSBuZXcgc2luZ2xlVmlldyh7bW9kZWw6IHN0dWRlbnRzX2RhdGEuYXQoMCl9KTtcblx0Ly8gJChcIiNwYWdlLWNvbnRlbnQgI3dyYXBwZXJcIikuaHRtbChzdHVkZW50c19kaXNwbGF5LnJlbmRlcigpLiRlbCk7XG5cblxuXG5cdC8vIE5vdyB5b3UgY2FuIGJlIHJlYWR5LCBldmVyeXRoaW5nJ3MgbG9hZGVkIGluIGFuZCBkaXNwbGF5ZWQhXG5cdCQuaG9sZFJlYWR5KGZhbHNlKTtcblx0JChcIiNwYWdlLWNvbnRlbnRcIikuY3NzKCdkaXNwbGF5JywgJ2lubGluZScpO1xuXHQvLyBBZnRlciB0aGlzIHBvaW50IHlvdSBzaG91bGQgdGhlbiBiaW5kIGV2ZW50cywgYW5pbWF0aW9ucywgZXRjLlxuXHQvLyAod2hpY2ggd2lsbCBoYXBwZW4gaW4gc2NyaXB0LmpzIGluIGRvY3VtZW50LnJlYWR5KVxufSk7XG5cblxubWFnaWMudmFsaWRhdGVXZWJBZGRyZXNzID0gZnVuY3Rpb24oZWwsIG5hbWVzKXtcblx0dmFyIHN0YXJ0ID0gL15odHRwcz86XFwvXFwvL2c7XG5cblx0Xy5lYWNoKG5hbWVzLCBmdW5jdGlvbihuYW1lLCBpKSB7XG5cdFx0aWYgKGVsLmdldChuYW1lKSAhPT0gXCJcIiAmJiB0eXBlb2YgZWwuZ2V0KG5hbWUpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0Ly8gQWRkIGh0dHA6Ly8gcHJlZml4IGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGl0LFxuXHRcdFx0Ly8gcmVxdWlyZWQgdG8gbWFrZSBzdXJlIGxpbmtzIGFyZSBhYnNvbHV0ZVxuXHRcdFx0aWYgKCFzdGFydC50ZXN0KGVsLmdldChuYW1lKSkpe1xuXHRcdFx0XHR2YXIgb2xkID0gZWwuZ2V0KG5hbWUpO1xuXHRcdFx0XHRlbC5zZXQobmFtZSwgXCJodHRwOi8vXCIgKyBvbGQpO1xuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0Ly8gVXNlciBkaWQgbm90IHByb3ZpZGUgbGluayB0byB3ZWJzaXRlXG5cdFx0fVxuXHR9KTtcbn07XG5cbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG4vLyBJbml0aWFsaXphdGlvbiBmb3IgbW9kZWwgKHByb2JhYmx5IHdpbGwgbm90IG5lZWQgY2hhbmdpbmcgZXZlcilcbnZhciBtb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdGRlZmF1bHRzOntcblx0XHRlbWFpbDogXCJwbGFjZWhvbGRlckBnZW5lcmljLmNvbVwiLFxuXHRcdG5hbWU6IFwiRGF2aWQgQm93aWVcIixcblx0XHR3ZWJzaXRlOiBcInd3dy5nb29nbGUuY29tXCJcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kZWw7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbl8udGVtcGxhdGVTZXR0aW5ncyA9IHtcblx0aW50ZXJwb2xhdGU6IC9cXCg6KC4rPyk6XFwpL2csXG5cdGV2YWx1YXRlOiAvXFwpOiguKz8pOlxcKC9nXG59O1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IG9ubHkgcmVuZGVyIG9uY2UgaW5zdGFuY2Ugb2YgYSBtb2RlbFxuLy8gaWUuIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIHN0dWRlbnQncyBpbmZvXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJhcnRpY2xlXCIsXG5cdGNsYXNzTmFtZTogXCJzdHVkZW50V3JhcHBlclwiLFxuXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCQoXCIjd3JhcHBlclwiKS5odG1sKCkpLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2luZ2xlVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdHRoaXMuJGVsLmh0bWwoc2luZ2xlVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTsiXX0=
