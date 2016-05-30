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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY3VzdG9tLmpzIiwiamF2YXNjcmlwdHMvbW9kZWxzLmpzIiwiamF2YXNjcmlwdHMvc2luZ2xlVmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xudmFyIG1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWxzLmpzXCIpO1xuXG4vLyBUaGUgY29sbGVjdGlvbnMgb2YgZGF0YSB0aGF0IHdlIGltcG9ydCBpbiBmcm9tIHRoZSB3b3JkcHJlc3Mgc2VydmVyLlxudmFyIGNvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdG1vZGVsOiBtb2RlbCxcblx0Ly8gdXJsOiBcImh0dHA6Ly9iYWdkLXRlc3QuaGVyb2t1YXBwLmNvbS93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mb1wiXG5cdHVybDogXCJodHRwOi8vbG9jYWxob3N0L3dvcmRwcmVzcy93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mb1wiLFxuXG5cdGNvbXBhcmF0b3I6IFwibmFtZVwiXG59KTtcblxuc3R1ZGVudHNfZGF0YSA9IG5ldyBjb2xsZWN0aW9uKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1ZGVudHNfZGF0YTtcbiIsIi8vIEJ1bmNoIG9mIGltcG9ydHNcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xudmFyIHN0dWRlbnRzX2RhdGEgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uLmpzXCIpO1xudmFyIHNpbmdsZVZpZXcgPSByZXF1aXJlKFwiLi9zaW5nbGVWaWV3LmpzXCIpO1xuXG4kLmhvbGRSZWFkeSh0cnVlKTtcbiQoXCIjcGFnZS1jb250ZW50XCIpLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbi8vIEZldGNoIGRhdGEgZnJvbSB0aGUgYmFja2VuZFxuLy8gQW55dGhpbmcgdGhhdCBuZWVkcyBkb2luZyBiZWZvcmUgZGF0YSBpcyBsb2FkZWQgc2hvdWxkIGJlIGhlcmUgYXMgd2VsbC5cbnZhciByZWNlaXZlZERhdGEgPSBuZXcgRXZlbnQoXCJyZWNlaXZlZERhdGFcIik7XG5cbnN0dWRlbnRzX2RhdGEuZmV0Y2goe1xuXHQvLyBEaXNwYXRjaCB0aGUgcmVjZWl2ZWQgZGF0YSBldmVudCBhZnRlciB0aGUgZGF0YSBpcyBzdWNjZXNmdWxseSBsb2FkZWRcblx0c3VjY2VzczogZnVuY3Rpb24oKXtcblx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChyZWNlaXZlZERhdGEpO1xuXHR9XG59KTtcblxuXG5cbi8vIFRoZSBwYWdlIGxvZ2ljIHNob3VsZCBnbyBpbiB0aGlzIGNhbGxiYWNrIGZ1bmN0aW9uIChyZW5kZXJpbmcgZXRjLilcbi8vIFRyZWF0IHRoaXMgYXMgdGhlIHJlZ3VsYXIgZG9jdW1lbnQucmVhZHkgdGhpbmcgdW5sZXNzIHRoZXJlIGFyZSBzdHVmZiB0byBiZSBkb25lXG4vLyBiZWZvcmUgbG9hZGluZyBpbiB0aGUgZGF0YS5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVjZWl2ZWREYXRhXCIsIGZ1bmN0aW9uKCl7XG5cdGNvbnNvbGUubG9nKHN0dWRlbnRzX2RhdGEubW9kZWxzKTtcblxuXHR2YXIgc3R1ZGVudHNfZGlzcGxheSA9IG5ldyBzaW5nbGVWaWV3KHttb2RlbDogc3R1ZGVudHNfZGF0YS5hdCgwKX0pO1xuXHQkKFwiI3BhZ2UtY29udGVudCAjd3JhcHBlclwiKS5odG1sKHN0dWRlbnRzX2Rpc3BsYXkucmVuZGVyKCkuJGVsKTtcblxuXHQkLmhvbGRSZWFkeShmYWxzZSk7XG5cdCQoXCIjcGFnZS1jb250ZW50XCIpLmNzcygnZGlzcGxheScsICdpbmxpbmUnKTtcbn0pOyIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG4vLyBJbml0aWFsaXphdGlvbiBmb3IgbW9kZWwgKHByb2JhYmx5IHdpbGwgbm90IG5lZWQgY2hhbmdpbmcgZXZlcilcbnZhciBtb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdGRlZmF1bHRzOntcblx0XHRlbWFpbDogXCJwbGFjZWhvbGRlckBnZW5lcmljLmNvbVwiLFxuXHRcdG5hbWU6IFwiRGF2aWQgQm93aWVcIixcblx0XHR3ZWJzaXRlOiBcInd3dy5nb29nbGUuY29tXCJcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kZWw7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbl8udGVtcGxhdGVTZXR0aW5ncyA9IHtcblx0aW50ZXJwb2xhdGU6IC9cXCg6KC4rPyk6XFwpL2csXG5cdGV2YWx1YXRlOiAvXFwpOiguKz8pOlxcKC9nXG59O1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IG9ubHkgcmVuZGVyIG9uY2UgaW5zdGFuY2Ugb2YgYSBtb2RlbFxuLy8gaWUuIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIHN0dWRlbnQncyBpbmZvXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJhcnRpY2xlXCIsXG5cdGNsYXNzTmFtZTogXCJzdHVkZW50V3JhcHBlclwiLFxuXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCQoXCIjd3JhcHBlclwiKS5odG1sKCkpLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2luZ2xlVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdHRoaXMuJGVsLmh0bWwoc2luZ2xlVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTsiXX0=
