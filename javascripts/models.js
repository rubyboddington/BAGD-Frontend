var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

// Initialization
var model = Backbone.Model.extend({
	defaults:{
		email: "placeholder@generic.com",
		name: "David Bowie",
		website: "www.google.com"
	}
});

module.exports = model;