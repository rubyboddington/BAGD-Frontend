var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
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