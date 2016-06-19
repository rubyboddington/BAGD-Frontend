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
			var header = "<ul>";

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
window.router = require("./routes.js");
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

		// Typography because that's what we do
		magic.typography(el, ["bio", "hero_caption", "caption_1", "caption_2"]);

		// Get video thumbnails
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

		// Obfuscate email addresses
		el.set("email", magic.encodeEmail(el.get("email")));
	});

	// Render the home page
	var questions_display = $("#questions").html();
	$("#page-content #main .content").html(questions_display);

	window.students_list = new collectionView({collection: students_data});
	$("#page-content #names-nav .nav-content").html(students_list.render().$el);
	$("#page-content #name-list").append($("#page-content #missing-names").html());

	// Now you can be ready, everything's loaded in and displayed!
	$.holdReady(false);
	window.routes = new router();
	Backbone.history.start();
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

magic.encodeEmail = function(email) {
	var regEmail = email;
	var codeEmail = "";

	var regLength = regEmail.length;
	for (i = 0; i < regLength; i++) {
		var charNum = "000";
		var curChar = regEmail.charAt(i);

		switch (i){
			case "A":
				charNum = "065";
				break;
			case "a":
				charNum = "097";
				break;
			case "B":
				charNum = "066";
				break;
			case "b":
				charNum = "098";
				break;
			case "C":
				charNum = "067";
				break;
			case "c":
				charNum = "099";
				break;
			case "D":
				charNum = "068";
				break;
			case "d":
				charNum = "100";
				break;
			case "E":
				charNum = "069";
				break;
			case "e":
				charNum = "101";
				break;
			case "F":
				charNum = "070";
				break;
			case "f":
				charNum = "102";
				break;
			case "G":
				charNum = "071";
				break;
			case "g":
				charNum = "103";
				break;
			case "H":
				charNum = "072";
				break;
			case "h":
				charNum = "104";
				break;
			case "I":
				charNum = "073";
				break;
			case "i":
				charNum = "105";
				break;
			case "J":
				charNum = "074";
				break;
			case "j":
				charNum = "106";
				break;
			case "K":
				charNum = "075";
				break;
			case "k":
				charNum = "107";
				break;
			case "L":
				charNum = "076";
				break;
			case "l":
				charNum = "108";
				break;
			case "M":
				charNum = "077";
				break;
			case "m":
				charNum = "109";
				break;
			case "N":
				charNum = "078";
				break;
			case "n":
				charNum = "110";
				break;
			case "O":
				charNum = "079";
				break;
			case "o":
				charNum = "111";
				break;
			case "P":
				charNum = "080";
				break;
			case "p":
				charNum = "112";
				break;
			case "Q":
				charNum = "081";
				break;
			case "q":
				charNum = "113";
				break;
			case "R":
				charNum = "082";
				break;
			case "r":
				charNum = "114";
				break;
			case "S":
				charNum = "083";
				break;
			case "s":
				charNum = "115";
				break;
			case "T":
				charNum = "084";
				break;
			case "t":
				charNum = "116";
				break;
			case "U":
				charNum = "085";
				break;
			case "u":
				charNum = "117";
				break;
			case "V":
				charNum = "086";
				break;
			case "v":
				charNum = "118";
				break;
			case "W":
				charNum = "087";
				break;
			case "w":
				charNum = "119";
				break;
			case "X":
				charNum = "088";
				break;
			case "x":
				charNum = "120";
				break;
			case "Y":
				charNum = "089";
				break;
			case "y":
				charNum = "121";
				break;
			case "Z":
				charNum = "090";
				break;
			case "z":
				charNum = "122";
				break;
			case "0":
				charNum = "048";
				break;
			case "1":
				charNum = "049";
				break;
			case "2":
				charNum = "050";
				break;
			case "3":
				charNum = "051";
				break;
			case "4":
				charNum = "052";
				break;
			case "5":
				charNum = "053";
				break;
			case "6":
				charNum = "054";
				break;
			case "7":
				charNum = "055";
				break;
			case "8":
				charNum = "056";
				break;
			case "9":
				charNum = "057";
				break;
			case "&":
				charNum = "038";
				break;
			case " ":
				charNum = "032";
				break;
			case "_":
				charNum = "095";
				break;
			case "-":
				charNum = "045";
				break;
			case "@":
				charNum = "064";
				break;
			case ".":
				charNum = "046";
				break;
		}

		if (charNum == "000") {
			codeEmail += curChar;
		}else{
			codeEmail += "&#" + charNum + ";";
		}
	}
	return codeEmail;
};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./collection.js":1,"./collectionView.js":2,"./galleryView.js":4,"./routes.js":6,"./searchView.js":7,"./singleView.js":8,"smark":9}],4:[function(require,module,exports){
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

var router = Backbone.Router.extend({
	routes: {
		"": "home",
		"press": "press",
		"about": "about",
		"visit": "visit",
		"showcase": "showcase",
		"map": "map",
		":name": "studentName"
	},

	home: function(){
		$("#page-content header #main-header #home").trigger("click");
	},

	press: function(){
		$("#page-content header #main-header #press").trigger("click");
	},

	about: function(){
		$("#page-content header #main-header #show").trigger("click");
	},

	visit: function(){
		$("#page-content header #main-header #visit").trigger("click");
	},

	showcase: function(){
		$("#page-content header #names-header #showcase").trigger('click');
	},

	map: function(){
		$("#page-content header #names-header #map").trigger("click");
	},

	studentName: function(name){
		var matchedData = students_data.find(function(student){
			var link = student.get("name").replace(/\s/g, "").toLowerCase();
			return link == name.toLowerCase();
		});

		enterSearchMode(false);
		fullOverlay(false);

		var buffer = $("#page-content #names-nav .nav-content").html();
		resetNameList(students_data);
		$("#page-content #names-nav #name-list li a#" + matchedData.cid).trigger('click');
		$("#page-content #names-nav .nav-content").html(buffer);
		rebindEvents();
	}
});

