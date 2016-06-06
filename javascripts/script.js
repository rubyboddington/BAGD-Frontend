$(document).ready(function() {
	// Holding page functions
	holdingPageDetails();
	$(window).resize(holdingPageDetails);


	// Save states
	var currMain = "";
	var questionMain = $("#page-content #main .content").html();
	var aboutMain = $("#page-content > #about").html();
	var pressMain = $("#page-content > #press").html();
	window.currDisID = "";
	// enums for currDisType: questions, work, about, press, gallery
	window.currDisType = "questions";


	/*--------------------------------------------------------*/
	/*                        Main                            */
	/*--------------------------------------------------------*/
	// Main navigation links
	// Home
	$("#page-content header #main-header #home").click(function(e) {
		$("#page-content #main .content").html(questionMain);
		$("#page-content header #main-header nav a").removeClass('active');
		$("#page-content #name-list a").removeClass("active");
		$("#page-content #tags-nav li a").removeClass("active").each(function(i) {
			setTagsDisplay($(this));
		});
		resetNameList(students_data);
		currDisType = "questions";
	});
	// About
	$("#page-content header #main-header #show").click(function(e) {
		$("#page-content #main .content").html(aboutMain);
		$("#page-content header #main-header nav a").removeClass('active');
		$(this).addClass('active');
		$("#page-content #name-list a").removeClass("active");
		$("#page-content #tags-nav li a").removeClass("active").each(function(i) {
			setTagsDisplay($(this));
		});
		resetNameList(students_data);
		currDisType = "about";
	});
	// Press
	$("#page-content header #main-header #press").click(function(e) {
		$("#page-content #main .content").html(pressMain);
		$("#page-content header #main-header nav a").removeClass('active');
		$(this).addClass('active');
		$("#page-content #name-list a").removeClass("active");
		$("#page-content #tags-nav li a").removeClass("active").each(function(i) {
			setTagsDisplay($(this));
		});
		resetNameList(students_data);
		currDisType = "press";
	});

	// Tags navigation menu
	$("#page-content #tags-nav li a").hover(function() {
		// Hover in
		var txt = $(this).text().substring(2);
		currMain = $("#page-content #main .content").html();
		mainOverlay(true, txt);

		students_data.each(function(student, key){
			var matched = false;
			_.each(student.get("tags"), function(tag, i){
				if (tag == txt){
					matched = true;
				}
			});
			if (matched){
				if(!($("#page-content #name-list #" + student.cid).hasClass("active"))){
					$("#page-content #name-list #" + student.cid).addClass("active");
				}
			}else{
				if($("#page-content #name-list #" + student.cid).hasClass("active")){
					$("#page-content #name-list #" + student.cid).removeClass("active");
				}
			}
		});

	}, function() {
		// Hover out
		mainOverlay(false);
		$("#page-content #name-list a").removeClass("active");
		if (currDisID !== "" && currDisType == "work"){
			$("#page-content #name-list #" + currDisID).addClass("active");
		}

	}).click(function(e){
		// Reset main navigation
		$("#page-content #main header nav a").removeClass("active");

		$(this).toggleClass('active');

		setTagsDisplay($(this));

		// Create a collection of all the works with the tags associated with it
		var galleryCollection;
		var selectedTags = [];

		_($("#page-content #tags-nav .nav-content li a")).each(function(el, i){
			el = $(el);
			if(el.hasClass("active")){
				selectedTags.push(el.text().substring(2));
			}
		});

		// Skip the rest if no tag are selected
		if(_.isEmpty(selectedTags)){
			if (currDisID === ""){
				$("#page-content #main .content").html(questionMain);
				currDisType = "question";
			}else{
				renderStudent(currDisID);
				currDisType = "work";
			}
			resetNameList(students_data);
			return;
		}

		// Create a new filtered collection
		galleryCollection = new Backbone.Collection(students_data.filter(function(student){
			var tags = student.get("tags");
			if (_.isEqual(_.intersection(tags, selectedTags), selectedTags)){
				return true;
			}
		}));

		// Render a new name list
		resetNameList(galleryCollection);

		// Render the gallery
		var gallery_display = new galleryView({collection: galleryCollection});
		$("#page-content #main .content").html(gallery_display.render().$el);
		currMain = $("#page-content #main .content").html();
		currDisType = "gallery";

		// Hover and click event for the gallery items
		$("#page-content #main .content .gallery a").hover(function() {
			// Hover in
			var hoverID = $(this).children('img').attr("id").substring(5);
			if(!($("#page-content #name-list #" + hoverID).hasClass("active"))){
				$("#page-content #name-list #" + hoverID).addClass("active");
			}
		}, function() {
			// Hover out
			var hoverID = $(this).children('img').attr("id").substring(5);
			if($("#page-content #name-list #" + hoverID).hasClass("active")){
				$("#page-content #name-list #" + hoverID).removeClass("active");
			}
		}).click(function(e) {
			// Reset main navigation
			$("#page-content header #main-header nav a").removeClass("active");

			// Render student info
			$("#page-content #names-nav li a").removeClass("active");

			var clickID = $(this).children('img').attr("id").substring(5);
			if(!($("#page-content #name-list #" + clickID).hasClass("active"))){
				$("#page-content #name-list #" + clickID).addClass("active");
			}

			renderStudent(clickID);

			currDisID = clickID;
			currDisType = "work";
		});
	});

	rebindEvents();

	/*--------------------------------------------------------*/
	/*                        Tags                            */
	/*--------------------------------------------------------*/
	$("#page-content header #tags-header #clear-tags").click(function(e) {
		$("#page-content #tags-nav li a").removeClass("active").each(function(i) {
			setTagsDisplay($(this));
		});
		resetNameList(students_data);

		if(currDisID !== ""){
			renderStudent(currDisID);
		}else{
			$("#page-content #main .content").html(questionMain);
		}
	});


	/*--------------------------------------------------------*/
	/*                        Names                           */
	/*--------------------------------------------------------*/
	$("#page-content header #names-header #showcase").click(function(e) {
		if (fullOverlayed){
			fullOverlay(false);

			$("#page-content header #names-header button").removeClass('active');
			if($("#page-content header #names-header #showcase").hasClass('selected')){
				$("#page-content header #names-header #showcase").removeClass('selected');
			}
		}else{
			fullOverlay(true, "<h1>Smaple text</h1>", "#fff");

			$("#page-content header #names-header button").addClass('active');
			if(!($("#page-content header #names-header #showcase").hasClass('selected'))){
				$("#page-content header #names-header #showcase").addClass('selected');
			}
		}
	});

	$("#page-content header #names-header #map").hover(function() {
		// Hover in
		var content = "<object id='map' type='image/svg+xml' data='images/map.svg'>Your browser does not support SVG</object>";
		fullOverlayHover(true, content);
	}, function() {
		//Hover out
		fullOverlayHover(false);
	});



	// Miscellaneous fix and functions
	// Fix sponsor logo position
	$("#main").scroll(function(e) {
		var margin = -10;
		margin = margin - $("#main").scrollTop();
		$("#sponsors img").css('margin-top', margin);
	});

	// Main header background behaviour
	setTimeout(function(){
		if($("#main").width() < 780 + $("header #main-header nav").width()){
			$("header #main-header").css('background-color', 'white');
		}else{
			$("header #main-header").css('background-color', 'none');
		}
	}, 1);
	$(window).resize(function(){
		if($("#main").width() < 780 + $("header #main-header nav").width()){
			$("header #main-header").css('background-color', 'white');
		}else{
			$("header #main-header").css('background-color', 'none');
		}
	});
});


