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
	// url: "http://bagd-test.herokuapp.com/wp-json/wp/v2/student_info"
	url: "http://localhost/wordpress/wp-json/wp/v2/student_info"
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

$.holdReady(true);
$("#page-content").css('display', 'none');

// Fetch data from the backend
// Anything that needs doing before data is loaded should be here as well.
var receivedData = new Event("receivedData");

students_data.fetch({
	// Dispatch the received data event after the data is succesfully loaded
	success: function(){
		window.dispatchEvent(receivedData);
	}
});



// The page logic should go in this callback function (rendering etc.)
// Treat this as the regular document.ready thing unless there are stuff to be done
// before loading in the data.
window.addEventListener("receivedData", function(){
	console.log(students_data.models);

	var students_display = new singleView({model: students_data.at(0)});
	$("#page-content #wrapper").html(students_display.render().$el);

	$.holdReady(false);
	$("#page-content").css('display', 'inline');
});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY3VzdG9tLmpzIiwiamF2YXNjcmlwdHMvbW9kZWxzLmpzIiwiamF2YXNjcmlwdHMvc2luZ2xlVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgbW9kZWwgPSByZXF1aXJlKFwiLi9tb2RlbHMuanNcIik7XG5cbi8vIFRoZSBjb2xsZWN0aW9ucyBvZiBkYXRhIHRoYXQgd2UgaW1wb3J0IGluIGZyb20gdGhlIHdvcmRwcmVzcyBzZXJ2ZXIuXG52YXIgY29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0bW9kZWw6IG1vZGVsLFxuXHQvLyB1cmw6IFwiaHR0cDovL2JhZ2QtdGVzdC5oZXJva3VhcHAuY29tL3dwLWpzb24vd3AvdjIvc3R1ZGVudF9pbmZvXCJcblx0dXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Qvd29yZHByZXNzL3dwLWpzb24vd3AvdjIvc3R1ZGVudF9pbmZvXCJcbn0pO1xuXG5zdHVkZW50c19kYXRhID0gbmV3IGNvbGxlY3Rpb24oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdHVkZW50c19kYXRhO1xuIiwiLy8gQnVuY2ggb2YgaW1wb3J0c1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgc3R1ZGVudHNfZGF0YSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb24uanNcIik7XG52YXIgc2luZ2xlVmlldyA9IHJlcXVpcmUoXCIuL3NpbmdsZVZpZXcuanNcIik7XG5cbiQuaG9sZFJlYWR5KHRydWUpO1xuJChcIiNwYWdlLWNvbnRlbnRcIikuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcblxuLy8gRmV0Y2ggZGF0YSBmcm9tIHRoZSBiYWNrZW5kXG4vLyBBbnl0aGluZyB0aGF0IG5lZWRzIGRvaW5nIGJlZm9yZSBkYXRhIGlzIGxvYWRlZCBzaG91bGQgYmUgaGVyZSBhcyB3ZWxsLlxudmFyIHJlY2VpdmVkRGF0YSA9IG5ldyBFdmVudChcInJlY2VpdmVkRGF0YVwiKTtcblxuc3R1ZGVudHNfZGF0YS5mZXRjaCh7XG5cdC8vIERpc3BhdGNoIHRoZSByZWNlaXZlZCBkYXRhIGV2ZW50IGFmdGVyIHRoZSBkYXRhIGlzIHN1Y2Nlc2Z1bGx5IGxvYWRlZFxuXHRzdWNjZXNzOiBmdW5jdGlvbigpe1xuXHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KHJlY2VpdmVkRGF0YSk7XG5cdH1cbn0pO1xuXG5cblxuLy8gVGhlIHBhZ2UgbG9naWMgc2hvdWxkIGdvIGluIHRoaXMgY2FsbGJhY2sgZnVuY3Rpb24gKHJlbmRlcmluZyBldGMuKVxuLy8gVHJlYXQgdGhpcyBhcyB0aGUgcmVndWxhciBkb2N1bWVudC5yZWFkeSB0aGluZyB1bmxlc3MgdGhlcmUgYXJlIHN0dWZmIHRvIGJlIGRvbmVcbi8vIGJlZm9yZSBsb2FkaW5nIGluIHRoZSBkYXRhLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZWNlaXZlZERhdGFcIiwgZnVuY3Rpb24oKXtcblx0Y29uc29sZS5sb2coc3R1ZGVudHNfZGF0YS5tb2RlbHMpO1xuXG5cdHZhciBzdHVkZW50c19kaXNwbGF5ID0gbmV3IHNpbmdsZVZpZXcoe21vZGVsOiBzdHVkZW50c19kYXRhLmF0KDApfSk7XG5cdCQoXCIjcGFnZS1jb250ZW50ICN3cmFwcGVyXCIpLmh0bWwoc3R1ZGVudHNfZGlzcGxheS5yZW5kZXIoKS4kZWwpO1xuXG5cdCQuaG9sZFJlYWR5KGZhbHNlKTtcblx0JChcIiNwYWdlLWNvbnRlbnRcIikuY3NzKCdkaXNwbGF5JywgJ2lubGluZScpO1xufSk7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIEluaXRpYWxpemF0aW9uIGZvciBtb2RlbCAocHJvYmFibHkgd2lsbCBub3QgbmVlZCBjaGFuZ2luZyBldmVyKVxudmFyIG1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6e1xuXHRcdGVtYWlsOiBcInBsYWNlaG9sZGVyQGdlbmVyaWMuY29tXCIsXG5cdFx0bmFtZTogXCJEYXZpZCBCb3dpZVwiLFxuXHRcdHdlYnNpdGU6IFwid3d3Lmdvb2dsZS5jb21cIlxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RlbDsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuXHRpbnRlcnBvbGF0ZTogL1xcKDooLis/KTpcXCkvZyxcblx0ZXZhbHVhdGU6IC9cXCk6KC4rPyk6XFwoL2dcbn07XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgb25seSByZW5kZXIgb25jZSBpbnN0YW5jZSBvZiBhIG1vZGVsXG4vLyBpZS4gZm9yIGRpc3BsYXlpbmcgYSBzaW5nbGUgc3R1ZGVudCdzIGluZm9cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcImFydGljbGVcIixcblx0Y2xhc3NOYW1lOiBcInN0dWRlbnRXcmFwcGVyXCIsXG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiN3cmFwcGVyXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzaW5nbGVUZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC50b0pTT04oKSk7XG5cdFx0dGhpcy4kZWwuaHRtbChzaW5nbGVUZW1wbGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pOyJdfQ==