module.exports = router;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
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
		this.$el.html(nameTemplate);
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
(function (global){
/* @license smark.js written by Kenneth Lim <limzy.kenneth@gmail.com> (http://designerken.be)
   License under the BSD 2-Clause License */
(function(e){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=e()}else if(typeof define==="function"&&define.amd){define([],e)}else{var r;if(typeof window!=="undefined"){r=window}else if(typeof global!=="undefined"){r=global}else if(typeof self!=="undefined"){r=self}else{r=this}r.smark=e()}})(function(){var e,r,a;return function t(e,r,a){function i(s,p){if(!r[s]){if(!e[s]){var o=typeof require=="function"&&require;if(!p&&o)return o(s,!0);if(l)return l(s,!0);var n=new Error("Cannot find module '"+s+"'");throw n.code="MODULE_NOT_FOUND",n}var h=r[s]={exports:{}};e[s][0].call(h.exports,function(r){var a=e[s][1][r];return i(a?a:r)},h,h.exports,t,e,r,a)}return r[s].exports}var l=typeof require=="function"&&require;for(var s=0;s<a.length;s++)i(a[s]);return i}({1:[function(e,r,a){var t=e("./regex.js");t.typeIs=e("./typeIs.js");t.typographicChanges=e("./typography.js");t.parseParagraph=e("./paragraph.js");t.generate=function(e,r){var a="";var i={type:"auto",typography:true};for(var l in r){for(var s in i){if(l==s){i[s]=r[l]}}}var p=i.type;var o=i.typography;if(p=="auto"){if(this.typeIs(e)=="youtube"){p="youtube"}else if(this.typeIs(e)=="vimeo"){p="vimeo"}else if(this.typeIs(e)=="image"){p="image"}else if(this.typeIs(e)=="link"){p="link"}else if(this.typeIs(e)=="paragraph"){p="paragraph"}}else{p=i.type}a=n(e,p);return{html:a,type:p};function n(e,r){var a;var i=t;switch(r){case"youtube":e=e.replace(i.youtubeRE,"$1");a='<iframe class="smark youtube" src="https://www.youtube.com/embed/'+e+'" frameborder="0" width="853" height="480" allowfullscreen></iframe>';break;case"vimeo":e=e.replace(i.vimeoRE,"$1");a='<iframe class="smark vimeo" src="https://player.vimeo.com/video/'+e+'" frameborder="0" width="853" height="480" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';break;case"image":var l=e.replace(i.imageRE,"$1");var s=e.replace(i.imageRE,"$2");if(o){s=i.typographicChanges(s)}a='<img class="smark image" title="'+s+'" src="'+l+'">';if(i.imageLinkRE.test(e)){var p=i.imageLinkRE.exec(e)[0];p=p.substring(1,p.length-1);a='<a href="'+p+'" target=_blank>'+a+"</a>"}break;case"link":e=e.match(i.htmlRE)[0];a='<iframe class="smark website" src="'+e+'" width="853" height="480" frameborder="0"></iframe>';break;case"paragraph":e=i.parseParagraph(o,e);a='<p class="smark paragraph">'+e+"</p>";break;default:a=""}return a}};r.exports=t},{"./paragraph.js":2,"./regex.js":3,"./typeIs.js":4,"./typography.js":5}],2:[function(e,r,a){var t=e("./regex.js");r.exports=function(e,r){if(e){r=this.typographicChanges(r)}var a="";r=n(r);var i=r.match(t.olRE);if(i!==null){for(var l=0;l<i.length;l++){var s=i[l].match(t.olliRE);a="<ol>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.olliRE,"$1")+"</li>"}a+="</ol>";r=r.replace(i[l],a)}}var o=r.match(t.ulRE);if(o!==null){for(var l=0;l<o.length;l++){var s=o[l].match(t.ulliRE);a="<ul>";for(var p=0;p<s.length;p++){a+="<li>"+s[p].replace(t.ulliRE,"$1")+"</li>"}a+="</ul>";r=r.replace(o[l],a)}}if(t.bqRE.test(r)){if(r.replace(t.bqRE,"$2")===""){r=r.replace(t.bqRE,"<blockquote><p>$1</p></blockquote>")}else{r=r.replace(t.bqRE,"<blockquote><p>$1</p><footer>$2</footer></blockquote>")}}r=r.replace(t.h6RE,"<h6>$1</h6>");r=r.replace(t.h5RE,"<h5>$1</h5>");r=r.replace(t.h4RE,"<h4>$1</h4>");r=r.replace(t.h3RE,"<h3>$1</h3>");r=r.replace(t.h2RE,"<h2>$1</h2>");r=r.replace(t.h1RE,"<h1>$1</h1>");r=r.replace(t.hrRE,"<hr />");return r;function n(e){if(e.replace(t.linkRE,"$1")!==""){a='<a href="$2">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$2">$1</a>'}}e=e.replace(t.linkRE,a);if(e.replace(t.linkBareRE,"$1")!==""){a='<a href="$1">$1</a>';if(t.linkBlankRE.test(e)){a='<a target=_blank href="$1">$1</a>'}}e=e.replace(t.linkBareRE,a);return e}}},{"./regex.js":3}],3:[function(e,r,a){var t={youtubeRE:/^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be|be\.com)\/(?:watch|embed\/watch|embed)?[\?\/]?(?:v=|feature=player_embedded&v=)?([\w-_]+).*?$/,vimeoRE:/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/)?(?:\w+\/)?(\d+)$/,imageRE:/^(?! )(.+?\.(?:jpg|jpeg|gif|png|bmp))(?: -title="(.+?)")?(?:\(.+?\))?$/,imageLinkRE:/(?:\((.+?)\)){1}/,htmlRE:/^((?!.*(jpg|jpeg|gif|png|bmp))(https?:\/\/)[\w\-_]+(\.[\w\-_]+)+[\w\-.,@?^=%&:\/~\\+#]*)|.+\.(?!jpg|jpeg|gif|png|bmp)html?$/,linkRE:/\[(?!-)(.*?)\](?:|-blank) ?\((.+?)\)/g,linkBlankRE:/\[(?!-)(.*?)\]-blank ?\((.+?)\)/g,linkBareRE:/\[(?!-)(.*?)\](?:-blank)?/g,linkBareBlankRE:/\[(?!-)(.*?)\](?:-blank)/g,olRE:/(?:\d\.\s(.+?) \| ?)+/g,olliRE:/\d\.\s(.+?) \|/g,ulRE:/(?:\*\s(.+?) \| ?)+/g,ulliRE:/\*\s(.+?) \|/g,h6RE:/\s?#{6} (.+?) #{6}\s?/g,h5RE:/\s?#{5} (.+?) #{5}\s?/g,h4RE:/\s?#{4} (.+?) #{4}\s?/g,h3RE:/\s?#{3} (.+?) #{3}\s?/g,h2RE:/\s?#{2} (.+?) #{2}\s?/g,h1RE:/\s?# (.+?) #\s?/g,hrRE:/\s?---\s?/g,bqRE:/```(.+?)(?:\[-source:\s?(.+)\])?```/g,dQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?"(.+?)\\?"([ \.,;:\b\]])?/g,sQuotRE:/(^|\s(?:[ \.,;:\b\[])?)\\?'(.+?)\\?'([ \.,;:\b\]])?/g,volRE:/\bvol\.\s\b/gi,pRE:/\bp\.\s\b(?=\d+)/g,cRE:/\bc\.\s\b(?=\d+)/g,flRE:/\bfl\.\s\b(?=\d+)/g,ieRE:/\bi\.e\.\s?\b/g,egRE:/\be\.g\.\s\b/g,aposRE:/([A-Za-z]+)'([a-z]+)/g,endashRE:/(.+?)\s-\s(.+?)/g,elipseRE:/\.{3}/g};r.exports=t},{}],4:[function(e,r,a){var t=e("./regex.js");typeIs=function(e){if(this.youtubeRE.test(e)){return"youtube"}else if(this.vimeoRE.test(e)){return"vimeo"}else if(this.imageRE.test(e)){return"image"}else if(this.htmlRE.test(e)){return"link"}else{return"paragraph"}};r.exports=typeIs},{"./regex.js":3}],5:[function(e,r,a){r.exports=function(e){e=e.replace(this.dQuotRE,"$1&#8220;$2&#8221;$3");e=e.replace(this.sQuotRE,"$1&#8216;$2&#8217;$3");e=e.replace(this.volRE,"Vol.");e=e.replace(this.pRE,"p.");e=e.replace(this.cRE,"<i>c.</i>");e=e.replace(this.flRE,"<i>fl.</i>");e=e.replace(this.ieRE,"<i>ie</i> ");e=e.replace(this.egRE,"<i>eg</i> ");e=e.replace(this.aposRE,"$1&#8217;$2");e=e.replace(this.endashRE,"$1&#8211;$2");e=e.replace(this.elipseRE,"&#8230;");return e}},{}]},{},[1])(1)});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY29sbGVjdGlvblZpZXcuanMiLCJqYXZhc2NyaXB0cy9jdXN0b20uanMiLCJqYXZhc2NyaXB0cy9nYWxsZXJ5Vmlldy5qcyIsImphdmFzY3JpcHRzL21vZGVscy5qcyIsImphdmFzY3JpcHRzL3JvdXRlcy5qcyIsImphdmFzY3JpcHRzL3NlYXJjaFZpZXcuanMiLCJqYXZhc2NyaXB0cy9zaW5nbGVWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3NtYXJrL3NtYXJrLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcbnZhciBtb2RlbCA9IHJlcXVpcmUoXCIuL21vZGVscy5qc1wiKTtcblxuLy8gVGhlIGNvbGxlY3Rpb25zIG9mIGRhdGEgdGhhdCB3ZSBpbXBvcnQgaW4gZnJvbSB0aGUgd29yZHByZXNzIHNlcnZlci5cbnZhciBjb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuXHRtb2RlbDogbW9kZWwsXG5cdHVybDogXCJodHRwOi8vaW5mby5jc21ncmFwaGljZGVzaWduLmNvbS93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mbz9maWx0ZXJbcG9zdHNfcGVyX3BhZ2VdPS0xXCIsXG5cdC8vIHVybDogXCJodHRwOi8vbG9jYWxob3N0L3dvcmRwcmVzcy93cC1qc29uL3dwL3YyL3N0dWRlbnRfaW5mb1wiLFxuXHQvLyB1cmw6IFwiLi9yZXNwb25zZS5qc29uXCIsXG5cblx0Y29tcGFyYXRvcjogXCJuYW1lXCJcbn0pO1xuXG5zdHVkZW50c19kYXRhID0gbmV3IGNvbGxlY3Rpb24oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdHVkZW50c19kYXRhO1xuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgcmVuZGVycyBhIGNvbGxlY3Rpb24gb2YgZGF0YVxuLy8gaWUuIGEgY29sbGVjdGlvbiBvZiBzdHVkZW50cyBpbmZvIGZvciBuYXZpZ2F0aW9uIG9yIHNvbWV0aGluZyBlbHNlLlxuXG4vLyBDcmVhdGUgb25lIGVsZW1lbnQgYXQgYSB0aW1lXG52YXIgaW5kaXZpZHVhbCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJsaVwiLFxuXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCQoXCIjbmFtZS1saXN0LWl0ZW1cIikuaHRtbCgpKSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG1vZGVsVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdHRoaXMuJGVsLmh0bWwobW9kZWxUZW1wbGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG4vLyBQbGFjaW5nIHRoZSBlbGVtZW50cyBjcmVhdGVkIGFib3ZlIGludG8gdGhlIGNvbGxlY3Rpb24gdmlldyByZW5kZXJlci5cbm1vZHVsZS5leHBvcnRzID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcImRpdlwiLFxuXHRpZDogXCJuYW1lLWxpc3RcIixcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIHdob2xlTGlzdCA9IFwiXCI7XG5cdFx0dmFyIGdyb3VwZWRMaXN0ID0gdGhpcy5jb2xsZWN0aW9uLmdyb3VwQnkoZnVuY3Rpb24oZWwpe1xuXHRcdFx0dmFyIGZpcnN0Q2hhciA9IGVsLmdldChcIm5hbWVcIikuY2hhckF0KDApO1xuXHRcdFx0cmV0dXJuIGZpcnN0Q2hhcjtcblx0XHR9LCB0aGlzKTtcblxuXHRcdF8uZWFjaChncm91cGVkTGlzdCwgZnVuY3Rpb24oZWwsIGtleSl7XG5cdFx0XHR2YXIgaGVhZGVyID0gXCI8dWw+XCI7XG5cblx0XHRcdHdob2xlTGlzdCArPSBoZWFkZXI7XG5cblx0XHRcdF8uZWFjaChlbCwgZnVuY3Rpb24oZWwsIGkpe1xuXHRcdFx0XHR3aG9sZUxpc3QgKz0gdGhpcy5hZGRNb2RlbChlbCk7XG5cdFx0XHR9LCB0aGlzKTtcblxuXHRcdFx0d2hvbGVMaXN0ICs9IFwiPC91bD5cIjtcblx0XHR9LCB0aGlzKTtcblxuXHRcdHRoaXMuJGVsLmh0bWwod2hvbGVMaXN0KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGFkZE1vZGVsOiBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIG1vZGVsVmlldyA9IG5ldyBpbmRpdmlkdWFsKHttb2RlbDogbW9kZWx9KTtcblx0XHRyZXR1cm4gbW9kZWxWaWV3LnJlbmRlcigpLiRlbC5odG1sKCk7XG5cdH1cbn0pOyIsIi8vIEJ1bmNoIG9mIGltcG9ydHNcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbndpbmRvdy5zbWFyayA9IHJlcXVpcmUoXCJzbWFya1wiKTtcbkJhY2tib25lLiQgPSAkO1xud2luZG93LnN0dWRlbnRzX2RhdGEgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uLmpzXCIpO1xud2luZG93LnNpbmdsZVZpZXcgPSByZXF1aXJlKFwiLi9zaW5nbGVWaWV3LmpzXCIpO1xud2luZG93LmNvbGxlY3Rpb25WaWV3ID0gcmVxdWlyZShcIi4vY29sbGVjdGlvblZpZXcuanNcIik7XG53aW5kb3cuZ2FsbGVyeVZpZXcgPSByZXF1aXJlKFwiLi9nYWxsZXJ5Vmlldy5qc1wiKTtcbndpbmRvdy5zZWFyY2hWaWV3ID0gcmVxdWlyZShcIi4vc2VhcmNoVmlldy5qc1wiKTtcbndpbmRvdy5yb3V0ZXIgPSByZXF1aXJlKFwiLi9yb3V0ZXMuanNcIik7XG52YXIgbWFnaWMgPSBtYWdpYyB8fCB7fTtcblxuLy8gSG9sZCB0aGF0IHJlYWR5LCBtYWdpYyBuZWVkcyB0byBoYXBwZW4gZmlyc3QhXG4kLmhvbGRSZWFkeSh0cnVlKTtcbiQoXCIjcGFnZS1jb250ZW50XCIpLmNzcygnZGlzcGxheScsICdub25lJyk7XG5cbi8vIEFueXRoaW5nIHRoYXQgbmVlZHMgZG9pbmcgYmVmb3JlIGRhdGEgaXMgbG9hZGVkIHNob3VsZCBnbyBoZXJlLlxudmFyIHJlY2VpdmVkRGF0YSA9IG5ldyBFdmVudChcInJlY2VpdmVkRGF0YVwiKTtcblxuLy8gRmV0Y2ggZGF0YSBmcm9tIHRoZSBiYWNrZW5kLlxuc3R1ZGVudHNfZGF0YS5mZXRjaCh7XG5cdC8vIERpc3BhdGNoIHRoZSByZWNlaXZlZCBkYXRhIGV2ZW50IGFmdGVyIHRoZSBkYXRhIGlzIHN1Y2Nlc2Z1bGx5IGxvYWRlZC5cblx0c3VjY2VzczogZnVuY3Rpb24oKXtcblx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChyZWNlaXZlZERhdGEpO1xuXHR9XG59KTtcblxuXG4vLyBUaGUgcGFnZSBsb2dpYyBzaG91bGQgZ28gaW4gdGhpcyBjYWxsYmFjayBmdW5jdGlvbiAocmVuZGVyaW5nIGV0Yy4pXG4vLyBUcmVhdCB0aGlzIGFzIHRoZSByZWd1bGFyIGRvY3VtZW50LnJlYWR5IHRoaW5nIHVubGVzcyB0aGVyZSBhcmUgc3R1ZmYgdG8gYmVcbi8vIGRvbmUgYmVmb3JlIGxvYWRpbmcgaW4gdGhlIGRhdGEuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlY2VpdmVkRGF0YVwiLCBmdW5jdGlvbigpe1xuXHQvLyBzdHVkZW50c19kYXRhIGlzIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuXHRjb25zb2xlLmxvZyhzdHVkZW50c19kYXRhLm1vZGVscyk7XG5cdC8vIE1ha2UgdGhlbSBkYXRhIHByZXR0eSFcblx0c3R1ZGVudHNfZGF0YS5lYWNoKGZ1bmN0aW9uKGVsLCBpKXtcblx0XHQvLyBWYWxpZGF0ZSBhbmQgZml4IHdlYnNpdGUgYWRkcmVzc2VzXG5cdFx0bWFnaWMudmFsaWRhdGVXZWJBZGRyZXNzKGVsLCBbXG5cdFx0XHRcImxpbmtfdG9fcGVyc29uYWxfd2Vic2l0ZVwiLFxuXHRcdFx0XCJ5b3V0dWJlXCIsXG5cdFx0XHRcInZpbWVvXCIsXG5cdFx0XHRcImhlcm9fdmlkZW9cIixcblx0XHRcdFwidmlkZW9fMVwiLFxuXHRcdFx0XCJ2aWRlb18yXCJcblx0XHRdKTtcblxuXHRcdC8vIENvbnZlcnQgc3R1ZGVudCBJRCB0byB1cHBlciBjYXNlXG5cdFx0ZWwuc2V0KFwic3R1ZGVudF9udW1iZXJcIiwgZWwuZ2V0KFwic3R1ZGVudF9udW1iZXJcIikudG9VcHBlckNhc2UoKSk7XG5cblx0XHQvLyBUcmltIHRhZ3MgdG8gNyBpdGVtcyBvbmx5XG5cdFx0aWYgKGVsLmdldChcInRhZ3NcIikgIT09IG51bGwpe1xuXHRcdFx0aWYgKGVsLmdldChcInRhZ3NcIikubGVuZ3RoID4gNyl7XG5cdFx0XHRcdGVsLmdldChcInRhZ3NcIikuc3BsaWNlKDcpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFR5cG9ncmFwaHkgYmVjYXVzZSB0aGF0J3Mgd2hhdCB3ZSBkb1xuXHRcdG1hZ2ljLnR5cG9ncmFwaHkoZWwsIFtcImJpb1wiLCBcImhlcm9fY2FwdGlvblwiLCBcImNhcHRpb25fMVwiLCBcImNhcHRpb25fMlwiXSk7XG5cblx0XHQvLyBHZXQgdmlkZW8gdGh1bWJuYWlsc1xuXHRcdHZhciBhdmFpbGFibGVWaWRlb3MgPSBbXTtcblx0XHRpZiAoZWwuZ2V0KFwiaGVyb19pbWFnZV92aWRlb1wiKSA9PSBcIlZpZGVvXCIpe1xuXHRcdFx0YXZhaWxhYmxlVmlkZW9zLnB1c2goXCJoZXJvX3ZpZGVvXCIpO1xuXHRcdH1cblx0XHRpZiAoZWwuZ2V0KFwiaW1hZ2VfdmlkZW9fMVwiKSA9PSBcIlZpZGVvXCIpe1xuXHRcdFx0YXZhaWxhYmxlVmlkZW9zLnB1c2goXCJ2aWRlb18xXCIpO1xuXHRcdH1cblx0XHRpZiAoZWwuZ2V0KFwiaW1hZ2VfdmlkZW9fMlwiKSA9PSBcIlZpZGVvXCIpe1xuXHRcdFx0YXZhaWxhYmxlVmlkZW9zLnB1c2goXCJ2aWRlb18yXCIpO1xuXHRcdH1cblx0XHRpZighKF8uaXNFbXB0eShhdmFpbGFibGVWaWRlb3MpKSl7XG5cdFx0XHRtYWdpYy5nZXRWaWRlb0ltYWdlKGVsLCBhdmFpbGFibGVWaWRlb3MpO1xuXHRcdH1cblxuXHRcdC8vIE9iZnVzY2F0ZSBlbWFpbCBhZGRyZXNzZXNcblx0XHRlbC5zZXQoXCJlbWFpbFwiLCBtYWdpYy5lbmNvZGVFbWFpbChlbC5nZXQoXCJlbWFpbFwiKSkpO1xuXHR9KTtcblxuXHQvLyBSZW5kZXIgdGhlIGhvbWUgcGFnZVxuXHR2YXIgcXVlc3Rpb25zX2Rpc3BsYXkgPSAkKFwiI3F1ZXN0aW9uc1wiKS5odG1sKCk7XG5cdCQoXCIjcGFnZS1jb250ZW50ICNtYWluIC5jb250ZW50XCIpLmh0bWwocXVlc3Rpb25zX2Rpc3BsYXkpO1xuXG5cdHdpbmRvdy5zdHVkZW50c19saXN0ID0gbmV3IGNvbGxlY3Rpb25WaWV3KHtjb2xsZWN0aW9uOiBzdHVkZW50c19kYXRhfSk7XG5cdCQoXCIjcGFnZS1jb250ZW50ICNuYW1lcy1uYXYgLm5hdi1jb250ZW50XCIpLmh0bWwoc3R1ZGVudHNfbGlzdC5yZW5kZXIoKS4kZWwpO1xuXHQkKFwiI3BhZ2UtY29udGVudCAjbmFtZS1saXN0XCIpLmFwcGVuZCgkKFwiI3BhZ2UtY29udGVudCAjbWlzc2luZy1uYW1lc1wiKS5odG1sKCkpO1xuXG5cdC8vIE5vdyB5b3UgY2FuIGJlIHJlYWR5LCBldmVyeXRoaW5nJ3MgbG9hZGVkIGluIGFuZCBkaXNwbGF5ZWQhXG5cdCQuaG9sZFJlYWR5KGZhbHNlKTtcblx0d2luZG93LnJvdXRlcyA9IG5ldyByb3V0ZXIoKTtcblx0QmFja2JvbmUuaGlzdG9yeS5zdGFydCgpO1xuXHQkKFwiI3BhZ2UtY29udGVudFwiKS5jc3MoXCJkaXNwbGF5XCIsIFwiaW5saW5lXCIpO1xuXHQkKFwiI2xvYWRpbmdcIikuY3NzKFwib3BhY2l0eVwiLCBcIjBcIik7XG5cdHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblx0XHQkKFwiI2xvYWRpbmdcIikuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XG5cdH0sIDUwMCk7XG5cdC8vIEFmdGVyIHRoaXMgcG9pbnQgeW91IHNob3VsZCB0aGVuIGJpbmQgZXZlbnRzLCBhbmltYXRpb25zLCBldGMuXG5cdC8vICh3aGljaCB3aWxsIGhhcHBlbiBpbiBzY3JpcHQuanMgaW4gZG9jdW1lbnQucmVhZHkpXG59KTtcblxuXG4vLyBTb21lIG1hZ2ljIGZ1bmN0aW9uc1xubWFnaWMudmFsaWRhdGVXZWJBZGRyZXNzID0gZnVuY3Rpb24oZWwsIG5hbWVzKXtcblx0dmFyIHN0YXJ0ID0gL15odHRwcz86XFwvXFwvL2dpO1xuXG5cdF8uZWFjaChuYW1lcywgZnVuY3Rpb24obmFtZSwgaSkge1xuXHRcdGlmIChlbC5nZXQobmFtZSkgIT09IFwiXCIgJiYgdHlwZW9mIGVsLmdldChuYW1lKSAhPSBcInVuZGVmaW5lZFwiKXtcblx0XHRcdC8vIEFkZCBodHRwOi8vIHByZWZpeCBpZiBpdCBkb2Vzbid0IGFscmVhZHkgaGF2ZSBpdCxcblx0XHRcdC8vIHJlcXVpcmVkIHRvIG1ha2Ugc3VyZSBsaW5rcyBhcmUgYWJzb2x1dGVcblx0XHRcdGlmIChlbC5nZXQobmFtZSkuc2VhcmNoKHN0YXJ0KSA9PSAtMSl7XG5cdFx0XHRcdHZhciBvbGQgPSBlbC5nZXQobmFtZSk7XG5cdFx0XHRcdGVsLnNldChuYW1lLCBcImh0dHA6Ly9cIiArIG9sZCk7XG5cdFx0XHR9XG5cdFx0fWVsc2V7XG5cdFx0XHQvLyBVc2VyIGRpZCBub3QgcHJvdmlkZSBsaW5rIHRvIHdlYnNpdGVcblx0XHR9XG5cdH0pO1xufTtcblxubWFnaWMudHlwb2dyYXBoeSA9IGZ1bmN0aW9uKGVsLCBmaWVsZHMpe1xuXHRfLmVhY2goZmllbGRzLCBmdW5jdGlvbihmaWVsZCwgaSl7XG5cdFx0aWYgKGVsLmdldChmaWVsZCkpe1xuXHRcdFx0ZWwuc2V0KGZpZWxkLCBzbWFyay50eXBvZ3JhcGhpY0NoYW5nZXMoZWwuZ2V0KGZpZWxkKSkudHJpbSgpKTtcblx0XHR9XG5cdH0pO1xufTtcblxubWFnaWMuZ2V0VmlkZW9JbWFnZSA9IGZ1bmN0aW9uKGVsLCBmaWVsZHMpe1xuXHRfLmVhY2goZmllbGRzLCBmdW5jdGlvbihmaWVsZCwgaSl7XG5cdFx0aWYoZWwuZ2V0KGZpZWxkKSAhPT0gXCJcIil7XG5cdFx0XHR2YXIgdmlkSUQ7XG5cdFx0XHRpZihzbWFyay50eXBlSXMoZWwuZ2V0KGZpZWxkKSkgPT0gXCJ5b3V0dWJlXCIpe1xuXHRcdFx0XHR2aWRJRCA9IGVsLmdldChmaWVsZCkucmVwbGFjZShzbWFyay55b3V0dWJlUkUsIFwiJDFcIik7XG5cdFx0XHRcdHZhciBpbWFnZUxpbmsgPSBcImh0dHA6Ly9pMy55dGltZy5jb20vdmkvXCIgKyB2aWRJRCArIFwiL3NkZGVmYXVsdC5qcGdcIjtcblx0XHRcdFx0ZWwuc2V0KGZpZWxkICsgXCJfaW1hZ2VcIiwgaW1hZ2VMaW5rKTtcblxuXHRcdFx0fWVsc2UgaWYoc21hcmsudHlwZUlzKGVsLmdldChmaWVsZCkpID09IFwidmltZW9cIil7XG5cdFx0XHRcdHZpZElEID0gZWwuZ2V0KGZpZWxkKS5yZXBsYWNlKHNtYXJrLnZpbWVvUkUsIFwiJDFcIik7XG5cdFx0XHRcdG1hZ2ljLnZpbWVvTG9hZGluZ1RodW1iKHZpZElELCBmdW5jdGlvbihpbWFnZUxpbmspe1xuXHRcdFx0XHRcdGVsLnNldChmaWVsZCArIFwiX2ltYWdlXCIsIGltYWdlTGluayk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGVsLmdldChcIm5hbWVcIiksIGVsLmdldChmaWVsZCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy52aW1lb0xvYWRpbmdUaHVtYiA9IGZ1bmN0aW9uKGlkLCBjYWxsYmFjayl7XG5cdHZhciB1cmwgPSBcImh0dHBzOi8vdmltZW8uY29tL2FwaS9vZW1iZWQuanNvbj91cmw9aHR0cHMlM0EvL3ZpbWVvLmNvbS9cIiArIGlkO1xuXHQkLmFqYXgoe1xuXHRcdHVybDogdXJsLFxuXHRcdGRhdGFUeXBlOiBcImpzb25cIlxuXHR9KS5kb25lKGZ1bmN0aW9uKGRhdGEpe1xuXHRcdHZhciByZXR1cm5JbWFnZSA9IGRhdGEudGh1bWJuYWlsX3VybDtcblx0XHRyZXR1cm5JbWFnZSA9IHJldHVybkltYWdlLnJlcGxhY2UoLyguKj9fKVxcZCs/KFxcLmpwZykvLCBcIiQxNjQwJDJcIik7XG5cdFx0Y2FsbGJhY2socmV0dXJuSW1hZ2UpO1xuXHR9KTtcbn07XG5cbm1hZ2ljLmVuY29kZUVtYWlsID0gZnVuY3Rpb24oZW1haWwpIHtcblx0dmFyIHJlZ0VtYWlsID0gZW1haWw7XG5cdHZhciBjb2RlRW1haWwgPSBcIlwiO1xuXG5cdHZhciByZWdMZW5ndGggPSByZWdFbWFpbC5sZW5ndGg7XG5cdGZvciAoaSA9IDA7IGkgPCByZWdMZW5ndGg7IGkrKykge1xuXHRcdHZhciBjaGFyTnVtID0gXCIwMDBcIjtcblx0XHR2YXIgY3VyQ2hhciA9IHJlZ0VtYWlsLmNoYXJBdChpKTtcblxuXHRcdHN3aXRjaCAoaSl7XG5cdFx0XHRjYXNlIFwiQVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNjVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwOTdcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNjZcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwOThcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQ1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNjdcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiY1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwOTlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNjhcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiZFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDBcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNjlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiZVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzBcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiZlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiR1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiZ1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDNcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiSFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiaFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiSVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzNcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiaVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiSlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwialwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDZcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiS1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwia1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDdcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzZcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwibFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDhcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzdcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwibVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMDlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzhcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiblwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTBcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiT1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNzlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwib1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiUFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODBcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwicFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiUVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwicVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTNcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiUlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiclwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODNcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwic1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiVFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwidFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTZcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiVVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwidVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTdcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiVlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODZcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwidlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMThcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiV1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODdcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwid1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMTlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiWFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODhcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwieFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMjBcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiWVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwODlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwieVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMjFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiWlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwOTBcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwielwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIxMjJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiMFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNDhcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiMVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNDlcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiMlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTBcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiM1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTFcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiNFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiNVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTNcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiNlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiN1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiOFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTZcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiOVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNTdcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiJlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwMzhcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiIFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwMzJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiX1wiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwOTVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiLVwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNDVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQFwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNjRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiLlwiOlxuXHRcdFx0XHRjaGFyTnVtID0gXCIwNDZcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0aWYgKGNoYXJOdW0gPT0gXCIwMDBcIikge1xuXHRcdFx0Y29kZUVtYWlsICs9IGN1ckNoYXI7XG5cdFx0fWVsc2V7XG5cdFx0XHRjb2RlRW1haWwgKz0gXCImI1wiICsgY2hhck51bSArIFwiO1wiO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gY29kZUVtYWlsO1xufTtcblxuIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgcmVuZGVycyBhIGdhbGxlcnkgb2YgaW1hZ2VzXG5cbnZhciBpbWFnZVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCQoXCIjc2luZ2xlSW1hZ2VcIikuaHRtbCgpKSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0aWYgKHRoaXMubW9kZWwuZ2V0KFwiaGVyb19pbWFnZV9tZWRpdW1cIikgfHwgdGhpcy5tb2RlbC5nZXQoXCJoZXJvX3ZpZGVvX2ltYWdlXCIpKXtcblx0XHRcdHZhciBpbWFnZVRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsLnRvSlNPTigpKTtcblx0XHRcdHRoaXMuJGVsLmh0bWwoaW1hZ2VUZW1wbGF0ZSk7XG5cdFx0fWVsc2V7XG5cdFx0XHR0aGlzLiRlbC5odG1sKFwiXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbnZhciBnYWxsZXJ5VmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJhcnRpY2xlXCIsXG5cdGNsYXNzTmFtZTogXCJnYWxsZXJ5XCIsXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29sbGVjdGlvbi5lYWNoKHRoaXMuYWRkTW9kZWwsIHRoaXMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGFkZE1vZGVsOiBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIHZpZXcgPSBuZXcgaW1hZ2VWaWV3KHttb2RlbDogbW9kZWx9KTtcblx0XHR0aGlzLiRlbC5hcHBlbmQodmlldy5yZW5kZXIoKS4kZWwuaHRtbCgpKTtcblx0fVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBnYWxsZXJ5VmlldzsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuLy8gSW5pdGlhbGl6YXRpb24gZm9yIG1vZGVsIChwcm9iYWJseSB3aWxsIG5vdCBuZWVkIGNoYW5naW5nIGV2ZXIpXG52YXIgbW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXHRkZWZhdWx0czp7XG5cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbW9kZWw7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbnZhciByb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcblx0cm91dGVzOiB7XG5cdFx0XCJcIjogXCJob21lXCIsXG5cdFx0XCJwcmVzc1wiOiBcInByZXNzXCIsXG5cdFx0XCJhYm91dFwiOiBcImFib3V0XCIsXG5cdFx0XCJ2aXNpdFwiOiBcInZpc2l0XCIsXG5cdFx0XCJzaG93Y2FzZVwiOiBcInNob3djYXNlXCIsXG5cdFx0XCJtYXBcIjogXCJtYXBcIixcblx0XHRcIjpuYW1lXCI6IFwic3R1ZGVudE5hbWVcIlxuXHR9LFxuXG5cdGhvbWU6IGZ1bmN0aW9uKCl7XG5cdFx0JChcIiNwYWdlLWNvbnRlbnQgaGVhZGVyICNtYWluLWhlYWRlciAjaG9tZVwiKS50cmlnZ2VyKFwiY2xpY2tcIik7XG5cdH0sXG5cblx0cHJlc3M6IGZ1bmN0aW9uKCl7XG5cdFx0JChcIiNwYWdlLWNvbnRlbnQgaGVhZGVyICNtYWluLWhlYWRlciAjcHJlc3NcIikudHJpZ2dlcihcImNsaWNrXCIpO1xuXHR9LFxuXG5cdGFib3V0OiBmdW5jdGlvbigpe1xuXHRcdCQoXCIjcGFnZS1jb250ZW50IGhlYWRlciAjbWFpbi1oZWFkZXIgI3Nob3dcIikudHJpZ2dlcihcImNsaWNrXCIpO1xuXHR9LFxuXG5cdHZpc2l0OiBmdW5jdGlvbigpe1xuXHRcdCQoXCIjcGFnZS1jb250ZW50IGhlYWRlciAjbWFpbi1oZWFkZXIgI3Zpc2l0XCIpLnRyaWdnZXIoXCJjbGlja1wiKTtcblx0fSxcblxuXHRzaG93Y2FzZTogZnVuY3Rpb24oKXtcblx0XHQkKFwiI3BhZ2UtY29udGVudCBoZWFkZXIgI25hbWVzLWhlYWRlciAjc2hvd2Nhc2VcIikudHJpZ2dlcignY2xpY2snKTtcblx0fSxcblxuXHRtYXA6IGZ1bmN0aW9uKCl7XG5cdFx0JChcIiNwYWdlLWNvbnRlbnQgaGVhZGVyICNuYW1lcy1oZWFkZXIgI21hcFwiKS50cmlnZ2VyKFwiY2xpY2tcIik7XG5cdH0sXG5cblx0c3R1ZGVudE5hbWU6IGZ1bmN0aW9uKG5hbWUpe1xuXHRcdHZhciBtYXRjaGVkRGF0YSA9IHN0dWRlbnRzX2RhdGEuZmluZChmdW5jdGlvbihzdHVkZW50KXtcblx0XHRcdHZhciBsaW5rID0gc3R1ZGVudC5nZXQoXCJuYW1lXCIpLnJlcGxhY2UoL1xccy9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0cmV0dXJuIGxpbmsgPT0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdH0pO1xuXG5cdFx0ZW50ZXJTZWFyY2hNb2RlKGZhbHNlKTtcblx0XHRmdWxsT3ZlcmxheShmYWxzZSk7XG5cblx0XHR2YXIgYnVmZmVyID0gJChcIiNwYWdlLWNvbnRlbnQgI25hbWVzLW5hdiAubmF2LWNvbnRlbnRcIikuaHRtbCgpO1xuXHRcdHJlc2V0TmFtZUxpc3Qoc3R1ZGVudHNfZGF0YSk7XG5cdFx0JChcIiNwYWdlLWNvbnRlbnQgI25hbWVzLW5hdiAjbmFtZS1saXN0IGxpIGEjXCIgKyBtYXRjaGVkRGF0YS5jaWQpLnRyaWdnZXIoJ2NsaWNrJyk7XG5cdFx0JChcIiNwYWdlLWNvbnRlbnQgI25hbWVzLW5hdiAubmF2LWNvbnRlbnRcIikuaHRtbChidWZmZXIpO1xuXHRcdHJlYmluZEV2ZW50cygpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXI7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbi8vIFRoZSB2aWV3IHJlbmRlcmVyIHRoYXQgcmVuZGVycyBzZWFyY2ggcmVzdWx0c1xuXG52YXIgbmFtZVZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwibGlcIixcblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiNzZWFyY2gtbGlzdC1uYW1lXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBuYW1lVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdHRoaXMuJGVsLmh0bWwobmFtZVRlbXBsYXRlKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbnZhciBzZWFyY2hWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcInVsXCIsXG5cdGlkOiBcInNlYXJjaC1yZXN1bHRzXCIsXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHRoaXMuY29sbGVjdGlvbi5lYWNoKHRoaXMuYWRkTW9kZWwsIHRoaXMpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGFkZE1vZGVsOiBmdW5jdGlvbihtb2RlbCl7XG5cdFx0dmFyIHZpZXcgPSBuZXcgbmFtZVZpZXcoe21vZGVsOiBtb2RlbH0pO1xuXHRcdHRoaXMuJGVsLmFwcGVuZCh2aWV3LnJlbmRlcigpLiRlbC5odG1sKCkpO1xuXHR9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IHNlYXJjaFZpZXc7IiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG5cbl8udGVtcGxhdGVTZXR0aW5ncyA9IHtcblx0aW50ZXJwb2xhdGU6IC9cXCg6KC4rPyk6XFwpL2csXG5cdGV2YWx1YXRlOiAvXFwpOiguKz8pOlxcKC9nbVxufTtcblxuLy8gVGhlIHZpZXcgcmVuZGVyZXIgdGhhdCBvbmx5IHJlbmRlciBvbmNlIGluc3RhbmNlIG9mIGEgbW9kZWxcbi8vIGllLiBmb3IgZGlzcGxheWluZyBhIHNpbmdsZSBzdHVkZW50J3MgaW5mb1xubW9kdWxlLmV4cG9ydHMgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwiYXJ0aWNsZVwiLFxuXHRpZDogXCJzdHVkZW50V3JhcHBlclwiLFxuXG5cdHRlbXBsYXRlOiBfLnRlbXBsYXRlKCQoXCIjc2luZ2xlU3R1ZGVudFwiKS5odG1sKCkpLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHR2YXIgc2luZ2xlVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdHRoaXMuJGVsLmh0bWwoc2luZ2xlVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTsiLCIvKiBAbGljZW5zZSBzbWFyay5qcyB3cml0dGVuIGJ5IEtlbm5ldGggTGltIDxsaW16eS5rZW5uZXRoQGdtYWlsLmNvbT4gKGh0dHA6Ly9kZXNpZ25lcmtlbi5iZSlcbiAgIExpY2Vuc2UgdW5kZXIgdGhlIEJTRCAyLUNsYXVzZSBMaWNlbnNlICovXG4oZnVuY3Rpb24oZSl7aWYodHlwZW9mIGV4cG9ydHM9PT1cIm9iamVjdFwiJiZ0eXBlb2YgbW9kdWxlIT09XCJ1bmRlZmluZWRcIil7bW9kdWxlLmV4cG9ydHM9ZSgpfWVsc2UgaWYodHlwZW9mIGRlZmluZT09PVwiZnVuY3Rpb25cIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGUpfWVsc2V7dmFyIHI7aWYodHlwZW9mIHdpbmRvdyE9PVwidW5kZWZpbmVkXCIpe3I9d2luZG93fWVsc2UgaWYodHlwZW9mIGdsb2JhbCE9PVwidW5kZWZpbmVkXCIpe3I9Z2xvYmFsfWVsc2UgaWYodHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiKXtyPXNlbGZ9ZWxzZXtyPXRoaXN9ci5zbWFyaz1lKCl9fSkoZnVuY3Rpb24oKXt2YXIgZSxyLGE7cmV0dXJuIGZ1bmN0aW9uIHQoZSxyLGEpe2Z1bmN0aW9uIGkocyxwKXtpZighcltzXSl7aWYoIWVbc10pe3ZhciBvPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXAmJm8pcmV0dXJuIG8ocywhMCk7aWYobClyZXR1cm4gbChzLCEwKTt2YXIgbj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK3MrXCInXCIpO3Rocm93IG4uY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixufXZhciBoPXJbc109e2V4cG9ydHM6e319O2Vbc11bMF0uY2FsbChoLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIGE9ZVtzXVsxXVtyXTtyZXR1cm4gaShhP2E6cil9LGgsaC5leHBvcnRzLHQsZSxyLGEpfXJldHVybiByW3NdLmV4cG9ydHN9dmFyIGw9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIHM9MDtzPGEubGVuZ3RoO3MrKylpKGFbc10pO3JldHVybiBpfSh7MTpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PWUoXCIuL3JlZ2V4LmpzXCIpO3QudHlwZUlzPWUoXCIuL3R5cGVJcy5qc1wiKTt0LnR5cG9ncmFwaGljQ2hhbmdlcz1lKFwiLi90eXBvZ3JhcGh5LmpzXCIpO3QucGFyc2VQYXJhZ3JhcGg9ZShcIi4vcGFyYWdyYXBoLmpzXCIpO3QuZ2VuZXJhdGU9ZnVuY3Rpb24oZSxyKXt2YXIgYT1cIlwiO3ZhciBpPXt0eXBlOlwiYXV0b1wiLHR5cG9ncmFwaHk6dHJ1ZX07Zm9yKHZhciBsIGluIHIpe2Zvcih2YXIgcyBpbiBpKXtpZihsPT1zKXtpW3NdPXJbbF19fX12YXIgcD1pLnR5cGU7dmFyIG89aS50eXBvZ3JhcGh5O2lmKHA9PVwiYXV0b1wiKXtpZih0aGlzLnR5cGVJcyhlKT09XCJ5b3V0dWJlXCIpe3A9XCJ5b3V0dWJlXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJ2aW1lb1wiKXtwPVwidmltZW9cIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cImltYWdlXCIpe3A9XCJpbWFnZVwifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwibGlua1wiKXtwPVwibGlua1wifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwicGFyYWdyYXBoXCIpe3A9XCJwYXJhZ3JhcGhcIn19ZWxzZXtwPWkudHlwZX1hPW4oZSxwKTtyZXR1cm57aHRtbDphLHR5cGU6cH07ZnVuY3Rpb24gbihlLHIpe3ZhciBhO3ZhciBpPXQ7c3dpdGNoKHIpe2Nhc2VcInlvdXR1YmVcIjplPWUucmVwbGFjZShpLnlvdXR1YmVSRSxcIiQxXCIpO2E9JzxpZnJhbWUgY2xhc3M9XCJzbWFyayB5b3V0dWJlXCIgc3JjPVwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJytlKydcIiBmcmFtZWJvcmRlcj1cIjBcIiB3aWR0aD1cIjg1M1wiIGhlaWdodD1cIjQ4MFwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT4nO2JyZWFrO2Nhc2VcInZpbWVvXCI6ZT1lLnJlcGxhY2UoaS52aW1lb1JFLFwiJDFcIik7YT0nPGlmcmFtZSBjbGFzcz1cInNtYXJrIHZpbWVvXCIgc3JjPVwiaHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLycrZSsnXCIgZnJhbWVib3JkZXI9XCIwXCIgd2lkdGg9XCI4NTNcIiBoZWlnaHQ9XCI0ODBcIiB3ZWJraXRhbGxvd2Z1bGxzY3JlZW4gbW96YWxsb3dmdWxsc2NyZWVuIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT4nO2JyZWFrO2Nhc2VcImltYWdlXCI6dmFyIGw9ZS5yZXBsYWNlKGkuaW1hZ2VSRSxcIiQxXCIpO3ZhciBzPWUucmVwbGFjZShpLmltYWdlUkUsXCIkMlwiKTtpZihvKXtzPWkudHlwb2dyYXBoaWNDaGFuZ2VzKHMpfWE9JzxpbWcgY2xhc3M9XCJzbWFyayBpbWFnZVwiIHRpdGxlPVwiJytzKydcIiBzcmM9XCInK2wrJ1wiPic7aWYoaS5pbWFnZUxpbmtSRS50ZXN0KGUpKXt2YXIgcD1pLmltYWdlTGlua1JFLmV4ZWMoZSlbMF07cD1wLnN1YnN0cmluZygxLHAubGVuZ3RoLTEpO2E9JzxhIGhyZWY9XCInK3ArJ1wiIHRhcmdldD1fYmxhbms+JythK1wiPC9hPlwifWJyZWFrO2Nhc2VcImxpbmtcIjplPWUubWF0Y2goaS5odG1sUkUpWzBdO2E9JzxpZnJhbWUgY2xhc3M9XCJzbWFyayB3ZWJzaXRlXCIgc3JjPVwiJytlKydcIiB3aWR0aD1cIjg1M1wiIGhlaWdodD1cIjQ4MFwiIGZyYW1lYm9yZGVyPVwiMFwiPjwvaWZyYW1lPic7YnJlYWs7Y2FzZVwicGFyYWdyYXBoXCI6ZT1pLnBhcnNlUGFyYWdyYXBoKG8sZSk7YT0nPHAgY2xhc3M9XCJzbWFyayBwYXJhZ3JhcGhcIj4nK2UrXCI8L3A+XCI7YnJlYWs7ZGVmYXVsdDphPVwiXCJ9cmV0dXJuIGF9fTtyLmV4cG9ydHM9dH0se1wiLi9wYXJhZ3JhcGguanNcIjoyLFwiLi9yZWdleC5qc1wiOjMsXCIuL3R5cGVJcy5qc1wiOjQsXCIuL3R5cG9ncmFwaHkuanNcIjo1fV0sMjpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PWUoXCIuL3JlZ2V4LmpzXCIpO3IuZXhwb3J0cz1mdW5jdGlvbihlLHIpe2lmKGUpe3I9dGhpcy50eXBvZ3JhcGhpY0NoYW5nZXMocil9dmFyIGE9XCJcIjtyPW4ocik7dmFyIGk9ci5tYXRjaCh0Lm9sUkUpO2lmKGkhPT1udWxsKXtmb3IodmFyIGw9MDtsPGkubGVuZ3RoO2wrKyl7dmFyIHM9aVtsXS5tYXRjaCh0Lm9sbGlSRSk7YT1cIjxvbD5cIjtmb3IodmFyIHA9MDtwPHMubGVuZ3RoO3ArKyl7YSs9XCI8bGk+XCIrc1twXS5yZXBsYWNlKHQub2xsaVJFLFwiJDFcIikrXCI8L2xpPlwifWErPVwiPC9vbD5cIjtyPXIucmVwbGFjZShpW2xdLGEpfX12YXIgbz1yLm1hdGNoKHQudWxSRSk7aWYobyE9PW51bGwpe2Zvcih2YXIgbD0wO2w8by5sZW5ndGg7bCsrKXt2YXIgcz1vW2xdLm1hdGNoKHQudWxsaVJFKTthPVwiPHVsPlwiO2Zvcih2YXIgcD0wO3A8cy5sZW5ndGg7cCsrKXthKz1cIjxsaT5cIitzW3BdLnJlcGxhY2UodC51bGxpUkUsXCIkMVwiKStcIjwvbGk+XCJ9YSs9XCI8L3VsPlwiO3I9ci5yZXBsYWNlKG9bbF0sYSl9fWlmKHQuYnFSRS50ZXN0KHIpKXtpZihyLnJlcGxhY2UodC5icVJFLFwiJDJcIik9PT1cIlwiKXtyPXIucmVwbGFjZSh0LmJxUkUsXCI8YmxvY2txdW90ZT48cD4kMTwvcD48L2Jsb2NrcXVvdGU+XCIpfWVsc2V7cj1yLnJlcGxhY2UodC5icVJFLFwiPGJsb2NrcXVvdGU+PHA+JDE8L3A+PGZvb3Rlcj4kMjwvZm9vdGVyPjwvYmxvY2txdW90ZT5cIil9fXI9ci5yZXBsYWNlKHQuaDZSRSxcIjxoNj4kMTwvaDY+XCIpO3I9ci5yZXBsYWNlKHQuaDVSRSxcIjxoNT4kMTwvaDU+XCIpO3I9ci5yZXBsYWNlKHQuaDRSRSxcIjxoND4kMTwvaDQ+XCIpO3I9ci5yZXBsYWNlKHQuaDNSRSxcIjxoMz4kMTwvaDM+XCIpO3I9ci5yZXBsYWNlKHQuaDJSRSxcIjxoMj4kMTwvaDI+XCIpO3I9ci5yZXBsYWNlKHQuaDFSRSxcIjxoMT4kMTwvaDE+XCIpO3I9ci5yZXBsYWNlKHQuaHJSRSxcIjxociAvPlwiKTtyZXR1cm4gcjtmdW5jdGlvbiBuKGUpe2lmKGUucmVwbGFjZSh0LmxpbmtSRSxcIiQxXCIpIT09XCJcIil7YT0nPGEgaHJlZj1cIiQyXCI+JDE8L2E+JztpZih0LmxpbmtCbGFua1JFLnRlc3QoZSkpe2E9JzxhIHRhcmdldD1fYmxhbmsgaHJlZj1cIiQyXCI+JDE8L2E+J319ZT1lLnJlcGxhY2UodC5saW5rUkUsYSk7aWYoZS5yZXBsYWNlKHQubGlua0JhcmVSRSxcIiQxXCIpIT09XCJcIil7YT0nPGEgaHJlZj1cIiQxXCI+JDE8L2E+JztpZih0LmxpbmtCbGFua1JFLnRlc3QoZSkpe2E9JzxhIHRhcmdldD1fYmxhbmsgaHJlZj1cIiQxXCI+JDE8L2E+J319ZT1lLnJlcGxhY2UodC5saW5rQmFyZVJFLGEpO3JldHVybiBlfX19LHtcIi4vcmVnZXguanNcIjozfV0sMzpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PXt5b3V0dWJlUkU6L14oPzpodHRwcz86XFwvXFwvKT8oPzp3d3dcXC4pP3lvdXR1KD86XFwuYmV8YmVcXC5jb20pXFwvKD86d2F0Y2h8ZW1iZWRcXC93YXRjaHxlbWJlZCk/W1xcP1xcL10/KD86dj18ZmVhdHVyZT1wbGF5ZXJfZW1iZWRkZWQmdj0pPyhbXFx3LV9dKykuKj8kLyx2aW1lb1JFOi9eKD86aHR0cHM/OlxcL1xcLyk/KD86d3d3XFwuKT92aW1lb1xcLmNvbVxcLyg/OmNoYW5uZWxzXFwvKT8oPzpcXHcrXFwvKT8oXFxkKykkLyxpbWFnZVJFOi9eKD8hICkoLis/XFwuKD86anBnfGpwZWd8Z2lmfHBuZ3xibXApKSg/OiAtdGl0bGU9XCIoLis/KVwiKT8oPzpcXCguKz9cXCkpPyQvLGltYWdlTGlua1JFOi8oPzpcXCgoLis/KVxcKSl7MX0vLGh0bWxSRTovXigoPyEuKihqcGd8anBlZ3xnaWZ8cG5nfGJtcCkpKGh0dHBzPzpcXC9cXC8pW1xcd1xcLV9dKyhcXC5bXFx3XFwtX10rKStbXFx3XFwtLixAP149JSY6XFwvflxcXFwrI10qKXwuK1xcLig/IWpwZ3xqcGVnfGdpZnxwbmd8Ym1wKWh0bWw/JC8sbGlua1JFOi9cXFsoPyEtKSguKj8pXFxdKD86fC1ibGFuaykgP1xcKCguKz8pXFwpL2csbGlua0JsYW5rUkU6L1xcWyg/IS0pKC4qPylcXF0tYmxhbmsgP1xcKCguKz8pXFwpL2csbGlua0JhcmVSRTovXFxbKD8hLSkoLio/KVxcXSg/Oi1ibGFuayk/L2csbGlua0JhcmVCbGFua1JFOi9cXFsoPyEtKSguKj8pXFxdKD86LWJsYW5rKS9nLG9sUkU6Lyg/OlxcZFxcLlxccyguKz8pIFxcfCA/KSsvZyxvbGxpUkU6L1xcZFxcLlxccyguKz8pIFxcfC9nLHVsUkU6Lyg/OlxcKlxccyguKz8pIFxcfCA/KSsvZyx1bGxpUkU6L1xcKlxccyguKz8pIFxcfC9nLGg2UkU6L1xccz8jezZ9ICguKz8pICN7Nn1cXHM/L2csaDVSRTovXFxzPyN7NX0gKC4rPykgI3s1fVxccz8vZyxoNFJFOi9cXHM/I3s0fSAoLis/KSAjezR9XFxzPy9nLGgzUkU6L1xccz8jezN9ICguKz8pICN7M31cXHM/L2csaDJSRTovXFxzPyN7Mn0gKC4rPykgI3syfVxccz8vZyxoMVJFOi9cXHM/IyAoLis/KSAjXFxzPy9nLGhyUkU6L1xccz8tLS1cXHM/L2csYnFSRTovYGBgKC4rPykoPzpcXFstc291cmNlOlxccz8oLispXFxdKT9gYGAvZyxkUXVvdFJFOi8oXnxcXHMoPzpbIFxcLiw7OlxcYlxcW10pPylcXFxcP1wiKC4rPylcXFxcP1wiKFsgXFwuLDs6XFxiXFxdXSk/L2csc1F1b3RSRTovKF58XFxzKD86WyBcXC4sOzpcXGJcXFtdKT8pXFxcXD8nKC4rPylcXFxcPycoWyBcXC4sOzpcXGJcXF1dKT8vZyx2b2xSRTovXFxidm9sXFwuXFxzXFxiL2dpLHBSRTovXFxicFxcLlxcc1xcYig/PVxcZCspL2csY1JFOi9cXGJjXFwuXFxzXFxiKD89XFxkKykvZyxmbFJFOi9cXGJmbFxcLlxcc1xcYig/PVxcZCspL2csaWVSRTovXFxiaVxcLmVcXC5cXHM/XFxiL2csZWdSRTovXFxiZVxcLmdcXC5cXHNcXGIvZyxhcG9zUkU6LyhbQS1aYS16XSspJyhbYS16XSspL2csZW5kYXNoUkU6LyguKz8pXFxzLVxccyguKz8pL2csZWxpcHNlUkU6L1xcLnszfS9nfTtyLmV4cG9ydHM9dH0se31dLDQ6W2Z1bmN0aW9uKGUscixhKXt2YXIgdD1lKFwiLi9yZWdleC5qc1wiKTt0eXBlSXM9ZnVuY3Rpb24oZSl7aWYodGhpcy55b3V0dWJlUkUudGVzdChlKSl7cmV0dXJuXCJ5b3V0dWJlXCJ9ZWxzZSBpZih0aGlzLnZpbWVvUkUudGVzdChlKSl7cmV0dXJuXCJ2aW1lb1wifWVsc2UgaWYodGhpcy5pbWFnZVJFLnRlc3QoZSkpe3JldHVyblwiaW1hZ2VcIn1lbHNlIGlmKHRoaXMuaHRtbFJFLnRlc3QoZSkpe3JldHVyblwibGlua1wifWVsc2V7cmV0dXJuXCJwYXJhZ3JhcGhcIn19O3IuZXhwb3J0cz10eXBlSXN9LHtcIi4vcmVnZXguanNcIjozfV0sNTpbZnVuY3Rpb24oZSxyLGEpe3IuZXhwb3J0cz1mdW5jdGlvbihlKXtlPWUucmVwbGFjZSh0aGlzLmRRdW90UkUsXCIkMSYjODIyMDskMiYjODIyMTskM1wiKTtlPWUucmVwbGFjZSh0aGlzLnNRdW90UkUsXCIkMSYjODIxNjskMiYjODIxNzskM1wiKTtlPWUucmVwbGFjZSh0aGlzLnZvbFJFLFwiVm9sLlwiKTtlPWUucmVwbGFjZSh0aGlzLnBSRSxcInAuXCIpO2U9ZS5yZXBsYWNlKHRoaXMuY1JFLFwiPGk+Yy48L2k+XCIpO2U9ZS5yZXBsYWNlKHRoaXMuZmxSRSxcIjxpPmZsLjwvaT5cIik7ZT1lLnJlcGxhY2UodGhpcy5pZVJFLFwiPGk+aWU8L2k+IFwiKTtlPWUucmVwbGFjZSh0aGlzLmVnUkUsXCI8aT5lZzwvaT4gXCIpO2U9ZS5yZXBsYWNlKHRoaXMuYXBvc1JFLFwiJDEmIzgyMTc7JDJcIik7ZT1lLnJlcGxhY2UodGhpcy5lbmRhc2hSRSxcIiQxJiM4MjExOyQyXCIpO2U9ZS5yZXBsYWNlKHRoaXMuZWxpcHNlUkUsXCImIzgyMzA7XCIpO3JldHVybiBlfX0se31dfSx7fSxbMV0pKDEpfSk7XG4iXX0=