/*--------------------------------------------------------*/
/*                   Custom functions                     */
/*--------------------------------------------------------*/
var fullOverlayed = false;
function fullOverlay(show, content, background){
	if (typeof background == "undefined"){
		background = "rgba(255,255,255,0)";
	}

	if(show){
		$("#page-content #full-overlay").html(content).css({
			display: 'block',
			"background-color": background
		});
		setTimeout(function(){
			$("#page-content #full-overlay").css('opacity', 1);
		}, 10);

		$("#page-content header #tags-header #clear-box").css('display', 'none');
		$("#page-content header #tags-header #search-box #search").css('background-color', '#fff');
		fullOverlayed = true;

	}else{
		$("#page-content #full-overlay").css('opacity', 0);
		setTimeout(function(){
			$("#page-content #full-overlay").html("").css('display', 'none');
		}, 200);

		$("#page-content header #tags-header #clear-box").css('display', "revert");
		$("#page-content header #tags-header #search-box #search").css('background-color', '#ff0');

		fullOverlayed = false;
	}
}

function fullOverlayHover(show, content, background){
	if (typeof background == "undefined"){
		background = "rgba(255,255,255,0)";
	}

	if(show){
		$("#page-content #full-overlay-hover").html(content).css({
			display: 'block',
			"background-color": background
		});
		setTimeout(function(){
			$("#page-content #full-overlay-hover").css('opacity', 1);
		}, 10);

		fullOverlayed = true;

	}else{
		$("#page-content #full-overlay-hover").css('opacity', 0);
		setTimeout(function(){
			$("#page-content #full-overlay-hover").html("").css('display', 'none');
		}, 200);

		fullOverlayed = false;
	}
}

