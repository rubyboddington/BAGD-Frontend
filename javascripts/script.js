$(document).ready(function() {
	// Holding page functions
	holdingPageDetails();
	$(window).resize(holdingPageDetails);


	// Seed the RNG with today's date
	window.seed = new Date();
	seed = seed.getDate().toString() + seed.getMonth().toString() + seed.getFullYear().toString();
	Math.seedrandom(seed);

	// Save states
	var currMain = "";
	var questionMain = $("#page-content #main .content").html();
	var aboutMain = $("#page-content > #about").html();
	var pressMain = $("#page-content > #press").html();
	var visitMain = $("#page-content > #visit").html();
	window.currDisID = "";
	// enums for currDisType: questions, work, about, press, gallery
	window.currDisType = "questions";

	var allTags = [
				   "Advertising",
				   "Design & Interaction",
				   "Illustration",
				   "Moving Image",
				   "Editorial",
				   "Craft",
				   "Photography",
				   "Typography",
				   "Print",
				   "Web",
				   "Digital Media",
				   "Installation",
				   "Social Design",
				   "Branding",
				   "Fine Art",
				   "Social Media",
				   "Experiential",
				   "Identity",
				   "Problem Solving",
				   "Mapping",
				   "Utopia/Dystopia",
				   "Culture",
				   "Reality/Fiction",
				   "System",
				   "Chaos/Order",
				   "Language",
				   "Storytelling",
				   "Environment",
				   "Technology",
				   "Education",
				   "Society"
				   ];

	// Constants
	window.questions = [
		{
			sectionQuestion: "How do we (re)materialise culture?",
			sectionTags: "history, archeology, old media, craft and traditional techniques, obsolete technology, vintage, retro, experiential"
		},
		{
			sectionQuestion: "How do we (re)design who we are?",
			sectionTags: "gender, identity, anthropology, psychology, behaviour studies, contemporary subcultures, DIY culture, biography, education"
		},
		{
			sectionQuestion: "How is reality formed by narratives?",
			sectionTags: "fiction, non-fiction, reportage, memory, experiential, myths, tales, folklore, personal narrative, stories, biographies, language, communication"
		},
		{
			sectionQuestion: "How does graphic communication (re)solve problems?",
			sectionTags: "problem-solving, problem-revealing"
		},
		{
			sectionQuestion: "Is technology leading us to utopia or dystopia?",
			sectionTags: "connected life, new technologies, UX, social media, internet, alternative future, dystopia & utopia, mass media, information society, speculative design"
		},
		{
			sectionQuestion: "Should design impose order or chaos?",
			sectionTags: "educational, didactic, learning, hacking, disruption, sense, perception, subversion, chance, chaos, systematic thinking, systems, play, editorial"
		},
		{
			sectionQuestion: "How do we find a voice in a commercial world?",
			sectionTags: "consumerism, anti-consumerism, commerce, retail, editorial, branding"
		},
		{
			sectionQuestion: "What is wrong with design/society?",
			sectionTags: "ecology, environment, current affairs, politics, social issues, inequality, activism, play"
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
		$("#page-content #names-nav").scrollTop(0);
		$("#page-content #tags-nav").scrollTop(0);
		$("#page-content #tags-nav li a").removeClass("active").each(function(i) {
			setTagsDisplay($(this));
		});
		resetNameList(students_data);
		currDisType = "questions";

		routes.navigate("", {trigger: false});
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

		routes.navigate("about");
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

		routes.navigate("press", {trigger: false});
	});
	// Visit
	$("#page-content header #main-header #visit").click(function(e) {
		$("#page-content #main .content").html(visitMain);
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
		currDisType = "visit";

		routes.navigate("visit", {trigger: false});
	});

	// Tags navigation menu
	$("#page-content #tags-nav li a").hover(function() {
		// Hover in
		var txt = $(this).text().substring(2);
		txt = txt.replace(/\u00AD/g, "");
		currMain = $("#page-content #main .content").html();
		mainOverlay(true, txt);
		$("#page-content header #main-header").css('display', 'none');

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
		$("#page-content header #main-header").css('display', 'inline');
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
			var t = el.text().replace(/\u00AD/g, "");
			if(el.hasClass("active")){
				selectedTags.push(t.substring(2));
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

	$("#page-content #tags-nav #show-other-tags").click(function(e) {
		$(this).css('display', 'none');
		$("#page-content #tags-nav #other-tags").css('display', 'inline');
	});


	/*--------------------------------------------------------*/
	/*                        Names                           */
	/*--------------------------------------------------------*/
	// Showcase button
	$("#page-content header #names-header #showcase").click(function(e) {
		enterSearchMode(false);

		Math.seedrandom(seed);

		if($("#page-content header #names-header #showcase").hasClass('selected')){
			fullOverlay(false, $(this));
			var s;
			switch(currDisType){
				case "questions":
					routes.navigate("");
					break;

				case "press":
					routes.navigate("press");
					break;

				case "about":
					routes.navigate("about");
					break;

				case "work":
					s = students_data.find(function(student){
						var cid = student.cid;
						return cid == currDisID;
					});
					routes.navigate(s.get("name").replace(/\s/g, "").toLowerCase());
					break;

				case "gallery":
					if(currDisID === ""){
						routes.navigate("");
					}else{
						s = students_data.find(function(student){
							var cid = student.cid;
							return cid == currDisID;
						});
						routes.navigate(s.get("name").replace(/\s/g, "").toLowerCase());
					}
					break;
			}
			$(".hidden").css('display', 'none');
		}else{
			routes.navigate("showcase");

			var galleryCollection = new Backbone.Collection(students_data.sortBy(function(){
				return Math.random();
			}));
			var content = returnRenderedGallery(galleryCollection);

			fullOverlay(true, content, "#fff");

			$("#page-content header #names-header button").addClass('active').removeClass('selected');
			if(!($("#page-content header #names-header #showcase").hasClass('selected'))){
				$("#page-content header #names-header #showcase").addClass('selected');
			}

			$("#page-content #full-overlay .gallery a").click(function(e) {
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

			var s;
			switch(currDisType){
				case "questions":
					routes.navigate("");
					break;

				case "press":
					routes.navigate("press");
					break;

				case "about":
					routes.navigate("about");
					break;

				case "work":
					s = students_data.find(function(student){
						var cid = student.cid;
						return cid == currDisID;
					});
					routes.navigate(s.get("name").replace(/\s/g, "").toLowerCase());
					break;

				case "gallery":
					if(currDisID === ""){
						routes.navigate("");
					}else{
						s = students_data.find(function(student){
							var cid = student.cid;
							return cid == currDisID;
						});
						routes.navigate(s.get("name").replace(/\s/g, "").toLowerCase());
					}
					break;
			}
			$(".hidden").css('display', 'none');
		}else{
			routes.navigate("map");

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
			$("#page-content #full-overlay #map-box #map .sections").hover(function() {
				// Hover in
				var id = $(this).attr("id").substring(1);
				var minimalContent = minimalTemplate(questions[id-1]);
				$("#page-content #full-overlay .fixed").html(minimalContent);
			}, function() {
				// Hover out
				var id = -1;
				$("#page-content #full-overlay #map-box #map .sections").each(function(i) {
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
				$("#page-content #full-overlay .fixed").html(minimalTemplate(obj));

			}).click(function(e) {
				$("#page-content #full-overlay #map-box #map .sections").each(function(i) {
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
				$("#page-content #full-overlay #map-box #map-gallery").html(content);

				var id = activeQuestion.substring(1);
				$("#page-content #full-overlay .fixed").html(minimalTemplate(questions[id-1]));

				$("#page-content #full-overlay #map-box #map-gallery a").click(function(e) {
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
	$("#page-content header #tags-header #search-box #status-icon").click(function(e) {
		$("#page-content header #tags-header #search-box input").trigger("focus");
	});

	$("#page-content header #tags-header #search-box input").keyup(function(e) {
		e.stopPropagation();
		var searchCollection;

		if($(this).val() !== ""){
			var reg = new RegExp(accent_fold($(this).val()).toLowerCase());
			searchCollection = new Backbone.Collection(students_data.filter(function(student){
				return accent_fold(student.get("name")).toLowerCase().match(reg);
			}));

			var selectedTags = [];
			_.each(allTags, function(el){
				if(el.toLowerCase().match(reg)){
					selectedTags.push(el);
				}
			});
			var tagsSearchCollection = new Backbone.Collection(students_data.filter(function(student){
				var tags = student.get("tags");
				if (_.intersection(tags, selectedTags).length !== 0){
					return true;
				}
			}));

			$("#page-content header #tags-header #search-box #status-icon")
				.attr('src', './images/search-exit.png');

			searchCollection.add(tagsSearchCollection.toJSON());
		}else{
			searchCollection = [];

			$("#page-content header #tags-header #search-box #status-icon")
				.attr('src', './images/search-enter.png');
		}

		if($("#page-content header #tags-header #search-box #status-icon").attr('src').match("exit")){
			$("#page-content header #tags-header #search-box #status-icon").click(function(e) {
				$("#page-content header #tags-header #search-box input").val("").trigger('keyup');
			});
		}else{
			$("#page-content header #tags-header #search-box #status-icon").click(function(e) {
				$("#page-content header #tags-header #search-box input").trigger("focus");
			});
		}

		if (searchCollection.length === 0){
			enterSearchMode(false);
		}else if(searchCollection.length > 0 && $("#page-content header #tags-header #search-box input").is(":focus")){
			enterSearchMode(true);
		}

		if (searchCollection.length !== 0){
			var search_display = returnRenderedSearch(searchCollection);
			$("#page-content #search-overlay").html(search_display);
		}

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
		$("#page-content header #tags-header #search-box #search").addClass('active');
		$("#page-content header #main-header").css('background', 'rgba(255,255,255,0)');
		fullOverlayed = true;

	}else{
		$("#page-content #full-overlay").css('opacity', 0);
		setTimeout(function(){
			$("#page-content #full-overlay").html("").css('display', 'none');
		}, 200);

		$("#page-content header #tags-header #search-box #search").removeClass('active');

		if (!(isTagsEmpty())){
			$("#page-content header #tags-header #clear-box").css('display', 'block');
		}

		$("#page-content header #names-header button").removeClass('active');
		if(typeof content != "undefined" && content.hasClass('selected')){
			content.removeClass('selected');
		}

		$("#page-content header #main-header").css('background', 'rgba(255,255,255,255)');
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

	if(_.isEqual(collection, students_data)){
		$("#page-content #name-list").append($("#page-content #missing-names").html());
	}

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
	routes.navigate(students_data.get(cid).get("name").replace(/\s/g, "").toLowerCase());

	var students_display = new singleView({model: students_data.get(cid)});
	$("#page-content #main .content").html(students_display.render().$el);

	$("#page-content #name-list li a").removeClass('active');
	var listName = "#page-content #name-list #" + cid;
	if(!($(listName).hasClass('active'))){
		$(listName).addClass('active');
	}

	$("#page-content #main").scrollTop(0);
}

function returnRenderedGallery(collection){
	var gallery_display = new galleryView({collection: collection});
	return gallery_display.render().$el;
}

function enterSearchMode(enter){
	if(enter){
		if (!fullOverlayed){
			if(!($("#page-content header #tags-header #search").hasClass('active'))){
				$("#page-content header #tags-header #search").addClass('active');
			}
		}

		$("#page-content header #main-header").css('background-color', 'rgba(255,255,255,0)');
		searchOverlay(true);
	}else{
		if (!fullOverlayed){
			$("#page-content header #tags-header #search").removeClass('active');
		}

		$("#page-content header #main-header").css('background-color', 'revert');
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
		$("#page-content header #main-header").css('display', 'none');
	}, function() {
		// Hover out
		if($(this).hasClass("active") && currDisID != $(this).attr("id")){
			$(this).removeClass("active");
		}
		$("#page-content #names-nav ul").mouseleave(function(e) {
			$("#page-content header #main-header").css('display', 'inline');
		});
	});
	// Just so that in between hover the overlay doesn't flash
	$("#page-content #names-nav ul").hover(function() {}, function() {
		// Hover out
		mainOverlay(false);
	});


	/*--------------------------------------------------------*/
	/*                       Questions                        */
	/*--------------------------------------------------------*/
	var questionSelected = "";
	$("#page-content #main #questions u").click(function(e) {
		var qid = $(this).attr('id');
		questionSelected = qid;
		var questionCollection = new Backbone.Collection(students_data.filter(function(student){
			return student.get("question") == qid;
		}));

		resetNameList(questionCollection);
		$("#page-content #main #sponsors").css('display', 'none');
		$(this).siblings().css('opacity', '0');

	}).hover(function() {
		// Hover in
		$("#page-content #name-list li a").removeClass('active');

		var qid = $(this).attr('id');
		if (questionSelected != qid){
			$(this).css('opacity', '1');
		}

		students_data.each(function(student, key){
			if(student.get("question") == qid){
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
		$("#page-content #name-list li a").removeClass('active');
		var qid = $(this).attr('id');

		if (questionSelected !== "" && questionSelected != qid){
			$(this).css('opacity', '0');
		}
	});
}

function mapActive(active){
	if(active){
		$("#page-content #full-overlay #map-box #map text").css('display', 'inline');
	}else{
		$("#page-content #full-overlay #map-box #map text").css('display', 'none');
	}
}

function mainOverlay(show, content){
	// Soft hephen injection here, work on content variable
	switch(content){
		case "Annemarieke Kloosterhof":
			content = injectSoftHyphens(content, 4);
	}

	if(show){
		$("#page-content #main #main-hover-content").html("<h1>" + content + "</h1>").css('display', 'block');
	}else{
		$("#page-content #main #main-hover-content").css('display', 'none');
	}
}

function injectSoftHyphens(string, index){
	var head = string.substring(0, index);
	var tail = string.substring(index, string.length);
	return head + "&shy;" + tail;
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


/*--------------------------------------------------------*/
/*               accent-folding function                  */
/*--------------------------------------------------------*/
var accent_map = {
'ẚ':'a',
'Á':'a',
'á':'a',
'À':'a',
'à':'a',
'Ă':'a',
'ă':'a',
'Ắ':'a',
'ắ':'a',
'Ằ':'a',
'ằ':'a',
'Ẵ':'a',
'ẵ':'a',
'Ẳ':'a',
'ẳ':'a',
'Â':'a',
'â':'a',
'Ấ':'a',
'ấ':'a',
'Ầ':'a',
'ầ':'a',
'Ẫ':'a',
'ẫ':'a',
'Ẩ':'a',
'ẩ':'a',
'Ǎ':'a',
'ǎ':'a',
'Å':'a',
'å':'a',
'Ǻ':'a',
'ǻ':'a',
'Ä':'a',
'ä':'a',
'Ǟ':'a',
'ǟ':'a',
'Ã':'a',
'ã':'a',
'Ȧ':'a',
'ȧ':'a',
'Ǡ':'a',
'ǡ':'a',
'Ą':'a',
'ą':'a',
'Ā':'a',
'ā':'a',
'Ả':'a',
'ả':'a',
'Ȁ':'a',
'ȁ':'a',
'Ȃ':'a',
'ȃ':'a',
'Ạ':'a',
'ạ':'a',
'Ặ':'a',
'ặ':'a',
'Ậ':'a',
'ậ':'a',
'Ḁ':'a',
'ḁ':'a',
'Ⱥ':'a',
'ⱥ':'a',
'Ǽ':'a',
'ǽ':'a',
'Ǣ':'a',
'ǣ':'a',
'Ḃ':'b',
'ḃ':'b',
'Ḅ':'b',
'ḅ':'b',
'Ḇ':'b',
'ḇ':'b',
'Ƀ':'b',
'ƀ':'b',
'ᵬ':'b',
'Ɓ':'b',
'ɓ':'b',
'Ƃ':'b',
'ƃ':'b',
'Ć':'c',
'ć':'c',
'Ĉ':'c',
'ĉ':'c',
'Č':'c',
'č':'c',
'Ċ':'c',
'ċ':'c',
'Ç':'c',
'ç':'c',
'Ḉ':'c',
'ḉ':'c',
'Ȼ':'c',
'ȼ':'c',
'Ƈ':'c',
'ƈ':'c',
'ɕ':'c',
'Ď':'d',
'ď':'d',
'Ḋ':'d',
'ḋ':'d',
'Ḑ':'d',
'ḑ':'d',
'Ḍ':'d',
'ḍ':'d',
'Ḓ':'d',
'ḓ':'d',
'Ḏ':'d',
'ḏ':'d',
'Đ':'d',
'đ':'d',
'ᵭ':'d',
'Ɖ':'d',
'ɖ':'d',
'Ɗ':'d',
'ɗ':'d',
'Ƌ':'d',
'ƌ':'d',
'ȡ':'d',
'ð':'d',
'É':'e',
'Ə':'e',
'Ǝ':'e',
'ǝ':'e',
'é':'e',
'È':'e',
'è':'e',
'Ĕ':'e',
'ĕ':'e',
'Ê':'e',
'ê':'e',
'Ế':'e',
'ế':'e',
'Ề':'e',
'ề':'e',
'Ễ':'e',
'ễ':'e',
'Ể':'e',
'ể':'e',
'Ě':'e',
'ě':'e',
'Ë':'e',
'ë':'e',
'Ẽ':'e',
'ẽ':'e',
'Ė':'e',
'ė':'e',
'Ȩ':'e',
'ȩ':'e',
'Ḝ':'e',
'ḝ':'e',
'Ę':'e',
'ę':'e',
'Ē':'e',
'ē':'e',
'Ḗ':'e',
'ḗ':'e',
'Ḕ':'e',
'ḕ':'e',
'Ẻ':'e',
'ẻ':'e',
'Ȅ':'e',
'ȅ':'e',
'Ȇ':'e',
'ȇ':'e',
'Ẹ':'e',
'ẹ':'e',
'Ệ':'e',
'ệ':'e',
'Ḙ':'e',
'ḙ':'e',
'Ḛ':'e',
'ḛ':'e',
'Ɇ':'e',
'ɇ':'e',
'ɚ':'e',
'ɝ':'e',
'Ḟ':'f',
'ḟ':'f',
'ᵮ':'f',
'Ƒ':'f',
'ƒ':'f',
'Ǵ':'g',
'ǵ':'g',
'Ğ':'g',
'ğ':'g',
'Ĝ':'g',
'ĝ':'g',
'Ǧ':'g',
'ǧ':'g',
'Ġ':'g',
'ġ':'g',
'Ģ':'g',
'ģ':'g',
'Ḡ':'g',
'ḡ':'g',
'Ǥ':'g',
'ǥ':'g',
'Ɠ':'g',
'ɠ':'g',
'Ĥ':'h',
'ĥ':'h',
'Ȟ':'h',
'ȟ':'h',
'Ḧ':'h',
'ḧ':'h',
'Ḣ':'h',
'ḣ':'h',
'Ḩ':'h',
'ḩ':'h',
'Ḥ':'h',
'ḥ':'h',
'Ḫ':'h',
'ḫ':'h',
'H':'h',
'̱':'h',
'ẖ':'h',
'Ħ':'h',
'ħ':'h',
'Ⱨ':'h',
'ⱨ':'h',
'Í':'i',
'í':'i',
'Ì':'i',
'ì':'i',
'Ĭ':'i',
'ĭ':'i',
'Î':'i',
'î':'i',
'Ǐ':'i',
'ǐ':'i',
'Ï':'i',
'ï':'i',
'Ḯ':'i',
'ḯ':'i',
'Ĩ':'i',
'ĩ':'i',
'İ':'i',
'i':'i',
'Į':'i',
'į':'i',
'Ī':'i',
'ī':'i',
'Ỉ':'i',
'ỉ':'i',
'Ȉ':'i',
'ȉ':'i',
'Ȋ':'i',
'ȋ':'i',
'Ị':'i',
'ị':'i',
'Ḭ':'i',
'ḭ':'i',
'I':'i',
'ı':'i',
'Ɨ':'i',
'ɨ':'i',
'Ĵ':'j',
'ĵ':'j',
'J':'j',
'̌':'j',
'ǰ':'j',
'ȷ':'j',
'Ɉ':'j',
'ɉ':'j',
'ʝ':'j',
'ɟ':'j',
'ʄ':'j',
'Ḱ':'k',
'ḱ':'k',
'Ǩ':'k',
'ǩ':'k',
'Ķ':'k',
'ķ':'k',
'Ḳ':'k',
'ḳ':'k',
'Ḵ':'k',
'ḵ':'k',
'Ƙ':'k',
'ƙ':'k',
'Ⱪ':'k',
'ⱪ':'k',
'Ĺ':'a',
'ĺ':'l',
'Ľ':'l',
'ľ':'l',
'Ļ':'l',
'ļ':'l',
'Ḷ':'l',
'ḷ':'l',
'Ḹ':'l',
'ḹ':'l',
'Ḽ':'l',
'ḽ':'l',
'Ḻ':'l',
'ḻ':'l',
'Ł':'l',
'ł':'l',
'̣':'l',
'Ŀ':'l',
'ŀ':'l',
'Ƚ':'l',
'ƚ':'l',
'Ⱡ':'l',
'ⱡ':'l',
'Ɫ':'l',
'ɫ':'l',
'ɬ':'l',
'ɭ':'l',
'ȴ':'l',
'Ḿ':'m',
'ḿ':'m',
'Ṁ':'m',
'ṁ':'m',
'Ṃ':'m',
'ṃ':'m',
'ɱ':'m',
'Ń':'n',
'ń':'n',
'Ǹ':'n',
'ǹ':'n',
'Ň':'n',
'ň':'n',
'Ñ':'n',
'ñ':'n',
'Ṅ':'n',
'ṅ':'n',
'Ņ':'n',
'ņ':'n',
'Ṇ':'n',
'ṇ':'n',
'Ṋ':'n',
'ṋ':'n',
'Ṉ':'n',
'ṉ':'n',
'Ɲ':'n',
'ɲ':'n',
'Ƞ':'n',
'ƞ':'n',
'ɳ':'n',
'ȵ':'n',
'N':'n',
'̈':'n',
'n':'n',
'Ó':'o',
'ó':'o',
'Ò':'o',
'ò':'o',
'Ŏ':'o',
'ŏ':'o',
'Ô':'o',
'ô':'o',
'Ố':'o',
'ố':'o',
'Ồ':'o',
'ồ':'o',
'Ỗ':'o',
'ỗ':'o',
'Ổ':'o',
'ổ':'o',
'Ǒ':'o',
'ǒ':'o',
'Ö':'o',
'ö':'o',
'Ȫ':'o',
'ȫ':'o',
'Ő':'o',
'ő':'o',
'Õ':'o',
'õ':'o',
'Ṍ':'o',
'ṍ':'o',
'Ṏ':'o',
'ṏ':'o',
'Ȭ':'o',
'ȭ':'o',
'Ȯ':'o',
'ȯ':'o',
'Ȱ':'o',
'ȱ':'o',
'Ø':'o',
'ø':'o',
'Ǿ':'o',
'ǿ':'o',
'Ǫ':'o',
'ǫ':'o',
'Ǭ':'o',
'ǭ':'o',
'Ō':'o',
'ō':'o',
'Ṓ':'o',
'ṓ':'o',
'Ṑ':'o',
'ṑ':'o',
'Ỏ':'o',
'ỏ':'o',
'Ȍ':'o',
'ȍ':'o',
'Ȏ':'o',
'ȏ':'o',
'Ơ':'o',
'ơ':'o',
'Ớ':'o',
'ớ':'o',
'Ờ':'o',
'ờ':'o',
'Ỡ':'o',
'ỡ':'o',
'Ở':'o',
'ở':'o',
'Ợ':'o',
'ợ':'o',
'Ọ':'o',
'ọ':'o',
'Ộ':'o',
'ộ':'o',
'Ɵ':'o',
'ɵ':'o',
'Ṕ':'p',
'ṕ':'p',
'Ṗ':'p',
'ṗ':'p',
'Ᵽ':'p',
'Ƥ':'p',
'ƥ':'p',
'P':'p',
'̃':'p',
'p':'p',
'ʠ':'q',
'Ɋ':'q',
'ɋ':'q',
'Ŕ':'r',
'ŕ':'r',
'Ř':'r',
'ř':'r',
'Ṙ':'r',
'ṙ':'r',
'Ŗ':'r',
'ŗ':'r',
'Ȑ':'r',
'ȑ':'r',
'Ȓ':'r',
'ȓ':'r',
'Ṛ':'r',
'ṛ':'r',
'Ṝ':'r',
'ṝ':'r',
'Ṟ':'r',
'ṟ':'r',
'Ɍ':'r',
'ɍ':'r',
'ᵲ':'r',
'ɼ':'r',
'Ɽ':'r',
'ɽ':'r',
'ɾ':'r',
'ᵳ':'r',
'ß':'s',
'Ś':'s',
'ś':'s',
'Ṥ':'s',
'ṥ':'s',
'Ŝ':'s',
'ŝ':'s',
'Š':'s',
'š':'s',
'Ṧ':'s',
'ṧ':'s',
'Ṡ':'s',
'ṡ':'s',
'ẛ':'s',
'Ş':'s',
'ş':'s',
'Ṣ':'s',
'ṣ':'s',
'Ṩ':'s',
'ṩ':'s',
'Ș':'s',
'ș':'s',
'ʂ':'s',
'S':'s',
'̩':'s',
's':'s',
'Þ':'t',
'þ':'t',
'Ť':'t',
'ť':'t',
'T':'t',
'ẗ':'t',
'Ṫ':'t',
'ṫ':'t',
'Ţ':'t',
'ţ':'t',
'Ṭ':'t',
'ṭ':'t',
'Ț':'t',
'ț':'t',
'Ṱ':'t',
'ṱ':'t',
'Ṯ':'t',
'ṯ':'t',
'Ŧ':'t',
'ŧ':'t',
'Ⱦ':'t',
'ⱦ':'t',
'ᵵ':'t',
'ƫ':'t',
'Ƭ':'t',
'ƭ':'t',
'Ʈ':'t',
'ʈ':'t',
'ȶ':'t',
'Ú':'u',
'ú':'u',
'Ù':'u',
'ù':'u',
'Ŭ':'u',
'ŭ':'u',
'Û':'u',
'û':'u',
'Ǔ':'u',
'ǔ':'u',
'Ů':'u',
'ů':'u',
'Ü':'u',
'ü':'u',
'Ǘ':'u',
'ǘ':'u',
'Ǜ':'u',
'ǜ':'u',
'Ǚ':'u',
'ǚ':'u',
'Ǖ':'u',
'ǖ':'u',
'Ű':'u',
'ű':'u',
'Ũ':'u',
'ũ':'u',
'Ṹ':'u',
'ṹ':'u',
'Ų':'u',
'ų':'u',
'Ū':'u',
'ū':'u',
'Ṻ':'u',
'ṻ':'u',
'Ủ':'u',
'ủ':'u',
'Ȕ':'u',
'ȕ':'u',
'Ȗ':'u',
'ȗ':'u',
'Ư':'u',
'ư':'u',
'Ứ':'u',
'ứ':'u',
'Ừ':'u',
'ừ':'u',
'Ữ':'u',
'ữ':'u',
'Ử':'u',
'ử':'u',
'Ự':'u',
'ự':'u',
'Ụ':'u',
'ụ':'u',
'Ṳ':'u',
'ṳ':'u',
'Ṷ':'u',
'ṷ':'u',
'Ṵ':'u',
'ṵ':'u',
'Ʉ':'u',
'ʉ':'u',
'Ṽ':'v',
'ṽ':'v',
'Ṿ':'v',
'ṿ':'v',
'Ʋ':'v',
'ʋ':'v',
'Ẃ':'w',
'ẃ':'w',
'Ẁ':'w',
'ẁ':'w',
'Ŵ':'w',
'ŵ':'w',
'W':'w',
'̊':'w',
'ẘ':'w',
'Ẅ':'w',
'ẅ':'w',
'Ẇ':'w',
'ẇ':'w',
'Ẉ':'w',
'ẉ':'w',
'Ẍ':'x',
'ẍ':'x',
'Ẋ':'x',
'ẋ':'x',
'Ý':'y',
'ý':'y',
'Ỳ':'y',
'ỳ':'y',
'Ŷ':'y',
'ŷ':'y',
'Y':'y',
'ẙ':'y',
'Ÿ':'y',
'ÿ':'y',
'Ỹ':'y',
'ỹ':'y',
'Ẏ':'y',
'ẏ':'y',
'Ȳ':'y',
'ȳ':'y',
'Ỷ':'y',
'ỷ':'y',
'Ỵ':'y',
'ỵ':'y',
'ʏ':'y',
'Ɏ':'y',
'ɏ':'y',
'Ƴ':'y',
'ƴ':'y',
'Ź':'z',
'ź':'z',
'Ẑ':'z',
'ẑ':'z',
'Ž':'z',
'ž':'z',
'Ż':'z',
'ż':'z',
'Ẓ':'z',
'ẓ':'z',
'Ẕ':'z',
'ẕ':'z',
'Ƶ':'z',
'ƶ':'z',
'Ȥ':'z',
'ȥ':'z',
'ʐ':'z',
'ʑ':'z',
'Ⱬ':'z',
'ⱬ':'z',
'Ǯ':'z',
'ǯ':'z',
'ƺ':'z',

// Roman fullwidth ascii equivalents: 0xff00 to 0xff5e
'２':'2',
'６':'6',
'Ｂ':'B',
'Ｆ':'F',
'Ｊ':'J',
'Ｎ':'N',
'Ｒ':'R',
'Ｖ':'V',
'Ｚ':'Z',
'ｂ':'b',
'ｆ':'f',
'ｊ':'j',
'ｎ':'n',
'ｒ':'r',
'ｖ':'v',
'ｚ':'z',
'１':'1',
'５':'5',
'９':'9',
'Ａ':'A',
'Ｅ':'E',
'Ｉ':'I',
'Ｍ':'M',
'Ｑ':'Q',
'Ｕ':'U',
'Ｙ':'Y',
'ａ':'a',
'ｅ':'e',
'ｉ':'i',
'ｍ':'m',
'ｑ':'q',
'ｕ':'u',
'ｙ':'y',
'０':'0',
'４':'4',
'８':'8',
'Ｄ':'D',
'Ｈ':'H',
'Ｌ':'L',
'Ｐ':'P',
'Ｔ':'T',
'Ｘ':'X',
'ｄ':'d',
'ｈ':'h',
'ｌ':'l',
'ｐ':'p',
'ｔ':'t',
'ｘ':'x',
'３':'3',
'７':'7',
'Ｃ':'C',
'Ｇ':'G',
'Ｋ':'K',
'Ｏ':'O',
'Ｓ':'S',
'Ｗ':'W',
'ｃ':'c',
'ｇ':'g',
'ｋ':'k',
'ｏ':'o',
'ｓ':'s',
'ｗ':'w'};

var accentMap = {
    'á':'a', 'é':'e', 'í':'i','ó':'o','ú':'u'
};

function accent_fold (s) {
	if (!s) { return ''; }
    var ret = '';
    for (var i=0; i<s.length; i++) {
		ret += accent_map[s.charAt(i)] || s.charAt(i);
    }
    return ret;
}


// accent_folded_hilite("Fulanilo López", 'lo')
//   --> "Fulani<b>lo</b> <b>Ló</b>pez"
//
function accent_folded_hilite(str, q) {
	var str_folded = accent_fold(str).toLowerCase().replace(/[<>]+/g, '');
	var q_folded = accent_fold(q).toLowerCase().replace(/[<>]+/g, '');

	// create an intermediary string with hilite hints
	// example: fulani<lo> <lo>pez
	var re = new RegExp(q_folded, 'g');
	var hilite_hints = str_folded.replace(re, '<'+q_folded+'>');

	// index pointer for the original string
	var spos = 0;
	// accumulator for our final string
	var highlighted = '';

	// walk down the original string and the hilite hint
	// string in parallel. when you encounter a < or > hint,
	// append the opening / closing tag in our final string.
	// if the current char is not a hint, append the corresponding
	// char from the *original* string to our final string and
	// advance the original string's pointer.
	for (var i=0; i<hilite_hints.length; i++) {
		var c = str.charAt(spos);
		var h = hilite_hints.charAt(i);
		if (h === '<') {
			highlighted += '<b>';
		} else if (h === '>') {
			highlighted += '</b>';
		} else {
			spos += 1;
			highlighted += c;
		}
	}
	return highlighted;
}
