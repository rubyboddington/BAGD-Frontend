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
window.smark = require("smark");
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
	console.log(students_data.at(0).toJSON());


	// students_display is the single view object meant to render info for one student
	window.students_display = new singleView({model: students_data.at(90)});
	// $("#page-content #wrapper").html(students_display.render().$el);

	var questions_display = $("#questions").html();
	$("#page-content #main .content").html(questions_display);

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
	id: "studentWrapper",

	template: _.template($("#singleStudent").html()),

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
(function(e){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=e()}else if(typeof define==="function"&&define.amd){define([],e)}else{var r;if(typeof window!=="undefined"){r=window}else if(typeof global!=="undefined"){r=global}else if(typeof self!=="undefined"){r=self}else{r=this}r.smark=e()}})(function(){var e,r,a;return function t(e,r,a){function i(s,p){if(!r[s]){if(!e[s]){var o=typeof require=="function"&&require;if(!p&&o)return o(s,!0);if(l)return l(s,!0);var n=new Error("Cannot find module '"+s+"'");throw n.code="MODULE_NOT_FOUND",n}var h=r[s]={exports:{}};e[s][0].call(h.exports,function(r){var a=e[s][1][r];return i(a?a:r)},h,h.exports,t,e,r,a)}return r[s].exports}var l=typeof require=="function"&&require;for(var s=0;s<a.length;s++)i(a[s]);return i}({1:[function(e,r,a){var t=e("./regex.js");t.typeIs=e("./typeIs.js");t.typographicChanges=e("./typography.js");t.parseParagraph=e("./paragraph.js");t.generate=function(e,r){var a="";var i={type:"auto",typography:true};for(var l in r){for(var s in i){if(l==s){i[s]=r[l]}}}var p=i.type;var o=i.typography;if(p=="auto"){if(this.typeIs(e)=="youtube"){p="youtube"}else if(this.typeIs(e)=="vimeo"){p="vimeo"}else if(this.typeIs(e)=="image"){p="image"}else if(this.typeIs(e)=="link"){p="link"}else if(this.typeIs(e)=="paragraph"){p="paragraph"}}else{p=i.type}a=n(e,p);return{html:a,type:p};function n(e,r){var a;var i=t;switch(r){case"youtube":e=e.replace(i.youtubeRE,"$1");a='<iframe class="smark youtube" src="https://www.youtube.com/embed/'+e+'" frameborder="0" width="853" height="480" allowfullscreen></iframe>';break;case"vimeo":e=e.replace(i.vimeoRE,"$1");a='<iframe class="smark vimeo" src="https://player.vimeo.com/video/'+e+'" frameborder="0" width="853" height="480" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';break;case"image":var l=e.replace(i.imageRE,"$1");var s=e.replace(i.imageRE,"$2");if(o){s=i.typographicChanges(s)}a='<img class="smark image" title="'+s+'" src="'+l+'">';if(i.imageLinkRE.test(e)){var p=i.imageLinkRE.exec(e)[0];p=p.substring(1,p.length-1);a='<a href="'+p+'" target=_blank>'+a+"</a>"}break;case"link":e=e.match(i.htmlRE)[0];a='<iframe class="smark website" src="'+e+'" width="853" height="480" frameborder="0"></iframe>';break;case"paragraph":e=i.parseParagraph(o,e);a='<p class="smark paragraph">'+e+"</p>";break;default:a=""}return a}};r.exports=t},{"./paragraph.js":2,"./regex.js":3,"./typeIs.js":4,"./typography.js":5}],2:[function(e,r,a){var t=e("./regex.js");r.exports=function(e,r){if(e){r=this.typographicChanges(r)}var a="";r=n(r);var i=r.match(t.olRE);if(i!==null){for(var l=0;l<i.length;l++){var s=i[l].match(t.olliRE);a="<ol>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.olliRE,"$1")+"</li>"}a+="</ol>";r=r.replace(i[l],a)}}var o=r.match(t.ulRE);if(o!==null){for(var l=0;l<o.length;l++){var s=o[l].match(t.ulliRE);a="<ul>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.ulliRE,"$1")+"</li>"}a+="</ul>";r=r.replace(o[l],a)}}if(t.bqRE.test(r)){if(r.replace(t.bqRE,"$2")===""){r=r.replace(t.bqRE,"<blockquote><p>$1</p></blockquote>")}else{r=r.replace(t.bqRE,"<blockquote><p>$1</p><footer>$2</footer></blockquote>")}}r=r.replace(t.h6RE,"<h6>$1</h6>");r=r.replace(t.h5RE,"<h5>$1</h5>");r=r.replace(t.h4RE,"<h4>$1</h4>");r=r.replace(t.h3RE,"<h3>$1</h3>");r=r.replace(t.h2RE,"<h2>$1</h2>");r=r.replace(t.h1RE,"<h1>$1</h1>");r=r.replace(t.hrRE,"<hr />");return r;function n(e){if(e.replace(t.linkRE,"$1")!==""){a='<a href="$2">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$2">$1</a>'}}e=e.replace(t.linkRE,a);if(e.replace(t.linkBareRE,"$1")!==""){a='<a href="$1">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$1">$1</a>'}}e=e.replace(t.linkBareRE,a);return e}}},{"./regex.js":3}],3:[function(e,r,a){var t={youtubeRE:/^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch|embed\/watch|embed)?[\?\/]?(?:v=|feature=player_embedded&v=)?([\w-_]+).*?$/,vimeoRE:/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/)?(?:\w+\/)?(\d+)$/,imageRE:/^(?! )(.+?\.(?:jpg|jpeg|gif|png|bmp))(?: -title="(.+?)")?(?:\(.+?\))?$/,imageLinkRE:/(?:\((.+?)\)){1}/,htmlRE:/^((?!.*(jpg|jpeg|gif|png|bmp))(https?:\/\/)[\w\-_]+(\.[\w\-_]+)+[\w\-.,@?^=%&:\/~\\+#]*)|.+\.(?!jpg|jpeg|gif|png|bmp)html?$/,linkRE:/\[(?!-)(.*?)\](?:|-blank) ?\((.+?)\)/g,linkBlankRE:/\[(?!-)(.*?)\]-blank ?\((.+?)\)/g,linkBareRE:/\[(?!-)(.*?)\](?:-blank)?/g,linkBareBlankRE:/\[(?!-)(.*?)\](?:-blank)/g,olRE:/(?:\d\.\s(.+?) \| ?)+/g,olliRE:/\d\.\s(.+?) \|/g,ulRE:/(?:\*\s(.+?) \| ?)+/g,ulliRE:/\*\s(.+?) \|/g,h6RE:/\s?#{6} (.+?) #{6}\s?/g,h5RE:/\s?#{5} (.+?) #{5}\s?/g,h4RE:/\s?#{4} (.+?) #{4}\s?/g,h3RE:/\s?#{3} (.+?) #{3}\s?/g,h2RE:/\s?#{2} (.+?) #{2}\s?/g,h1RE:/\s?# (.+?) #\s?/g,hrRE:/\s?---\s?/g,bqRE:/```(.+?)(?:\[-source:\s?(.+)\])?```/g,dQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?"(.+?)\\?"([ \.,;:\b\]])?/g,sQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?'(.+?)\\?'([ \.,;:\b\]])?/g,volRE:/\bvol\.\s\b/gi,pRE:/\bp\.\s\b(?=\d+)/g,cRE:/\bc\.\s\b(?=\d+)/g,flRE:/\bfl\.\s\b(?=\d+)/g,ieRE:/\bi\.e\.\s?\b/g,egRE:/\be\.g\.\s\b/g,aposRE:/([A-Za-z]+)'([a-z]+)/g,endashRE:/(.+?)\s-\s(.+?)/g,elipseRE:/\.{3}/g};r.exports=t},{}],4:[function(e,r,a){var t=e("./regex.js");typeIs=function(e){if(this.youtubeRE.test(e)){return"youtube"}else if(this.vimeoRE.test(e)){return"vimeo"}else if(this.imageRE.test(e)){return"image"}else if(this.htmlRE.test(e)){return"link"}else{return"paragraph"}};r.exports=typeIs},{"./regex.js":3}],5:[function(e,r,a){r.exports=function(e){e=e.replace(this.dQuotRE,"$1&#8220;$2&#8221;$3");e=e.replace(this.sQuotRE,"$1&#8216;$2&#8217;$3");e=e.replace(this.volRE,"Vol.");e=e.replace(this.pRE,"p.");e=e.replace(this.cRE,"<i>c.</i>");e=e.replace(this.flRE,"<i>fl.</i>");e=e.replace(this.ieRE,"<i>ie</i> ");e=e.replace(this.egRE,"<i>eg</i> ");e=e.replace(this.aposRE,"$1&#8217;$2");e=e.replace(this.endashRE,"$1&#8211;$2");e=e.replace(this.elipseRE,"&#8230;");return e}},{}]},{},[1])(1)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY29sbGVjdGlvblZpZXcuanMiLCJqYXZhc2NyaXB0cy9jdXN0b20uanMiLCJqYXZhc2NyaXB0cy9tb2RlbHMuanMiLCJqYXZhc2NyaXB0cy9zaW5nbGVWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3NtYXJrL3NtYXJrLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgbW9kZWwgPSByZXF1aXJlKFwiLi9tb2RlbHMuanNcIik7XG5cbi8vIFRoZSBjb2xsZWN0aW9ucyBvZiBkYXRhIHRoYXQgd2UgaW1wb3J0IGluIGZyb20gdGhlIHdvcmRwcmVzcyBzZXJ2ZXIuXG52YXIgY29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0bW9kZWw6IG1vZGVsLFxuXHQvLyB1cmw6IFwiaHR0cDovL2luZm8uY3NtZ3JhcGhpY2Rlc2lnbi5jb20vd3AtanNvbi93cC92Mi9zdHVkZW50X2luZm8/ZmlsdGVyW3Bvc3RzX3Blcl9wYWdlXT0tMVwiLFxuXHQvLyB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdC93b3JkcHJlc3Mvd3AtanNvbi93cC92Mi9zdHVkZW50X2luZm9cIixcblx0dXJsOiBcIi4vcmVzcG9uc2UuanNvblwiLFxuXG5cdGNvbXBhcmF0b3I6IFwibmFtZVwiXG59KTtcblxuc3R1ZGVudHNfZGF0YSA9IG5ldyBjb2xsZWN0aW9uKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1ZGVudHNfZGF0YTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IHJlbmRlcnMgYSBjb2xsZWN0aW9uIG9mIGRhdGFcbi8vIGllLiBhIGNvbGxlY3Rpb24gb2Ygc3R1ZGVudHMgaW5mbyBmb3IgbmF2aWdhdGlvbiBvciBzb21ldGhpbmcgZWxzZS5cblxuLy8gQ3JlYXRlIG9uZSBlbGVtZW50IGF0IGEgdGltZVxudmFyIGluZGl2aWR1YWwgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwibGlcIixcblxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSgkKFwiI25hbWUtbGlzdC1pdGVtXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBtb2RlbFRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsLnRvSlNPTigpKTtcblx0XHR0aGlzLiRlbC5odG1sKG1vZGVsVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxuLy8gUGxhY2luZyB0aGUgZWxlbWVudHMgY3JlYXRlZCBhYm92ZSBpbnRvIHRoZSBjb2xsZWN0aW9uIHZpZXcgcmVuZGVyZXIuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJkaXZcIixcblx0aWQ6IFwibmFtZS1saXN0XCIsXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciB3aG9sZUxpc3QgPSBcIlwiO1xuXHRcdHZhciBncm91cGVkTGlzdCA9IHRoaXMuY29sbGVjdGlvbi5ncm91cEJ5KGZ1bmN0aW9uKGVsKXtcblx0XHRcdHZhciBmaXJzdENoYXIgPSBlbC5nZXQoXCJuYW1lXCIpLmNoYXJBdCgwKTtcblx0XHRcdHJldHVybiBmaXJzdENoYXI7XG5cdFx0fSwgdGhpcyk7XG5cblx0XHRfLmVhY2goZ3JvdXBlZExpc3QsIGZ1bmN0aW9uKGVsLCBrZXkpe1xuXHRcdFx0dmFyIGhlYWRlciA9IFwiPHVsPjxsaT48aDY+XCIgKyBrZXkgKyBcIjwvaDY+PC9saT5cIjtcblxuXHRcdFx0d2hvbGVMaXN0ICs9IGhlYWRlcjtcblxuXHRcdFx0Xy5lYWNoKGVsLCBmdW5jdGlvbihlbCwgaSl7XG5cdFx0XHRcdHdob2xlTGlzdCArPSB0aGlzLmFkZE1vZGVsKGVsKTtcblx0XHRcdH0sIHRoaXMpO1xuXG5cdFx0XHR3aG9sZUxpc3QgKz0gXCI8L3VsPlwiO1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCh3aG9sZUxpc3QpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YWRkTW9kZWw6IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgbW9kZWxWaWV3ID0gbmV3IGluZGl2aWR1YWwoe21vZGVsOiBtb2RlbH0pO1xuXHRcdHJldHVybiBtb2RlbFZpZXcucmVuZGVyKCkuJGVsLmh0bWwoKTtcblx0fVxufSk7IiwiLy8gQnVuY2ggb2YgaW1wb3J0c1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xud2luZG93LnNtYXJrID0gcmVxdWlyZShcInNtYXJrXCIpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgc3R1ZGVudHNfZGF0YSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb24uanNcIik7XG52YXIgc2luZ2xlVmlldyA9IHJlcXVpcmUoXCIuL3NpbmdsZVZpZXcuanNcIik7XG52YXIgY29sbGVjdGlvblZpZXcgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uVmlldy5qc1wiKTtcbnZhciBtYWdpYyA9IG1hZ2ljIHx8IHt9O1xuXG4vLyBIb2xkIHRoYXQgcmVhZHksIG1hZ2ljIG5lZWRzIHRvIGhhcHBlbiBmaXJzdCFcbiQuaG9sZFJlYWR5KHRydWUpO1xuJChcIiNwYWdlLWNvbnRlbnRcIikuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcblxuLy8gQW55dGhpbmcgdGhhdCBuZWVkcyBkb2luZyBiZWZvcmUgZGF0YSBpcyBsb2FkZWQgc2hvdWxkIGdvIGhlcmUuXG52YXIgcmVjZWl2ZWREYXRhID0gbmV3IEV2ZW50KFwicmVjZWl2ZWREYXRhXCIpO1xuXG4vLyBGZXRjaCBkYXRhIGZyb20gdGhlIGJhY2tlbmQuXG5zdHVkZW50c19kYXRhLmZldGNoKHtcblx0Ly8gRGlzcGF0Y2ggdGhlIHJlY2VpdmVkIGRhdGEgZXZlbnQgYWZ0ZXIgdGhlIGRhdGEgaXMgc3VjY2VzZnVsbHkgbG9hZGVkLlxuXHRzdWNjZXNzOiBmdW5jdGlvbigpe1xuXHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KHJlY2VpdmVkRGF0YSk7XG5cdH1cbn0pO1xuXG5cbi8vIFRoZSBwYWdlIGxvZ2ljIHNob3VsZCBnbyBpbiB0aGlzIGNhbGxiYWNrIGZ1bmN0aW9uIChyZW5kZXJpbmcgZXRjLilcbi8vIFRyZWF0IHRoaXMgYXMgdGhlIHJlZ3VsYXIgZG9jdW1lbnQucmVhZHkgdGhpbmcgdW5sZXNzIHRoZXJlIGFyZSBzdHVmZiB0byBiZVxuLy8gZG9uZSBiZWZvcmUgbG9hZGluZyBpbiB0aGUgZGF0YS5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVjZWl2ZWREYXRhXCIsIGZ1bmN0aW9uKCl7XG5cdC8vIHN0dWRlbnRzX2RhdGEgaXMgdGhlIGNvbGxlY3Rpb24gb2JqZWN0XG5cdGNvbnNvbGUubG9nKHN0dWRlbnRzX2RhdGEubW9kZWxzKTtcblx0Ly8gTWFrZSB0aGVtIGRhdGEgcHJldHR5IVxuXHRzdHVkZW50c19kYXRhLmVhY2goZnVuY3Rpb24oZWwsIGkpe1xuXHRcdC8vIFZhbGlkYXRlIGFuZCBmaXggd2Vic2l0ZSBhZGRyZXNzZXNcblx0XHRtYWdpYy52YWxpZGF0ZVdlYkFkZHJlc3MoZWwsIFtcblx0XHRcdFwibGlua190b19wZXJzb25hbF93ZWJzaXRlXCIsXG5cdFx0XHRcInlvdXR1YmVcIixcblx0XHRcdFwidmltZW9cIixcblx0XHRcdFwiaGVyb192aWRlb1wiLFxuXHRcdFx0XCJ2aWRlb18xXCIsXG5cdFx0XHRcInZpZGVvXzJcIlxuXHRcdF0pO1xuXG5cdFx0Ly8gQ29udmVydCBzdHVkZW50IElEIHRvIHVwcGVyIGNhc2Vcblx0XHRlbC5zZXQoXCJzdHVkZW50X251bWJlclwiLCBlbC5nZXQoXCJzdHVkZW50X251bWJlclwiKS50b1VwcGVyQ2FzZSgpKTtcblxuXHRcdC8vIFRyaW0gdGFncyB0byA3IGl0ZW1zIG9ubHlcblx0XHRpZiAoZWwuZ2V0KFwidGFnc1wiKSAhPT0gbnVsbCl7XG5cdFx0XHRpZiAoZWwuZ2V0KFwidGFnc1wiKS5sZW5ndGggPiA3KXtcblx0XHRcdFx0ZWwuZ2V0KFwidGFnc1wiKS5zcGxpY2UoNyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bWFnaWMudHlwb2dyYXBoeShlbCwgW1wiYmlvXCIsIFwiaGVyb19jYXB0aW9uXCIsIFwiY2FwdGlvbl8xXCIsIFwiY2FwdGlvbl8yXCJdKTtcblxuXHRcdHZhciBhdmFpbGFibGVWaWRlb3MgPSBbXTtcblx0XHRpZiAoZWwuZ2V0KFwiaGVyb19pbWFnZV92aWRlb1wiKSA9PSBcIlZpZGVvXCIpe1xuXHRcdFx0YXZhaWxhYmxlVmlkZW9zLnB1c2goXCJoZXJvX3ZpZGVvXCIpO1xuXHRcdH1cblx0XHRpZiAoZWwuZ2V0KFwiaW1hZ2VfdmlkZW9fMVwiKSA9PSBcIlZpZGVvXCIpe1xuXHRcdFx0YXZhaWxhYmxlVmlkZW9zLnB1c2goXCJ2aWRlb18xXCIpO1xuXHRcdH1cblx0XHRpZiAoZWwuZ2V0KFwiaW1hZ2VfdmlkZW9fMlwiKSA9PSBcIlZpZGVvXCIpe1xuXHRcdFx0YXZhaWxhYmxlVmlkZW9zLnB1c2goXCJ2aWRlb18yXCIpO1xuXHRcdH1cblx0XHRpZighKF8uaXNFbXB0eShhdmFpbGFibGVWaWRlb3MpKSl7XG5cdFx0XHRtYWdpYy5nZXRWaWRlb0ltYWdlKGVsLCBhdmFpbGFibGVWaWRlb3MpO1xuXHRcdH1cblx0fSk7XG5cdGNvbnNvbGUubG9nKHN0dWRlbnRzX2RhdGEuYXQoMCkudG9KU09OKCkpO1xuXG5cblx0Ly8gc3R1ZGVudHNfZGlzcGxheSBpcyB0aGUgc2luZ2xlIHZpZXcgb2JqZWN0IG1lYW50IHRvIHJlbmRlciBpbmZvIGZvciBvbmUgc3R1ZGVudFxuXHR3aW5kb3cuc3R1ZGVudHNfZGlzcGxheSA9IG5ldyBzaW5nbGVWaWV3KHttb2RlbDogc3R1ZGVudHNfZGF0YS5hdCg5MCl9KTtcblx0Ly8gJChcIiNwYWdlLWNvbnRlbnQgI3dyYXBwZXJcIikuaHRtbChzdHVkZW50c19kaXNwbGF5LnJlbmRlcigpLiRlbCk7XG5cblx0dmFyIHF1ZXN0aW9uc19kaXNwbGF5ID0gJChcIiNxdWVzdGlvbnNcIikuaHRtbCgpO1xuXHQkKFwiI3BhZ2UtY29udGVudCAjbWFpbiAuY29udGVudFwiKS5odG1sKHF1ZXN0aW9uc19kaXNwbGF5KTtcblxuXHR2YXIgc3R1ZGVudHNfbGlzdCA9IG5ldyBjb2xsZWN0aW9uVmlldyh7Y29sbGVjdGlvbjogc3R1ZGVudHNfZGF0YX0pO1xuXHQkKFwiI3BhZ2UtY29udGVudCAjbmFtZXMtbmF2IC5uYXYtY29udGVudFwiKS5odG1sKHN0dWRlbnRzX2xpc3QucmVuZGVyKCkuJGVsKTtcblxuXG5cdC8vIE5vdyB5b3UgY2FuIGJlIHJlYWR5LCBldmVyeXRoaW5nJ3MgbG9hZGVkIGluIGFuZCBkaXNwbGF5ZWQhXG5cdCQuaG9sZFJlYWR5KGZhbHNlKTtcblx0JChcIiNwYWdlLWNvbnRlbnRcIikuY3NzKFwiZGlzcGxheVwiLCBcImlubGluZVwiKTtcblx0JChcIiNsb2FkaW5nXCIpLmNzcyhcIm9wYWNpdHlcIiwgXCIwXCIpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cdFx0JChcIiNsb2FkaW5nXCIpLmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xuXHR9LCA1MDApO1xuXHQvLyBBZnRlciB0aGlzIHBvaW50IHlvdSBzaG91bGQgdGhlbiBiaW5kIGV2ZW50cywgYW5pbWF0aW9ucywgZXRjLlxuXHQvLyAod2hpY2ggd2lsbCBoYXBwZW4gaW4gc2NyaXB0LmpzIGluIGRvY3VtZW50LnJlYWR5KVxufSk7XG5cblxuLy8gU29tZSBtYWdpYyBmdW5jdGlvbnNcbm1hZ2ljLnZhbGlkYXRlV2ViQWRkcmVzcyA9IGZ1bmN0aW9uKGVsLCBuYW1lcyl7XG5cdHZhciBzdGFydCA9IC9eaHR0cHM/OlxcL1xcLy9naTtcblxuXHRfLmVhY2gobmFtZXMsIGZ1bmN0aW9uKG5hbWUsIGkpIHtcblx0XHRpZiAoZWwuZ2V0KG5hbWUpICE9PSBcIlwiICYmIHR5cGVvZiBlbC5nZXQobmFtZSkgIT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHQvLyBBZGQgaHR0cDovLyBwcmVmaXggaWYgaXQgZG9lc24ndCBhbHJlYWR5IGhhdmUgaXQsXG5cdFx0XHQvLyByZXF1aXJlZCB0byBtYWtlIHN1cmUgbGlua3MgYXJlIGFic29sdXRlXG5cdFx0XHRpZiAoZWwuZ2V0KG5hbWUpLnNlYXJjaChzdGFydCkgPT0gLTEpe1xuXHRcdFx0XHR2YXIgb2xkID0gZWwuZ2V0KG5hbWUpO1xuXHRcdFx0XHRlbC5zZXQobmFtZSwgXCJodHRwOi8vXCIgKyBvbGQpO1xuXHRcdFx0fVxuXHRcdH1lbHNle1xuXHRcdFx0Ly8gVXNlciBkaWQgbm90IHByb3ZpZGUgbGluayB0byB3ZWJzaXRlXG5cdFx0fVxuXHR9KTtcbn07XG5cbm1hZ2ljLnR5cG9ncmFwaHkgPSBmdW5jdGlvbihlbCwgZmllbGRzKXtcblx0Xy5lYWNoKGZpZWxkcywgZnVuY3Rpb24oZmllbGQsIGkpe1xuXHRcdGlmIChlbC5nZXQoZmllbGQpKXtcblx0XHRcdGVsLnNldChmaWVsZCwgc21hcmsudHlwb2dyYXBoaWNDaGFuZ2VzKGVsLmdldChmaWVsZCkpLnRyaW0oKSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbm1hZ2ljLmdldFZpZGVvSW1hZ2UgPSBmdW5jdGlvbihlbCwgZmllbGRzKXtcblx0Xy5lYWNoKGZpZWxkcywgZnVuY3Rpb24oZmllbGQsIGkpe1xuXHRcdGlmKGVsLmdldChmaWVsZCkgIT09IFwiXCIpe1xuXHRcdFx0dmFyIHZpZElEO1xuXHRcdFx0aWYoc21hcmsudHlwZUlzKGVsLmdldChmaWVsZCkpID09IFwieW91dHViZVwiKXtcblx0XHRcdFx0dmlkSUQgPSBlbC5nZXQoZmllbGQpLnJlcGxhY2Uoc21hcmsueW91dHViZVJFLCBcIiQxXCIpO1xuXHRcdFx0XHR2YXIgaW1hZ2VMaW5rID0gXCJodHRwOi8vaTMueXRpbWcuY29tL3ZpL1wiICsgdmlkSUQgKyBcIi9zZGRlZmF1bHQuanBnXCI7XG5cdFx0XHRcdGVsLnNldChmaWVsZCArIFwiX2ltYWdlXCIsIGltYWdlTGluayk7XG5cblx0XHRcdH1lbHNlIGlmKHNtYXJrLnR5cGVJcyhlbC5nZXQoZmllbGQpKSA9PSBcInZpbWVvXCIpe1xuXHRcdFx0XHR2aWRJRCA9IGVsLmdldChmaWVsZCkucmVwbGFjZShzbWFyay52aW1lb1JFLCBcIiQxXCIpO1xuXHRcdFx0XHRtYWdpYy52aW1lb0xvYWRpbmdUaHVtYih2aWRJRCwgZnVuY3Rpb24oaW1hZ2VMaW5rKXtcblx0XHRcdFx0XHRlbC5zZXQoZmllbGQgKyBcIl9pbWFnZVwiLCBpbWFnZUxpbmspO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlbC5nZXQoXCJuYW1lXCIpLCBlbC5nZXQoZmllbGQpKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufTtcblxubWFnaWMudmltZW9Mb2FkaW5nVGh1bWIgPSBmdW5jdGlvbihpZCwgY2FsbGJhY2spe1xuICAgIHZhciB1cmwgPSBcImh0dHBzOi8vdmltZW8uY29tL2FwaS9vZW1iZWQuanNvbj91cmw9aHR0cHMlM0EvL3ZpbWVvLmNvbS9cIiArIGlkO1xuICAgICQuYWpheCh7XG4gICAgXHR1cmw6IHVybCxcbiAgICBcdGRhdGFUeXBlOiBcImpzb25cIlxuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSl7XG4gICAgXHR2YXIgcmV0dXJuSW1hZ2UgPSBkYXRhLnRodW1ibmFpbF91cmw7XG4gICAgXHRyZXR1cm5JbWFnZSA9IHJldHVybkltYWdlLnJlcGxhY2UoLyguKj9fKVxcZCs/KFxcLmpwZykvLCBcIiQxNjQwJDJcIik7XG4gICAgXHRjYWxsYmFjayhyZXR1cm5JbWFnZSk7XG4gICAgfSk7XG59O1xuXG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuLy8gSW5pdGlhbGl6YXRpb24gZm9yIG1vZGVsIChwcm9iYWJseSB3aWxsIG5vdCBuZWVkIGNoYW5naW5nIGV2ZXIpXG52YXIgbW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czp7XG5cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kZWw7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbl8udGVtcGxhdGVTZXR0aW5ncyA9IHtcblx0aW50ZXJwb2xhdGU6IC9cXCg6KC4rPyk6XFwpL2csXG5cdGV2YWx1YXRlOiAvXFwpOiguKz8pOlxcKC9nXG59O1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IG9ubHkgcmVuZGVyIG9uY2UgaW5zdGFuY2Ugb2YgYSBtb2RlbFxuLy8gaWUuIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIHN0dWRlbnQncyBpbmZvXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJhcnRpY2xlXCIsXG5cdGlkOiBcInN0dWRlbnRXcmFwcGVyXCIsXG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiNzaW5nbGVTdHVkZW50XCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzaW5nbGVUZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC50b0pTT04oKSk7XG5cdFx0dGhpcy4kZWwuaHRtbChzaW5nbGVUZW1wbGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pOyIsIi8qIEBsaWNlbnNlIHNtYXJrLmpzIHdyaXR0ZW4gYnkgS2VubmV0aCBMaW0gPGxpbXp5Lmtlbm5ldGhAZ21haWwuY29tPiAoaHR0cDovL2Rlc2lnbmVya2VuLmJlKVxuICAgTGljZW5zZSB1bmRlciB0aGUgQlNEIDItQ2xhdXNlIExpY2Vuc2UgKi9cbihmdW5jdGlvbihlKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1lKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZSl9ZWxzZXt2YXIgcjtpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7cj13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7cj1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe3I9c2VsZn1lbHNle3I9dGhpc31yLnNtYXJrPWUoKX19KShmdW5jdGlvbigpe3ZhciBlLHIsYTtyZXR1cm4gZnVuY3Rpb24gdChlLHIsYSl7ZnVuY3Rpb24gaShzLHApe2lmKCFyW3NdKXtpZighZVtzXSl7dmFyIG89dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighcCYmbylyZXR1cm4gbyhzLCEwKTtpZihsKXJldHVybiBsKHMsITApO3ZhciBuPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrcytcIidcIik7dGhyb3cgbi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLG59dmFyIGg9cltzXT17ZXhwb3J0czp7fX07ZVtzXVswXS5jYWxsKGguZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgYT1lW3NdWzFdW3JdO3JldHVybiBpKGE/YTpyKX0saCxoLmV4cG9ydHMsdCxlLHIsYSl9cmV0dXJuIHJbc10uZXhwb3J0c312YXIgbD10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgcz0wO3M8YS5sZW5ndGg7cysrKWkoYVtzXSk7cmV0dXJuIGl9KHsxOltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9ZShcIi4vcmVnZXguanNcIik7dC50eXBlSXM9ZShcIi4vdHlwZUlzLmpzXCIpO3QudHlwb2dyYXBoaWNDaGFuZ2VzPWUoXCIuL3R5cG9ncmFwaHkuanNcIik7dC5wYXJzZVBhcmFncmFwaD1lKFwiLi9wYXJhZ3JhcGguanNcIik7dC5nZW5lcmF0ZT1mdW5jdGlvbihlLHIpe3ZhciBhPVwiXCI7dmFyIGk9e3R5cGU6XCJhdXRvXCIsdHlwb2dyYXBoeTp0cnVlfTtmb3IodmFyIGwgaW4gcil7Zm9yKHZhciBzIGluIGkpe2lmKGw9PXMpe2lbc109cltsXX19fXZhciBwPWkudHlwZTt2YXIgbz1pLnR5cG9ncmFwaHk7aWYocD09XCJhdXRvXCIpe2lmKHRoaXMudHlwZUlzKGUpPT1cInlvdXR1YmVcIil7cD1cInlvdXR1YmVcIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cInZpbWVvXCIpe3A9XCJ2aW1lb1wifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwiaW1hZ2VcIil7cD1cImltYWdlXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJsaW5rXCIpe3A9XCJsaW5rXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJwYXJhZ3JhcGhcIil7cD1cInBhcmFncmFwaFwifX1lbHNle3A9aS50eXBlfWE9bihlLHApO3JldHVybntodG1sOmEsdHlwZTpwfTtmdW5jdGlvbiBuKGUscil7dmFyIGE7dmFyIGk9dDtzd2l0Y2gocil7Y2FzZVwieW91dHViZVwiOmU9ZS5yZXBsYWNlKGkueW91dHViZVJFLFwiJDFcIik7YT0nPGlmcmFtZSBjbGFzcz1cInNtYXJrIHlvdXR1YmVcIiBzcmM9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nK2UrJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIHdpZHRoPVwiODUzXCIgaGVpZ2h0PVwiNDgwXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7YnJlYWs7Y2FzZVwidmltZW9cIjplPWUucmVwbGFjZShpLnZpbWVvUkUsXCIkMVwiKTthPSc8aWZyYW1lIGNsYXNzPVwic21hcmsgdmltZW9cIiBzcmM9XCJodHRwczovL3BsYXllci52aW1lby5jb20vdmlkZW8vJytlKydcIiBmcmFtZWJvcmRlcj1cIjBcIiB3aWR0aD1cIjg1M1wiIGhlaWdodD1cIjQ4MFwiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7YnJlYWs7Y2FzZVwiaW1hZ2VcIjp2YXIgbD1lLnJlcGxhY2UoaS5pbWFnZVJFLFwiJDFcIik7dmFyIHM9ZS5yZXBsYWNlKGkuaW1hZ2VSRSxcIiQyXCIpO2lmKG8pe3M9aS50eXBvZ3JhcGhpY0NoYW5nZXMocyl9YT0nPGltZyBjbGFzcz1cInNtYXJrIGltYWdlXCIgdGl0bGU9XCInK3MrJ1wiIHNyYz1cIicrbCsnXCI+JztpZihpLmltYWdlTGlua1JFLnRlc3QoZSkpe3ZhciBwPWkuaW1hZ2VMaW5rUkUuZXhlYyhlKVswXTtwPXAuc3Vic3RyaW5nKDEscC5sZW5ndGgtMSk7YT0nPGEgaHJlZj1cIicrcCsnXCIgdGFyZ2V0PV9ibGFuaz4nK2ErXCI8L2E+XCJ9YnJlYWs7Y2FzZVwibGlua1wiOmU9ZS5tYXRjaChpLmh0bWxSRSlbMF07YT0nPGlmcmFtZSBjbGFzcz1cInNtYXJrIHdlYnNpdGVcIiBzcmM9XCInK2UrJ1wiIHdpZHRoPVwiODUzXCIgaGVpZ2h0PVwiNDgwXCIgZnJhbWVib3JkZXI9XCIwXCI+PC9pZnJhbWU+JzticmVhaztjYXNlXCJwYXJhZ3JhcGhcIjplPWkucGFyc2VQYXJhZ3JhcGgobyxlKTthPSc8cCBjbGFzcz1cInNtYXJrIHBhcmFncmFwaFwiPicrZStcIjwvcD5cIjticmVhaztkZWZhdWx0OmE9XCJcIn1yZXR1cm4gYX19O3IuZXhwb3J0cz10fSx7XCIuL3BhcmFncmFwaC5qc1wiOjIsXCIuL3JlZ2V4LmpzXCI6MyxcIi4vdHlwZUlzLmpzXCI6NCxcIi4vdHlwb2dyYXBoeS5qc1wiOjV9XSwyOltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9ZShcIi4vcmVnZXguanNcIik7ci5leHBvcnRzPWZ1bmN0aW9uKGUscil7aWYoZSl7cj10aGlzLnR5cG9ncmFwaGljQ2hhbmdlcyhyKX12YXIgYT1cIlwiO3I9bihyKTt2YXIgaT1yLm1hdGNoKHQub2xSRSk7aWYoaSE9PW51bGwpe2Zvcih2YXIgbD0wO2w8aS5sZW5ndGg7bCsrKXt2YXIgcz1pW2xdLm1hdGNoKHQub2xsaVJFKTthPVwiPG9sPlwiO2Zvcih2YXIgcD0wO3A8cy5sZW5ndGg7cCsrKXthKz1cIjxsaT5cIitzW3BdLnJlcGxhY2UodC5vbGxpUkUsXCIkMVwiKStcIjwvbGk+XCJ9YSs9XCI8L29sPlwiO3I9ci5yZXBsYWNlKGlbbF0sYSl9fXZhciBvPXIubWF0Y2godC51bFJFKTtpZihvIT09bnVsbCl7Zm9yKHZhciBsPTA7bDxvLmxlbmd0aDtsKyspe3ZhciBzPW9bbF0ubWF0Y2godC51bGxpUkUpO2E9XCI8dWw+XCI7Zm9yKHZhciBwPTA7cDxzLmxlbmd0aDtwKyspe2ErPVwiPGxpPlwiK3NbcF0ucmVwbGFjZSh0LnVsbGlSRSxcIiQxXCIpK1wiPC9saT5cIn1hKz1cIjwvdWw+XCI7cj1yLnJlcGxhY2Uob1tsXSxhKX19aWYodC5icVJFLnRlc3Qocikpe2lmKHIucmVwbGFjZSh0LmJxUkUsXCIkMlwiKT09PVwiXCIpe3I9ci5yZXBsYWNlKHQuYnFSRSxcIjxibG9ja3F1b3RlPjxwPiQxPC9wPjwvYmxvY2txdW90ZT5cIil9ZWxzZXtyPXIucmVwbGFjZSh0LmJxUkUsXCI8YmxvY2txdW90ZT48cD4kMTwvcD48Zm9vdGVyPiQyPC9mb290ZXI+PC9ibG9ja3F1b3RlPlwiKX19cj1yLnJlcGxhY2UodC5oNlJFLFwiPGg2PiQxPC9oNj5cIik7cj1yLnJlcGxhY2UodC5oNVJFLFwiPGg1PiQxPC9oNT5cIik7cj1yLnJlcGxhY2UodC5oNFJFLFwiPGg0PiQxPC9oND5cIik7cj1yLnJlcGxhY2UodC5oM1JFLFwiPGgzPiQxPC9oMz5cIik7cj1yLnJlcGxhY2UodC5oMlJFLFwiPGgyPiQxPC9oMj5cIik7cj1yLnJlcGxhY2UodC5oMVJFLFwiPGgxPiQxPC9oMT5cIik7cj1yLnJlcGxhY2UodC5oclJFLFwiPGhyIC8+XCIpO3JldHVybiByO2Z1bmN0aW9uIG4oZSl7aWYoZS5yZXBsYWNlKHQubGlua1JFLFwiJDFcIikhPT1cIlwiKXthPSc8YSBocmVmPVwiJDJcIj4kMTwvYT4nO2lmKHQubGlua0JsYW5rUkUudGVzdChlKSl7YT0nPGEgdGFyZ2V0PV9ibGFuayBocmVmPVwiJDJcIj4kMTwvYT4nfX1lPWUucmVwbGFjZSh0LmxpbmtSRSxhKTtpZihlLnJlcGxhY2UodC5saW5rQmFyZVJFLFwiJDFcIikhPT1cIlwiKXthPSc8YSBocmVmPVwiJDFcIj4kMTwvYT4nO2lmKHQubGlua0JsYW5rUkUudGVzdChlKSl7YT0nPGEgdGFyZ2V0PV9ibGFuayBocmVmPVwiJDFcIj4kMTwvYT4nfX1lPWUucmVwbGFjZSh0LmxpbmtCYXJlUkUsYSk7cmV0dXJuIGV9fX0se1wiLi9yZWdleC5qc1wiOjN9XSwzOltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9e3lvdXR1YmVSRTovXig/Omh0dHBzPzpcXC9cXC8pPyg/Ond3d1xcLik/eW91dHUoPzpcXC5iZXxiZVxcLmNvbSlcXC8oPzp3YXRjaHxlbWJlZFxcL3dhdGNofGVtYmVkKT9bXFw/XFwvXT8oPzp2PXxmZWF0dXJlPXBsYXllcl9lbWJlZGRlZCZ2PSk/KFtcXHctX10rKS4qPyQvLHZpbWVvUkU6L14oPzpodHRwcz86XFwvXFwvKT8oPzp3d3dcXC4pP3ZpbWVvXFwuY29tXFwvKD86Y2hhbm5lbHNcXC8pPyg/OlxcdytcXC8pPyhcXGQrKSQvLGltYWdlUkU6L14oPyEgKSguKz9cXC4oPzpqcGd8anBlZ3xnaWZ8cG5nfGJtcCkpKD86IC10aXRsZT1cIiguKz8pXCIpPyg/OlxcKC4rP1xcKSk/JC8saW1hZ2VMaW5rUkU6Lyg/OlxcKCguKz8pXFwpKXsxfS8saHRtbFJFOi9eKCg/IS4qKGpwZ3xqcGVnfGdpZnxwbmd8Ym1wKSkoaHR0cHM/OlxcL1xcLylbXFx3XFwtX10rKFxcLltcXHdcXC1fXSspK1tcXHdcXC0uLEA/Xj0lJjpcXC9+XFxcXCsjXSopfC4rXFwuKD8hanBnfGpwZWd8Z2lmfHBuZ3xibXApaHRtbD8kLyxsaW5rUkU6L1xcWyg/IS0pKC4qPylcXF0oPzp8LWJsYW5rKSA/XFwoKC4rPylcXCkvZyxsaW5rQmxhbmtSRTovXFxbKD8hLSkoLio/KVxcXS1ibGFuayA/XFwoKC4rPylcXCkvZyxsaW5rQmFyZVJFOi9cXFsoPyEtKSguKj8pXFxdKD86LWJsYW5rKT8vZyxsaW5rQmFyZUJsYW5rUkU6L1xcWyg/IS0pKC4qPylcXF0oPzotYmxhbmspL2csb2xSRTovKD86XFxkXFwuXFxzKC4rPykgXFx8ID8pKy9nLG9sbGlSRTovXFxkXFwuXFxzKC4rPykgXFx8L2csdWxSRTovKD86XFwqXFxzKC4rPykgXFx8ID8pKy9nLHVsbGlSRTovXFwqXFxzKC4rPykgXFx8L2csaDZSRTovXFxzPyN7Nn0gKC4rPykgI3s2fVxccz8vZyxoNVJFOi9cXHM/I3s1fSAoLis/KSAjezV9XFxzPy9nLGg0UkU6L1xccz8jezR9ICguKz8pICN7NH1cXHM/L2csaDNSRTovXFxzPyN7M30gKC4rPykgI3szfVxccz8vZyxoMlJFOi9cXHM/I3syfSAoLis/KSAjezJ9XFxzPy9nLGgxUkU6L1xccz8jICguKz8pICNcXHM/L2csaHJSRTovXFxzPy0tLVxccz8vZyxicVJFOi9gYGAoLis/KSg/OlxcWy1zb3VyY2U6XFxzPyguKylcXF0pP2BgYC9nLGRRdW90UkU6LyhefFxccyg/OlsgXFwuLDs6XFxiXFxbXSk/KVxcXFw/XCIoLis/KVxcXFw/XCIoWyBcXC4sOzpcXGJcXF1dKT8vZyxzUXVvdFJFOi8oXnxcXHMoPzpbIFxcLiw7OlxcYlxcW10pPylcXFxcPycoLis/KVxcXFw/JyhbIFxcLiw7OlxcYlxcXV0pPy9nLHZvbFJFOi9cXGJ2b2xcXC5cXHNcXGIvZ2kscFJFOi9cXGJwXFwuXFxzXFxiKD89XFxkKykvZyxjUkU6L1xcYmNcXC5cXHNcXGIoPz1cXGQrKS9nLGZsUkU6L1xcYmZsXFwuXFxzXFxiKD89XFxkKykvZyxpZVJFOi9cXGJpXFwuZVxcLlxccz9cXGIvZyxlZ1JFOi9cXGJlXFwuZ1xcLlxcc1xcYi9nLGFwb3NSRTovKFtBLVphLXpdKyknKFthLXpdKykvZyxlbmRhc2hSRTovKC4rPylcXHMtXFxzKC4rPykvZyxlbGlwc2VSRTovXFwuezN9L2d9O3IuZXhwb3J0cz10fSx7fV0sNDpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PWUoXCIuL3JlZ2V4LmpzXCIpO3R5cGVJcz1mdW5jdGlvbihlKXtpZih0aGlzLnlvdXR1YmVSRS50ZXN0KGUpKXtyZXR1cm5cInlvdXR1YmVcIn1lbHNlIGlmKHRoaXMudmltZW9SRS50ZXN0KGUpKXtyZXR1cm5cInZpbWVvXCJ9ZWxzZSBpZih0aGlzLmltYWdlUkUudGVzdChlKSl7cmV0dXJuXCJpbWFnZVwifWVsc2UgaWYodGhpcy5odG1sUkUudGVzdChlKSl7cmV0dXJuXCJsaW5rXCJ9ZWxzZXtyZXR1cm5cInBhcmFncmFwaFwifX07ci5leHBvcnRzPXR5cGVJc30se1wiLi9yZWdleC5qc1wiOjN9XSw1OltmdW5jdGlvbihlLHIsYSl7ci5leHBvcnRzPWZ1bmN0aW9uKGUpe2U9ZS5yZXBsYWNlKHRoaXMuZFF1b3RSRSxcIiQxJiM4MjIwOyQyJiM4MjIxOyQzXCIpO2U9ZS5yZXBsYWNlKHRoaXMuc1F1b3RSRSxcIiQxJiM4MjE2OyQyJiM4MjE3OyQzXCIpO2U9ZS5yZXBsYWNlKHRoaXMudm9sUkUsXCJWb2wuXCIpO2U9ZS5yZXBsYWNlKHRoaXMucFJFLFwicC5cIik7ZT1lLnJlcGxhY2UodGhpcy5jUkUsXCI8aT5jLjwvaT5cIik7ZT1lLnJlcGxhY2UodGhpcy5mbFJFLFwiPGk+ZmwuPC9pPlwiKTtlPWUucmVwbGFjZSh0aGlzLmllUkUsXCI8aT5pZTwvaT4gXCIpO2U9ZS5yZXBsYWNlKHRoaXMuZWdSRSxcIjxpPmVnPC9pPiBcIik7ZT1lLnJlcGxhY2UodGhpcy5hcG9zUkUsXCIkMSYjODIxNzskMlwiKTtlPWUucmVwbGFjZSh0aGlzLmVuZGFzaFJFLFwiJDEmIzgyMTE7JDJcIik7ZT1lLnJlcGxhY2UodGhpcy5lbGlwc2VSRSxcIiYjODIzMDtcIik7cmV0dXJuIGV9fSx7fV19LHt9LFsxXSkoMSl9KTtcbiJdfQ==