function resetNameList(collection){
	students_list = new collectionView({collection: collection});
	$("#page-content #names-nav .nav-content").html(students_list.render().$el);
	rebindEvents();
}

function setTagsDisplay($el){
	var txt = $el.text().substring(1);
	if($el.hasClass("active")){
		txt = "+" + txt;
	}else{
		txt = "-" + txt;
	}
	$el.text(txt);
}

function renderStudent(cid){
	var students_display = new singleView({model: students_data.get(cid)});
	$("#page-content #main .content").html(students_display.render().$el);

	$("#page-content #main").scrollTop(0);

	var listName = "#page-content #name-list #" + cid;
	if(!($(listName).hasClass('active'))){
		$(listName).addClass('active');
	}
}

function rebindEvents(){
	// Names navigation menu
	$("#page-content #names-nav li a").click(function(e){
		// Reset main navigation
		$("#page-content header #main-header nav a").removeClass("active");

		$("#page-content #names-nav li a").removeClass("active");
		$(this).addClass("active");

		// Render each students data
		var cid = $(this).attr("id");
		renderStudent(cid);
		currDisID = students_data.where({name: $(this).text()})[0].cid;
		currDisType = "work";
		mainOverlay(false);
	}).hover(function() {
		// Hover in
		if(!($(this).hasClass("active"))){
			$(this).addClass("active");
		}
		mainOverlay(true, $(this).text());
	}, function() {
		// Hover out
		if($(this).hasClass("active") && currDisID != $(this).attr("id")){
			$(this).removeClass("active");
		}
	});
	// Just so that in between hover the overlay doesn't flash
	$("#page-content #names-nav ul").hover(function() {}, function() {
		// Hover out
		mainOverlay(false);
	});
}

function mainOverlay(show, content){
	if(show){
		$("#page-content #main #main-hover-content").html("<h1>" + content + "</h1>").css('display', 'block');
	}else{
		$("#page-content #main #main-hover-content").css('display', 'none');
	}
}

function holdingPageDetails(){
	if(window.innerWidth >= 480){
		$("header.holding-page u, header.holding-page #show-details").hover(function() {
			$("header.holding-page #show-details").css('max-height', '1500px');
		}, function() {
			$("header.holding-page #show-details").css('max-height', '0px');
		});
	}
}