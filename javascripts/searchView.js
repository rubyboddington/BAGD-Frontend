var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

// The view renderer that renders search results

var nameView = Backbone.View.extend({
	tagName: "li",
	template: _.template($("#search-list-name").html()),

	render: function(){
		var nameTemplate = this.template(this.model.toJSON());
		this.$el.html(imageTemplate);
		return this;
	}
});

var searchView = Backbone.View.extend({
	tagName: "ul",
	id: "search-results",

	render: function(){
		this.collection.each(this.addModel, this);
		return this;
	},

	addModel: function(model){
		var view = new nameView({model: model});
		this.$el.append(view.render().$el.html());
	}
});


module.exports = searchView;