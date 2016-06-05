$(document).ready(function() {
	// Holding page functions
	holdingPageDetails();
	$(window).resize(holdingPageDetails);


	// Save states
	var currMain = "";
	var questionMain = $("#page-content #main .content").html();
	window.currDisID = "";
	window.currDisType = "questions";

	// Tags navigation menu
	$("#page-content #tags-nav li a").hover(function() {
		// Hover in
		var txt = $(this).text().substring(2);
		currMain = $("#page-content #main .content").html();
		$("#page-content #main #main-hover-content").html("<h1>" + txt + "</h1>").css('display', 'block');

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
		$("#page-content #main #main-hover-content").css('display', 'none');
		$("#page-content #name-list a").removeClass("active");
		if (currDisID !== "" && currDisType == "work"){
			$("#page-content #name-list #" + currDisID).addClass("active");
		}

	}).click(function(e){
		$(this).toggleClass('active');

		var txt = $(this).text().substring(1);
		if($(this).hasClass("active")){
			txt = "+" + txt;
		}else{
			txt = "-" + txt;
		}
		$(this).text(txt);

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
			students_list = new collectionView({collection: students_data});
			$("#page-content #names-nav .nav-content").html(students_list.render().$el);
			rebindEvents();
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
		students_list = new collectionView({collection: galleryCollection});
		$("#page-content #names-nav .nav-content").html(students_list.render().$el);
		rebindEvents();


		// Render the gallery
		var gallery_display = new galleryView({collection: galleryCollection});
		$("#page-content #main .content").html(gallery_display.render().$el);
		currMain = $("#page-content #main .content").html();
		currDisType = "gallery";

		// Hover and click event for the gallery items
		$("#page-content #main .content .gallery a").hover(function() {
			var hoverID = $(this).children('img').attr("id").substring(5);
			if(!($("#page-content #name-list #" + hoverID).hasClass("active"))){
				$("#page-content #name-list #" + hoverID).addClass("active");
			}
		}, function() {
			var hoverID = $(this).children('img').attr("id").substring(5);
			if($("#page-content #name-list #" + hoverID).hasClass("active")){
				$("#page-content #name-list #" + hoverID).removeClass("active");
			}
		}).click(function(e) {
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


	// Miscellaneous fix and functions
	// Fix sponsor logo position
	$("#main").scroll(function(e) {
		var margin = -10;
		margin = margin - $("#main").scrollTop();
		$("#sponsors img").css('margin-top', margin);
	});

	setTimeout(function(){
		if($("#main").width() < 780 + $("#main header nav").width()){
			$("#main header").css('background-color', 'white');
		}else{
			$("#main header").css('background-color', 'none');
		}
	}, 1);
	$(window).resize(function(){
		if($("#main").width() < 780 + $("#main header nav").width()){
			$("#main header").css('background-color', 'white');
		}else{
			$("#main header").css('background-color', 'none');
		}
	});
});

function renderStudent(cid){
	var students_display = new singleView({model: students_data.get(cid)});
	$("#page-content #main .content").html(students_display.render().$el);
}

function rebindEvents(){
	// Names navigation menu
	$("#page-content #names-nav li a").click(function(e){
		$("#page-content #names-nav li a").removeClass("active");
		$(this).addClass("active");

		// Render each students data
		var cid = $(this).attr("id");
		renderStudent(cid);
		currDisID = students_data.where({name: $(this).text()})[0].cid;
	});
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