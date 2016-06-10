var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

_.templateSettings = {
	interpolate: /\(:(.+?):\)/g,
	evaluate: /\):(.+?):\(/gm
};

// The view renderer that only render once instance of a model
// ie. for displaying a single student's info
module.exports = Backbone.View.extend({
	tagName: "article",
	id: "studentWrapper",

	template: _.template($("#singleStudent").html()),

	render: function(){
		var singleTemplate = this.template(this.model.toJSON());
		this.$el.html(singleTemplate);
		return this;
	}
});