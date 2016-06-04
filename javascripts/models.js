var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

// Initialization for model (probably will not need changing ever)
var model = Backbone.Model.extend({
	defaults:{

	}
});

module.exports = model;