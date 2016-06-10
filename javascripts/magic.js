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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqYXZhc2NyaXB0cy9jb2xsZWN0aW9uLmpzIiwiamF2YXNjcmlwdHMvY29sbGVjdGlvblZpZXcuanMiLCJqYXZhc2NyaXB0cy9jdXN0b20uanMiLCJqYXZhc2NyaXB0cy9nYWxsZXJ5Vmlldy5qcyIsImphdmFzY3JpcHRzL21vZGVscy5qcyIsImphdmFzY3JpcHRzL3JvdXRlcy5qcyIsImphdmFzY3JpcHRzL3NlYXJjaFZpZXcuanMiLCJqYXZhc2NyaXB0cy9zaW5nbGVWaWV3LmpzIiwibm9kZV9tb2R1bGVzL3NtYXJrL3NtYXJrLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNqWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xuQmFja2JvbmUuJCA9ICQ7XG52YXIgbW9kZWwgPSByZXF1aXJlKFwiLi9tb2RlbHMuanNcIik7XG5cbi8vIFRoZSBjb2xsZWN0aW9ucyBvZiBkYXRhIHRoYXQgd2UgaW1wb3J0IGluIGZyb20gdGhlIHdvcmRwcmVzcyBzZXJ2ZXIuXG52YXIgY29sbGVjdGlvbiA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblx0bW9kZWw6IG1vZGVsLFxuXHR1cmw6IFwiaHR0cDovL2luZm8uY3NtZ3JhcGhpY2Rlc2lnbi5jb20vd3AtanNvbi93cC92Mi9zdHVkZW50X2luZm8/ZmlsdGVyW3Bvc3RzX3Blcl9wYWdlXT0tMVwiLFxuXHQvLyB1cmw6IFwiaHR0cDovL2xvY2FsaG9zdC93b3JkcHJlc3Mvd3AtanNvbi93cC92Mi9zdHVkZW50X2luZm9cIixcblx0Ly8gdXJsOiBcIi4vcmVzcG9uc2UuanNvblwiLFxuXG5cdGNvbXBhcmF0b3I6IFwibmFtZVwiXG59KTtcblxuc3R1ZGVudHNfZGF0YSA9IG5ldyBjb2xsZWN0aW9uKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1ZGVudHNfZGF0YTtcbiIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IHJlbmRlcnMgYSBjb2xsZWN0aW9uIG9mIGRhdGFcbi8vIGllLiBhIGNvbGxlY3Rpb24gb2Ygc3R1ZGVudHMgaW5mbyBmb3IgbmF2aWdhdGlvbiBvciBzb21ldGhpbmcgZWxzZS5cblxuLy8gQ3JlYXRlIG9uZSBlbGVtZW50IGF0IGEgdGltZVxudmFyIGluZGl2aWR1YWwgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwibGlcIixcblxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSgkKFwiI25hbWUtbGlzdC1pdGVtXCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBtb2RlbFRlbXBsYXRlID0gdGhpcy50ZW1wbGF0ZSh0aGlzLm1vZGVsLnRvSlNPTigpKTtcblx0XHR0aGlzLiRlbC5odG1sKG1vZGVsVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxuLy8gUGxhY2luZyB0aGUgZWxlbWVudHMgY3JlYXRlZCBhYm92ZSBpbnRvIHRoZSBjb2xsZWN0aW9uIHZpZXcgcmVuZGVyZXIuXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJkaXZcIixcblx0aWQ6IFwibmFtZS1saXN0XCIsXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciB3aG9sZUxpc3QgPSBcIlwiO1xuXHRcdHZhciBncm91cGVkTGlzdCA9IHRoaXMuY29sbGVjdGlvbi5ncm91cEJ5KGZ1bmN0aW9uKGVsKXtcblx0XHRcdHZhciBmaXJzdENoYXIgPSBlbC5nZXQoXCJuYW1lXCIpLmNoYXJBdCgwKTtcblx0XHRcdHJldHVybiBmaXJzdENoYXI7XG5cdFx0fSwgdGhpcyk7XG5cblx0XHRfLmVhY2goZ3JvdXBlZExpc3QsIGZ1bmN0aW9uKGVsLCBrZXkpe1xuXHRcdFx0dmFyIGhlYWRlciA9IFwiPHVsPjxsaT48aDY+XCIgKyBrZXkgKyBcIjwvaDY+PC9saT5cIjtcblxuXHRcdFx0d2hvbGVMaXN0ICs9IGhlYWRlcjtcblxuXHRcdFx0Xy5lYWNoKGVsLCBmdW5jdGlvbihlbCwgaSl7XG5cdFx0XHRcdHdob2xlTGlzdCArPSB0aGlzLmFkZE1vZGVsKGVsKTtcblx0XHRcdH0sIHRoaXMpO1xuXG5cdFx0XHR3aG9sZUxpc3QgKz0gXCI8L3VsPlwiO1xuXHRcdH0sIHRoaXMpO1xuXG5cdFx0dGhpcy4kZWwuaHRtbCh3aG9sZUxpc3QpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YWRkTW9kZWw6IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgbW9kZWxWaWV3ID0gbmV3IGluZGl2aWR1YWwoe21vZGVsOiBtb2RlbH0pO1xuXHRcdHJldHVybiBtb2RlbFZpZXcucmVuZGVyKCkuJGVsLmh0bWwoKTtcblx0fVxufSk7IiwiLy8gQnVuY2ggb2YgaW1wb3J0c1xudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XG52YXIgXyA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydfJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydfJ10gOiBudWxsKTtcbnZhciBCYWNrYm9uZSA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WydCYWNrYm9uZSddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnQmFja2JvbmUnXSA6IG51bGwpO1xud2luZG93LnNtYXJrID0gcmVxdWlyZShcInNtYXJrXCIpO1xuQmFja2JvbmUuJCA9ICQ7XG53aW5kb3cuc3R1ZGVudHNfZGF0YSA9IHJlcXVpcmUoXCIuL2NvbGxlY3Rpb24uanNcIik7XG53aW5kb3cuc2luZ2xlVmlldyA9IHJlcXVpcmUoXCIuL3NpbmdsZVZpZXcuanNcIik7XG53aW5kb3cuY29sbGVjdGlvblZpZXcgPSByZXF1aXJlKFwiLi9jb2xsZWN0aW9uVmlldy5qc1wiKTtcbndpbmRvdy5nYWxsZXJ5VmlldyA9IHJlcXVpcmUoXCIuL2dhbGxlcnlWaWV3LmpzXCIpO1xud2luZG93LnNlYXJjaFZpZXcgPSByZXF1aXJlKFwiLi9zZWFyY2hWaWV3LmpzXCIpO1xud2luZG93LnJvdXRlciA9IHJlcXVpcmUoXCIuL3JvdXRlcy5qc1wiKTtcbnZhciBtYWdpYyA9IG1hZ2ljIHx8IHt9O1xuXG4vLyBIb2xkIHRoYXQgcmVhZHksIG1hZ2ljIG5lZWRzIHRvIGhhcHBlbiBmaXJzdCFcbiQuaG9sZFJlYWR5KHRydWUpO1xuJChcIiNwYWdlLWNvbnRlbnRcIikuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcblxuLy8gQW55dGhpbmcgdGhhdCBuZWVkcyBkb2luZyBiZWZvcmUgZGF0YSBpcyBsb2FkZWQgc2hvdWxkIGdvIGhlcmUuXG52YXIgcmVjZWl2ZWREYXRhID0gbmV3IEV2ZW50KFwicmVjZWl2ZWREYXRhXCIpO1xuXG4vLyBGZXRjaCBkYXRhIGZyb20gdGhlIGJhY2tlbmQuXG5zdHVkZW50c19kYXRhLmZldGNoKHtcblx0Ly8gRGlzcGF0Y2ggdGhlIHJlY2VpdmVkIGRhdGEgZXZlbnQgYWZ0ZXIgdGhlIGRhdGEgaXMgc3VjY2VzZnVsbHkgbG9hZGVkLlxuXHRzdWNjZXNzOiBmdW5jdGlvbigpe1xuXHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KHJlY2VpdmVkRGF0YSk7XG5cdH1cbn0pO1xuXG5cbi8vIFRoZSBwYWdlIGxvZ2ljIHNob3VsZCBnbyBpbiB0aGlzIGNhbGxiYWNrIGZ1bmN0aW9uIChyZW5kZXJpbmcgZXRjLilcbi8vIFRyZWF0IHRoaXMgYXMgdGhlIHJlZ3VsYXIgZG9jdW1lbnQucmVhZHkgdGhpbmcgdW5sZXNzIHRoZXJlIGFyZSBzdHVmZiB0byBiZVxuLy8gZG9uZSBiZWZvcmUgbG9hZGluZyBpbiB0aGUgZGF0YS5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVjZWl2ZWREYXRhXCIsIGZ1bmN0aW9uKCl7XG5cdC8vIHN0dWRlbnRzX2RhdGEgaXMgdGhlIGNvbGxlY3Rpb24gb2JqZWN0XG5cdGNvbnNvbGUubG9nKHN0dWRlbnRzX2RhdGEubW9kZWxzKTtcblx0Ly8gTWFrZSB0aGVtIGRhdGEgcHJldHR5IVxuXHRzdHVkZW50c19kYXRhLmVhY2goZnVuY3Rpb24oZWwsIGkpe1xuXHRcdC8vIFZhbGlkYXRlIGFuZCBmaXggd2Vic2l0ZSBhZGRyZXNzZXNcblx0XHRtYWdpYy52YWxpZGF0ZVdlYkFkZHJlc3MoZWwsIFtcblx0XHRcdFwibGlua190b19wZXJzb25hbF93ZWJzaXRlXCIsXG5cdFx0XHRcInlvdXR1YmVcIixcblx0XHRcdFwidmltZW9cIixcblx0XHRcdFwiaGVyb192aWRlb1wiLFxuXHRcdFx0XCJ2aWRlb18xXCIsXG5cdFx0XHRcInZpZGVvXzJcIlxuXHRcdF0pO1xuXG5cdFx0Ly8gQ29udmVydCBzdHVkZW50IElEIHRvIHVwcGVyIGNhc2Vcblx0XHRlbC5zZXQoXCJzdHVkZW50X251bWJlclwiLCBlbC5nZXQoXCJzdHVkZW50X251bWJlclwiKS50b1VwcGVyQ2FzZSgpKTtcblxuXHRcdC8vIFRyaW0gdGFncyB0byA3IGl0ZW1zIG9ubHlcblx0XHRpZiAoZWwuZ2V0KFwidGFnc1wiKSAhPT0gbnVsbCl7XG5cdFx0XHRpZiAoZWwuZ2V0KFwidGFnc1wiKS5sZW5ndGggPiA3KXtcblx0XHRcdFx0ZWwuZ2V0KFwidGFnc1wiKS5zcGxpY2UoNyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVHlwb2dyYXBoeSBiZWNhdXNlIHRoYXQncyB3aGF0IHdlIGRvXG5cdFx0bWFnaWMudHlwb2dyYXBoeShlbCwgW1wiYmlvXCIsIFwiaGVyb19jYXB0aW9uXCIsIFwiY2FwdGlvbl8xXCIsIFwiY2FwdGlvbl8yXCJdKTtcblxuXHRcdC8vIEdldCB2aWRlbyB0aHVtYm5haWxzXG5cdFx0dmFyIGF2YWlsYWJsZVZpZGVvcyA9IFtdO1xuXHRcdGlmIChlbC5nZXQoXCJoZXJvX2ltYWdlX3ZpZGVvXCIpID09IFwiVmlkZW9cIil7XG5cdFx0XHRhdmFpbGFibGVWaWRlb3MucHVzaChcImhlcm9fdmlkZW9cIik7XG5cdFx0fVxuXHRcdGlmIChlbC5nZXQoXCJpbWFnZV92aWRlb18xXCIpID09IFwiVmlkZW9cIil7XG5cdFx0XHRhdmFpbGFibGVWaWRlb3MucHVzaChcInZpZGVvXzFcIik7XG5cdFx0fVxuXHRcdGlmIChlbC5nZXQoXCJpbWFnZV92aWRlb18yXCIpID09IFwiVmlkZW9cIil7XG5cdFx0XHRhdmFpbGFibGVWaWRlb3MucHVzaChcInZpZGVvXzJcIik7XG5cdFx0fVxuXHRcdGlmKCEoXy5pc0VtcHR5KGF2YWlsYWJsZVZpZGVvcykpKXtcblx0XHRcdG1hZ2ljLmdldFZpZGVvSW1hZ2UoZWwsIGF2YWlsYWJsZVZpZGVvcyk7XG5cdFx0fVxuXG5cdFx0Ly8gT2JmdXNjYXRlIGVtYWlsIGFkZHJlc3Nlc1xuXHRcdGVsLnNldChcImVtYWlsXCIsIG1hZ2ljLmVuY29kZUVtYWlsKGVsLmdldChcImVtYWlsXCIpKSk7XG5cdH0pO1xuXG5cdC8vIFJlbmRlciB0aGUgaG9tZSBwYWdlXG5cdHZhciBxdWVzdGlvbnNfZGlzcGxheSA9ICQoXCIjcXVlc3Rpb25zXCIpLmh0bWwoKTtcblx0JChcIiNwYWdlLWNvbnRlbnQgI21haW4gLmNvbnRlbnRcIikuaHRtbChxdWVzdGlvbnNfZGlzcGxheSk7XG5cblx0d2luZG93LnN0dWRlbnRzX2xpc3QgPSBuZXcgY29sbGVjdGlvblZpZXcoe2NvbGxlY3Rpb246IHN0dWRlbnRzX2RhdGF9KTtcblx0JChcIiNwYWdlLWNvbnRlbnQgI25hbWVzLW5hdiAubmF2LWNvbnRlbnRcIikuaHRtbChzdHVkZW50c19saXN0LnJlbmRlcigpLiRlbCk7XG5cblx0Ly8gTm93IHlvdSBjYW4gYmUgcmVhZHksIGV2ZXJ5dGhpbmcncyBsb2FkZWQgaW4gYW5kIGRpc3BsYXllZCFcblx0JC5ob2xkUmVhZHkoZmFsc2UpO1xuXHR3aW5kb3cucm91dGVzID0gbmV3IHJvdXRlcigpO1xuXHRCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KCk7XG5cdCQoXCIjcGFnZS1jb250ZW50XCIpLmNzcyhcImRpc3BsYXlcIiwgXCJpbmxpbmVcIik7XG5cdCQoXCIjbG9hZGluZ1wiKS5jc3MoXCJvcGFjaXR5XCIsIFwiMFwiKTtcblx0c2V0VGltZW91dChmdW5jdGlvbigpe1xuXHRcdCQoXCIjbG9hZGluZ1wiKS5jc3MoXCJkaXNwbGF5XCIsIFwibm9uZVwiKTtcblx0fSwgNTAwKTtcblx0Ly8gQWZ0ZXIgdGhpcyBwb2ludCB5b3Ugc2hvdWxkIHRoZW4gYmluZCBldmVudHMsIGFuaW1hdGlvbnMsIGV0Yy5cblx0Ly8gKHdoaWNoIHdpbGwgaGFwcGVuIGluIHNjcmlwdC5qcyBpbiBkb2N1bWVudC5yZWFkeSlcbn0pO1xuXG5cbi8vIFNvbWUgbWFnaWMgZnVuY3Rpb25zXG5tYWdpYy52YWxpZGF0ZVdlYkFkZHJlc3MgPSBmdW5jdGlvbihlbCwgbmFtZXMpe1xuXHR2YXIgc3RhcnQgPSAvXmh0dHBzPzpcXC9cXC8vZ2k7XG5cblx0Xy5lYWNoKG5hbWVzLCBmdW5jdGlvbihuYW1lLCBpKSB7XG5cdFx0aWYgKGVsLmdldChuYW1lKSAhPT0gXCJcIiAmJiB0eXBlb2YgZWwuZ2V0KG5hbWUpICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0Ly8gQWRkIGh0dHA6Ly8gcHJlZml4IGlmIGl0IGRvZXNuJ3QgYWxyZWFkeSBoYXZlIGl0LFxuXHRcdFx0Ly8gcmVxdWlyZWQgdG8gbWFrZSBzdXJlIGxpbmtzIGFyZSBhYnNvbHV0ZVxuXHRcdFx0aWYgKGVsLmdldChuYW1lKS5zZWFyY2goc3RhcnQpID09IC0xKXtcblx0XHRcdFx0dmFyIG9sZCA9IGVsLmdldChuYW1lKTtcblx0XHRcdFx0ZWwuc2V0KG5hbWUsIFwiaHR0cDovL1wiICsgb2xkKTtcblx0XHRcdH1cblx0XHR9ZWxzZXtcblx0XHRcdC8vIFVzZXIgZGlkIG5vdCBwcm92aWRlIGxpbmsgdG8gd2Vic2l0ZVxuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy50eXBvZ3JhcGh5ID0gZnVuY3Rpb24oZWwsIGZpZWxkcyl7XG5cdF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkLCBpKXtcblx0XHRpZiAoZWwuZ2V0KGZpZWxkKSl7XG5cdFx0XHRlbC5zZXQoZmllbGQsIHNtYXJrLnR5cG9ncmFwaGljQ2hhbmdlcyhlbC5nZXQoZmllbGQpKS50cmltKCkpO1xuXHRcdH1cblx0fSk7XG59O1xuXG5tYWdpYy5nZXRWaWRlb0ltYWdlID0gZnVuY3Rpb24oZWwsIGZpZWxkcyl7XG5cdF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkLCBpKXtcblx0XHRpZihlbC5nZXQoZmllbGQpICE9PSBcIlwiKXtcblx0XHRcdHZhciB2aWRJRDtcblx0XHRcdGlmKHNtYXJrLnR5cGVJcyhlbC5nZXQoZmllbGQpKSA9PSBcInlvdXR1YmVcIil7XG5cdFx0XHRcdHZpZElEID0gZWwuZ2V0KGZpZWxkKS5yZXBsYWNlKHNtYXJrLnlvdXR1YmVSRSwgXCIkMVwiKTtcblx0XHRcdFx0dmFyIGltYWdlTGluayA9IFwiaHR0cDovL2kzLnl0aW1nLmNvbS92aS9cIiArIHZpZElEICsgXCIvc2RkZWZhdWx0LmpwZ1wiO1xuXHRcdFx0XHRlbC5zZXQoZmllbGQgKyBcIl9pbWFnZVwiLCBpbWFnZUxpbmspO1xuXG5cdFx0XHR9ZWxzZSBpZihzbWFyay50eXBlSXMoZWwuZ2V0KGZpZWxkKSkgPT0gXCJ2aW1lb1wiKXtcblx0XHRcdFx0dmlkSUQgPSBlbC5nZXQoZmllbGQpLnJlcGxhY2Uoc21hcmsudmltZW9SRSwgXCIkMVwiKTtcblx0XHRcdFx0bWFnaWMudmltZW9Mb2FkaW5nVGh1bWIodmlkSUQsIGZ1bmN0aW9uKGltYWdlTGluayl7XG5cdFx0XHRcdFx0ZWwuc2V0KGZpZWxkICsgXCJfaW1hZ2VcIiwgaW1hZ2VMaW5rKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0Y29uc29sZS5sb2coZWwuZ2V0KFwibmFtZVwiKSwgZWwuZ2V0KGZpZWxkKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcbn07XG5cbm1hZ2ljLnZpbWVvTG9hZGluZ1RodW1iID0gZnVuY3Rpb24oaWQsIGNhbGxiYWNrKXtcblx0dmFyIHVybCA9IFwiaHR0cHM6Ly92aW1lby5jb20vYXBpL29lbWJlZC5qc29uP3VybD1odHRwcyUzQS8vdmltZW8uY29tL1wiICsgaWQ7XG5cdCQuYWpheCh7XG5cdFx0dXJsOiB1cmwsXG5cdFx0ZGF0YVR5cGU6IFwianNvblwiXG5cdH0pLmRvbmUoZnVuY3Rpb24oZGF0YSl7XG5cdFx0dmFyIHJldHVybkltYWdlID0gZGF0YS50aHVtYm5haWxfdXJsO1xuXHRcdHJldHVybkltYWdlID0gcmV0dXJuSW1hZ2UucmVwbGFjZSgvKC4qP18pXFxkKz8oXFwuanBnKS8sIFwiJDE2NDAkMlwiKTtcblx0XHRjYWxsYmFjayhyZXR1cm5JbWFnZSk7XG5cdH0pO1xufTtcblxubWFnaWMuZW5jb2RlRW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xuXHR2YXIgcmVnRW1haWwgPSBlbWFpbDtcblx0dmFyIGNvZGVFbWFpbCA9IFwiXCI7XG5cblx0dmFyIHJlZ0xlbmd0aCA9IHJlZ0VtYWlsLmxlbmd0aDtcblx0Zm9yIChpID0gMDsgaSA8IHJlZ0xlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGNoYXJOdW0gPSBcIjAwMFwiO1xuXHRcdHZhciBjdXJDaGFyID0gcmVnRW1haWwuY2hhckF0KGkpO1xuXG5cdFx0c3dpdGNoIChpKXtcblx0XHRcdGNhc2UgXCJBXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA2NVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA5N1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJCXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA2NlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJiXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA5OFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJDXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA2N1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJjXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA5OVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJEXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA2OFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJkXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwMFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA2OVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJlXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwMVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJGXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3MFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJmXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwMlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJHXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3MVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJnXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwM1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJIXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3MlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJoXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwNFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJJXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3M1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJpXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwNVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJKXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3NFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJqXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwNlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJLXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3NVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJrXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwN1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJMXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3NlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJsXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwOFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3N1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJtXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEwOVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3OFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJuXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExMFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJPXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA3OVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJvXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExMVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJQXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4MFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJwXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExMlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJRXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4MVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJxXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExM1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJSXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4MlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJyXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExNFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJTXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4M1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJzXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExNVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJUXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4NFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJ0XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExNlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJVXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4NVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJ1XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExN1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJWXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4NlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJ2XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExOFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJXXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4N1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJ3XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjExOVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJYXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4OFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJ4XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEyMFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJZXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA4OVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJ5XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEyMVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJaXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA5MFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJ6XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjEyMlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIwXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA0OFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIxXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA0OVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIyXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1MFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIzXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1MVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCI0XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1MlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCI1XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1M1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCI2XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1NFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCI3XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1NVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCI4XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1NlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCI5XCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA1N1wiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCImXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjAzOFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIgXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjAzMlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJfXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA5NVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCItXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA0NVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJAXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA2NFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIuXCI6XG5cdFx0XHRcdGNoYXJOdW0gPSBcIjA0NlwiO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRpZiAoY2hhck51bSA9PSBcIjAwMFwiKSB7XG5cdFx0XHRjb2RlRW1haWwgKz0gY3VyQ2hhcjtcblx0XHR9ZWxzZXtcblx0XHRcdGNvZGVFbWFpbCArPSBcIiYjXCIgKyBjaGFyTnVtICsgXCI7XCI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBjb2RlRW1haWw7XG59O1xuXG4iLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuLy8gVGhlIHZpZXcgcmVuZGVyZXIgdGhhdCByZW5kZXJzIGEgZ2FsbGVyeSBvZiBpbWFnZXNcblxudmFyIGltYWdlVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiNzaW5nbGVJbWFnZVwiKS5odG1sKCkpLFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKXtcblx0XHRpZiAodGhpcy5tb2RlbC5nZXQoXCJoZXJvX2ltYWdlX21lZGl1bVwiKSB8fCB0aGlzLm1vZGVsLmdldChcImhlcm9fdmlkZW9faW1hZ2VcIikpe1xuXHRcdFx0dmFyIGltYWdlVGVtcGxhdGUgPSB0aGlzLnRlbXBsYXRlKHRoaXMubW9kZWwudG9KU09OKCkpO1xuXHRcdFx0dGhpcy4kZWwuaHRtbChpbWFnZVRlbXBsYXRlKTtcblx0XHR9ZWxzZXtcblx0XHRcdHRoaXMuJGVsLmh0bWwoXCJcIik7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxudmFyIGdhbGxlcnlWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiBcImFydGljbGVcIixcblx0Y2xhc3NOYW1lOiBcImdhbGxlcnlcIixcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2godGhpcy5hZGRNb2RlbCwgdGhpcyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YWRkTW9kZWw6IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgdmlldyA9IG5ldyBpbWFnZVZpZXcoe21vZGVsOiBtb2RlbH0pO1xuXHRcdHRoaXMuJGVsLmFwcGVuZCh2aWV3LnJlbmRlcigpLiRlbC5odG1sKCkpO1xuXHR9XG59KTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IGdhbGxlcnlWaWV3OyIsInZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xudmFyIF8gPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snXyddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnXyddIDogbnVsbCk7XG52YXIgQmFja2JvbmUgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snQmFja2JvbmUnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ0JhY2tib25lJ10gOiBudWxsKTtcbkJhY2tib25lLiQgPSAkO1xuXG4vLyBJbml0aWFsaXphdGlvbiBmb3IgbW9kZWwgKHByb2JhYmx5IHdpbGwgbm90IG5lZWQgY2hhbmdpbmcgZXZlcilcbnZhciBtb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdGRlZmF1bHRzOntcblxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBtb2RlbDsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxudmFyIHJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmQoe1xuXHRyb3V0ZXM6IHtcblx0XHRcIlwiOiBcImhvbWVcIixcblx0XHRcInByZXNzXCI6IFwicHJlc3NcIixcblx0XHRcImFib3V0XCI6IFwiYWJvdXRcIixcblx0XHRcInZpc2l0XCI6IFwidmlzaXRcIixcblx0XHRcInNob3djYXNlXCI6IFwic2hvd2Nhc2VcIixcblx0XHRcIm1hcFwiOiBcIm1hcFwiLFxuXHRcdFwiOm5hbWVcIjogXCJzdHVkZW50TmFtZVwiXG5cdH0sXG5cblx0aG9tZTogZnVuY3Rpb24oKXtcblx0XHQkKFwiI3BhZ2UtY29udGVudCBoZWFkZXIgI21haW4taGVhZGVyICNob21lXCIpLnRyaWdnZXIoXCJjbGlja1wiKTtcblx0fSxcblxuXHRwcmVzczogZnVuY3Rpb24oKXtcblx0XHQkKFwiI3BhZ2UtY29udGVudCBoZWFkZXIgI21haW4taGVhZGVyICNwcmVzc1wiKS50cmlnZ2VyKFwiY2xpY2tcIik7XG5cdH0sXG5cblx0YWJvdXQ6IGZ1bmN0aW9uKCl7XG5cdFx0JChcIiNwYWdlLWNvbnRlbnQgaGVhZGVyICNtYWluLWhlYWRlciAjc2hvd1wiKS50cmlnZ2VyKFwiY2xpY2tcIik7XG5cdH0sXG5cblx0dmlzaXQ6IGZ1bmN0aW9uKCl7XG5cdFx0JChcIiNwYWdlLWNvbnRlbnQgaGVhZGVyICNtYWluLWhlYWRlciAjdmlzaXRcIikudHJpZ2dlcihcImNsaWNrXCIpO1xuXHR9LFxuXG5cdHNob3djYXNlOiBmdW5jdGlvbigpe1xuXHRcdCQoXCIjcGFnZS1jb250ZW50IGhlYWRlciAjbmFtZXMtaGVhZGVyICNzaG93Y2FzZVwiKS50cmlnZ2VyKCdjbGljaycpO1xuXHR9LFxuXG5cdG1hcDogZnVuY3Rpb24oKXtcblx0XHQkKFwiI3BhZ2UtY29udGVudCBoZWFkZXIgI25hbWVzLWhlYWRlciAjbWFwXCIpLnRyaWdnZXIoXCJjbGlja1wiKTtcblx0fSxcblxuXHRzdHVkZW50TmFtZTogZnVuY3Rpb24obmFtZSl7XG5cdFx0dmFyIG1hdGNoZWREYXRhID0gc3R1ZGVudHNfZGF0YS5maW5kKGZ1bmN0aW9uKHN0dWRlbnQpe1xuXHRcdFx0dmFyIGxpbmsgPSBzdHVkZW50LmdldChcIm5hbWVcIikucmVwbGFjZSgvXFxzL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRyZXR1cm4gbGluayA9PSBuYW1lLnRvTG93ZXJDYXNlKCk7XG5cdFx0fSk7XG5cblx0XHRlbnRlclNlYXJjaE1vZGUoZmFsc2UpO1xuXHRcdGZ1bGxPdmVybGF5KGZhbHNlKTtcblxuXHRcdHZhciBidWZmZXIgPSAkKFwiI3BhZ2UtY29udGVudCAjbmFtZXMtbmF2IC5uYXYtY29udGVudFwiKS5odG1sKCk7XG5cdFx0cmVzZXROYW1lTGlzdChzdHVkZW50c19kYXRhKTtcblx0XHQkKFwiI3BhZ2UtY29udGVudCAjbmFtZXMtbmF2ICNuYW1lLWxpc3QgbGkgYSNcIiArIG1hdGNoZWREYXRhLmNpZCkudHJpZ2dlcignY2xpY2snKTtcblx0XHQkKFwiI3BhZ2UtY29udGVudCAjbmFtZXMtbmF2IC5uYXYtY29udGVudFwiKS5odG1sKGJ1ZmZlcik7XG5cdFx0cmViaW5kRXZlbnRzKCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlcjsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuLy8gVGhlIHZpZXcgcmVuZGVyZXIgdGhhdCByZW5kZXJzIHNlYXJjaCByZXN1bHRzXG5cbnZhciBuYW1lVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJsaVwiLFxuXHR0ZW1wbGF0ZTogXy50ZW1wbGF0ZSgkKFwiI3NlYXJjaC1saXN0LW5hbWVcIikuaHRtbCgpKSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIG5hbWVUZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC50b0pTT04oKSk7XG5cdFx0dGhpcy4kZWwuaHRtbChuYW1lVGVtcGxhdGUpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxudmFyIHNlYXJjaFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6IFwidWxcIixcblx0aWQ6IFwic2VhcmNoLXJlc3VsdHNcIixcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCl7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLmVhY2godGhpcy5hZGRNb2RlbCwgdGhpcyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0YWRkTW9kZWw6IGZ1bmN0aW9uKG1vZGVsKXtcblx0XHR2YXIgdmlldyA9IG5ldyBuYW1lVmlldyh7bW9kZWw6IG1vZGVsfSk7XG5cdFx0dGhpcy4kZWwuYXBwZW5kKHZpZXcucmVuZGVyKCkuJGVsLmh0bWwoKSk7XG5cdH1cbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gc2VhcmNoVmlldzsiLCJ2YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcbnZhciBfID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ18nXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJ18nXSA6IG51bGwpO1xudmFyIEJhY2tib25lID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJ0JhY2tib25lJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWydCYWNrYm9uZSddIDogbnVsbCk7XG5CYWNrYm9uZS4kID0gJDtcblxuXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuXHRpbnRlcnBvbGF0ZTogL1xcKDooLis/KTpcXCkvZyxcblx0ZXZhbHVhdGU6IC9cXCk6KC4rPyk6XFwoL2dtXG59O1xuXG4vLyBUaGUgdmlldyByZW5kZXJlciB0aGF0IG9ubHkgcmVuZGVyIG9uY2UgaW5zdGFuY2Ugb2YgYSBtb2RlbFxuLy8gaWUuIGZvciBkaXNwbGF5aW5nIGEgc2luZ2xlIHN0dWRlbnQncyBpbmZvXG5tb2R1bGUuZXhwb3J0cyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogXCJhcnRpY2xlXCIsXG5cdGlkOiBcInN0dWRlbnRXcmFwcGVyXCIsXG5cblx0dGVtcGxhdGU6IF8udGVtcGxhdGUoJChcIiNzaW5nbGVTdHVkZW50XCIpLmh0bWwoKSksXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpe1xuXHRcdHZhciBzaW5nbGVUZW1wbGF0ZSA9IHRoaXMudGVtcGxhdGUodGhpcy5tb2RlbC50b0pTT04oKSk7XG5cdFx0dGhpcy4kZWwuaHRtbChzaW5nbGVUZW1wbGF0ZSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pOyIsIi8qIEBsaWNlbnNlIHNtYXJrLmpzIHdyaXR0ZW4gYnkgS2VubmV0aCBMaW0gPGxpbXp5Lmtlbm5ldGhAZ21haWwuY29tPiAoaHR0cDovL2Rlc2lnbmVya2VuLmJlKVxuICAgTGljZW5zZSB1bmRlciB0aGUgQlNEIDItQ2xhdXNlIExpY2Vuc2UgKi9cbihmdW5jdGlvbihlKXtpZih0eXBlb2YgZXhwb3J0cz09PVwib2JqZWN0XCImJnR5cGVvZiBtb2R1bGUhPT1cInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cz1lKCl9ZWxzZSBpZih0eXBlb2YgZGVmaW5lPT09XCJmdW5jdGlvblwiJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZSl9ZWxzZXt2YXIgcjtpZih0eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIil7cj13aW5kb3d9ZWxzZSBpZih0eXBlb2YgZ2xvYmFsIT09XCJ1bmRlZmluZWRcIil7cj1nbG9iYWx9ZWxzZSBpZih0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCIpe3I9c2VsZn1lbHNle3I9dGhpc31yLnNtYXJrPWUoKX19KShmdW5jdGlvbigpe3ZhciBlLHIsYTtyZXR1cm4gZnVuY3Rpb24gdChlLHIsYSl7ZnVuY3Rpb24gaShzLHApe2lmKCFyW3NdKXtpZighZVtzXSl7dmFyIG89dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighcCYmbylyZXR1cm4gbyhzLCEwKTtpZihsKXJldHVybiBsKHMsITApO3ZhciBuPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrcytcIidcIik7dGhyb3cgbi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLG59dmFyIGg9cltzXT17ZXhwb3J0czp7fX07ZVtzXVswXS5jYWxsKGguZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgYT1lW3NdWzFdW3JdO3JldHVybiBpKGE/YTpyKX0saCxoLmV4cG9ydHMsdCxlLHIsYSl9cmV0dXJuIHJbc10uZXhwb3J0c312YXIgbD10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgcz0wO3M8YS5sZW5ndGg7cysrKWkoYVtzXSk7cmV0dXJuIGl9KHsxOltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9ZShcIi4vcmVnZXguanNcIik7dC50eXBlSXM9ZShcIi4vdHlwZUlzLmpzXCIpO3QudHlwb2dyYXBoaWNDaGFuZ2VzPWUoXCIuL3R5cG9ncmFwaHkuanNcIik7dC5wYXJzZVBhcmFncmFwaD1lKFwiLi9wYXJhZ3JhcGguanNcIik7dC5nZW5lcmF0ZT1mdW5jdGlvbihlLHIpe3ZhciBhPVwiXCI7dmFyIGk9e3R5cGU6XCJhdXRvXCIsdHlwb2dyYXBoeTp0cnVlfTtmb3IodmFyIGwgaW4gcil7Zm9yKHZhciBzIGluIGkpe2lmKGw9PXMpe2lbc109cltsXX19fXZhciBwPWkudHlwZTt2YXIgbz1pLnR5cG9ncmFwaHk7aWYocD09XCJhdXRvXCIpe2lmKHRoaXMudHlwZUlzKGUpPT1cInlvdXR1YmVcIil7cD1cInlvdXR1YmVcIn1lbHNlIGlmKHRoaXMudHlwZUlzKGUpPT1cInZpbWVvXCIpe3A9XCJ2aW1lb1wifWVsc2UgaWYodGhpcy50eXBlSXMoZSk9PVwiaW1hZ2VcIil7cD1cImltYWdlXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJsaW5rXCIpe3A9XCJsaW5rXCJ9ZWxzZSBpZih0aGlzLnR5cGVJcyhlKT09XCJwYXJhZ3JhcGhcIil7cD1cInBhcmFncmFwaFwifX1lbHNle3A9aS50eXBlfWE9bihlLHApO3JldHVybntodG1sOmEsdHlwZTpwfTtmdW5jdGlvbiBuKGUscil7dmFyIGE7dmFyIGk9dDtzd2l0Y2gocil7Y2FzZVwieW91dHViZVwiOmU9ZS5yZXBsYWNlKGkueW91dHViZVJFLFwiJDFcIik7YT0nPGlmcmFtZSBjbGFzcz1cInNtYXJrIHlvdXR1YmVcIiBzcmM9XCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nK2UrJ1wiIGZyYW1lYm9yZGVyPVwiMFwiIHdpZHRoPVwiODUzXCIgaGVpZ2h0PVwiNDgwXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7YnJlYWs7Y2FzZVwidmltZW9cIjplPWUucmVwbGFjZShpLnZpbWVvUkUsXCIkMVwiKTthPSc8aWZyYW1lIGNsYXNzPVwic21hcmsgdmltZW9cIiBzcmM9XCJodHRwczovL3BsYXllci52aW1lby5jb20vdmlkZW8vJytlKydcIiBmcmFtZWJvcmRlcj1cIjBcIiB3aWR0aD1cIjg1M1wiIGhlaWdodD1cIjQ4MFwiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPic7YnJlYWs7Y2FzZVwiaW1hZ2VcIjp2YXIgbD1lLnJlcGxhY2UoaS5pbWFnZVJFLFwiJDFcIik7dmFyIHM9ZS5yZXBsYWNlKGkuaW1hZ2VSRSxcIiQyXCIpO2lmKG8pe3M9aS50eXBvZ3JhcGhpY0NoYW5nZXMocyl9YT0nPGltZyBjbGFzcz1cInNtYXJrIGltYWdlXCIgdGl0bGU9XCInK3MrJ1wiIHNyYz1cIicrbCsnXCI+JztpZihpLmltYWdlTGlua1JFLnRlc3QoZSkpe3ZhciBwPWkuaW1hZ2VMaW5rUkUuZXhlYyhlKVswXTtwPXAuc3Vic3RyaW5nKDEscC5sZW5ndGgtMSk7YT0nPGEgaHJlZj1cIicrcCsnXCIgdGFyZ2V0PV9ibGFuaz4nK2ErXCI8L2E+XCJ9YnJlYWs7Y2FzZVwibGlua1wiOmU9ZS5tYXRjaChpLmh0bWxSRSlbMF07YT0nPGlmcmFtZSBjbGFzcz1cInNtYXJrIHdlYnNpdGVcIiBzcmM9XCInK2UrJ1wiIHdpZHRoPVwiODUzXCIgaGVpZ2h0PVwiNDgwXCIgZnJhbWVib3JkZXI9XCIwXCI+PC9pZnJhbWU+JzticmVhaztjYXNlXCJwYXJhZ3JhcGhcIjplPWkucGFyc2VQYXJhZ3JhcGgobyxlKTthPSc8cCBjbGFzcz1cInNtYXJrIHBhcmFncmFwaFwiPicrZStcIjwvcD5cIjticmVhaztkZWZhdWx0OmE9XCJcIn1yZXR1cm4gYX19O3IuZXhwb3J0cz10fSx7XCIuL3BhcmFncmFwaC5qc1wiOjIsXCIuL3JlZ2V4LmpzXCI6MyxcIi4vdHlwZUlzLmpzXCI6NCxcIi4vdHlwb2dyYXBoeS5qc1wiOjV9XSwyOltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9ZShcIi4vcmVnZXguanNcIik7ci5leHBvcnRzPWZ1bmN0aW9uKGUscil7aWYoZSl7cj10aGlzLnR5cG9ncmFwaGljQ2hhbmdlcyhyKX12YXIgYT1cIlwiO3I9bihyKTt2YXIgaT1yLm1hdGNoKHQub2xSRSk7aWYoaSE9PW51bGwpe2Zvcih2YXIgbD0wO2w8aS5sZW5ndGg7bCsrKXt2YXIgcz1pW2xdLm1hdGNoKHQub2xsaVJFKTthPVwiPG9sPlwiO2Zvcih2YXIgcD0wO3A8cy5sZW5ndGg7cCsrKXthKz1cIjxsaT5cIitzW3BdLnJlcGxhY2UodC5vbGxpUkUsXCIkMVwiKStcIjwvbGk+XCJ9YSs9XCI8L29sPlwiO3I9ci5yZXBsYWNlKGlbbF0sYSl9fXZhciBvPXIubWF0Y2godC51bFJFKTtpZihvIT09bnVsbCl7Zm9yKHZhciBsPTA7bDxvLmxlbmd0aDtsKyspe3ZhciBzPW9bbF0ubWF0Y2godC51bGxpUkUpO2E9XCI8dWw+XCI7Zm9yKHZhciBwPTA7cDxzLmxlbmd0aDtwKyspe2ErPVwiPGxpPlwiK3NbcF0ucmVwbGFjZSh0LnVsbGlSRSxcIiQxXCIpK1wiPC9saT5cIn1hKz1cIjwvdWw+XCI7cj1yLnJlcGxhY2Uob1tsXSxhKX19aWYodC5icVJFLnRlc3Qocikpe2lmKHIucmVwbGFjZSh0LmJxUkUsXCIkMlwiKT09PVwiXCIpe3I9ci5yZXBsYWNlKHQuYnFSRSxcIjxibG9ja3F1b3RlPjxwPiQxPC9wPjwvYmxvY2txdW90ZT5cIil9ZWxzZXtyPXIucmVwbGFjZSh0LmJxUkUsXCI8YmxvY2txdW90ZT48cD4kMTwvcD48Zm9vdGVyPiQyPC9mb290ZXI+PC9ibG9ja3F1b3RlPlwiKX19cj1yLnJlcGxhY2UodC5oNlJFLFwiPGg2PiQxPC9oNj5cIik7cj1yLnJlcGxhY2UodC5oNVJFLFwiPGg1PiQxPC9oNT5cIik7cj1yLnJlcGxhY2UodC5oNFJFLFwiPGg0PiQxPC9oND5cIik7cj1yLnJlcGxhY2UodC5oM1JFLFwiPGgzPiQxPC9oMz5cIik7cj1yLnJlcGxhY2UodC5oMlJFLFwiPGgyPiQxPC9oMj5cIik7cj1yLnJlcGxhY2UodC5oMVJFLFwiPGgxPiQxPC9oMT5cIik7cj1yLnJlcGxhY2UodC5oclJFLFwiPGhyIC8+XCIpO3JldHVybiByO2Z1bmN0aW9uIG4oZSl7aWYoZS5yZXBsYWNlKHQubGlua1JFLFwiJDFcIikhPT1cIlwiKXthPSc8YSBocmVmPVwiJDJcIj4kMTwvYT4nO2lmKHQubGlua0JsYW5rUkUudGVzdChlKSl7YT0nPGEgdGFyZ2V0PV9ibGFuayBocmVmPVwiJDJcIj4kMTwvYT4nfX1lPWUucmVwbGFjZSh0LmxpbmtSRSxhKTtpZihlLnJlcGxhY2UodC5saW5rQmFyZVJFLFwiJDFcIikhPT1cIlwiKXthPSc8YSBocmVmPVwiJDFcIj4kMTwvYT4nO2lmKHQubGlua0JsYW5rUkUudGVzdChlKSl7YT0nPGEgdGFyZ2V0PV9ibGFuayBocmVmPVwiJDFcIj4kMTwvYT4nfX1lPWUucmVwbGFjZSh0LmxpbmtCYXJlUkUsYSk7cmV0dXJuIGV9fX0se1wiLi9yZWdleC5qc1wiOjN9XSwzOltmdW5jdGlvbihlLHIsYSl7dmFyIHQ9e3lvdXR1YmVSRTovXig/Omh0dHBzPzpcXC9cXC8pPyg/Ond3d1xcLik/eW91dHUoPzpcXC5iZXxiZVxcLmNvbSlcXC8oPzp3YXRjaHxlbWJlZFxcL3dhdGNofGVtYmVkKT9bXFw/XFwvXT8oPzp2PXxmZWF0dXJlPXBsYXllcl9lbWJlZGRlZCZ2PSk/KFtcXHctX10rKS4qPyQvLHZpbWVvUkU6L14oPzpodHRwcz86XFwvXFwvKT8oPzp3d3dcXC4pP3ZpbWVvXFwuY29tXFwvKD86Y2hhbm5lbHNcXC8pPyg/OlxcdytcXC8pPyhcXGQrKSQvLGltYWdlUkU6L14oPyEgKSguKz9cXC4oPzpqcGd8anBlZ3xnaWZ8cG5nfGJtcCkpKD86IC10aXRsZT1cIiguKz8pXCIpPyg/OlxcKC4rP1xcKSk/JC8saW1hZ2VMaW5rUkU6Lyg/OlxcKCguKz8pXFwpKXsxfS8saHRtbFJFOi9eKCg/IS4qKGpwZ3xqcGVnfGdpZnxwbmd8Ym1wKSkoaHR0cHM/OlxcL1xcLylbXFx3XFwtX10rKFxcLltcXHdcXC1fXSspK1tcXHdcXC0uLEA/Xj0lJjpcXC9+XFxcXCsjXSopfC4rXFwuKD8hanBnfGpwZWd8Z2lmfHBuZ3xibXApaHRtbD8kLyxsaW5rUkU6L1xcWyg/IS0pKC4qPylcXF0oPzp8LWJsYW5rKSA/XFwoKC4rPylcXCkvZyxsaW5rQmxhbmtSRTovXFxbKD8hLSkoLio/KVxcXS1ibGFuayA/XFwoKC4rPylcXCkvZyxsaW5rQmFyZVJFOi9cXFsoPyEtKSguKj8pXFxdKD86LWJsYW5rKT8vZyxsaW5rQmFyZUJsYW5rUkU6L1xcWyg/IS0pKC4qPylcXF0oPzotYmxhbmspL2csb2xSRTovKD86XFxkXFwuXFxzKC4rPykgXFx8ID8pKy9nLG9sbGlSRTovXFxkXFwuXFxzKC4rPykgXFx8L2csdWxSRTovKD86XFwqXFxzKC4rPykgXFx8ID8pKy9nLHVsbGlSRTovXFwqXFxzKC4rPykgXFx8L2csaDZSRTovXFxzPyN7Nn0gKC4rPykgI3s2fVxccz8vZyxoNVJFOi9cXHM/I3s1fSAoLis/KSAjezV9XFxzPy9nLGg0UkU6L1xccz8jezR9ICguKz8pICN7NH1cXHM/L2csaDNSRTovXFxzPyN7M30gKC4rPykgI3szfVxccz8vZyxoMlJFOi9cXHM/I3syfSAoLis/KSAjezJ9XFxzPy9nLGgxUkU6L1xccz8jICguKz8pICNcXHM/L2csaHJSRTovXFxzPy0tLVxccz8vZyxicVJFOi9gYGAoLis/KSg/OlxcWy1zb3VyY2U6XFxzPyguKylcXF0pP2BgYC9nLGRRdW90UkU6LyhefFxccyg/OlsgXFwuLDs6XFxiXFxbXSk/KVxcXFw/XCIoLis/KVxcXFw/XCIoWyBcXC4sOzpcXGJcXF1dKT8vZyxzUXVvdFJFOi8oXnxcXHMoPzpbIFxcLiw7OlxcYlxcW10pPylcXFxcPycoLis/KVxcXFw/JyhbIFxcLiw7OlxcYlxcXV0pPy9nLHZvbFJFOi9cXGJ2b2xcXC5cXHNcXGIvZ2kscFJFOi9cXGJwXFwuXFxzXFxiKD89XFxkKykvZyxjUkU6L1xcYmNcXC5cXHNcXGIoPz1cXGQrKS9nLGZsUkU6L1xcYmZsXFwuXFxzXFxiKD89XFxkKykvZyxpZVJFOi9cXGJpXFwuZVxcLlxccz9cXGIvZyxlZ1JFOi9cXGJlXFwuZ1xcLlxcc1xcYi9nLGFwb3NSRTovKFtBLVphLXpdKyknKFthLXpdKykvZyxlbmRhc2hSRTovKC4rPylcXHMtXFxzKC4rPykvZyxlbGlwc2VSRTovXFwuezN9L2d9O3IuZXhwb3J0cz10fSx7fV0sNDpbZnVuY3Rpb24oZSxyLGEpe3ZhciB0PWUoXCIuL3JlZ2V4LmpzXCIpO3R5cGVJcz1mdW5jdGlvbihlKXtpZih0aGlzLnlvdXR1YmVSRS50ZXN0KGUpKXtyZXR1cm5cInlvdXR1YmVcIn1lbHNlIGlmKHRoaXMudmltZW9SRS50ZXN0KGUpKXtyZXR1cm5cInZpbWVvXCJ9ZWxzZSBpZih0aGlzLmltYWdlUkUudGVzdChlKSl7cmV0dXJuXCJpbWFnZVwifWVsc2UgaWYodGhpcy5odG1sUkUudGVzdChlKSl7cmV0dXJuXCJsaW5rXCJ9ZWxzZXtyZXR1cm5cInBhcmFncmFwaFwifX07ci5leHBvcnRzPXR5cGVJc30se1wiLi9yZWdleC5qc1wiOjN9XSw1OltmdW5jdGlvbihlLHIsYSl7ci5leHBvcnRzPWZ1bmN0aW9uKGUpe2U9ZS5yZXBsYWNlKHRoaXMuZFF1b3RSRSxcIiQxJiM4MjIwOyQyJiM4MjIxOyQzXCIpO2U9ZS5yZXBsYWNlKHRoaXMuc1F1b3RSRSxcIiQxJiM4MjE2OyQyJiM4MjE3OyQzXCIpO2U9ZS5yZXBsYWNlKHRoaXMudm9sUkUsXCJWb2wuXCIpO2U9ZS5yZXBsYWNlKHRoaXMucFJFLFwicC5cIik7ZT1lLnJlcGxhY2UodGhpcy5jUkUsXCI8aT5jLjwvaT5cIik7ZT1lLnJlcGxhY2UodGhpcy5mbFJFLFwiPGk+ZmwuPC9pPlwiKTtlPWUucmVwbGFjZSh0aGlzLmllUkUsXCI8aT5pZTwvaT4gXCIpO2U9ZS5yZXBsYWNlKHRoaXMuZWdSRSxcIjxpPmVnPC9pPiBcIik7ZT1lLnJlcGxhY2UodGhpcy5hcG9zUkUsXCIkMSYjODIxNzskMlwiKTtlPWUucmVwbGFjZSh0aGlzLmVuZGFzaFJFLFwiJDEmIzgyMTE7JDJcIik7ZT1lLnJlcGxhY2UodGhpcy5lbGlwc2VSRSxcIiYjODIzMDtcIik7cmV0dXJuIGV9fSx7fV19LHt9LFsxXSkoMSl9KTtcbiJdfQ==
