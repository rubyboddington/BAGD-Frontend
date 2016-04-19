var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

var individual = Backbone.View.extend({
	tagName: "article",
	className: "navBtn",

	template: _.template($("#individualView").html()),

	render: function(){
		var modelTemplate = this.template(this.model.toJSON());
		this.$el.html(modelTemplate);
		return this;
	}
});

module.exports = Backbone.View.extend({
	tagName: "section",
	className: "all",

	render: function(){
		this.collection.each(this.addModel, this);
		return this;
	},

	addModel: function(model){
		var modelView = new individual({model: model});
		this.$el.append(modelView.render().$el);
	}
});