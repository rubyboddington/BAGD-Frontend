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

},{"./models.js":5}],2:[function(require,module,exports){
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
window.students_data = require("./collection.js");
window.singleView = require("./singleView.js");
window.collectionView = require("./collectionView.js");
window.galleryView = require("./galleryView.js");
window.searchView = require("./searchView.js");
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
	// console.log(students_data.at(0).toJSON());

	// Render the home page
	var questions_display = $("#questions").html();
	$("#page-content #main .content").html(questions_display);

	window.students_list = new collectionView({collection: students_data});
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

},{"./collection.js":1,"./collectionView.js":2,"./galleryView.js":4,"./searchView.js":6,"./singleView.js":7,"smark":8}],4:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;

// The view renderer that renders a gallery of images

var imageView = Backbone.View.extend({
	template: _.template($("#singleImage").html()),

	render: function(){
		if (this.model.get("hero_image_medium") || this.model.get("hero_video_image")){
			var imageTemplate = this.template(this.model.toJSON());
			this.$el.html(imageTemplate);
		}else{
			this.$el.html("");
		}
		return this;
	}
});

var galleryView = Backbone.View.extend({
	tagName: "article",
	className: "gallery",

	render: function(){
		this.collection.each(this.addModel, this);
		return this;
	},

	addModel: function(model){
		var view = new imageView({model: model});
		this.$el.append(view.render().$el.html());
	}
});


module.exports = galleryView;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;

// The view renderer that renders search results

var nameView = Backbone.View.extend({
	tagName: "li",
	template: _.template($("#search-list-name").html()),

	render: function(){
		var nameTemplate = this.template(this.model.toJSON());
		this.$el.html(imageTemplate);
		return this;
	}
});

var searchView = Backbone.View.extend({
	tagName: "ul",
	id: "search-results",

	render: function(){
		this.collection.each(this.addModel, this);
		return this;
	},

	addModel: function(model){
		var view = new nameView({model: model});
		this.$el.append(view.render().$el.html());
	}
});


module.exports = searchView;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
Backbone.$ = $;

