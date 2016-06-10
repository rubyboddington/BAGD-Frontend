var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
Backbone.$ = $;

// The view renderer that renders a gallery of images

var imageView = Backbone.View.extend({
	template: _.template($("#singleImage").html()),

	render: function(){
		if (this.model.get("hero_image_medium") || this.model.get("hero_video_image")){
			var imageTemplate = this.template(this.model.toJSON());
			this.$el.html(imageTemplate);
		}else{
			this.$el.html("");
		}
		return this;
	}
});

var galleryView = Backbone.View.extend({
	tagName: "article",
	className: "gallery",

	render: function(){
		this.collection.each(this.addModel, this);
		return this;
	},

	addModel: function(model){
		var view = new imageView({model: model});
		this.$el.append(view.render().$el.html());
	}
});


module.exports = galleryView;