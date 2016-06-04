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
	// url: "http://info.csmgraphicdesign.com/wp-json/wp/v2/student_info?filter[posts_per_page]=-1",
	// url: "http://localhost/wordpress/wp-json/wp/v2/student_info",
	url: "./response.json",

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
var smark = require("smark");
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

		magic.typography(el, ["bio", "hero_caption", "caption_1", "caption_2"]);

		var availableVideos = [];
		if (el.get("hero_image_video") == "Video"){
			availableVideos.push("hero_video");
		}
		if (el.get("image_video_1") == "Video"){
			availableVideos.push("video_1");
		}
		if (el.get("image_video_2") == "Video"){
			availableVideos.push("video_2");
		}
		if(!(_.isEmpty(availableVideos))){
			magic.getVideoImage(el, availableVideos);
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


// Some magic functions
magic.validateWebAddress = function(el, names){
	var start = /^https?:\/\//gi;

	_.each(names, function(name, i) {
		if (el.get(name) !== "" && typeof el.get(name) != "undefined"){
			// Add http:// prefix if it doesn't already have it,
			// required to make sure links are absolute
			if (el.get(name).search(start) == -1){
				var old = el.get(name);
				el.set(name, "http://" + old);
			}
		}else{
			// User did not provide link to website
		}
	});
};

magic.typography = function(el, fields){
	_.each(fields, function(field, i){
		if (el.get(field)){
			el.set(field, smark.typographicChanges(el.get(field)).trim());
		}
	});
};

magic.getVideoImage = function(el, fields){
	_.each(fields, function(field, i){
		if(el.get(field) !== ""){
			var vidID;
			if(smark.typeIs(el.get(field)) == "youtube"){
				vidID = el.get(field).replace(smark.youtubeRE, "$1");
				var imageLink = "http://i3.ytimg.com/vi/" + vidID + "/sddefault.jpg";
				el.set(field + "_image", imageLink);

			}else if(smark.typeIs(el.get(field)) == "vimeo"){
				vidID = el.get(field).replace(smark.vimeoRE, "$1");
				magic.vimeoLoadingThumb(vidID, function(imageLink){
					el.set(field + "_image", imageLink);
				});
			}else{
				console.log(el.get("name"), el.get(field));
			}
		}
	});
};

magic.vimeoLoadingThumb = function(id, callback){
    var url = "https://vimeo.com/api/oembed.json?url=https%3A//vimeo.com/" + id;
    $.ajax({
    	url: url,
    	dataType: "json"
    }).done(function(data){
    	var returnImage = data.thumbnail_url;
    	returnImage = returnImage.replace(/(.*?_)\d+?(\.jpg)/, "$1640$2");
    	callback(returnImage);
    });
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./collection.js":1,"./singleView.js":4,"smark":5}],3:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
(function (global){
/* @license smark.js written by Kenneth Lim <limzy.kenneth@gmail.com> (http://designerken.be)
   License under the BSD 2-Clause License */
(function(e){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=e()}else if(typeof define==="function"&&define.amd){define([],e)}else{var r;if(typeof window!=="undefined"){r=window}else if(typeof global!=="undefined"){r=global}else if(typeof self!=="undefined"){r=self}else{r=this}r.smark=e()}})(function(){var e,r,a;return function t(e,r,a){function i(s,p){if(!r[s]){if(!e[s]){var o=typeof require=="function"&&require;if(!p&&o)return o(s,!0);if(l)return l(s,!0);var n=new Error("Cannot find module '"+s+"'");throw n.code="MODULE_NOT_FOUND",n}var h=r[s]={exports:{}};e[s][0].call(h.exports,function(r){var a=e[s][1][r];return i(a?a:r)},h,h.exports,t,e,r,a)}return r[s].exports}var l=typeof require=="function"&&require;for(var s=0;s<a.length;s++)i(a[s]);return i}({1:[function(e,r,a){var t=e("./regex.js");t.typeIs=e("./typeIs.js");t.typographicChanges=e("./typography.js");t.parseParagraph=e("./paragraph.js");t.generate=function(e,r){var a="";var i={type:"auto",typography:true};for(var l in r){for(var s in i){if(l==s){i.j=r.i}}}var p=i.type;var o=i.typography;if(p=="auto"){if(this.typeIs(e)=="youtube"){p="youtube"}else if(this.typeIs(e)=="vimeo"){p="vimeo"}else if(this.typeIs(e)=="image"){p="image"}else if(this.typeIs(e)=="link"){p="link"}else if(this.typeIs(e)=="paragraph"){p="paragraph"}}else{p=i.type}a=n(e,p);return{html:a,type:p};function n(e,r){var a;var i=t;switch(r){case"youtube":e=e.replace(i.youtubeRE,"$1");a='<iframe class="smark youtube" src="https://www.youtube.com/embed/'+e+'" frameborder="0" width="853" height="480" allowfullscreen></iframe>';break;case"vimeo":e=e.replace(i.vimeoRE,"$1");a='<iframe class="smark vimeo" src="https://player.vimeo.com/video/'+e+'" frameborder="0" width="853" height="480" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';break;case"image":var l=e.replace(i.imageRE,"$1");var s=e.replace(i.imageRE,"$2");if(o){s=i.typographicChanges(s)}a='<img class="smark image" title="'+s+'" src="'+l+'">';if(i.imageLinkRE.test(e)){var p=i.imageLinkRE.exec(e)[0];p=p.substring(1,p.length-1);a='<a href="'+p+'" target=_blank>'+a+"</a>"}break;case"link":e=e.match(i.htmlRE)[0];a='<iframe class="smark website" src="'+e+'" width="853" height="480" frameborder="0"></iframe>';break;case"paragraph":e=i.parseParagraph(o,e);a='<p class="smark paragraph">'+e+"</p>";break;default:a=""}return a}};r.exports=t},{"./paragraph.js":2,"./regex.js":3,"./typeIs.js":4,"./typography.js":5}],2:[function(e,r,a){var t=e("./regex.js");r.exports=function(e,r){if(e){r=this.typographicChanges(r)}var a="";r=n(r);var i=r.match(t.olRE);if(i!==null){for(var l=0;l<i.length;l++){var s=i[l].match(t.olliRE);a="<ol>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.olliRE,"$1")+"</li>"}a+="</ol>";r=r.replace(i[l],a)}}var o=r.match(t.ulRE);if(o!==null){for(var l=0;l<o.length;l++){var s=o[l].match(t.ulliRE);a="<ul>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.ulliRE,"$1")+"</li>"}a+="</ul>";r=r.replace(o[l],a)}}if(t.bqRE.test(r)){if(r.replace(t.bqRE,"$2")===""){r=r.replace(t.bqRE,"<blockquote><p>$1</p></blockquote>")}else{r=r.replace(t.bqRE,"<blockquote><p>$1</p><footer>$2</footer></blockquote>")}}r=r.replace(t.h6RE,"<h6>$1</h6>");r=r.replace(t.h5RE,"<h5>$1</h5>");r=r.replace(t.h4RE,"<h4>$1</h4>");r=r.replace(t.h3RE,"<h3>$1</h3>");r=r.replace(t.h2RE,"<h2>$1</h2>");r=r.replace(t.h1RE,"<h1>$1</h1>");r=r.replace(t.hrRE,"<hr />");return r;function n(e){if(e.replace(t.linkRE,"$1")!==""){a='<a href="$2">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$2">$1</a>'}}e=e.replace(t.linkRE,a);if(e.replace(t.linkBareRE,"$1")!==""){a='<a href="$1">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$1">$1</a>'}}e=e.replace(t.linkBareRE,a);return e}}},{"./regex.js":3}],3:[function(e,r,a){var t={youtubeRE:/^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch|embed\/watch|embed)?[\?\/]?(?:v=|feature=player_embedded&v=)?([\w-_]+).*?$/,vimeoRE:/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/)?(?:\w+\/)?(\d+)$/,imageRE:/^(?! )(.+?\.(?:jpg|jpeg|gif|png|bmp))(?: -title="(.+?)")?(?:\(.+?\))?$/,imageLinkRE:/(?:\((.+?)\)){1}/,htmlRE:/^((?!.*(jpg|jpeg|gif|png|bmp))(https?:\/\/)[\w\-_]+(\.[\w\-_]+)+[\w\-.,@?^=%&:\/~\\+#]*)|.+\.(?!jpg|jpeg|gif|png|bmp)html?$/,linkRE:/\[(?!-)(.*?)\](?:|-blank) ?\((.+?)\)/g,linkBlankRE:/\[(?!-)(.*?)\]-blank ?\((.+?)\)/g,linkBareRE:/\[(?!-)(.*?)\](?:-blank)?/g,linkBareBlankRE:/\[(?!-)(.*?)\](?:-blank)/g,olRE:/(?:\d\.\s(.+?) \| ?)+/g,olliRE:/\d\.\s(.+?) \|/g,ulRE:/(?:\*\s(.+?) \| ?)+/g,ulliRE:/\*\s(.+?) \|/g,h6RE:/\s?#{6} (.+?) #{6}\s?/g,h5RE:/\s?#{5} (.+?) #{5}\s?/g,h4RE:/\s?#{4} (.+?) #{4}\s?/g,h3RE:/\s?#{3} (.+?) #{3}\s?/g,h2RE:/\s?#{2} (.+?) #{2}\s?/g,h1RE:/\s?# (.+?) #\s?/g,hrRE:/\s?---\s?/g,bqRE:/```(.+?)(?:\[-source:\s?(.+)\])?```/g,dQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?"(.+?)\\?"([ \.,;:\b\]])?/g,sQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?'(.+?)\\?'([ \.,;:\b\]])?/g,volRE:/\bvol\.\s\b/gi,pRE:/\bp\.\s\b(?=\d+)/g,cRE:/\bc\.\s\b(?=\d+)/g,flRE:/\bfl\.\s\b(?=\d+)/g,ieRE:/\bi\.e\.\s?\b/g,egRE:/\be\.g\.\s\b/g,aposRE:/([A-Za-z]+)'([a-z]+)/g,endashRE:/(.+?)\s-\s(.+?)/g,elipseRE:/\.{3}/g};r.exports=t},{}],4:[function(e,r,a){var t=e("./regex.js");typeIs=function(e){if(this.youtubeRE.test(e)){return"youtube"}else if(this.vimeoRE.test(e)){return"vimeo"}else if(this.imageRE.test(e)){return"image"}else if(this.htmlRE.test(e)){return"link"}else{return"paragraph"}};r.exports=typeIs},{"./regex.js":3}],5:[function(e,r,a){r.exports=function(e){e=e.replace(this.dQuotRE,"$1&#8220;$2&#8221;$3");e=e.replace(this.sQuotRE,"$1&#8216;$2&#8217;$3");e=e.replace(this.volRE,"Vol.");e=e.replace(this.pRE,"p.");e=e.replace(this.cRE,"<i>c.</i>");e=e.replace(this.flRE,"<i>fl.</i>");e=e.replace(this.ieRE,"<i>ie</i> ");e=e.replace(this.egRE,"<i>eg</i> ");e=e.replace(this.aposRE,"$1&#8217;$2");e=e.replace(this.endashRE,"$1&#8211;$2");e=e.replace(this.elipseRE,"&#8230;");return e}},{}]},{},[1])(1)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY3VzdG9tLmpzIiwiamF2YXNjcmlwdHMvbW9kZWxzLmpzIiwiamF2YXNjcmlwdHMvc2luZ2xlVmlldy5qcyIsIm5vZGVfbW9kdWxlcy9zbWFyay9zbWFyay5taW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcbnZhciBtb2RlbCA9IHJlcXVpcmUoXCIuL21vZGVscy5qc1wiKTtcblxuLy8gVGhlIGNvbGxlY3Rpb25zIG9mIGRhdGEgdGhhdCB3ZSBpbXBvcnQgaW4gZnJvbSB0aGUgd29yZHByZXNzIHNlcnZlci5cbnZhciBjb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHRtb2RlbDogbW9kZWwsXG5cdC8vIHVybDogXCJodHRwOi8vaW5mby5jc21ncmFwaGljZGVzaWduLmNvbS93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mbz9maWx0ZXJbcG9zdHNfcGVyX3BhZ2VdPS0xXCIsXG5cdC8vIHVybDogXCJodHRwOi8vbG9jYWxob3N0L3dvcmRwcmVzcy93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mb1wiLFxuXHR1cmw6IFwiLi9yZXNwb25zZS5qc29uXCIsXG5cblx0Y29tcGFyYXRvcjogXCJuYW1lXCJcbn0pO1xuXG5zdHVkZW50c19kYXRhID0gbmV3IGNvbGxlY3Rpb24oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdHVkZW50c19kYXRhO1xuIiwiLy8gQnVuY2ggb2YgaW1wb3J0c1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xudmFyIHNtYXJrID0gcmVxdWlyZShcInNtYXJrXCIpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgc3R1ZGVudHNfZGF0YSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb24uanNcIik7XG52YXIgc2luZ2xlVmlldyA9IHJlcXVpcmUoXCIuL3NpbmdsZVZpZXcuanNcIik7XG52YXIgbWFnaWMgPSBtYWdpYyB8fCB7fTtcblxuLy8gSG9sZCB0aGF0IHJlYWR5LCBtYWdpYyBuZWVkcyB0byBoYXBwZW4gZmlyc3QhXG4kLmhvbGRSZWFkeSh0cnVlKTtcbiQoXCIjcGFnZS1jb250ZW50XCIpLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbi8vIEFueXRoaW5nIHRoYXQgbmVlZHMgZG9pbmcgYmVmb3JlIGRhdGEgaXMgbG9hZGVkIHNob3VsZCBnbyBoZXJlLlxudmFyIHJlY2VpdmVkRGF0YSA9IG5ldyBFdmVudChcInJlY2VpdmVkRGF0YVwiKTtcblxuLy8gRmV0Y2ggZGF0YSBmcm9tIHRoZSBiYWNrZW5kLlxuc3R1ZGVudHNfZGF0YS5mZXRjaCh7XG5cdC8vIERpc3BhdGNoIHRoZSByZWNlaXZlZCBkYXRhIGV2ZW50IGFmdGVyIHRoZSBkYXRhIGlzIHN1Y2Nlc2Z1bGx5IGxvYWRlZC5cblx0c3VjY2VzczogZnVuY3Rpb24oKXtcblx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChyZWNlaXZlZERhdGEpO1xuXHR9XG59KTtcblxuXG4vLyBUaGUgcGFnZSBsb2dpYyBzaG91bGQgZ28gaW4gdGhpcyBjYWxsYmFjayBmdW5jdGlvbiAocmVuZGVyaW5nIGV0Yy4pXG4vLyBUcmVhdCB0aGlzIGFzIHRoZSByZWd1bGFyIGRvY3VtZW50LnJlYWR5IHRoaW5nIHVubGVzcyB0aGVyZSBhcmUgc3R1ZmYgdG8gYmVcbi8vIGRvbmUgYmVmb3JlIGxvYWRpbmcgaW4gdGhlIGRhdGEuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlY2VpdmVkRGF0YVwiLCBmdW5jdGlvbigpe1xuXHQvLyBzdHVkZW50c19kYXRhIGlzIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuXHRjb25zb2xlLmxvZyhzdHVkZW50c19kYXRhLm1vZGVscyk7XG5cdC8vIE1ha2UgdGhlbSBkYXRhIHByZXR0eSFcblx0c3R1ZGVudHNfZGF0YS5lYWNoKGZ1bmN0aW9uKGVsLCBpKXtcblx0XHQvLyBWYWxpZGF0ZSBhbmQgZml4IHdlYnNpdGUgYWRkcmVzc2VzXG5cdFx0bWFnaWMudmFsaWRhdGVXZWJBZGRyZXNzKGVsLCBbXG5cdFx0XHRcImxpbmtfdG9fcGVyc29uYWxfd2Vic2l0ZVwiLFxuXHRcdFx0XCJ5b3V0dWJlXCIsXG5cdFx0XHRcInZpbWVvXCIsXG5cdFx0XHRcImhlcm9fdmlkZW9cIixcblx0XHRcdFwidmlkZW9fMVwiLFxuXHRcdFx0XCJ2aWRlb18yXCJcblx0XHRdKTtcblxuXHRcdC8vIENvbnZlcnQgc3R1ZGVudCBJRCB0byB1cHBlciBjYXNlXG5cdFx0ZWwuc2V0KFwic3R1ZGVudF9udW1iZXJcIiwgZWwuZ2V0KFwic3R1ZGVudF9udW1iZXJcIikudG9VcHBlckNhc2UoKSk7XG5cblx0XHQvLyBUcmltIHRhZ3MgdG8gNyBpdGVtcyBvbmx5XG5cdFx0aWYgKGVsLmdldChcInRhZ3NcIikgIT09IG51bGwpe1xuXHRcdFx0aWYgKGVsLmdldChcInRhZ3NcIikubGVuZ3RoID4gNyl7XG5cdFx0XHRcdGVsLmdldChcInRhZ3NcIikuc3BsaWNlKDcpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1hZ2ljLnR5cG9ncmFwaHkoZWwsIFtcImJpb1wiLCBcImhlcm9fY2FwdGlvblwiLCBcImNhcHRpb25fMVwiLCBcImNhcHRpb25fMlwiXSk7XG5cblx0XHR2YXIgYXZhaWxhYmxlVmlkZW9zID0gW107XG5cdFx0aWYgKGVsLmdldChcImhlcm9faW1hZ2VfdmlkZW9cIikgPT0gXCJWaWRlb1wiKXtcblx0XHRcdGF2YWlsYWJsZVZpZGVvcy5wdXNoKFwiaGVyb192aWRlb1wiKTtcblx0XHR9XG5cdFx0aWYgKGVsLmdldChcImltYWdlX3ZpZGVvXzFcIikgPT0gXCJWaWRlb1wiKXtcblx0XHRcdGF2YWlsYWJsZVZpZGVvcy5wdXNoKFwidmlkZW9fMVwiKTtcblx0XHR9XG5cdFx0aWYgKGVsLmdldChcImltYWdlX3ZpZGVvXzJcIikgPT0gXCJWaWRlb1wiKXtcblx0XHRcdGF2YWlsYWJsZVZpZGVvcy5wdXNoKFwidmlkZW9fMlwiKTtcblx0XHR9XG5cdFx0aWYoIShfLmlzRW1wdHkoYXZhaWxhYmxlVmlkZW9zKSkpe1xuXHRcdFx0bWFnaWMuZ2V0VmlkZW9JbWFnZShlbCwgYXZhaWxhYmxlVmlkZW9zKTtcblx0XHR9XG5cdH0pO1xuXG5cblx0Ly8gc3R1ZGVudHNfZGlzcGxheSBpcyB0aGUgc2luZ2xlIHZpZXcgb2JqZWN0IG1lYW50IHRvIHJlbmRlciBpbmZvIGZvciBvbmUgc3R1ZGVudFxuXHR2YXIgc3R1ZGVudHNfZGlzcGxheSA9IG5ldyBzaW5nbGVWaWV3KHttb2RlbDogc3R1ZGVudHNfZGF0YS5hdCgwKX0pO1xuXHQvLyAkKFwiI3BhZ2UtY29udGVudCAjd3JhcHBlclwiKS5odG1sKHN0dWRlbnRzX2Rpc3BsYXkucmVuZGVyKCkuJGVsKTtcblxuXG5cblx0Ly8gTm93IHlvdSBjYW4gYmUgcmVhZHksIGV2ZXJ5dGhpbmcncyBsb2FkZWQgaW4gYW5kIGRpc3BsYXllZCFcblx0JC5ob2xkUmVhZHkoZmFsc2UpO1xuXHQkKFwiI3BhZ2UtY29udGVudFwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiaW5saW5lXCIpO1xuXHQkKFwiI2xvYWRpbmdcIikuY3NzKFwib3BhY2l0eVwiLCBcIjBcIik7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHQkKFwiI2xvYWRpbmdcIikuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG5cdH0sIDUwMCk7XG5cdC8vIEFmdGVyIHRoaXMgcG9pbnQgeW91IHNob3VsZCB0aGVuIGJpbmQgZXZlbnRzLCBhbmltYXRpb25zLCBldGMuXG5cdC8vICh3aGljaCB3aWxsIGhhcHBlbiBpbiBzY3JpcHQuanMgaW4gZG9jdW1lbnQucmVhZHkpXG59KTtcblxuXG4vLyBTb21lIG1hZ2ljIGZ1bmN0aW9uc1xubWFnaWMudmFsaWRhdGVXZWJBZGRyZXNzID0gZnVuY3Rpb24oZWwsIG5hbWVzKXtcblx0dmFyIHN0YXJ0ID0gL15odHRwcz86XFwvXFwvL2dpO1xuXG5cdF8uZWFjaChuYW1lcywgZnVuY3Rpb24obmFtZSwgaSkge1xuXHRcdGlmIChlbC5nZXQobmFtZSkgIT09IFwiXCIgJiYgdHlwZW9mIGVsLmdldChuYW1lKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdC8vIEFkZCBodHRwOi8vIHByZWZpeCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgaGF2ZSBpdCxcblx0XHRcdC8vIHJlcXVpcmVkIHRvIG1ha2Ugc3VyZSBsaW5rcyBhcmUgYWJzb2x1dGVcblx0XHRcdGlmIChlbC5nZXQobmFtZSkuc2VhcmNoKHN0YXJ0KSA9PSAtMSl7XG5cdFx0XHRcdHZhciBvbGQgPSBlbC5nZXQobmFtZSk7XG5cdFx0XHRcdGVsLnNldChuYW1lLCBcImh0dHA6Ly9cIiArIG9sZCk7XG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHQvLyBVc2VyIGRpZCBub3QgcHJvdmlkZSBsaW5rIHRvIHdlYnNpdGVcblx0XHR9XG5cdH0pO1xufTtcblxubWFnaWMudHlwb2dyYXBoeSA9IGZ1bmN0aW9uKGVsLCBmaWVsZHMpe1xuXHRfLmVhY2goZmllbGRzLCBmdW5jdGlvbihmaWVsZCwgaSl7XG5cdFx0aWYgKGVsLmdldChmaWVsZCkpe1xuXHRcdFx0ZWwuc2V0KGZpZWxkLCBzbWFyay50eXBvZ3JhcGhpY0NoYW5nZXMoZWwuZ2V0KGZpZWxkKSkudHJpbSgpKTtcblx0XHR9XG5cdH0pO1xufTtcblxubWFnaWMuZ2V0VmlkZW9JbWFnZSA9IGZ1bmN0aW9uKGVsLCBmaWVsZHMpe1xuXHRfLmVhY2goZmllbGRzLCBmdW5jdGlvbihmaWVsZCwgaSl7XG5cdFx0aWYoZWwuZ2V0KGZpZWxkKSAhPT0gXCJcIil7XG5cdFx0XHR2YXIgdmlkSUQ7XG5cdFx0XHRpZihzbWFyay50eXBlSXMoZWwuZ2V0KGZpZWxkKSkgPT0gXCJ5b3V0dWJlXCIpe1xuXHRcdFx0XHR2aWRJRCA9IGVsLmdldChmaWVsZCkucmVwbGFjZShzbWFyay55b3V0dWJlUkUsIFwiJDFcIik7XG5cdFx0XHRcdHZhciBpbWFnZUxpbmsgPSBcImh0dHA6Ly9pMy55dGltZy5jb20vdmkvXCIgKyB2aWRJRCArIFwiL3NkZGVmYXVsdC5qcGdcIjtcblx0XHRcdFx0ZWwuc2V0KGZpZWxkICsgXCJfaW1hZ2VcIiwgaW1hZ2VMaW5rKTtcblxuXHRcdFx0fWVsc2UgaWYoc21hcmsudHlwZUlzKGVsLmdldChmaWVsZCkpID09IFwidmltZW9cIil7XG5cdFx0XHRcdHZpZElEID0gZWwuZ2V0KGZpZWxkKS5yZXBsYWNlKHNtYXJrLnZpbWVvUkUsIFwiJDFcIik7XG5cdFx0XHRcdG1hZ2ljLnZpbWVvTG9hZGluZ1RodW1iKHZpZElELCBmdW5jdGlvbihpbWFnZUxpbmspe1xuXHRcdFx0XHRcdGVsLnNldChmaWVsZCArIFwiX2ltYWdlXCIsIGltYWdlTGluayk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVsLmdldChcIm5hbWVcIiksIGVsLmdldChmaWVsZCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy52aW1lb0xvYWRpbmdUaHVtYiA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjayl7XG4gICAgdmFyIHVybCA9IFwiaHR0cHM6Ly92aW1lby5jb20vYXBpL29lbWJlZC5qc29uP3VybD1odHRwcyUzQS8vdmltZW8uY29tL1wiICsgaWQ7XG4gICAgJC5hamF4KHtcbiAgICBcdHVybDogdXJsLFxuICAgIFx0ZGF0YVR5cGU6IFwianNvblwiXG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhKXtcbiAgICBcdHZhciByZXR1cm5JbWFnZSA9IGRhdGEudGh1bWJuYWlsX3VybDtcbiAgICBcdHJldHVybkltYWdlID0gcmV0dXJuSW1hZ2UucmVwbGFjZSgvKC4qP18pXFxkKz8oXFwuanBnKS8sIFwiJDE2NDAkMlwiKTtcbiAgICBcdGNhbGxiYWNrKHJldHVybkltYWdlKTtcbiAgICB9KTtcbn07XG5cbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG4vLyBJbml0aWFsaXphdGlvbiBmb3IgbW9kZWwgKHByb2JhYmx5IHdpbGwgbm90IG5lZWQgY2hhbmdpbmcgZXZlcilcbnZhciBtb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdGRlZmF1bHRzOntcblx0XHRlbWFpbDogXCJwbGFjZWhvbGRlckBnZW5lcmljLmNvbVwiLFxuXHRcdG5hbWU6IFwiRGF2aWQgQm93aWVcIixcblx0XHR3ZWJzaXRlOiBcInd3dy5nb29nbGUuY29tXCJcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kZWw7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbl8udGVtcGxhdGVTZXR0aW5ncyA9IHtcblx0aW50ZXJwb2xhdGU6IC9cXCg6KC4rPyk6XFwpL2csXG5cdGV2YWx1YXRlOiAvXFwpOiguKz8pOlxcKC9nXG59O1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IG9ubHkgcmVuZGVyIG9uY2UgaW5zdGFuY2Ugb2YgYSBtb2RlbFxuLy8gaWUuIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIHN0dWRlbnQncyBpbmZvXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJhcnRpY2xlXCIsXG5cdGNsYXNzTmFtZTogXCJzdHVkZW50V3JhcHBlclwiLFxuXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCQoXCIjd3JhcHBlclwiKS5odG1sKCkpLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2luZ2xlVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdHRoaXMuJGVsLmh0bWwoc2luZ2xlVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTsiLCIvKiBAbGljZW5zZSBzbWFyay5qcyB3cml0dGVuIGJ5IEtlbm5ldGggTGltIDxsaW16eS5rZW5uZXRoQGdtYWlsLmNvbT4gKGh0dHA6Ly9kZXNpZ25lcmtlbi5iZSlcbiAgIExpY2Vuc2UgdW5kZXIgdGhlIEJTRCAyLUNsYXVzZSBMaWNlbnNlICovXG4oZnVuY3Rpb24oZSl7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZSgpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGUpfWVsc2V7dmFyIHI7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe3I9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe3I9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtyPXNlbGZ9ZWxzZXtyPXRoaXN9ci5zbWFyaz1lKCl9fSkoZnVuY3Rpb24oKXt2YXIgZSxyLGE7cmV0dXJuIGZ1bmN0aW9uIHQoZSxyLGEpe2Z1bmN0aW9uIGkocyxwKXtpZighcltzXSl7aWYoIWVbc10pe3ZhciBvPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXAmJm8pcmV0dXJuIG8ocywhMCk7aWYobClyZXR1cm4gbChzLCEwKTt2YXIgbj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK3MrXCInXCIpO3Rocm93IG4uY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixufXZhciBoPXJbc109e2V4cG9ydHM6e319O2Vbc11bMF0uY2FsbChoLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIGE9ZVtzXVsxXVtyXTtyZXR1cm4gaShhP2E6cil9LGgsaC5leHBvcnRzLHQsZSxyLGEpfXJldHVybiByW3NdLmV4cG9ydHN9dmFyIGw9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIHM9MDtzPGEubGVuZ3RoO3MrKylpKGFbc10pO3JldHVybiBpfSh7MTpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PWUoXCIuL3JlZ2V4LmpzXCIpO3QudHlwZUlzPWUoXCIuL3R5cGVJcy5qc1wiKTt0LnR5cG9ncmFwaGljQ2hhbmdlcz1lKFwiLi90eXBvZ3JhcGh5LmpzXCIpO3QucGFyc2VQYXJhZ3JhcGg9ZShcIi4vcGFyYWdyYXBoLmpzXCIpO3QuZ2VuZXJhdGU9ZnVuY3Rpb24oZSxyKXt2YXIgYT1cIlwiO3ZhciBpPXt0eXBlOlwiYXV0b1wiLHR5cG9ncmFwaHk6dHJ1ZX07Zm9yKHZhciBsIGluIHIpe2Zvcih2YXIgcyBpbiBpKXtpZihsPT1zKXtpLmo9ci5pfX19dmFyIHA9aS50eXBlO3ZhciBvPWkudHlwb2dyYXBoeTtpZihwPT1cImF1dG9cIil7aWYodGhpcy50eXBlSXMoZSk9PVwieW91dHViZVwiKXtwPVwieW91dHViZVwifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwidmltZW9cIil7cD1cInZpbWVvXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJpbWFnZVwiKXtwPVwiaW1hZ2VcIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cImxpbmtcIil7cD1cImxpbmtcIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cInBhcmFncmFwaFwiKXtwPVwicGFyYWdyYXBoXCJ9fWVsc2V7cD1pLnR5cGV9YT1uKGUscCk7cmV0dXJue2h0bWw6YSx0eXBlOnB9O2Z1bmN0aW9uIG4oZSxyKXt2YXIgYTt2YXIgaT10O3N3aXRjaChyKXtjYXNlXCJ5b3V0dWJlXCI6ZT1lLnJlcGxhY2UoaS55b3V0dWJlUkUsXCIkMVwiKTthPSc8aWZyYW1lIGNsYXNzPVwic21hcmsgeW91dHViZVwiIHNyYz1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLycrZSsnXCIgZnJhbWVib3JkZXI9XCIwXCIgd2lkdGg9XCI4NTNcIiBoZWlnaHQ9XCI0ODBcIiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+JzticmVhaztjYXNlXCJ2aW1lb1wiOmU9ZS5yZXBsYWNlKGkudmltZW9SRSxcIiQxXCIpO2E9JzxpZnJhbWUgY2xhc3M9XCJzbWFyayB2aW1lb1wiIHNyYz1cImh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby8nK2UrJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIHdpZHRoPVwiODUzXCIgaGVpZ2h0PVwiNDgwXCIgd2Via2l0YWxsb3dmdWxsc2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+JzticmVhaztjYXNlXCJpbWFnZVwiOnZhciBsPWUucmVwbGFjZShpLmltYWdlUkUsXCIkMVwiKTt2YXIgcz1lLnJlcGxhY2UoaS5pbWFnZVJFLFwiJDJcIik7aWYobyl7cz1pLnR5cG9ncmFwaGljQ2hhbmdlcyhzKX1hPSc8aW1nIGNsYXNzPVwic21hcmsgaW1hZ2VcIiB0aXRsZT1cIicrcysnXCIgc3JjPVwiJytsKydcIj4nO2lmKGkuaW1hZ2VMaW5rUkUudGVzdChlKSl7dmFyIHA9aS5pbWFnZUxpbmtSRS5leGVjKGUpWzBdO3A9cC5zdWJzdHJpbmcoMSxwLmxlbmd0aC0xKTthPSc8YSBocmVmPVwiJytwKydcIiB0YXJnZXQ9X2JsYW5rPicrYStcIjwvYT5cIn1icmVhaztjYXNlXCJsaW5rXCI6ZT1lLm1hdGNoKGkuaHRtbFJFKVswXTthPSc8aWZyYW1lIGNsYXNzPVwic21hcmsgd2Vic2l0ZVwiIHNyYz1cIicrZSsnXCIgd2lkdGg9XCI4NTNcIiBoZWlnaHQ9XCI0ODBcIiBmcmFtZWJvcmRlcj1cIjBcIj48L2lmcmFtZT4nO2JyZWFrO2Nhc2VcInBhcmFncmFwaFwiOmU9aS5wYXJzZVBhcmFncmFwaChvLGUpO2E9JzxwIGNsYXNzPVwic21hcmsgcGFyYWdyYXBoXCI+JytlK1wiPC9wPlwiO2JyZWFrO2RlZmF1bHQ6YT1cIlwifXJldHVybiBhfX07ci5leHBvcnRzPXR9LHtcIi4vcGFyYWdyYXBoLmpzXCI6MixcIi4vcmVnZXguanNcIjozLFwiLi90eXBlSXMuanNcIjo0LFwiLi90eXBvZ3JhcGh5LmpzXCI6NX1dLDI6W2Z1bmN0aW9uKGUscixhKXt2YXIgdD1lKFwiLi9yZWdleC5qc1wiKTtyLmV4cG9ydHM9ZnVuY3Rpb24oZSxyKXtpZihlKXtyPXRoaXMudHlwb2dyYXBoaWNDaGFuZ2VzKHIpfXZhciBhPVwiXCI7cj1uKHIpO3ZhciBpPXIubWF0Y2godC5vbFJFKTtpZihpIT09bnVsbCl7Zm9yKHZhciBsPTA7bDxpLmxlbmd0aDtsKyspe3ZhciBzPWlbbF0ubWF0Y2godC5vbGxpUkUpO2E9XCI8b2w+XCI7Zm9yKHZhciBwPTA7cDxzLmxlbmd0aDtwKyspe2ErPVwiPGxpPlwiK3NbcF0ucmVwbGFjZSh0Lm9sbGlSRSxcIiQxXCIpK1wiPC9saT5cIn1hKz1cIjwvb2w+XCI7cj1yLnJlcGxhY2UoaVtsXSxhKX19dmFyIG89ci5tYXRjaCh0LnVsUkUpO2lmKG8hPT1udWxsKXtmb3IodmFyIGw9MDtsPG8ubGVuZ3RoO2wrKyl7dmFyIHM9b1tsXS5tYXRjaCh0LnVsbGlSRSk7YT1cIjx1bD5cIjtmb3IodmFyIHA9MDtwPHMubGVuZ3RoO3ArKyl7YSs9XCI8bGk+XCIrc1twXS5yZXBsYWNlKHQudWxsaVJFLFwiJDFcIikrXCI8L2xpPlwifWErPVwiPC91bD5cIjtyPXIucmVwbGFjZShvW2xdLGEpfX1pZih0LmJxUkUudGVzdChyKSl7aWYoci5yZXBsYWNlKHQuYnFSRSxcIiQyXCIpPT09XCJcIil7cj1yLnJlcGxhY2UodC5icVJFLFwiPGJsb2NrcXVvdGU+PHA+JDE8L3A+PC9ibG9ja3F1b3RlPlwiKX1lbHNle3I9ci5yZXBsYWNlKHQuYnFSRSxcIjxibG9ja3F1b3RlPjxwPiQxPC9wPjxmb290ZXI+JDI8L2Zvb3Rlcj48L2Jsb2NrcXVvdGU+XCIpfX1yPXIucmVwbGFjZSh0Lmg2UkUsXCI8aDY+JDE8L2g2PlwiKTtyPXIucmVwbGFjZSh0Lmg1UkUsXCI8aDU+JDE8L2g1PlwiKTtyPXIucmVwbGFjZSh0Lmg0UkUsXCI8aDQ+JDE8L2g0PlwiKTtyPXIucmVwbGFjZSh0LmgzUkUsXCI8aDM+JDE8L2gzPlwiKTtyPXIucmVwbGFjZSh0LmgyUkUsXCI8aDI+JDE8L2gyPlwiKTtyPXIucmVwbGFjZSh0LmgxUkUsXCI8aDE+JDE8L2gxPlwiKTtyPXIucmVwbGFjZSh0LmhyUkUsXCI8aHIgLz5cIik7cmV0dXJuIHI7ZnVuY3Rpb24gbihlKXtpZihlLnJlcGxhY2UodC5saW5rUkUsXCIkMVwiKSE9PVwiXCIpe2E9JzxhIGhyZWY9XCIkMlwiPiQxPC9hPic7aWYodC5saW5rQmxhbmtSRS50ZXN0KGUpKXthPSc8YSB0YXJnZXQ9X2JsYW5rIGhyZWY9XCIkMlwiPiQxPC9hPid9fWU9ZS5yZXBsYWNlKHQubGlua1JFLGEpO2lmKGUucmVwbGFjZSh0LmxpbmtCYXJlUkUsXCIkMVwiKSE9PVwiXCIpe2E9JzxhIGhyZWY9XCIkMVwiPiQxPC9hPic7aWYodC5saW5rQmxhbmtSRS50ZXN0KGUpKXthPSc8YSB0YXJnZXQ9X2JsYW5rIGhyZWY9XCIkMVwiPiQxPC9hPid9fWU9ZS5yZXBsYWNlKHQubGlua0JhcmVSRSxhKTtyZXR1cm4gZX19fSx7XCIuL3JlZ2V4LmpzXCI6M31dLDM6W2Z1bmN0aW9uKGUscixhKXt2YXIgdD17eW91dHViZVJFOi9eKD86aHR0cHM/OlxcL1xcLyk/KD86d3d3XFwuKT95b3V0dSg/OlxcLmJlfGJlXFwuY29tKVxcLyg/OndhdGNofGVtYmVkXFwvd2F0Y2h8ZW1iZWQpP1tcXD9cXC9dPyg/OnY9fGZlYXR1cmU9cGxheWVyX2VtYmVkZGVkJnY9KT8oW1xcdy1fXSspLio/JC8sdmltZW9SRTovXig/Omh0dHBzPzpcXC9cXC8pPyg/Ond3d1xcLik/dmltZW9cXC5jb21cXC8oPzpjaGFubmVsc1xcLyk/KD86XFx3K1xcLyk/KFxcZCspJC8saW1hZ2VSRTovXig/ISApKC4rP1xcLig/OmpwZ3xqcGVnfGdpZnxwbmd8Ym1wKSkoPzogLXRpdGxlPVwiKC4rPylcIik/KD86XFwoLis/XFwpKT8kLyxpbWFnZUxpbmtSRTovKD86XFwoKC4rPylcXCkpezF9LyxodG1sUkU6L14oKD8hLiooanBnfGpwZWd8Z2lmfHBuZ3xibXApKShodHRwcz86XFwvXFwvKVtcXHdcXC1fXSsoXFwuW1xcd1xcLV9dKykrW1xcd1xcLS4sQD9ePSUmOlxcL35cXFxcKyNdKil8LitcXC4oPyFqcGd8anBlZ3xnaWZ8cG5nfGJtcClodG1sPyQvLGxpbmtSRTovXFxbKD8hLSkoLio/KVxcXSg/OnwtYmxhbmspID9cXCgoLis/KVxcKS9nLGxpbmtCbGFua1JFOi9cXFsoPyEtKSguKj8pXFxdLWJsYW5rID9cXCgoLis/KVxcKS9nLGxpbmtCYXJlUkU6L1xcWyg/IS0pKC4qPylcXF0oPzotYmxhbmspPy9nLGxpbmtCYXJlQmxhbmtSRTovXFxbKD8hLSkoLio/KVxcXSg/Oi1ibGFuaykvZyxvbFJFOi8oPzpcXGRcXC5cXHMoLis/KSBcXHwgPykrL2csb2xsaVJFOi9cXGRcXC5cXHMoLis/KSBcXHwvZyx1bFJFOi8oPzpcXCpcXHMoLis/KSBcXHwgPykrL2csdWxsaVJFOi9cXCpcXHMoLis/KSBcXHwvZyxoNlJFOi9cXHM/I3s2fSAoLis/KSAjezZ9XFxzPy9nLGg1UkU6L1xccz8jezV9ICguKz8pICN7NX1cXHM/L2csaDRSRTovXFxzPyN7NH0gKC4rPykgI3s0fVxccz8vZyxoM1JFOi9cXHM/I3szfSAoLis/KSAjezN9XFxzPy9nLGgyUkU6L1xccz8jezJ9ICguKz8pICN7Mn1cXHM/L2csaDFSRTovXFxzPyMgKC4rPykgI1xccz8vZyxoclJFOi9cXHM/LS0tXFxzPy9nLGJxUkU6L2BgYCguKz8pKD86XFxbLXNvdXJjZTpcXHM/KC4rKVxcXSk/YGBgL2csZFF1b3RSRTovKF58XFxzKD86WyBcXC4sOzpcXGJcXFtdKT8pXFxcXD9cIiguKz8pXFxcXD9cIihbIFxcLiw7OlxcYlxcXV0pPy9nLHNRdW90UkU6LyhefFxccyg/OlsgXFwuLDs6XFxiXFxbXSk/KVxcXFw/JyguKz8pXFxcXD8nKFsgXFwuLDs6XFxiXFxdXSk/L2csdm9sUkU6L1xcYnZvbFxcLlxcc1xcYi9naSxwUkU6L1xcYnBcXC5cXHNcXGIoPz1cXGQrKS9nLGNSRTovXFxiY1xcLlxcc1xcYig/PVxcZCspL2csZmxSRTovXFxiZmxcXC5cXHNcXGIoPz1cXGQrKS9nLGllUkU6L1xcYmlcXC5lXFwuXFxzP1xcYi9nLGVnUkU6L1xcYmVcXC5nXFwuXFxzXFxiL2csYXBvc1JFOi8oW0EtWmEtel0rKScoW2Etel0rKS9nLGVuZGFzaFJFOi8oLis/KVxccy1cXHMoLis/KS9nLGVsaXBzZVJFOi9cXC57M30vZ307ci5leHBvcnRzPXR9LHt9XSw0OltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9ZShcIi4vcmVnZXguanNcIik7dHlwZUlzPWZ1bmN0aW9uKGUpe2lmKHRoaXMueW91dHViZVJFLnRlc3QoZSkpe3JldHVyblwieW91dHViZVwifWVsc2UgaWYodGhpcy52aW1lb1JFLnRlc3QoZSkpe3JldHVyblwidmltZW9cIn1lbHNlIGlmKHRoaXMuaW1hZ2VSRS50ZXN0KGUpKXtyZXR1cm5cImltYWdlXCJ9ZWxzZSBpZih0aGlzLmh0bWxSRS50ZXN0KGUpKXtyZXR1cm5cImxpbmtcIn1lbHNle3JldHVyblwicGFyYWdyYXBoXCJ9fTtyLmV4cG9ydHM9dHlwZUlzfSx7XCIuL3JlZ2V4LmpzXCI6M31dLDU6W2Z1bmN0aW9uKGUscixhKXtyLmV4cG9ydHM9ZnVuY3Rpb24oZSl7ZT1lLnJlcGxhY2UodGhpcy5kUXVvdFJFLFwiJDEmIzgyMjA7JDImIzgyMjE7JDNcIik7ZT1lLnJlcGxhY2UodGhpcy5zUXVvdFJFLFwiJDEmIzgyMTY7JDImIzgyMTc7JDNcIik7ZT1lLnJlcGxhY2UodGhpcy52b2xSRSxcIlZvbC5cIik7ZT1lLnJlcGxhY2UodGhpcy5wUkUsXCJwLlwiKTtlPWUucmVwbGFjZSh0aGlzLmNSRSxcIjxpPmMuPC9pPlwiKTtlPWUucmVwbGFjZSh0aGlzLmZsUkUsXCI8aT5mbC48L2k+XCIpO2U9ZS5yZXBsYWNlKHRoaXMuaWVSRSxcIjxpPmllPC9pPiBcIik7ZT1lLnJlcGxhY2UodGhpcy5lZ1JFLFwiPGk+ZWc8L2k+IFwiKTtlPWUucmVwbGFjZSh0aGlzLmFwb3NSRSxcIiQxJiM4MjE3OyQyXCIpO2U9ZS5yZXBsYWNlKHRoaXMuZW5kYXNoUkUsXCIkMSYjODIxMTskMlwiKTtlPWUucmVwbGFjZSh0aGlzLmVsaXBzZVJFLFwiJiM4MjMwO1wiKTtyZXR1cm4gZX19LHt9XX0se30sWzFdKSgxKX0pO1xuIl19
