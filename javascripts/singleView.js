var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

module.exports = Backbone.View.extend({
	tagName: "article",
	className: "studentWrapper",

	template: _.template($("#singleView").html()),

	render: function(){
		var singleTemplate = this.template(this.model.toJSON());
		this.$el.html(singleTemplate);
		return this;
	}
});