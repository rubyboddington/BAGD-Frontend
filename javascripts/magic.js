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

},{"./models.js":4}],2:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;

// The view renderer that renders a collection of data
// ie. a collection of students info for navigation or something else.

// Create one element at a time
var individual = Backbone.View.extend({
	tagName: "li",

	template: _.template($("#name-list-item").html()),

	render: function(){
		var modelTemplate = this.template(this.model.toJSON());
		this.$el.html(modelTemplate);
		return this;
	}
});

// Placing the elements created above into the collection view renderer.
module.exports = Backbone.View.extend({
	tagName: "div",
	id: "name-list",

	render: function(){
		var wholeList = "";
		var groupedList = this.collection.groupBy(function(el){
			var firstChar = el.get("name").charAt(0);
			return firstChar;
		}, this);

		_.each(groupedList, function(el, key){
			var header = "<ul><li><h6>" + key + "</h6></li>";

			wholeList += header;

			_.each(el, function(el, i){
				wholeList += this.addModel(el);
			}, this);

			wholeList += "</ul>";
		}, this);

		this.$el.html(wholeList);

		return this;
	},

	addModel: function(model){
		var modelView = new individual({model: model});
		return modelView.render().$el.html();
	}
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
// Bunch of imports
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var smark = require("smark");
Backbone.$ = $;
var students_data = require("./collection.js");
var singleView = require("./singleView.js");
var collectionView = require("./collectionView.js");
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

	var questions_display = $("#questions").html();
	$("#page-content #main").html(questions_display);

	var students_list = new collectionView({collection: students_data});
	$("#page-content #names-nav .nav-content").html(students_list.render().$el);



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

},{"./collection.js":1,"./collectionView.js":2,"./singleView.js":5,"smark":6}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
(function (global){
/* @license smark.js written by Kenneth Lim <limzy.kenneth@gmail.com> (http://designerken.be)
   License under the BSD 2-Clause License */
(function(e){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=e()}else if(typeof define==="function"&&define.amd){define([],e)}else{var r;if(typeof window!=="undefined"){r=window}else if(typeof global!=="undefined"){r=global}else if(typeof self!=="undefined"){r=self}else{r=this}r.smark=e()}})(function(){var e,r,a;return function t(e,r,a){function i(s,p){if(!r[s]){if(!e[s]){var o=typeof require=="function"&&require;if(!p&&o)return o(s,!0);if(l)return l(s,!0);var n=new Error("Cannot find module '"+s+"'");throw n.code="MODULE_NOT_FOUND",n}var h=r[s]={exports:{}};e[s][0].call(h.exports,function(r){var a=e[s][1][r];return i(a?a:r)},h,h.exports,t,e,r,a)}return r[s].exports}var l=typeof require=="function"&&require;for(var s=0;s<a.length;s++)i(a[s]);return i}({1:[function(e,r,a){var t=e("./regex.js");t.typeIs=e("./typeIs.js");t.typographicChanges=e("./typography.js");t.parseParagraph=e("./paragraph.js");t.generate=function(e,r){var a="";var i={type:"auto",typography:true};for(var l in r){for(var s in i){if(l==s){i.j=r.i}}}var p=i.type;var o=i.typography;if(p=="auto"){if(this.typeIs(e)=="youtube"){p="youtube"}else if(this.typeIs(e)=="vimeo"){p="vimeo"}else if(this.typeIs(e)=="image"){p="image"}else if(this.typeIs(e)=="link"){p="link"}else if(this.typeIs(e)=="paragraph"){p="paragraph"}}else{p=i.type}a=n(e,p);return{html:a,type:p};function n(e,r){var a;var i=t;switch(r){case"youtube":e=e.replace(i.youtubeRE,"$1");a='<iframe class="smark youtube" src="https://www.youtube.com/embed/'+e+'" frameborder="0" width="853" height="480" allowfullscreen></iframe>';break;case"vimeo":e=e.replace(i.vimeoRE,"$1");a='<iframe class="smark vimeo" src="https://player.vimeo.com/video/'+e+'" frameborder="0" width="853" height="480" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';break;case"image":var l=e.replace(i.imageRE,"$1");var s=e.replace(i.imageRE,"$2");if(o){s=i.typographicChanges(s)}a='<img class="smark image" title="'+s+'" src="'+l+'">';if(i.imageLinkRE.test(e)){var p=i.imageLinkRE.exec(e)[0];p=p.substring(1,p.length-1);a='<a href="'+p+'" target=_blank>'+a+"</a>"}break;case"link":e=e.match(i.htmlRE)[0];a='<iframe class="smark website" src="'+e+'" width="853" height="480" frameborder="0"></iframe>';break;case"paragraph":e=i.parseParagraph(o,e);a='<p class="smark paragraph">'+e+"</p>";break;default:a=""}return a}};r.exports=t},{"./paragraph.js":2,"./regex.js":3,"./typeIs.js":4,"./typography.js":5}],2:[function(e,r,a){var t=e("./regex.js");r.exports=function(e,r){if(e){r=this.typographicChanges(r)}var a="";r=n(r);var i=r.match(t.olRE);if(i!==null){for(var l=0;l<i.length;l++){var s=i[l].match(t.olliRE);a="<ol>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.olliRE,"$1")+"</li>"}a+="</ol>";r=r.replace(i[l],a)}}var o=r.match(t.ulRE);if(o!==null){for(var l=0;l<o.length;l++){var s=o[l].match(t.ulliRE);a="<ul>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.ulliRE,"$1")+"</li>"}a+="</ul>";r=r.replace(o[l],a)}}if(t.bqRE.test(r)){if(r.replace(t.bqRE,"$2")===""){r=r.replace(t.bqRE,"<blockquote><p>$1</p></blockquote>")}else{r=r.replace(t.bqRE,"<blockquote><p>$1</p><footer>$2</footer></blockquote>")}}r=r.replace(t.h6RE,"<h6>$1</h6>");r=r.replace(t.h5RE,"<h5>$1</h5>");r=r.replace(t.h4RE,"<h4>$1</h4>");r=r.replace(t.h3RE,"<h3>$1</h3>");r=r.replace(t.h2RE,"<h2>$1</h2>");r=r.replace(t.h1RE,"<h1>$1</h1>");r=r.replace(t.hrRE,"<hr />");return r;function n(e){if(e.replace(t.linkRE,"$1")!==""){a='<a href="$2">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$2">$1</a>'}}e=e.replace(t.linkRE,a);if(e.replace(t.linkBareRE,"$1")!==""){a='<a href="$1">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$1">$1</a>'}}e=e.replace(t.linkBareRE,a);return e}}},{"./regex.js":3}],3:[function(e,r,a){var t={youtubeRE:/^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch|embed\/watch|embed)?[\?\/]?(?:v=|feature=player_embedded&v=)?([\w-_]+).*?$/,vimeoRE:/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/)?(?:\w+\/)?(\d+)$/,imageRE:/^(?! )(.+?\.(?:jpg|jpeg|gif|png|bmp))(?: -title="(.+?)")?(?:\(.+?\))?$/,imageLinkRE:/(?:\((.+?)\)){1}/,htmlRE:/^((?!.*(jpg|jpeg|gif|png|bmp))(https?:\/\/)[\w\-_]+(\.[\w\-_]+)+[\w\-.,@?^=%&:\/~\\+#]*)|.+\.(?!jpg|jpeg|gif|png|bmp)html?$/,linkRE:/\[(?!-)(.*?)\](?:|-blank) ?\((.+?)\)/g,linkBlankRE:/\[(?!-)(.*?)\]-blank ?\((.+?)\)/g,linkBareRE:/\[(?!-)(.*?)\](?:-blank)?/g,linkBareBlankRE:/\[(?!-)(.*?)\](?:-blank)/g,olRE:/(?:\d\.\s(.+?) \| ?)+/g,olliRE:/\d\.\s(.+?) \|/g,ulRE:/(?:\*\s(.+?) \| ?)+/g,ulliRE:/\*\s(.+?) \|/g,h6RE:/\s?#{6} (.+?) #{6}\s?/g,h5RE:/\s?#{5} (.+?) #{5}\s?/g,h4RE:/\s?#{4} (.+?) #{4}\s?/g,h3RE:/\s?#{3} (.+?) #{3}\s?/g,h2RE:/\s?#{2} (.+?) #{2}\s?/g,h1RE:/\s?# (.+?) #\s?/g,hrRE:/\s?---\s?/g,bqRE:/```(.+?)(?:\[-source:\s?(.+)\])?```/g,dQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?"(.+?)\\?"([ \.,;:\b\]])?/g,sQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?'(.+?)\\?'([ \.,;:\b\]])?/g,volRE:/\bvol\.\s\b/gi,pRE:/\bp\.\s\b(?=\d+)/g,cRE:/\bc\.\s\b(?=\d+)/g,flRE:/\bfl\.\s\b(?=\d+)/g,ieRE:/\bi\.e\.\s?\b/g,egRE:/\be\.g\.\s\b/g,aposRE:/([A-Za-z]+)'([a-z]+)/g,endashRE:/(.+?)\s-\s(.+?)/g,elipseRE:/\.{3}/g};r.exports=t},{}],4:[function(e,r,a){var t=e("./regex.js");typeIs=function(e){if(this.youtubeRE.test(e)){return"youtube"}else if(this.vimeoRE.test(e)){return"vimeo"}else if(this.imageRE.test(e)){return"image"}else if(this.htmlRE.test(e)){return"link"}else{return"paragraph"}};r.exports=typeIs},{"./regex.js":3}],5:[function(e,r,a){r.exports=function(e){e=e.replace(this.dQuotRE,"$1&#8220;$2&#8221;$3");e=e.replace(this.sQuotRE,"$1&#8216;$2&#8217;$3");e=e.replace(this.volRE,"Vol.");e=e.replace(this.pRE,"p.");e=e.replace(this.cRE,"<i>c.</i>");e=e.replace(this.flRE,"<i>fl.</i>");e=e.replace(this.ieRE,"<i>ie</i> ");e=e.replace(this.egRE,"<i>eg</i> ");e=e.replace(this.aposRE,"$1&#8217;$2");e=e.replace(this.endashRE,"$1&#8211;$2");e=e.replace(this.elipseRE,"&#8230;");return e}},{}]},{},[1])(1)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY29sbGVjdGlvblZpZXcuanMiLCJqYXZhc2NyaXB0cy9jdXN0b20uanMiLCJqYXZhc2NyaXB0cy9tb2RlbHMuanMiLCJqYXZhc2NyaXB0cy9zaW5nbGVWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3NtYXJrL3NtYXJrLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xudmFyIG1vZGVsID0gcmVxdWlyZShcIi4vbW9kZWxzLmpzXCIpO1xuXG4vLyBUaGUgY29sbGVjdGlvbnMgb2YgZGF0YSB0aGF0IHdlIGltcG9ydCBpbiBmcm9tIHRoZSB3b3JkcHJlc3Mgc2VydmVyLlxudmFyIGNvbGxlY3Rpb24gPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdG1vZGVsOiBtb2RlbCxcblx0Ly8gdXJsOiBcImh0dHA6Ly9pbmZvLmNzbWdyYXBoaWNkZXNpZ24uY29tL3dwLWpzb24vd3AvdjIvc3R1ZGVudF9pbmZvP2ZpbHRlcltwb3N0c19wZXJfcGFnZV09LTFcIixcblx0Ly8gdXJsOiBcImh0dHA6Ly9sb2NhbGhvc3Qvd29yZHByZXNzL3dwLWpzb24vd3AvdjIvc3R1ZGVudF9pbmZvXCIsXG5cdHVybDogXCIuL3Jlc3BvbnNlLmpzb25cIixcblxuXHRjb21wYXJhdG9yOiBcIm5hbWVcIlxufSk7XG5cbnN0dWRlbnRzX2RhdGEgPSBuZXcgY29sbGVjdGlvbigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0dWRlbnRzX2RhdGE7XG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuLy8gVGhlIHZpZXcgcmVuZGVyZXIgdGhhdCByZW5kZXJzIGEgY29sbGVjdGlvbiBvZiBkYXRhXG4vLyBpZS4gYSBjb2xsZWN0aW9uIG9mIHN0dWRlbnRzIGluZm8gZm9yIG5hdmlnYXRpb24gb3Igc29tZXRoaW5nIGVsc2UuXG5cbi8vIENyZWF0ZSBvbmUgZWxlbWVudCBhdCBhIHRpbWVcbnZhciBpbmRpdmlkdWFsID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcImxpXCIsXG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiNuYW1lLWxpc3QtaXRlbVwiKS5odG1sKCkpLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgbW9kZWxUZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC50b0pTT04oKSk7XG5cdFx0dGhpcy4kZWwuaHRtbChtb2RlbFRlbXBsYXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbi8vIFBsYWNpbmcgdGhlIGVsZW1lbnRzIGNyZWF0ZWQgYWJvdmUgaW50byB0aGUgY29sbGVjdGlvbiB2aWV3IHJlbmRlcmVyLlxubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwiZGl2XCIsXG5cdGlkOiBcIm5hbWUtbGlzdFwiLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgd2hvbGVMaXN0ID0gXCJcIjtcblx0XHR2YXIgZ3JvdXBlZExpc3QgPSB0aGlzLmNvbGxlY3Rpb24uZ3JvdXBCeShmdW5jdGlvbihlbCl7XG5cdFx0XHR2YXIgZmlyc3RDaGFyID0gZWwuZ2V0KFwibmFtZVwiKS5jaGFyQXQoMCk7XG5cdFx0XHRyZXR1cm4gZmlyc3RDaGFyO1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0Xy5lYWNoKGdyb3VwZWRMaXN0LCBmdW5jdGlvbihlbCwga2V5KXtcblx0XHRcdHZhciBoZWFkZXIgPSBcIjx1bD48bGk+PGg2PlwiICsga2V5ICsgXCI8L2g2PjwvbGk+XCI7XG5cblx0XHRcdHdob2xlTGlzdCArPSBoZWFkZXI7XG5cblx0XHRcdF8uZWFjaChlbCwgZnVuY3Rpb24oZWwsIGkpe1xuXHRcdFx0XHR3aG9sZUxpc3QgKz0gdGhpcy5hZGRNb2RlbChlbCk7XG5cdFx0XHR9LCB0aGlzKTtcblxuXHRcdFx0d2hvbGVMaXN0ICs9IFwiPC91bD5cIjtcblx0XHR9LCB0aGlzKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwod2hvbGVMaXN0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGFkZE1vZGVsOiBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIG1vZGVsVmlldyA9IG5ldyBpbmRpdmlkdWFsKHttb2RlbDogbW9kZWx9KTtcblx0XHRyZXR1cm4gbW9kZWxWaWV3LnJlbmRlcigpLiRlbC5odG1sKCk7XG5cdH1cbn0pOyIsIi8vIEJ1bmNoIG9mIGltcG9ydHNcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbnZhciBzbWFyayA9IHJlcXVpcmUoXCJzbWFya1wiKTtcbkJhY2tib25lLiQgPSAkO1xudmFyIHN0dWRlbnRzX2RhdGEgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uLmpzXCIpO1xudmFyIHNpbmdsZVZpZXcgPSByZXF1aXJlKFwiLi9zaW5nbGVWaWV3LmpzXCIpO1xudmFyIGNvbGxlY3Rpb25WaWV3ID0gcmVxdWlyZShcIi4vY29sbGVjdGlvblZpZXcuanNcIik7XG52YXIgbWFnaWMgPSBtYWdpYyB8fCB7fTtcblxuLy8gSG9sZCB0aGF0IHJlYWR5LCBtYWdpYyBuZWVkcyB0byBoYXBwZW4gZmlyc3QhXG4kLmhvbGRSZWFkeSh0cnVlKTtcbiQoXCIjcGFnZS1jb250ZW50XCIpLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbi8vIEFueXRoaW5nIHRoYXQgbmVlZHMgZG9pbmcgYmVmb3JlIGRhdGEgaXMgbG9hZGVkIHNob3VsZCBnbyBoZXJlLlxudmFyIHJlY2VpdmVkRGF0YSA9IG5ldyBFdmVudChcInJlY2VpdmVkRGF0YVwiKTtcblxuLy8gRmV0Y2ggZGF0YSBmcm9tIHRoZSBiYWNrZW5kLlxuc3R1ZGVudHNfZGF0YS5mZXRjaCh7XG5cdC8vIERpc3BhdGNoIHRoZSByZWNlaXZlZCBkYXRhIGV2ZW50IGFmdGVyIHRoZSBkYXRhIGlzIHN1Y2Nlc2Z1bGx5IGxvYWRlZC5cblx0c3VjY2VzczogZnVuY3Rpb24oKXtcblx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChyZWNlaXZlZERhdGEpO1xuXHR9XG59KTtcblxuXG4vLyBUaGUgcGFnZSBsb2dpYyBzaG91bGQgZ28gaW4gdGhpcyBjYWxsYmFjayBmdW5jdGlvbiAocmVuZGVyaW5nIGV0Yy4pXG4vLyBUcmVhdCB0aGlzIGFzIHRoZSByZWd1bGFyIGRvY3VtZW50LnJlYWR5IHRoaW5nIHVubGVzcyB0aGVyZSBhcmUgc3R1ZmYgdG8gYmVcbi8vIGRvbmUgYmVmb3JlIGxvYWRpbmcgaW4gdGhlIGRhdGEuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlY2VpdmVkRGF0YVwiLCBmdW5jdGlvbigpe1xuXHQvLyBzdHVkZW50c19kYXRhIGlzIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuXHRjb25zb2xlLmxvZyhzdHVkZW50c19kYXRhLm1vZGVscyk7XG5cdC8vIE1ha2UgdGhlbSBkYXRhIHByZXR0eSFcblx0c3R1ZGVudHNfZGF0YS5lYWNoKGZ1bmN0aW9uKGVsLCBpKXtcblx0XHQvLyBWYWxpZGF0ZSBhbmQgZml4IHdlYnNpdGUgYWRkcmVzc2VzXG5cdFx0bWFnaWMudmFsaWRhdGVXZWJBZGRyZXNzKGVsLCBbXG5cdFx0XHRcImxpbmtfdG9fcGVyc29uYWxfd2Vic2l0ZVwiLFxuXHRcdFx0XCJ5b3V0dWJlXCIsXG5cdFx0XHRcInZpbWVvXCIsXG5cdFx0XHRcImhlcm9fdmlkZW9cIixcblx0XHRcdFwidmlkZW9fMVwiLFxuXHRcdFx0XCJ2aWRlb18yXCJcblx0XHRdKTtcblxuXHRcdC8vIENvbnZlcnQgc3R1ZGVudCBJRCB0byB1cHBlciBjYXNlXG5cdFx0ZWwuc2V0KFwic3R1ZGVudF9udW1iZXJcIiwgZWwuZ2V0KFwic3R1ZGVudF9udW1iZXJcIikudG9VcHBlckNhc2UoKSk7XG5cblx0XHQvLyBUcmltIHRhZ3MgdG8gNyBpdGVtcyBvbmx5XG5cdFx0aWYgKGVsLmdldChcInRhZ3NcIikgIT09IG51bGwpe1xuXHRcdFx0aWYgKGVsLmdldChcInRhZ3NcIikubGVuZ3RoID4gNyl7XG5cdFx0XHRcdGVsLmdldChcInRhZ3NcIikuc3BsaWNlKDcpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG1hZ2ljLnR5cG9ncmFwaHkoZWwsIFtcImJpb1wiLCBcImhlcm9fY2FwdGlvblwiLCBcImNhcHRpb25fMVwiLCBcImNhcHRpb25fMlwiXSk7XG5cblx0XHR2YXIgYXZhaWxhYmxlVmlkZW9zID0gW107XG5cdFx0aWYgKGVsLmdldChcImhlcm9faW1hZ2VfdmlkZW9cIikgPT0gXCJWaWRlb1wiKXtcblx0XHRcdGF2YWlsYWJsZVZpZGVvcy5wdXNoKFwiaGVyb192aWRlb1wiKTtcblx0XHR9XG5cdFx0aWYgKGVsLmdldChcImltYWdlX3ZpZGVvXzFcIikgPT0gXCJWaWRlb1wiKXtcblx0XHRcdGF2YWlsYWJsZVZpZGVvcy5wdXNoKFwidmlkZW9fMVwiKTtcblx0XHR9XG5cdFx0aWYgKGVsLmdldChcImltYWdlX3ZpZGVvXzJcIikgPT0gXCJWaWRlb1wiKXtcblx0XHRcdGF2YWlsYWJsZVZpZGVvcy5wdXNoKFwidmlkZW9fMlwiKTtcblx0XHR9XG5cdFx0aWYoIShfLmlzRW1wdHkoYXZhaWxhYmxlVmlkZW9zKSkpe1xuXHRcdFx0bWFnaWMuZ2V0VmlkZW9JbWFnZShlbCwgYXZhaWxhYmxlVmlkZW9zKTtcblx0XHR9XG5cdH0pO1xuXG5cblx0Ly8gc3R1ZGVudHNfZGlzcGxheSBpcyB0aGUgc2luZ2xlIHZpZXcgb2JqZWN0IG1lYW50IHRvIHJlbmRlciBpbmZvIGZvciBvbmUgc3R1ZGVudFxuXHR2YXIgc3R1ZGVudHNfZGlzcGxheSA9IG5ldyBzaW5nbGVWaWV3KHttb2RlbDogc3R1ZGVudHNfZGF0YS5hdCgwKX0pO1xuXHQvLyAkKFwiI3BhZ2UtY29udGVudCAjd3JhcHBlclwiKS5odG1sKHN0dWRlbnRzX2Rpc3BsYXkucmVuZGVyKCkuJGVsKTtcblxuXHR2YXIgcXVlc3Rpb25zX2Rpc3BsYXkgPSAkKFwiI3F1ZXN0aW9uc1wiKS5odG1sKCk7XG5cdCQoXCIjcGFnZS1jb250ZW50ICNtYWluXCIpLmh0bWwocXVlc3Rpb25zX2Rpc3BsYXkpO1xuXG5cdHZhciBzdHVkZW50c19saXN0ID0gbmV3IGNvbGxlY3Rpb25WaWV3KHtjb2xsZWN0aW9uOiBzdHVkZW50c19kYXRhfSk7XG5cdCQoXCIjcGFnZS1jb250ZW50ICNuYW1lcy1uYXYgLm5hdi1jb250ZW50XCIpLmh0bWwoc3R1ZGVudHNfbGlzdC5yZW5kZXIoKS4kZWwpO1xuXG5cblxuXHQvLyBOb3cgeW91IGNhbiBiZSByZWFkeSwgZXZlcnl0aGluZydzIGxvYWRlZCBpbiBhbmQgZGlzcGxheWVkIVxuXHQkLmhvbGRSZWFkeShmYWxzZSk7XG5cdCQoXCIjcGFnZS1jb250ZW50XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJpbmxpbmVcIik7XG5cdCQoXCIjbG9hZGluZ1wiKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdCQoXCIjbG9hZGluZ1wiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcblx0fSwgNTAwKTtcblx0Ly8gQWZ0ZXIgdGhpcyBwb2ludCB5b3Ugc2hvdWxkIHRoZW4gYmluZCBldmVudHMsIGFuaW1hdGlvbnMsIGV0Yy5cblx0Ly8gKHdoaWNoIHdpbGwgaGFwcGVuIGluIHNjcmlwdC5qcyBpbiBkb2N1bWVudC5yZWFkeSlcbn0pO1xuXG5cbi8vIFNvbWUgbWFnaWMgZnVuY3Rpb25zXG5tYWdpYy52YWxpZGF0ZVdlYkFkZHJlc3MgPSBmdW5jdGlvbihlbCwgbmFtZXMpe1xuXHR2YXIgc3RhcnQgPSAvXmh0dHBzPzpcXC9cXC8vZ2k7XG5cblx0Xy5lYWNoKG5hbWVzLCBmdW5jdGlvbihuYW1lLCBpKSB7XG5cdFx0aWYgKGVsLmdldChuYW1lKSAhPT0gXCJcIiAmJiB0eXBlb2YgZWwuZ2V0KG5hbWUpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0Ly8gQWRkIGh0dHA6Ly8gcHJlZml4IGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGl0LFxuXHRcdFx0Ly8gcmVxdWlyZWQgdG8gbWFrZSBzdXJlIGxpbmtzIGFyZSBhYnNvbHV0ZVxuXHRcdFx0aWYgKGVsLmdldChuYW1lKS5zZWFyY2goc3RhcnQpID09IC0xKXtcblx0XHRcdFx0dmFyIG9sZCA9IGVsLmdldChuYW1lKTtcblx0XHRcdFx0ZWwuc2V0KG5hbWUsIFwiaHR0cDovL1wiICsgb2xkKTtcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdC8vIFVzZXIgZGlkIG5vdCBwcm92aWRlIGxpbmsgdG8gd2Vic2l0ZVxuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy50eXBvZ3JhcGh5ID0gZnVuY3Rpb24oZWwsIGZpZWxkcyl7XG5cdF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkLCBpKXtcblx0XHRpZiAoZWwuZ2V0KGZpZWxkKSl7XG5cdFx0XHRlbC5zZXQoZmllbGQsIHNtYXJrLnR5cG9ncmFwaGljQ2hhbmdlcyhlbC5nZXQoZmllbGQpKS50cmltKCkpO1xuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy5nZXRWaWRlb0ltYWdlID0gZnVuY3Rpb24oZWwsIGZpZWxkcyl7XG5cdF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkLCBpKXtcblx0XHRpZihlbC5nZXQoZmllbGQpICE9PSBcIlwiKXtcblx0XHRcdHZhciB2aWRJRDtcblx0XHRcdGlmKHNtYXJrLnR5cGVJcyhlbC5nZXQoZmllbGQpKSA9PSBcInlvdXR1YmVcIil7XG5cdFx0XHRcdHZpZElEID0gZWwuZ2V0KGZpZWxkKS5yZXBsYWNlKHNtYXJrLnlvdXR1YmVSRSwgXCIkMVwiKTtcblx0XHRcdFx0dmFyIGltYWdlTGluayA9IFwiaHR0cDovL2kzLnl0aW1nLmNvbS92aS9cIiArIHZpZElEICsgXCIvc2RkZWZhdWx0LmpwZ1wiO1xuXHRcdFx0XHRlbC5zZXQoZmllbGQgKyBcIl9pbWFnZVwiLCBpbWFnZUxpbmspO1xuXG5cdFx0XHR9ZWxzZSBpZihzbWFyay50eXBlSXMoZWwuZ2V0KGZpZWxkKSkgPT0gXCJ2aW1lb1wiKXtcblx0XHRcdFx0dmlkSUQgPSBlbC5nZXQoZmllbGQpLnJlcGxhY2Uoc21hcmsudmltZW9SRSwgXCIkMVwiKTtcblx0XHRcdFx0bWFnaWMudmltZW9Mb2FkaW5nVGh1bWIodmlkSUQsIGZ1bmN0aW9uKGltYWdlTGluayl7XG5cdFx0XHRcdFx0ZWwuc2V0KGZpZWxkICsgXCJfaW1hZ2VcIiwgaW1hZ2VMaW5rKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Y29uc29sZS5sb2coZWwuZ2V0KFwibmFtZVwiKSwgZWwuZ2V0KGZpZWxkKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07XG5cbm1hZ2ljLnZpbWVvTG9hZGluZ1RodW1iID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKXtcbiAgICB2YXIgdXJsID0gXCJodHRwczovL3ZpbWVvLmNvbS9hcGkvb2VtYmVkLmpzb24/dXJsPWh0dHBzJTNBLy92aW1lby5jb20vXCIgKyBpZDtcbiAgICAkLmFqYXgoe1xuICAgIFx0dXJsOiB1cmwsXG4gICAgXHRkYXRhVHlwZTogXCJqc29uXCJcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEpe1xuICAgIFx0dmFyIHJldHVybkltYWdlID0gZGF0YS50aHVtYm5haWxfdXJsO1xuICAgIFx0cmV0dXJuSW1hZ2UgPSByZXR1cm5JbWFnZS5yZXBsYWNlKC8oLio/XylcXGQrPyhcXC5qcGcpLywgXCIkMTY0MCQyXCIpO1xuICAgIFx0Y2FsbGJhY2socmV0dXJuSW1hZ2UpO1xuICAgIH0pO1xufTtcblxuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIEluaXRpYWxpemF0aW9uIGZvciBtb2RlbCAocHJvYmFibHkgd2lsbCBub3QgbmVlZCBjaGFuZ2luZyBldmVyKVxudmFyIG1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6e1xuXHRcdGVtYWlsOiBcInBsYWNlaG9sZGVyQGdlbmVyaWMuY29tXCIsXG5cdFx0bmFtZTogXCJEYXZpZCBCb3dpZVwiLFxuXHRcdHdlYnNpdGU6IFwid3d3Lmdvb2dsZS5jb21cIlxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RlbDsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuXHRpbnRlcnBvbGF0ZTogL1xcKDooLis/KTpcXCkvZyxcblx0ZXZhbHVhdGU6IC9cXCk6KC4rPyk6XFwoL2dcbn07XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgb25seSByZW5kZXIgb25jZSBpbnN0YW5jZSBvZiBhIG1vZGVsXG4vLyBpZS4gZm9yIGRpc3BsYXlpbmcgYSBzaW5nbGUgc3R1ZGVudCdzIGluZm9cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcImFydGljbGVcIixcblx0Y2xhc3NOYW1lOiBcInN0dWRlbnRXcmFwcGVyXCIsXG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiN3cmFwcGVyXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzaW5nbGVUZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC50b0pTT04oKSk7XG5cdFx0dGhpcy4kZWwuaHRtbChzaW5nbGVUZW1wbGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pOyIsIi8qIEBsaWNlbnNlIHNtYXJrLmpzIHdyaXR0ZW4gYnkgS2VubmV0aCBMaW0gPGxpbXp5Lmtlbm5ldGhAZ21haWwuY29tPiAoaHR0cDovL2Rlc2lnbmVya2VuLmJlKVxuICAgTGljZW5zZSB1bmRlciB0aGUgQlNEIDItQ2xhdXNlIExpY2Vuc2UgKi9cbihmdW5jdGlvbihlKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1lKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZSl9ZWxzZXt2YXIgcjtpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7cj13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7cj1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe3I9c2VsZn1lbHNle3I9dGhpc31yLnNtYXJrPWUoKX19KShmdW5jdGlvbigpe3ZhciBlLHIsYTtyZXR1cm4gZnVuY3Rpb24gdChlLHIsYSl7ZnVuY3Rpb24gaShzLHApe2lmKCFyW3NdKXtpZighZVtzXSl7dmFyIG89dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighcCYmbylyZXR1cm4gbyhzLCEwKTtpZihsKXJldHVybiBsKHMsITApO3ZhciBuPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrcytcIidcIik7dGhyb3cgbi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLG59dmFyIGg9cltzXT17ZXhwb3J0czp7fX07ZVtzXVswXS5jYWxsKGguZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgYT1lW3NdWzFdW3JdO3JldHVybiBpKGE/YTpyKX0saCxoLmV4cG9ydHMsdCxlLHIsYSl9cmV0dXJuIHJbc10uZXhwb3J0c312YXIgbD10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgcz0wO3M8YS5sZW5ndGg7cysrKWkoYVtzXSk7cmV0dXJuIGl9KHsxOltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9ZShcIi4vcmVnZXguanNcIik7dC50eXBlSXM9ZShcIi4vdHlwZUlzLmpzXCIpO3QudHlwb2dyYXBoaWNDaGFuZ2VzPWUoXCIuL3R5cG9ncmFwaHkuanNcIik7dC5wYXJzZVBhcmFncmFwaD1lKFwiLi9wYXJhZ3JhcGguanNcIik7dC5nZW5lcmF0ZT1mdW5jdGlvbihlLHIpe3ZhciBhPVwiXCI7dmFyIGk9e3R5cGU6XCJhdXRvXCIsdHlwb2dyYXBoeTp0cnVlfTtmb3IodmFyIGwgaW4gcil7Zm9yKHZhciBzIGluIGkpe2lmKGw9PXMpe2kuaj1yLml9fX12YXIgcD1pLnR5cGU7dmFyIG89aS50eXBvZ3JhcGh5O2lmKHA9PVwiYXV0b1wiKXtpZih0aGlzLnR5cGVJcyhlKT09XCJ5b3V0dWJlXCIpe3A9XCJ5b3V0dWJlXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJ2aW1lb1wiKXtwPVwidmltZW9cIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cImltYWdlXCIpe3A9XCJpbWFnZVwifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwibGlua1wiKXtwPVwibGlua1wifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwicGFyYWdyYXBoXCIpe3A9XCJwYXJhZ3JhcGhcIn19ZWxzZXtwPWkudHlwZX1hPW4oZSxwKTtyZXR1cm57aHRtbDphLHR5cGU6cH07ZnVuY3Rpb24gbihlLHIpe3ZhciBhO3ZhciBpPXQ7c3dpdGNoKHIpe2Nhc2VcInlvdXR1YmVcIjplPWUucmVwbGFjZShpLnlvdXR1YmVSRSxcIiQxXCIpO2E9JzxpZnJhbWUgY2xhc3M9XCJzbWFyayB5b3V0dWJlXCIgc3JjPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJytlKydcIiBmcmFtZWJvcmRlcj1cIjBcIiB3aWR0aD1cIjg1M1wiIGhlaWdodD1cIjQ4MFwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT4nO2JyZWFrO2Nhc2VcInZpbWVvXCI6ZT1lLnJlcGxhY2UoaS52aW1lb1JFLFwiJDFcIik7YT0nPGlmcmFtZSBjbGFzcz1cInNtYXJrIHZpbWVvXCIgc3JjPVwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLycrZSsnXCIgZnJhbWVib3JkZXI9XCIwXCIgd2lkdGg9XCI4NTNcIiBoZWlnaHQ9XCI0ODBcIiB3ZWJraXRhbGxvd2Z1bGxzY3JlZW4gbW96YWxsb3dmdWxsc2NyZWVuIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT4nO2JyZWFrO2Nhc2VcImltYWdlXCI6dmFyIGw9ZS5yZXBsYWNlKGkuaW1hZ2VSRSxcIiQxXCIpO3ZhciBzPWUucmVwbGFjZShpLmltYWdlUkUsXCIkMlwiKTtpZihvKXtzPWkudHlwb2dyYXBoaWNDaGFuZ2VzKHMpfWE9JzxpbWcgY2xhc3M9XCJzbWFyayBpbWFnZVwiIHRpdGxlPVwiJytzKydcIiBzcmM9XCInK2wrJ1wiPic7aWYoaS5pbWFnZUxpbmtSRS50ZXN0KGUpKXt2YXIgcD1pLmltYWdlTGlua1JFLmV4ZWMoZSlbMF07cD1wLnN1YnN0cmluZygxLHAubGVuZ3RoLTEpO2E9JzxhIGhyZWY9XCInK3ArJ1wiIHRhcmdldD1fYmxhbms+JythK1wiPC9hPlwifWJyZWFrO2Nhc2VcImxpbmtcIjplPWUubWF0Y2goaS5odG1sUkUpWzBdO2E9JzxpZnJhbWUgY2xhc3M9XCJzbWFyayB3ZWJzaXRlXCIgc3JjPVwiJytlKydcIiB3aWR0aD1cIjg1M1wiIGhlaWdodD1cIjQ4MFwiIGZyYW1lYm9yZGVyPVwiMFwiPjwvaWZyYW1lPic7YnJlYWs7Y2FzZVwicGFyYWdyYXBoXCI6ZT1pLnBhcnNlUGFyYWdyYXBoKG8sZSk7YT0nPHAgY2xhc3M9XCJzbWFyayBwYXJhZ3JhcGhcIj4nK2UrXCI8L3A+XCI7YnJlYWs7ZGVmYXVsdDphPVwiXCJ9cmV0dXJuIGF9fTtyLmV4cG9ydHM9dH0se1wiLi9wYXJhZ3JhcGguanNcIjoyLFwiLi9yZWdleC5qc1wiOjMsXCIuL3R5cGVJcy5qc1wiOjQsXCIuL3R5cG9ncmFwaHkuanNcIjo1fV0sMjpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PWUoXCIuL3JlZ2V4LmpzXCIpO3IuZXhwb3J0cz1mdW5jdGlvbihlLHIpe2lmKGUpe3I9dGhpcy50eXBvZ3JhcGhpY0NoYW5nZXMocil9dmFyIGE9XCJcIjtyPW4ocik7dmFyIGk9ci5tYXRjaCh0Lm9sUkUpO2lmKGkhPT1udWxsKXtmb3IodmFyIGw9MDtsPGkubGVuZ3RoO2wrKyl7dmFyIHM9aVtsXS5tYXRjaCh0Lm9sbGlSRSk7YT1cIjxvbD5cIjtmb3IodmFyIHA9MDtwPHMubGVuZ3RoO3ArKyl7YSs9XCI8bGk+XCIrc1twXS5yZXBsYWNlKHQub2xsaVJFLFwiJDFcIikrXCI8L2xpPlwifWErPVwiPC9vbD5cIjtyPXIucmVwbGFjZShpW2xdLGEpfX12YXIgbz1yLm1hdGNoKHQudWxSRSk7aWYobyE9PW51bGwpe2Zvcih2YXIgbD0wO2w8by5sZW5ndGg7bCsrKXt2YXIgcz1vW2xdLm1hdGNoKHQudWxsaVJFKTthPVwiPHVsPlwiO2Zvcih2YXIgcD0wO3A8cy5sZW5ndGg7cCsrKXthKz1cIjxsaT5cIitzW3BdLnJlcGxhY2UodC51bGxpUkUsXCIkMVwiKStcIjwvbGk+XCJ9YSs9XCI8L3VsPlwiO3I9ci5yZXBsYWNlKG9bbF0sYSl9fWlmKHQuYnFSRS50ZXN0KHIpKXtpZihyLnJlcGxhY2UodC5icVJFLFwiJDJcIik9PT1cIlwiKXtyPXIucmVwbGFjZSh0LmJxUkUsXCI8YmxvY2txdW90ZT48cD4kMTwvcD48L2Jsb2NrcXVvdGU+XCIpfWVsc2V7cj1yLnJlcGxhY2UodC5icVJFLFwiPGJsb2NrcXVvdGU+PHA+JDE8L3A+PGZvb3Rlcj4kMjwvZm9vdGVyPjwvYmxvY2txdW90ZT5cIil9fXI9ci5yZXBsYWNlKHQuaDZSRSxcIjxoNj4kMTwvaDY+XCIpO3I9ci5yZXBsYWNlKHQuaDVSRSxcIjxoNT4kMTwvaDU+XCIpO3I9ci5yZXBsYWNlKHQuaDRSRSxcIjxoND4kMTwvaDQ+XCIpO3I9ci5yZXBsYWNlKHQuaDNSRSxcIjxoMz4kMTwvaDM+XCIpO3I9ci5yZXBsYWNlKHQuaDJSRSxcIjxoMj4kMTwvaDI+XCIpO3I9ci5yZXBsYWNlKHQuaDFSRSxcIjxoMT4kMTwvaDE+XCIpO3I9ci5yZXBsYWNlKHQuaHJSRSxcIjxociAvPlwiKTtyZXR1cm4gcjtmdW5jdGlvbiBuKGUpe2lmKGUucmVwbGFjZSh0LmxpbmtSRSxcIiQxXCIpIT09XCJcIil7YT0nPGEgaHJlZj1cIiQyXCI+JDE8L2E+JztpZih0LmxpbmtCbGFua1JFLnRlc3QoZSkpe2E9JzxhIHRhcmdldD1fYmxhbmsgaHJlZj1cIiQyXCI+JDE8L2E+J319ZT1lLnJlcGxhY2UodC5saW5rUkUsYSk7aWYoZS5yZXBsYWNlKHQubGlua0JhcmVSRSxcIiQxXCIpIT09XCJcIil7YT0nPGEgaHJlZj1cIiQxXCI+JDE8L2E+JztpZih0LmxpbmtCbGFua1JFLnRlc3QoZSkpe2E9JzxhIHRhcmdldD1fYmxhbmsgaHJlZj1cIiQxXCI+JDE8L2E+J319ZT1lLnJlcGxhY2UodC5saW5rQmFyZVJFLGEpO3JldHVybiBlfX19LHtcIi4vcmVnZXguanNcIjozfV0sMzpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PXt5b3V0dWJlUkU6L14oPzpodHRwcz86XFwvXFwvKT8oPzp3d3dcXC4pP3lvdXR1KD86XFwuYmV8YmVcXC5jb20pXFwvKD86d2F0Y2h8ZW1iZWRcXC93YXRjaHxlbWJlZCk/W1xcP1xcL10/KD86dj18ZmVhdHVyZT1wbGF5ZXJfZW1iZWRkZWQmdj0pPyhbXFx3LV9dKykuKj8kLyx2aW1lb1JFOi9eKD86aHR0cHM/OlxcL1xcLyk/KD86d3d3XFwuKT92aW1lb1xcLmNvbVxcLyg/OmNoYW5uZWxzXFwvKT8oPzpcXHcrXFwvKT8oXFxkKykkLyxpbWFnZVJFOi9eKD8hICkoLis/XFwuKD86anBnfGpwZWd8Z2lmfHBuZ3xibXApKSg/OiAtdGl0bGU9XCIoLis/KVwiKT8oPzpcXCguKz9cXCkpPyQvLGltYWdlTGlua1JFOi8oPzpcXCgoLis/KVxcKSl7MX0vLGh0bWxSRTovXigoPyEuKihqcGd8anBlZ3xnaWZ8cG5nfGJtcCkpKGh0dHBzPzpcXC9cXC8pW1xcd1xcLV9dKyhcXC5bXFx3XFwtX10rKStbXFx3XFwtLixAP149JSY6XFwvflxcXFwrI10qKXwuK1xcLig/IWpwZ3xqcGVnfGdpZnxwbmd8Ym1wKWh0bWw/JC8sbGlua1JFOi9cXFsoPyEtKSguKj8pXFxdKD86fC1ibGFuaykgP1xcKCguKz8pXFwpL2csbGlua0JsYW5rUkU6L1xcWyg/IS0pKC4qPylcXF0tYmxhbmsgP1xcKCguKz8pXFwpL2csbGlua0JhcmVSRTovXFxbKD8hLSkoLio/KVxcXSg/Oi1ibGFuayk/L2csbGlua0JhcmVCbGFua1JFOi9cXFsoPyEtKSguKj8pXFxdKD86LWJsYW5rKS9nLG9sUkU6Lyg/OlxcZFxcLlxccyguKz8pIFxcfCA/KSsvZyxvbGxpUkU6L1xcZFxcLlxccyguKz8pIFxcfC9nLHVsUkU6Lyg/OlxcKlxccyguKz8pIFxcfCA/KSsvZyx1bGxpUkU6L1xcKlxccyguKz8pIFxcfC9nLGg2UkU6L1xccz8jezZ9ICguKz8pICN7Nn1cXHM/L2csaDVSRTovXFxzPyN7NX0gKC4rPykgI3s1fVxccz8vZyxoNFJFOi9cXHM/I3s0fSAoLis/KSAjezR9XFxzPy9nLGgzUkU6L1xccz8jezN9ICguKz8pICN7M31cXHM/L2csaDJSRTovXFxzPyN7Mn0gKC4rPykgI3syfVxccz8vZyxoMVJFOi9cXHM/IyAoLis/KSAjXFxzPy9nLGhyUkU6L1xccz8tLS1cXHM/L2csYnFSRTovYGBgKC4rPykoPzpcXFstc291cmNlOlxccz8oLispXFxdKT9gYGAvZyxkUXVvdFJFOi8oXnxcXHMoPzpbIFxcLiw7OlxcYlxcW10pPylcXFxcP1wiKC4rPylcXFxcP1wiKFsgXFwuLDs6XFxiXFxdXSk/L2csc1F1b3RSRTovKF58XFxzKD86WyBcXC4sOzpcXGJcXFtdKT8pXFxcXD8nKC4rPylcXFxcPycoWyBcXC4sOzpcXGJcXF1dKT8vZyx2b2xSRTovXFxidm9sXFwuXFxzXFxiL2dpLHBSRTovXFxicFxcLlxcc1xcYig/PVxcZCspL2csY1JFOi9cXGJjXFwuXFxzXFxiKD89XFxkKykvZyxmbFJFOi9cXGJmbFxcLlxcc1xcYig/PVxcZCspL2csaWVSRTovXFxiaVxcLmVcXC5cXHM/XFxiL2csZWdSRTovXFxiZVxcLmdcXC5cXHNcXGIvZyxhcG9zUkU6LyhbQS1aYS16XSspJyhbYS16XSspL2csZW5kYXNoUkU6LyguKz8pXFxzLVxccyguKz8pL2csZWxpcHNlUkU6L1xcLnszfS9nfTtyLmV4cG9ydHM9dH0se31dLDQ6W2Z1bmN0aW9uKGUscixhKXt2YXIgdD1lKFwiLi9yZWdleC5qc1wiKTt0eXBlSXM9ZnVuY3Rpb24oZSl7aWYodGhpcy55b3V0dWJlUkUudGVzdChlKSl7cmV0dXJuXCJ5b3V0dWJlXCJ9ZWxzZSBpZih0aGlzLnZpbWVvUkUudGVzdChlKSl7cmV0dXJuXCJ2aW1lb1wifWVsc2UgaWYodGhpcy5pbWFnZVJFLnRlc3QoZSkpe3JldHVyblwiaW1hZ2VcIn1lbHNlIGlmKHRoaXMuaHRtbFJFLnRlc3QoZSkpe3JldHVyblwibGlua1wifWVsc2V7cmV0dXJuXCJwYXJhZ3JhcGhcIn19O3IuZXhwb3J0cz10eXBlSXN9LHtcIi4vcmVnZXguanNcIjozfV0sNTpbZnVuY3Rpb24oZSxyLGEpe3IuZXhwb3J0cz1mdW5jdGlvbihlKXtlPWUucmVwbGFjZSh0aGlzLmRRdW90UkUsXCIkMSYjODIyMDskMiYjODIyMTskM1wiKTtlPWUucmVwbGFjZSh0aGlzLnNRdW90UkUsXCIkMSYjODIxNjskMiYjODIxNzskM1wiKTtlPWUucmVwbGFjZSh0aGlzLnZvbFJFLFwiVm9sLlwiKTtlPWUucmVwbGFjZSh0aGlzLnBSRSxcInAuXCIpO2U9ZS5yZXBsYWNlKHRoaXMuY1JFLFwiPGk+Yy48L2k+XCIpO2U9ZS5yZXBsYWNlKHRoaXMuZmxSRSxcIjxpPmZsLjwvaT5cIik7ZT1lLnJlcGxhY2UodGhpcy5pZVJFLFwiPGk+aWU8L2k+IFwiKTtlPWUucmVwbGFjZSh0aGlzLmVnUkUsXCI8aT5lZzwvaT4gXCIpO2U9ZS5yZXBsYWNlKHRoaXMuYXBvc1JFLFwiJDEmIzgyMTc7JDJcIik7ZT1lLnJlcGxhY2UodGhpcy5lbmRhc2hSRSxcIiQxJiM4MjExOyQyXCIpO2U9ZS5yZXBsYWNlKHRoaXMuZWxpcHNlUkUsXCImIzgyMzA7XCIpO3JldHVybiBlfX0se31dfSx7fSxbMV0pKDEpfSk7XG4iXX0=
