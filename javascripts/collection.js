var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;
var model = require("./models.js");

var collection = Backbone.Collection.extend({
	model: model,
	url: "http://bagd-test.herokuapp.com/wp-json/wp/v2/student_info"
});

students_data = new collection();

module.exports = students_data;
