var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var model = require("./models.js");

// The collections of data that we import in from the wordpress server.
var collection = Backbone.Collection.extend({
	model: model,
	// url: "http://2016.csmgraphicdesign.com/wp-json/wp/v2/student_info"
	url: "http://localhost/wordpress/wp-json/wp/v2/student_info",

	comparator: "name"
});

students_data = new collection();

module.exports = students_data;