_.templateSettings = {
	interpolate: /\(:(.+?):\)/g,
	evaluate: /\):(.+?):\(/gm
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

},{}],8:[function(require,module,exports){
(function (global){
/* @license smark.js written by Kenneth Lim <limzy.kenneth@gmail.com> (http://designerken.be)
   License under the BSD 2-Clause License */
(function(e){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=e()}else if(typeof define==="function"&&define.amd){define([],e)}else{var r;if(typeof window!=="undefined"){r=window}else if(typeof global!=="undefined"){r=global}else if(typeof self!=="undefined"){r=self}else{r=this}r.smark=e()}})(function(){var e,r,a;return function t(e,r,a){function i(s,p){if(!r[s]){if(!e[s]){var o=typeof require=="function"&&require;if(!p&&o)return o(s,!0);if(l)return l(s,!0);var n=new Error("Cannot find module '"+s+"'");throw n.code="MODULE_NOT_FOUND",n}var h=r[s]={exports:{}};e[s][0].call(h.exports,function(r){var a=e[s][1][r];return i(a?a:r)},h,h.exports,t,e,r,a)}return r[s].exports}var l=typeof require=="function"&&require;for(var s=0;s<a.length;s++)i(a[s]);return i}({1:[function(e,r,a){var t=e("./regex.js");t.typeIs=e("./typeIs.js");t.typographicChanges=e("./typography.js");t.parseParagraph=e("./paragraph.js");t.generate=function(e,r){var a="";var i={type:"auto",typography:true};for(var l in r){for(var s in i){if(l==s){i[s]=r[l]}}}var p=i.type;var o=i.typography;if(p=="auto"){if(this.typeIs(e)=="youtube"){p="youtube"}else if(this.typeIs(e)=="vimeo"){p="vimeo"}else if(this.typeIs(e)=="image"){p="image"}else if(this.typeIs(e)=="link"){p="link"}else if(this.typeIs(e)=="paragraph"){p="paragraph"}}else{p=i.type}a=n(e,p);return{html:a,type:p};function n(e,r){var a;var i=t;switch(r){case"youtube":e=e.replace(i.youtubeRE,"$1");a='<iframe class="smark youtube" src="https://www.youtube.com/embed/'+e+'" frameborder="0" width="853" height="480" allowfullscreen></iframe>';break;case"vimeo":e=e.replace(i.vimeoRE,"$1");a='<iframe class="smark vimeo" src="https://player.vimeo.com/video/'+e+'" frameborder="0" width="853" height="480" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';break;case"image":var l=e.replace(i.imageRE,"$1");var s=e.replace(i.imageRE,"$2");if(o){s=i.typographicChanges(s)}a='<img class="smark image" title="'+s+'" src="'+l+'">';if(i.imageLinkRE.test(e)){var p=i.imageLinkRE.exec(e)[0];p=p.substring(1,p.length-1);a='<a href="'+p+'" target=_blank>'+a+"</a>"}break;case"link":e=e.match(i.htmlRE)[0];a='<iframe class="smark website" src="'+e+'" width="853" height="480" frameborder="0"></iframe>';break;case"paragraph":e=i.parseParagraph(o,e);a='<p class="smark paragraph">'+e+"</p>";break;default:a=""}return a}};r.exports=t},{"./paragraph.js":2,"./regex.js":3,"./typeIs.js":4,"./typography.js":5}],2:[function(e,r,a){var t=e("./regex.js");r.exports=function(e,r){if(e){r=this.typographicChanges(r)}var a="";r=n(r);var i=r.match(t.olRE);if(i!==null){for(var l=0;l<i.length;l++){var s=i[l].match(t.olliRE);a="<ol>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.olliRE,"$1")+"</li>"}a+="</ol>";r=r.replace(i[l],a)}}var o=r.match(t.ulRE);if(o!==null){for(var l=0;l<o.length;l++){var s=o[l].match(t.ulliRE);a="<ul>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.ulliRE,"$1")+"</li>"}a+="</ul>";r=r.replace(o[l],a)}}if(t.bqRE.test(r)){if(r.replace(t.bqRE,"$2")===""){r=r.replace(t.bqRE,"<blockquote><p>$1</p></blockquote>")}else{r=r.replace(t.bqRE,"<blockquote><p>$1</p><footer>$2</footer></blockquote>")}}r=r.replace(t.h6RE,"<h6>$1</h6>");r=r.replace(t.h5RE,"<h5>$1</h5>");r=r.replace(t.h4RE,"<h4>$1</h4>");r=r.replace(t.h3RE,"<h3>$1</h3>");r=r.replace(t.h2RE,"<h2>$1</h2>");r=r.replace(t.h1RE,"<h1>$1</h1>");r=r.replace(t.hrRE,"<hr />");return r;function n(e){if(e.replace(t.linkRE,"$1")!==""){a='<a href="$2">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$2">$1</a>'}}e=e.replace(t.linkRE,a);if(e.replace(t.linkBareRE,"$1")!==""){a='<a href="$1">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$1">$1</a>'}}e=e.replace(t.linkBareRE,a);return e}}},{"./regex.js":3}],3:[function(e,r,a){var t={youtubeRE:/^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch|embed\/watch|embed)?[\?\/]?(?:v=|feature=player_embedded&v=)?([\w-_]+).*?$/,vimeoRE:/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/)?(?:\w+\/)?(\d+)$/,imageRE:/^(?! )(.+?\.(?:jpg|jpeg|gif|png|bmp))(?: -title="(.+?)")?(?:\(.+?\))?$/,imageLinkRE:/(?:\((.+?)\)){1}/,htmlRE:/^((?!.*(jpg|jpeg|gif|png|bmp))(https?:\/\/)[\w\-_]+(\.[\w\-_]+)+[\w\-.,@?^=%&:\/~\\+#]*)|.+\.(?!jpg|jpeg|gif|png|bmp)html?$/,linkRE:/\[(?!-)(.*?)\](?:|-blank) ?\((.+?)\)/g,linkBlankRE:/\[(?!-)(.*?)\]-blank ?\((.+?)\)/g,linkBareRE:/\[(?!-)(.*?)\](?:-blank)?/g,linkBareBlankRE:/\[(?!-)(.*?)\](?:-blank)/g,olRE:/(?:\d\.\s(.+?) \| ?)+/g,olliRE:/\d\.\s(.+?) \|/g,ulRE:/(?:\*\s(.+?) \| ?)+/g,ulliRE:/\*\s(.+?) \|/g,h6RE:/\s?#{6} (.+?) #{6}\s?/g,h5RE:/\s?#{5} (.+?) #{5}\s?/g,h4RE:/\s?#{4} (.+?) #{4}\s?/g,h3RE:/\s?#{3} (.+?) #{3}\s?/g,h2RE:/\s?#{2} (.+?) #{2}\s?/g,h1RE:/\s?# (.+?) #\s?/g,hrRE:/\s?---\s?/g,bqRE:/```(.+?)(?:\[-source:\s?(.+)\])?```/g,dQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?"(.+?)\\?"([ \.,;:\b\]])?/g,sQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?'(.+?)\\?'([ \.,;:\b\]])?/g,volRE:/\bvol\.\s\b/gi,pRE:/\bp\.\s\b(?=\d+)/g,cRE:/\bc\.\s\b(?=\d+)/g,flRE:/\bfl\.\s\b(?=\d+)/g,ieRE:/\bi\.e\.\s?\b/g,egRE:/\be\.g\.\s\b/g,aposRE:/([A-Za-z]+)'([a-z]+)/g,endashRE:/(.+?)\s-\s(.+?)/g,elipseRE:/\.{3}/g};r.exports=t},{}],4:[function(e,r,a){var t=e("./regex.js");typeIs=function(e){if(this.youtubeRE.test(e)){return"youtube"}else if(this.vimeoRE.test(e)){return"vimeo"}else if(this.imageRE.test(e)){return"image"}else if(this.htmlRE.test(e)){return"link"}else{return"paragraph"}};r.exports=typeIs},{"./regex.js":3}],5:[function(e,r,a){r.exports=function(e){e=e.replace(this.dQuotRE,"$1&#8220;$2&#8221;$3");e=e.replace(this.sQuotRE,"$1&#8216;$2&#8217;$3");e=e.replace(this.volRE,"Vol.");e=e.replace(this.pRE,"p.");e=e.replace(this.cRE,"<i>c.</i>");e=e.replace(this.flRE,"<i>fl.</i>");e=e.replace(this.ieRE,"<i>ie</i> ");e=e.replace(this.egRE,"<i>eg</i> ");e=e.replace(this.aposRE,"$1&#8217;$2");e=e.replace(this.endashRE,"$1&#8211;$2");e=e.replace(this.elipseRE,"&#8230;");return e}},{}]},{},[1])(1)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY29sbGVjdGlvblZpZXcuanMiLCJqYXZhc2NyaXB0cy9jdXN0b20uanMiLCJqYXZhc2NyaXB0cy9nYWxsZXJ5Vmlldy5qcyIsImphdmFzY3JpcHRzL21vZGVscy5qcyIsImphdmFzY3JpcHRzL3NlYXJjaFZpZXcuanMiLCJqYXZhc2NyaXB0cy9zaW5nbGVWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3NtYXJrL3NtYXJrLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgbW9kZWwgPSByZXF1aXJlKFwiLi9tb2RlbHMuanNcIik7XG5cbi8vIFRoZSBjb2xsZWN0aW9ucyBvZiBkYXRhIHRoYXQgd2UgaW1wb3J0IGluIGZyb20gdGhlIHdvcmRwcmVzcyBzZXJ2ZXIuXG52YXIgY29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0bW9kZWw6IG1vZGVsLFxuXHQvLyB1cmw6IFwiaHR0cDovL2luZm8uY3NtZ3JhcGhpY2Rlc2lnbi5jb20vd3AtanNvbi93cC92Mi9zdHVkZW50X2luZm8/ZmlsdGVyW3Bvc3RzX3Blcl9wYWdlXT0tMVwiLFxuXHQvLyB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdC93b3JkcHJlc3Mvd3AtanNvbi93cC92Mi9zdHVkZW50X2luZm9cIixcblx0dXJsOiBcIi4vcmVzcG9uc2UuanNvblwiLFxuXG5cdGNvbXBhcmF0b3I6IFwibmFtZVwiXG59KTtcblxuc3R1ZGVudHNfZGF0YSA9IG5ldyBjb2xsZWN0aW9uKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1ZGVudHNfZGF0YTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IHJlbmRlcnMgYSBjb2xsZWN0aW9uIG9mIGRhdGFcbi8vIGllLiBhIGNvbGxlY3Rpb24gb2Ygc3R1ZGVudHMgaW5mbyBmb3IgbmF2aWdhdGlvbiBvciBzb21ldGhpbmcgZWxzZS5cblxuLy8gQ3JlYXRlIG9uZSBlbGVtZW50IGF0IGEgdGltZVxudmFyIGluZGl2aWR1YWwgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwibGlcIixcblxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSgkKFwiI25hbWUtbGlzdC1pdGVtXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBtb2RlbFRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsLnRvSlNPTigpKTtcblx0XHR0aGlzLiRlbC5odG1sKG1vZGVsVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxuLy8gUGxhY2luZyB0aGUgZWxlbWVudHMgY3JlYXRlZCBhYm92ZSBpbnRvIHRoZSBjb2xsZWN0aW9uIHZpZXcgcmVuZGVyZXIuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJkaXZcIixcblx0aWQ6IFwibmFtZS1saXN0XCIsXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciB3aG9sZUxpc3QgPSBcIlwiO1xuXHRcdHZhciBncm91cGVkTGlzdCA9IHRoaXMuY29sbGVjdGlvbi5ncm91cEJ5KGZ1bmN0aW9uKGVsKXtcblx0XHRcdHZhciBmaXJzdENoYXIgPSBlbC5nZXQoXCJuYW1lXCIpLmNoYXJBdCgwKTtcblx0XHRcdHJldHVybiBmaXJzdENoYXI7XG5cdFx0fSwgdGhpcyk7XG5cblx0XHRfLmVhY2goZ3JvdXBlZExpc3QsIGZ1bmN0aW9uKGVsLCBrZXkpe1xuXHRcdFx0dmFyIGhlYWRlciA9IFwiPHVsPjxsaT48aDY+XCIgKyBrZXkgKyBcIjwvaDY+PC9saT5cIjtcblxuXHRcdFx0d2hvbGVMaXN0ICs9IGhlYWRlcjtcblxuXHRcdFx0Xy5lYWNoKGVsLCBmdW5jdGlvbihlbCwgaSl7XG5cdFx0XHRcdHdob2xlTGlzdCArPSB0aGlzLmFkZE1vZGVsKGVsKTtcblx0XHRcdH0sIHRoaXMpO1xuXG5cdFx0XHR3aG9sZUxpc3QgKz0gXCI8L3VsPlwiO1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCh3aG9sZUxpc3QpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YWRkTW9kZWw6IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgbW9kZWxWaWV3ID0gbmV3IGluZGl2aWR1YWwoe21vZGVsOiBtb2RlbH0pO1xuXHRcdHJldHVybiBtb2RlbFZpZXcucmVuZGVyKCkuJGVsLmh0bWwoKTtcblx0fVxufSk7IiwiLy8gQnVuY2ggb2YgaW1wb3J0c1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xud2luZG93LnNtYXJrID0gcmVxdWlyZShcInNtYXJrXCIpO1xuQmFja2JvbmUuJCA9ICQ7XG53aW5kb3cuc3R1ZGVudHNfZGF0YSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb24uanNcIik7XG53aW5kb3cuc2luZ2xlVmlldyA9IHJlcXVpcmUoXCIuL3NpbmdsZVZpZXcuanNcIik7XG53aW5kb3cuY29sbGVjdGlvblZpZXcgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uVmlldy5qc1wiKTtcbndpbmRvdy5nYWxsZXJ5VmlldyA9IHJlcXVpcmUoXCIuL2dhbGxlcnlWaWV3LmpzXCIpO1xud2luZG93LnNlYXJjaFZpZXcgPSByZXF1aXJlKFwiLi9zZWFyY2hWaWV3LmpzXCIpO1xudmFyIG1hZ2ljID0gbWFnaWMgfHwge307XG5cbi8vIEhvbGQgdGhhdCByZWFkeSwgbWFnaWMgbmVlZHMgdG8gaGFwcGVuIGZpcnN0IVxuJC5ob2xkUmVhZHkodHJ1ZSk7XG4kKFwiI3BhZ2UtY29udGVudFwiKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuXG4vLyBBbnl0aGluZyB0aGF0IG5lZWRzIGRvaW5nIGJlZm9yZSBkYXRhIGlzIGxvYWRlZCBzaG91bGQgZ28gaGVyZS5cbnZhciByZWNlaXZlZERhdGEgPSBuZXcgRXZlbnQoXCJyZWNlaXZlZERhdGFcIik7XG5cbi8vIEZldGNoIGRhdGEgZnJvbSB0aGUgYmFja2VuZC5cbnN0dWRlbnRzX2RhdGEuZmV0Y2goe1xuXHQvLyBEaXNwYXRjaCB0aGUgcmVjZWl2ZWQgZGF0YSBldmVudCBhZnRlciB0aGUgZGF0YSBpcyBzdWNjZXNmdWxseSBsb2FkZWQuXG5cdHN1Y2Nlc3M6IGZ1bmN0aW9uKCl7XG5cdFx0d2luZG93LmRpc3BhdGNoRXZlbnQocmVjZWl2ZWREYXRhKTtcblx0fVxufSk7XG5cblxuLy8gVGhlIHBhZ2UgbG9naWMgc2hvdWxkIGdvIGluIHRoaXMgY2FsbGJhY2sgZnVuY3Rpb24gKHJlbmRlcmluZyBldGMuKVxuLy8gVHJlYXQgdGhpcyBhcyB0aGUgcmVndWxhciBkb2N1bWVudC5yZWFkeSB0aGluZyB1bmxlc3MgdGhlcmUgYXJlIHN0dWZmIHRvIGJlXG4vLyBkb25lIGJlZm9yZSBsb2FkaW5nIGluIHRoZSBkYXRhLlxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZWNlaXZlZERhdGFcIiwgZnVuY3Rpb24oKXtcblx0Ly8gc3R1ZGVudHNfZGF0YSBpcyB0aGUgY29sbGVjdGlvbiBvYmplY3Rcblx0Y29uc29sZS5sb2coc3R1ZGVudHNfZGF0YS5tb2RlbHMpO1xuXHQvLyBNYWtlIHRoZW0gZGF0YSBwcmV0dHkhXG5cdHN0dWRlbnRzX2RhdGEuZWFjaChmdW5jdGlvbihlbCwgaSl7XG5cdFx0Ly8gVmFsaWRhdGUgYW5kIGZpeCB3ZWJzaXRlIGFkZHJlc3Nlc1xuXHRcdG1hZ2ljLnZhbGlkYXRlV2ViQWRkcmVzcyhlbCwgW1xuXHRcdFx0XCJsaW5rX3RvX3BlcnNvbmFsX3dlYnNpdGVcIixcblx0XHRcdFwieW91dHViZVwiLFxuXHRcdFx0XCJ2aW1lb1wiLFxuXHRcdFx0XCJoZXJvX3ZpZGVvXCIsXG5cdFx0XHRcInZpZGVvXzFcIixcblx0XHRcdFwidmlkZW9fMlwiXG5cdFx0XSk7XG5cblx0XHQvLyBDb252ZXJ0IHN0dWRlbnQgSUQgdG8gdXBwZXIgY2FzZVxuXHRcdGVsLnNldChcInN0dWRlbnRfbnVtYmVyXCIsIGVsLmdldChcInN0dWRlbnRfbnVtYmVyXCIpLnRvVXBwZXJDYXNlKCkpO1xuXG5cdFx0Ly8gVHJpbSB0YWdzIHRvIDcgaXRlbXMgb25seVxuXHRcdGlmIChlbC5nZXQoXCJ0YWdzXCIpICE9PSBudWxsKXtcblx0XHRcdGlmIChlbC5nZXQoXCJ0YWdzXCIpLmxlbmd0aCA+IDcpe1xuXHRcdFx0XHRlbC5nZXQoXCJ0YWdzXCIpLnNwbGljZSg3KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtYWdpYy50eXBvZ3JhcGh5KGVsLCBbXCJiaW9cIiwgXCJoZXJvX2NhcHRpb25cIiwgXCJjYXB0aW9uXzFcIiwgXCJjYXB0aW9uXzJcIl0pO1xuXG5cdFx0dmFyIGF2YWlsYWJsZVZpZGVvcyA9IFtdO1xuXHRcdGlmIChlbC5nZXQoXCJoZXJvX2ltYWdlX3ZpZGVvXCIpID09IFwiVmlkZW9cIil7XG5cdFx0XHRhdmFpbGFibGVWaWRlb3MucHVzaChcImhlcm9fdmlkZW9cIik7XG5cdFx0fVxuXHRcdGlmIChlbC5nZXQoXCJpbWFnZV92aWRlb18xXCIpID09IFwiVmlkZW9cIil7XG5cdFx0XHRhdmFpbGFibGVWaWRlb3MucHVzaChcInZpZGVvXzFcIik7XG5cdFx0fVxuXHRcdGlmIChlbC5nZXQoXCJpbWFnZV92aWRlb18yXCIpID09IFwiVmlkZW9cIil7XG5cdFx0XHRhdmFpbGFibGVWaWRlb3MucHVzaChcInZpZGVvXzJcIik7XG5cdFx0fVxuXHRcdGlmKCEoXy5pc0VtcHR5KGF2YWlsYWJsZVZpZGVvcykpKXtcblx0XHRcdG1hZ2ljLmdldFZpZGVvSW1hZ2UoZWwsIGF2YWlsYWJsZVZpZGVvcyk7XG5cdFx0fVxuXHR9KTtcblx0Ly8gY29uc29sZS5sb2coc3R1ZGVudHNfZGF0YS5hdCgwKS50b0pTT04oKSk7XG5cblx0Ly8gUmVuZGVyIHRoZSBob21lIHBhZ2Vcblx0dmFyIHF1ZXN0aW9uc19kaXNwbGF5ID0gJChcIiNxdWVzdGlvbnNcIikuaHRtbCgpO1xuXHQkKFwiI3BhZ2UtY29udGVudCAjbWFpbiAuY29udGVudFwiKS5odG1sKHF1ZXN0aW9uc19kaXNwbGF5KTtcblxuXHR3aW5kb3cuc3R1ZGVudHNfbGlzdCA9IG5ldyBjb2xsZWN0aW9uVmlldyh7Y29sbGVjdGlvbjogc3R1ZGVudHNfZGF0YX0pO1xuXHQkKFwiI3BhZ2UtY29udGVudCAjbmFtZXMtbmF2IC5uYXYtY29udGVudFwiKS5odG1sKHN0dWRlbnRzX2xpc3QucmVuZGVyKCkuJGVsKTtcblxuXHQvLyBOb3cgeW91IGNhbiBiZSByZWFkeSwgZXZlcnl0aGluZydzIGxvYWRlZCBpbiBhbmQgZGlzcGxheWVkIVxuXHQkLmhvbGRSZWFkeShmYWxzZSk7XG5cdCQoXCIjcGFnZS1jb250ZW50XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJpbmxpbmVcIik7XG5cdCQoXCIjbG9hZGluZ1wiKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdCQoXCIjbG9hZGluZ1wiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcblx0fSwgNTAwKTtcblx0Ly8gQWZ0ZXIgdGhpcyBwb2ludCB5b3Ugc2hvdWxkIHRoZW4gYmluZCBldmVudHMsIGFuaW1hdGlvbnMsIGV0Yy5cblx0Ly8gKHdoaWNoIHdpbGwgaGFwcGVuIGluIHNjcmlwdC5qcyBpbiBkb2N1bWVudC5yZWFkeSlcbn0pO1xuXG5cbi8vIFNvbWUgbWFnaWMgZnVuY3Rpb25zXG5tYWdpYy52YWxpZGF0ZVdlYkFkZHJlc3MgPSBmdW5jdGlvbihlbCwgbmFtZXMpe1xuXHR2YXIgc3RhcnQgPSAvXmh0dHBzPzpcXC9cXC8vZ2k7XG5cblx0Xy5lYWNoKG5hbWVzLCBmdW5jdGlvbihuYW1lLCBpKSB7XG5cdFx0aWYgKGVsLmdldChuYW1lKSAhPT0gXCJcIiAmJiB0eXBlb2YgZWwuZ2V0KG5hbWUpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0Ly8gQWRkIGh0dHA6Ly8gcHJlZml4IGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGl0LFxuXHRcdFx0Ly8gcmVxdWlyZWQgdG8gbWFrZSBzdXJlIGxpbmtzIGFyZSBhYnNvbHV0ZVxuXHRcdFx0aWYgKGVsLmdldChuYW1lKS5zZWFyY2goc3RhcnQpID09IC0xKXtcblx0XHRcdFx0dmFyIG9sZCA9IGVsLmdldChuYW1lKTtcblx0XHRcdFx0ZWwuc2V0KG5hbWUsIFwiaHR0cDovL1wiICsgb2xkKTtcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdC8vIFVzZXIgZGlkIG5vdCBwcm92aWRlIGxpbmsgdG8gd2Vic2l0ZVxuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy50eXBvZ3JhcGh5ID0gZnVuY3Rpb24oZWwsIGZpZWxkcyl7XG5cdF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkLCBpKXtcblx0XHRpZiAoZWwuZ2V0KGZpZWxkKSl7XG5cdFx0XHRlbC5zZXQoZmllbGQsIHNtYXJrLnR5cG9ncmFwaGljQ2hhbmdlcyhlbC5nZXQoZmllbGQpKS50cmltKCkpO1xuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy5nZXRWaWRlb0ltYWdlID0gZnVuY3Rpb24oZWwsIGZpZWxkcyl7XG5cdF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkLCBpKXtcblx0XHRpZihlbC5nZXQoZmllbGQpICE9PSBcIlwiKXtcblx0XHRcdHZhciB2aWRJRDtcblx0XHRcdGlmKHNtYXJrLnR5cGVJcyhlbC5nZXQoZmllbGQpKSA9PSBcInlvdXR1YmVcIil7XG5cdFx0XHRcdHZpZElEID0gZWwuZ2V0KGZpZWxkKS5yZXBsYWNlKHNtYXJrLnlvdXR1YmVSRSwgXCIkMVwiKTtcblx0XHRcdFx0dmFyIGltYWdlTGluayA9IFwiaHR0cDovL2kzLnl0aW1nLmNvbS92aS9cIiArIHZpZElEICsgXCIvc2RkZWZhdWx0LmpwZ1wiO1xuXHRcdFx0XHRlbC5zZXQoZmllbGQgKyBcIl9pbWFnZVwiLCBpbWFnZUxpbmspO1xuXG5cdFx0XHR9ZWxzZSBpZihzbWFyay50eXBlSXMoZWwuZ2V0KGZpZWxkKSkgPT0gXCJ2aW1lb1wiKXtcblx0XHRcdFx0dmlkSUQgPSBlbC5nZXQoZmllbGQpLnJlcGxhY2Uoc21hcmsudmltZW9SRSwgXCIkMVwiKTtcblx0XHRcdFx0bWFnaWMudmltZW9Mb2FkaW5nVGh1bWIodmlkSUQsIGZ1bmN0aW9uKGltYWdlTGluayl7XG5cdFx0XHRcdFx0ZWwuc2V0KGZpZWxkICsgXCJfaW1hZ2VcIiwgaW1hZ2VMaW5rKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Y29uc29sZS5sb2coZWwuZ2V0KFwibmFtZVwiKSwgZWwuZ2V0KGZpZWxkKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07XG5cbm1hZ2ljLnZpbWVvTG9hZGluZ1RodW1iID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKXtcbiAgICB2YXIgdXJsID0gXCJodHRwczovL3ZpbWVvLmNvbS9hcGkvb2VtYmVkLmpzb24/dXJsPWh0dHBzJTNBLy92aW1lby5jb20vXCIgKyBpZDtcbiAgICAkLmFqYXgoe1xuICAgIFx0dXJsOiB1cmwsXG4gICAgXHRkYXRhVHlwZTogXCJqc29uXCJcbiAgICB9KS5kb25lKGZ1bmN0aW9uKGRhdGEpe1xuICAgIFx0dmFyIHJldHVybkltYWdlID0gZGF0YS50aHVtYm5haWxfdXJsO1xuICAgIFx0cmV0dXJuSW1hZ2UgPSByZXR1cm5JbWFnZS5yZXBsYWNlKC8oLio/XylcXGQrPyhcXC5qcGcpLywgXCIkMTY0MCQyXCIpO1xuICAgIFx0Y2FsbGJhY2socmV0dXJuSW1hZ2UpO1xuICAgIH0pO1xufTtcblxuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgcmVuZGVycyBhIGdhbGxlcnkgb2YgaW1hZ2VzXG5cbnZhciBpbWFnZVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCQoXCIjc2luZ2xlSW1hZ2VcIikuaHRtbCgpKSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0aWYgKHRoaXMubW9kZWwuZ2V0KFwiaGVyb19pbWFnZV9tZWRpdW1cIikgfHwgdGhpcy5tb2RlbC5nZXQoXCJoZXJvX3ZpZGVvX2ltYWdlXCIpKXtcblx0XHRcdHZhciBpbWFnZVRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsLnRvSlNPTigpKTtcblx0XHRcdHRoaXMuJGVsLmh0bWwoaW1hZ2VUZW1wbGF0ZSk7XG5cdFx0fWVsc2V7XG5cdFx0XHR0aGlzLiRlbC5odG1sKFwiXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbnZhciBnYWxsZXJ5VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJhcnRpY2xlXCIsXG5cdGNsYXNzTmFtZTogXCJnYWxsZXJ5XCIsXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29sbGVjdGlvbi5lYWNoKHRoaXMuYWRkTW9kZWwsIHRoaXMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGFkZE1vZGVsOiBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIHZpZXcgPSBuZXcgaW1hZ2VWaWV3KHttb2RlbDogbW9kZWx9KTtcblx0XHR0aGlzLiRlbC5hcHBlbmQodmlldy5yZW5kZXIoKS4kZWwuaHRtbCgpKTtcblx0fVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBnYWxsZXJ5VmlldzsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuLy8gSW5pdGlhbGl6YXRpb24gZm9yIG1vZGVsIChwcm9iYWJseSB3aWxsIG5vdCBuZWVkIGNoYW5naW5nIGV2ZXIpXG52YXIgbW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czp7XG5cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kZWw7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgcmVuZGVycyBzZWFyY2ggcmVzdWx0c1xuXG52YXIgbmFtZVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwibGlcIixcblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiNzZWFyY2gtbGlzdC1uYW1lXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBuYW1lVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdHRoaXMuJGVsLmh0bWwoaW1hZ2VUZW1wbGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG52YXIgc2VhcmNoVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJ1bFwiLFxuXHRpZDogXCJzZWFyY2gtcmVzdWx0c1wiLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR0aGlzLmNvbGxlY3Rpb24uZWFjaCh0aGlzLmFkZE1vZGVsLCB0aGlzKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRhZGRNb2RlbDogZnVuY3Rpb24obW9kZWwpe1xuXHRcdHZhciB2aWV3ID0gbmV3IG5hbWVWaWV3KHttb2RlbDogbW9kZWx9KTtcblx0XHR0aGlzLiRlbC5hcHBlbmQodmlldy5yZW5kZXIoKS4kZWwuaHRtbCgpKTtcblx0fVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBzZWFyY2hWaWV3OyIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG5fLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG5cdGludGVycG9sYXRlOiAvXFwoOiguKz8pOlxcKS9nLFxuXHRldmFsdWF0ZTogL1xcKTooLis/KTpcXCgvZ21cbn07XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgb25seSByZW5kZXIgb25jZSBpbnN0YW5jZSBvZiBhIG1vZGVsXG4vLyBpZS4gZm9yIGRpc3BsYXlpbmcgYSBzaW5nbGUgc3R1ZGVudCdzIGluZm9cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcImFydGljbGVcIixcblx0aWQ6IFwic3R1ZGVudFdyYXBwZXJcIixcblxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSgkKFwiI3NpbmdsZVN0dWRlbnRcIikuaHRtbCgpKSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHNpbmdsZVRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsLnRvSlNPTigpKTtcblx0XHR0aGlzLiRlbC5odG1sKHNpbmdsZVRlbXBsYXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7IiwiLyogQGxpY2Vuc2Ugc21hcmsuanMgd3JpdHRlbiBieSBLZW5uZXRoIExpbSA8bGltenkua2VubmV0aEBnbWFpbC5jb20+IChodHRwOi8vZGVzaWduZXJrZW4uYmUpXG4gICBMaWNlbnNlIHVuZGVyIHRoZSBCU0QgMi1DbGF1c2UgTGljZW5zZSAqL1xuKGZ1bmN0aW9uKGUpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWUoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxlKX1lbHNle3ZhciByO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtyPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtyPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7cj1zZWxmfWVsc2V7cj10aGlzfXIuc21hcms9ZSgpfX0pKGZ1bmN0aW9uKCl7dmFyIGUscixhO3JldHVybiBmdW5jdGlvbiB0KGUscixhKXtmdW5jdGlvbiBpKHMscCl7aWYoIXJbc10pe2lmKCFlW3NdKXt2YXIgbz10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCFwJiZvKXJldHVybiBvKHMsITApO2lmKGwpcmV0dXJuIGwocywhMCk7dmFyIG49bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitzK1wiJ1wiKTt0aHJvdyBuLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsbn12YXIgaD1yW3NdPXtleHBvcnRzOnt9fTtlW3NdWzBdLmNhbGwoaC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBhPWVbc11bMV1bcl07cmV0dXJuIGkoYT9hOnIpfSxoLGguZXhwb3J0cyx0LGUscixhKX1yZXR1cm4gcltzXS5leHBvcnRzfXZhciBsPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBzPTA7czxhLmxlbmd0aDtzKyspaShhW3NdKTtyZXR1cm4gaX0oezE6W2Z1bmN0aW9uKGUscixhKXt2YXIgdD1lKFwiLi9yZWdleC5qc1wiKTt0LnR5cGVJcz1lKFwiLi90eXBlSXMuanNcIik7dC50eXBvZ3JhcGhpY0NoYW5nZXM9ZShcIi4vdHlwb2dyYXBoeS5qc1wiKTt0LnBhcnNlUGFyYWdyYXBoPWUoXCIuL3BhcmFncmFwaC5qc1wiKTt0LmdlbmVyYXRlPWZ1bmN0aW9uKGUscil7dmFyIGE9XCJcIjt2YXIgaT17dHlwZTpcImF1dG9cIix0eXBvZ3JhcGh5OnRydWV9O2Zvcih2YXIgbCBpbiByKXtmb3IodmFyIHMgaW4gaSl7aWYobD09cyl7aVtzXT1yW2xdfX19dmFyIHA9aS50eXBlO3ZhciBvPWkudHlwb2dyYXBoeTtpZihwPT1cImF1dG9cIil7aWYodGhpcy50eXBlSXMoZSk9PVwieW91dHViZVwiKXtwPVwieW91dHViZVwifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwidmltZW9cIil7cD1cInZpbWVvXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJpbWFnZVwiKXtwPVwiaW1hZ2VcIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cImxpbmtcIil7cD1cImxpbmtcIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cInBhcmFncmFwaFwiKXtwPVwicGFyYWdyYXBoXCJ9fWVsc2V7cD1pLnR5cGV9YT1uKGUscCk7cmV0dXJue2h0bWw6YSx0eXBlOnB9O2Z1bmN0aW9uIG4oZSxyKXt2YXIgYTt2YXIgaT10O3N3aXRjaChyKXtjYXNlXCJ5b3V0dWJlXCI6ZT1lLnJlcGxhY2UoaS55b3V0dWJlUkUsXCIkMVwiKTthPSc8aWZyYW1lIGNsYXNzPVwic21hcmsgeW91dHViZVwiIHNyYz1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLycrZSsnXCIgZnJhbWVib3JkZXI9XCIwXCIgd2lkdGg9XCI4NTNcIiBoZWlnaHQ9XCI0ODBcIiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+JzticmVhaztjYXNlXCJ2aW1lb1wiOmU9ZS5yZXBsYWNlKGkudmltZW9SRSxcIiQxXCIpO2E9JzxpZnJhbWUgY2xhc3M9XCJzbWFyayB2aW1lb1wiIHNyYz1cImh0dHBzOi8vcGxheWVyLnZpbWVvLmNvbS92aWRlby8nK2UrJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIHdpZHRoPVwiODUzXCIgaGVpZ2h0PVwiNDgwXCIgd2Via2l0YWxsb3dmdWxsc2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+JzticmVhaztjYXNlXCJpbWFnZVwiOnZhciBsPWUucmVwbGFjZShpLmltYWdlUkUsXCIkMVwiKTt2YXIgcz1lLnJlcGxhY2UoaS5pbWFnZVJFLFwiJDJcIik7aWYobyl7cz1pLnR5cG9ncmFwaGljQ2hhbmdlcyhzKX1hPSc8aW1nIGNsYXNzPVwic21hcmsgaW1hZ2VcIiB0aXRsZT1cIicrcysnXCIgc3JjPVwiJytsKydcIj4nO2lmKGkuaW1hZ2VMaW5rUkUudGVzdChlKSl7dmFyIHA9aS5pbWFnZUxpbmtSRS5leGVjKGUpWzBdO3A9cC5zdWJzdHJpbmcoMSxwLmxlbmd0aC0xKTthPSc8YSBocmVmPVwiJytwKydcIiB0YXJnZXQ9X2JsYW5rPicrYStcIjwvYT5cIn1icmVhaztjYXNlXCJsaW5rXCI6ZT1lLm1hdGNoKGkuaHRtbFJFKVswXTthPSc8aWZyYW1lIGNsYXNzPVwic21hcmsgd2Vic2l0ZVwiIHNyYz1cIicrZSsnXCIgd2lkdGg9XCI4NTNcIiBoZWlnaHQ9XCI0ODBcIiBmcmFtZWJvcmRlcj1cIjBcIj48L2lmcmFtZT4nO2JyZWFrO2Nhc2VcInBhcmFncmFwaFwiOmU9aS5wYXJzZVBhcmFncmFwaChvLGUpO2E9JzxwIGNsYXNzPVwic21hcmsgcGFyYWdyYXBoXCI+JytlK1wiPC9wPlwiO2JyZWFrO2RlZmF1bHQ6YT1cIlwifXJldHVybiBhfX07ci5leHBvcnRzPXR9LHtcIi4vcGFyYWdyYXBoLmpzXCI6MixcIi4vcmVnZXguanNcIjozLFwiLi90eXBlSXMuanNcIjo0LFwiLi90eXBvZ3JhcGh5LmpzXCI6NX1dLDI6W2Z1bmN0aW9uKGUscixhKXt2YXIgdD1lKFwiLi9yZWdleC5qc1wiKTtyLmV4cG9ydHM9ZnVuY3Rpb24oZSxyKXtpZihlKXtyPXRoaXMudHlwb2dyYXBoaWNDaGFuZ2VzKHIpfXZhciBhPVwiXCI7cj1uKHIpO3ZhciBpPXIubWF0Y2godC5vbFJFKTtpZihpIT09bnVsbCl7Zm9yKHZhciBsPTA7bDxpLmxlbmd0aDtsKyspe3ZhciBzPWlbbF0ubWF0Y2godC5vbGxpUkUpO2E9XCI8b2w+XCI7Zm9yKHZhciBwPTA7cDxzLmxlbmd0aDtwKyspe2ErPVwiPGxpPlwiK3NbcF0ucmVwbGFjZSh0Lm9sbGlSRSxcIiQxXCIpK1wiPC9saT5cIn1hKz1cIjwvb2w+XCI7cj1yLnJlcGxhY2UoaVtsXSxhKX19dmFyIG89ci5tYXRjaCh0LnVsUkUpO2lmKG8hPT1udWxsKXtmb3IodmFyIGw9MDtsPG8ubGVuZ3RoO2wrKyl7dmFyIHM9b1tsXS5tYXRjaCh0LnVsbGlSRSk7YT1cIjx1bD5cIjtmb3IodmFyIHA9MDtwPHMubGVuZ3RoO3ArKyl7YSs9XCI8bGk+XCIrc1twXS5yZXBsYWNlKHQudWxsaVJFLFwiJDFcIikrXCI8L2xpPlwifWErPVwiPC91bD5cIjtyPXIucmVwbGFjZShvW2xdLGEpfX1pZih0LmJxUkUudGVzdChyKSl7aWYoci5yZXBsYWNlKHQuYnFSRSxcIiQyXCIpPT09XCJcIil7cj1yLnJlcGxhY2UodC5icVJFLFwiPGJsb2NrcXVvdGU+PHA+JDE8L3A+PC9ibG9ja3F1b3RlPlwiKX1lbHNle3I9ci5yZXBsYWNlKHQuYnFSRSxcIjxibG9ja3F1b3RlPjxwPiQxPC9wPjxmb290ZXI+JDI8L2Zvb3Rlcj48L2Jsb2NrcXVvdGU+XCIpfX1yPXIucmVwbGFjZSh0Lmg2UkUsXCI8aDY+JDE8L2g2PlwiKTtyPXIucmVwbGFjZSh0Lmg1UkUsXCI8aDU+JDE8L2g1PlwiKTtyPXIucmVwbGFjZSh0Lmg0UkUsXCI8aDQ+JDE8L2g0PlwiKTtyPXIucmVwbGFjZSh0LmgzUkUsXCI8aDM+JDE8L2gzPlwiKTtyPXIucmVwbGFjZSh0LmgyUkUsXCI8aDI+JDE8L2gyPlwiKTtyPXIucmVwbGFjZSh0LmgxUkUsXCI8aDE+JDE8L2gxPlwiKTtyPXIucmVwbGFjZSh0LmhyUkUsXCI8aHIgLz5cIik7cmV0dXJuIHI7ZnVuY3Rpb24gbihlKXtpZihlLnJlcGxhY2UodC5saW5rUkUsXCIkMVwiKSE9PVwiXCIpe2E9JzxhIGhyZWY9XCIkMlwiPiQxPC9hPic7aWYodC5saW5rQmxhbmtSRS50ZXN0KGUpKXthPSc8YSB0YXJnZXQ9X2JsYW5rIGhyZWY9XCIkMlwiPiQxPC9hPid9fWU9ZS5yZXBsYWNlKHQubGlua1JFLGEpO2lmKGUucmVwbGFjZSh0LmxpbmtCYXJlUkUsXCIkMVwiKSE9PVwiXCIpe2E9JzxhIGhyZWY9XCIkMVwiPiQxPC9hPic7aWYodC5saW5rQmxhbmtSRS50ZXN0KGUpKXthPSc8YSB0YXJnZXQ9X2JsYW5rIGhyZWY9XCIkMVwiPiQxPC9hPid9fWU9ZS5yZXBsYWNlKHQubGlua0JhcmVSRSxhKTtyZXR1cm4gZX19fSx7XCIuL3JlZ2V4LmpzXCI6M31dLDM6W2Z1bmN0aW9uKGUscixhKXt2YXIgdD17eW91dHViZVJFOi9eKD86aHR0cHM/OlxcL1xcLyk/KD86d3d3XFwuKT95b3V0dSg/OlxcLmJlfGJlXFwuY29tKVxcLyg/OndhdGNofGVtYmVkXFwvd2F0Y2h8ZW1iZWQpP1tcXD9cXC9dPyg/OnY9fGZlYXR1cmU9cGxheWVyX2VtYmVkZGVkJnY9KT8oW1xcdy1fXSspLio/JC8sdmltZW9SRTovXig/Omh0dHBzPzpcXC9cXC8pPyg/Ond3d1xcLik/dmltZW9cXC5jb21cXC8oPzpjaGFubmVsc1xcLyk/KD86XFx3K1xcLyk/KFxcZCspJC8saW1hZ2VSRTovXig/ISApKC4rP1xcLig/OmpwZ3xqcGVnfGdpZnxwbmd8Ym1wKSkoPzogLXRpdGxlPVwiKC4rPylcIik/KD86XFwoLis/XFwpKT8kLyxpbWFnZUxpbmtSRTovKD86XFwoKC4rPylcXCkpezF9LyxodG1sUkU6L14oKD8hLiooanBnfGpwZWd8Z2lmfHBuZ3xibXApKShodHRwcz86XFwvXFwvKVtcXHdcXC1fXSsoXFwuW1xcd1xcLV9dKykrW1xcd1xcLS4sQD9ePSUmOlxcL35cXFxcKyNdKil8LitcXC4oPyFqcGd8anBlZ3xnaWZ8cG5nfGJtcClodG1sPyQvLGxpbmtSRTovXFxbKD8hLSkoLio/KVxcXSg/OnwtYmxhbmspID9cXCgoLis/KVxcKS9nLGxpbmtCbGFua1JFOi9cXFsoPyEtKSguKj8pXFxdLWJsYW5rID9cXCgoLis/KVxcKS9nLGxpbmtCYXJlUkU6L1xcWyg/IS0pKC4qPylcXF0oPzotYmxhbmspPy9nLGxpbmtCYXJlQmxhbmtSRTovXFxbKD8hLSkoLio/KVxcXSg/Oi1ibGFuaykvZyxvbFJFOi8oPzpcXGRcXC5cXHMoLis/KSBcXHwgPykrL2csb2xsaVJFOi9cXGRcXC5cXHMoLis/KSBcXHwvZyx1bFJFOi8oPzpcXCpcXHMoLis/KSBcXHwgPykrL2csdWxsaVJFOi9cXCpcXHMoLis/KSBcXHwvZyxoNlJFOi9cXHM/I3s2fSAoLis/KSAjezZ9XFxzPy9nLGg1UkU6L1xccz8jezV9ICguKz8pICN7NX1cXHM/L2csaDRSRTovXFxzPyN7NH0gKC4rPykgI3s0fVxccz8vZyxoM1JFOi9cXHM/I3szfSAoLis/KSAjezN9XFxzPy9nLGgyUkU6L1xccz8jezJ9ICguKz8pICN7Mn1cXHM/L2csaDFSRTovXFxzPyMgKC4rPykgI1xccz8vZyxoclJFOi9cXHM/LS0tXFxzPy9nLGJxUkU6L2BgYCguKz8pKD86XFxbLXNvdXJjZTpcXHM/KC4rKVxcXSk/YGBgL2csZFF1b3RSRTovKF58XFxzKD86WyBcXC4sOzpcXGJcXFtdKT8pXFxcXD9cIiguKz8pXFxcXD9cIihbIFxcLiw7OlxcYlxcXV0pPy9nLHNRdW90UkU6LyhefFxccyg/OlsgXFwuLDs6XFxiXFxbXSk/KVxcXFw/JyguKz8pXFxcXD8nKFsgXFwuLDs6XFxiXFxdXSk/L2csdm9sUkU6L1xcYnZvbFxcLlxcc1xcYi9naSxwUkU6L1xcYnBcXC5cXHNcXGIoPz1cXGQrKS9nLGNSRTovXFxiY1xcLlxcc1xcYig/PVxcZCspL2csZmxSRTovXFxiZmxcXC5cXHNcXGIoPz1cXGQrKS9nLGllUkU6L1xcYmlcXC5lXFwuXFxzP1xcYi9nLGVnUkU6L1xcYmVcXC5nXFwuXFxzXFxiL2csYXBvc1JFOi8oW0EtWmEtel0rKScoW2Etel0rKS9nLGVuZGFzaFJFOi8oLis/KVxccy1cXHMoLis/KS9nLGVsaXBzZVJFOi9cXC57M30vZ307ci5leHBvcnRzPXR9LHt9XSw0OltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9ZShcIi4vcmVnZXguanNcIik7dHlwZUlzPWZ1bmN0aW9uKGUpe2lmKHRoaXMueW91dHViZVJFLnRlc3QoZSkpe3JldHVyblwieW91dHViZVwifWVsc2UgaWYodGhpcy52aW1lb1JFLnRlc3QoZSkpe3JldHVyblwidmltZW9cIn1lbHNlIGlmKHRoaXMuaW1hZ2VSRS50ZXN0KGUpKXtyZXR1cm5cImltYWdlXCJ9ZWxzZSBpZih0aGlzLmh0bWxSRS50ZXN0KGUpKXtyZXR1cm5cImxpbmtcIn1lbHNle3JldHVyblwicGFyYWdyYXBoXCJ9fTtyLmV4cG9ydHM9dHlwZUlzfSx7XCIuL3JlZ2V4LmpzXCI6M31dLDU6W2Z1bmN0aW9uKGUscixhKXtyLmV4cG9ydHM9ZnVuY3Rpb24oZSl7ZT1lLnJlcGxhY2UodGhpcy5kUXVvdFJFLFwiJDEmIzgyMjA7JDImIzgyMjE7JDNcIik7ZT1lLnJlcGxhY2UodGhpcy5zUXVvdFJFLFwiJDEmIzgyMTY7JDImIzgyMTc7JDNcIik7ZT1lLnJlcGxhY2UodGhpcy52b2xSRSxcIlZvbC5cIik7ZT1lLnJlcGxhY2UodGhpcy5wUkUsXCJwLlwiKTtlPWUucmVwbGFjZSh0aGlzLmNSRSxcIjxpPmMuPC9pPlwiKTtlPWUucmVwbGFjZSh0aGlzLmZsUkUsXCI8aT5mbC48L2k+XCIpO2U9ZS5yZXBsYWNlKHRoaXMuaWVSRSxcIjxpPmllPC9pPiBcIik7ZT1lLnJlcGxhY2UodGhpcy5lZ1JFLFwiPGk+ZWc8L2k+IFwiKTtlPWUucmVwbGFjZSh0aGlzLmFwb3NSRSxcIiQxJiM4MjE3OyQyXCIpO2U9ZS5yZXBsYWNlKHRoaXMuZW5kYXNoUkUsXCIkMSYjODIxMTskMlwiKTtlPWUucmVwbGFjZSh0aGlzLmVsaXBzZVJFLFwiJiM4MjMwO1wiKTtyZXR1cm4gZX19LHt9XX0se30sWzFdKSgxKX0pO1xuIl19
