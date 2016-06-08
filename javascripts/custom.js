// Bunch of imports
var $ = require("jquery");
var _ = require("underscore");
var Backbone = require("backbone");
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

