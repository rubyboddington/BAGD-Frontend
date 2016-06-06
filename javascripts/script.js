$(document).ready(function() {
	// Holding page functions
	holdingPageDetails();
	$(window).resize(holdingPageDetails);


	// Seed the RNG with today's date
	var seed = new Date();
	seed = seed.getDate().toString() + seed.getMonth().toString + seed.getFullYear().toString();
	Math.seedrandom(seed);

	// Save states
	var currMain = "";
	var questionMain = $("#page-content #main .content").html();
	var aboutMain = $("#page-content > #about").html();
	var pressMain = $("#page-content > #press").html();
	window.currDisID = "";
	// enums for currDisType: questions, work, about, press, gallery
	window.currDisType = "questions";

	// Constants
	window.questions = [
		{
			sectionQuestion: "How does graphic communication (re)solve problems?",
			sectionTags: "problem-solving, problem-revealing"
		},
		{
			sectionQuestion: "How do we find a voice in a commercial world?",
			sectionTags: "consumerism, anti-consumerism, commerce, retail, editorial, branding"
		},
		{
			sectionQuestion: "How do we (re)design who we are?",
			sectionTags: "gender, identity, anthropology, psychology, behaviour studies, contemporary subcultures, DIY culture, biography, education"
		},
		{
			sectionQuestion: "Is technology leading us to utopia or dystopia?",
			sectionTags: "connected life, new technologies, UX, social media, internet, alternative future, dystopia & utopia, mass media, information society, speculative design"
		},
		{
			sectionQuestion: "How do we (re)materialise culture?",
			sectionTags: "history, archeology, old media, craft and traditional techniques, obsolete technology, vintage, retro, experiential"
		},
		{
			sectionQuestion: "What is wrong with design/society?",
			sectionTags: "ecology, environment, current affairs, politics, social issues, inequality, activism, play"
		},
		{
			sectionQuestion: "How is reality formed by narratives?",
			sectionTags: "fiction, non-fiction, reportage, memory, experiential, myths, tales, folklore, personal narrative, stories, biographies, language, communication"
		},
		{
			sectionQuestion: "Should design impose order or chaos?",
			sectionTags: "educational, didactic, learning, hacking, disruption, sense, perception, subversion, chance, chaos, systematic thinking, systems, play, editorial"
		}
	];


	/*--------------------------------------------------------*/
	/*                        Main                            */
	/*--------------------------------------------------------*/
	// Main navigation links
	// Home
	$("#page-content header #main-header #home").click(function(e) {
		$("#page-content #main .content").html(questionMain);
		$("#page-content header #main-header nav a").removeClass('active');
		enterSearchMode(false);
		fullOverlay(false, $("#page-content header #names-header #showcase, #page-content header #names-header #map"));
		$("#page-content header #tags-header #clear-box").css('display', 'none');
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
		enterSearchMode(false);
		fullOverlay(false, $("#page-content header #names-header #showcase, #page-content header #names-header #map"));
		$("#page-content header #tags-header #clear-box").css('display', 'none');
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
		enterSearchMode(false);
		fullOverlay(false, $("#page-content header #names-header #showcase, #page-content header #names-header #map"));
		$("#page-content header #tags-header #clear-box").css('display', 'none');
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
		var selectedTags = [];

		_($("#page-content #tags-nav .nav-content li a")).each(function(el, i){
			el = $(el);
			if(el.hasClass("active")){
				selectedTags.push(el.text().substring(2));
			}
		});

		// Skip the rest if no tag are selected
		if(isTagsEmpty()){
			if (currDisID === ""){
				$("#page-content #main .content").html(questionMain);
				currDisType = "question";
			}else{
				renderStudent(currDisID);
				currDisType = "work";
			}
			resetNameList(students_data);
			$("#page-content header #tags-header #clear-box").css('display', 'none');
			return;
		}

		$("#page-content header #tags-header #clear-box").css('display', 'block');

		// Create a new filtered collection
		var galleryCollection = new Backbone.Collection(students_data.filter(function(student){
			var tags = student.get("tags");
			if (_.isEqual(_.intersection(tags, selectedTags), selectedTags)){
				return true;
			}
		}));

		// Render a new name list
		resetNameList(galleryCollection);

		// Render the gallery
		$("#page-content #main .content").html(returnRenderedGallery(galleryCollection));
		currDisType = "gallery";
		currMain = $("#page-content #main .content").html();

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
		$("#page-content header #tags-header #clear-box").css('display', 'none');
	});


	/*--------------------------------------------------------*/
	/*                        Names                           */
	/*--------------------------------------------------------*/
	// Showcase button
	$("#page-content header #names-header #showcase").click(function(e) {
		enterSearchMode(false);

		Math.seedrandom(seed);
		if (fullOverlayed){
			// Hide overlay
			fullOverlay(false, $(this));
		}else{
			// Show overlay
			var galleryCollection = new Backbone.Collection(students_data.sortBy(function(){
				return Math.random();
			}));
			var content = returnRenderedGallery(galleryCollection);

			fullOverlay(true, content, "#fff");

			$("#page-content header #names-header button").addClass('active').removeClass('selected');
			if(!($("#page-content header #names-header #showcase").hasClass('selected'))){
				$("#page-content header #names-header #showcase").addClass('selected');
			}

			$("#page-content #search-overlay .gallery a").click(function(e) {
				var cid = $(this).children('img').attr('id').substring(5);
				fullOverlay(false, $("#page-content header #names-header #showcase"));

				renderStudent(cid);
			});
		}
	});

	// Map button
	$("#page-content header #names-header #map").hover(function() {
		// Hover in
		var template = _.template($("#page-content #map-nav").html());
		var content = template({
			sectionQuestion: "",
			sectionTags: ""
		});
		fullOverlayHover(true, content);
	}, function() {
		//Hover out
		fullOverlayHover(false);
	}).click(function(e) {
		enterSearchMode(false);

		if($("#page-content header #names-header #map").hasClass('selected')){
			fullOverlay(false, $(this));
			mapActive(false);
		}else{
			$("#page-content header #names-header button").addClass('active').removeClass('selected');
			if(!($("#page-content header #names-header #map").hasClass('selected'))){
				$("#page-content header #names-header #map").addClass('selected');
			}

			var template = _.template($("#page-content #map-nav").html());
			var content = template({
				sectionQuestion: "",
				sectionTags: ""
			});
			fullOverlay(true, content, "#fff");

			mapActive(true);

			var minimalTemplate = _.template($("#page-content #map-nav .fixed").html());
			$("#page-content #search-overlay #map-box #map .sections").hover(function() {
				// Hover in
				var id = $(this).attr("id").substring(1);
				var minimalContent = minimalTemplate(questions[id-1]);
				$("#page-content #search-overlay .fixed").html(minimalContent);
			}, function() {
				// Hover out
				var id = -1;
				$("#page-content #search-overlay #map-box #map .sections").each(function(i) {
					if($(this).attr('class').match("active")){
						id = $(this).attr("id").substring(1);
					}
				});

				var obj;
				if(id == -1){
					obj = {
						sectionQuestion: "",
						sectionTags: ""
					};
				}else{
					obj = questions[id-1];
				}
				$("#page-content #search-overlay .fixed").html(minimalTemplate(obj));

			}).click(function(e) {
				$("#page-content #search-overlay #map-box #map .sections").each(function(i) {
					if($(this).attr('class').match("active")){
						var noActive = $(this).attr('class').replace(" active", "");
						$(this).attr('class', noActive);
					}
				});
				if(!($(this).attr('class').match("active"))){
					var currentClasses = $(this).attr('class');
					$(this).attr('class', currentClasses + " active");
				}

				var activeQuestion = $(this).attr('id');
				var questionGalleryCollection = new Backbone.Collection(students_data.filter(function(student){
					return activeQuestion == student.get("question");
				}));

				var content = returnRenderedGallery(questionGalleryCollection);
				$("#page-content #search-overlay #map-box #map-gallery").html(content);

				var id = activeQuestion.substring(1);
				$("#page-content #search-overlay .fixed").html(minimalTemplate(questions[id-1]));

				$("#page-content #search-overlay #map-box #map-gallery a").click(function(e) {
					var cid = $(this).children('img').attr('id').substring(5);
					fullOverlay(false, $("#page-content header #names-header #map"));

					renderStudent(cid);
				});
			});
		}
	});

	/*--------------------------------------------------------*/
	/*                      Search Box                        */
	/*--------------------------------------------------------*/
	$("#page-content header #tags-header #search-box input").keyup(function(e) {
		e.stopPropagation();
		var searchCollection;

		if($(this).val() !== ""){
			var reg = new RegExp($(this).val().toLowerCase());
			searchCollection = new Backbone.Collection(students_data.filter(function(student){
				return student.get("name").toLowerCase().match(reg);
			}));
		}else{
			searchCollection = [];
		}

		if (searchCollection.length === 0){
			enterSearchMode(false);
		}else if(searchCollection.length > 0 && $("#page-content header #tags-header #search-box input").is(":focus")){
			enterSearchMode(true);
		}

		var search_display = returnRenderedSearch(searchCollection);
		$("#page-content #search-overlay").html(search_display);

		$("#page-content #search-overlay #search-results a").click(function(e) {
			var cid = $(this).attr("id");
			renderStudent(cid);

			enterSearchMode(false);
		});
	});


	/*--------------------------------------------------------*/
	/*                          MISC                          */
	/*--------------------------------------------------------*/
	// Miscellaneous fix and functions
	// Fix sponsor logo position
	$("#main").scroll(function(e) {
		var margin = -10;
		margin = margin - $("#main").scrollTop();
		$("#sponsors img").css('margin-top', margin);
	});

	// Main header background behaviour
	setTimeout(function(){
		if($("#main").width() < $("#page-content #main .details >article").width() + $("header #main-header nav").width()){
			$("header #main-header").css('background-color', 'white');
		}else{
			$("header #main-header").css('background-color', 'none');
		}
	}, 1);
	$(window).resize(function(){
		if($("#main").width() < $("#page-content #main .details >article").width() + $("header #main-header nav").width()){
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

		$("#page-content header #tags-header #search-box #search").css('background-color', '#ff0');

		if (!(isTagsEmpty())){
			$("#page-content header #tags-header #clear-box").css('display', 'block');
		}

		$("#page-content header #names-header button").removeClass('active');
		if(typeof content != "undefined" && content.hasClass('selected')){
			content.removeClass('selected');
		}

		fullOverlayed = false;
	}
}

function isTagsEmpty(){
	var selectedTags = [];

	_($("#page-content #tags-nav .nav-content li a")).each(function(el, i){
		el = $(el);
		if(el.hasClass("active")){
			selectedTags.push(el.text().substring(2));
		}
	});

	return _.isEmpty(selectedTags);
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
	}else{
		$("#page-content #full-overlay-hover").css('opacity', 0);
		setTimeout(function(){
			$("#page-content #full-overlay-hover").html("").css('display', 'none');
		}, 200);
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

	$("#page-content #name-list li a").removeClass('active');
	var listName = "#page-content #name-list #" + cid;
	if(!($(listName).hasClass('active'))){
		$(listName).addClass('active');
	}
}

function returnRenderedGallery(collection){
	var gallery_display = new galleryView({collection: collection});
	return gallery_display.render().$el;
}

function enterSearchMode(enter){
	if(enter){
		searchOverlay(true);
	}else{
		searchOverlay(false);
	}
}

function searchOverlay(show){
	if(show){
		$("#page-content header #names-header button").css('display', 'none');
		$("#page-content #search-overlay").css({
			display: 'block',
			"background-color": "#fff"
		});
		setTimeout(function(){
			$("#page-content #search-overlay").css('opacity', 1);
		}, 10);

		$("#page-content header #tags-header #clear-box").css('display', 'none');

	}else{
		$("#page-content header #names-header button").css('display', 'inline-block');

		$("#page-content #search-overlay").css('opacity', 0);
		setTimeout(function(){
			$("#page-content #search-overlay").html("").css('display', 'none');
		}, 200);

		if (!(isTagsEmpty())){
			$("#page-content header #tags-header #clear-box").css('display', 'block');
		}
	}
}

function returnRenderedSearch(collection){
	var search_display = new searchView({collection: collection});
	return search_display.render().$el;
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

function mapActive(active){
	if(active){
		$("#page-content #search-overlay #map-box #map text").css('display', 'inline');
	}else{
		$("#page-content #search-overlay #map-box #map text").css('display', 'none');
	}
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