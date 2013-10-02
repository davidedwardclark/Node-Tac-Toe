(function () {

	Game = Backbone.Model.extend({});

	Games = Backbone.Collection.extend({
		model: Game,
		url: '/stats/data/'
	});

	gameSet = new Games();

	GameView = Backbone.View.extend({
		tagName: 'div',
		className: 'game',
		initialize: function () {
			this.model.bind('change', this.render, this);
			this.template = _.template($('#game-template').html());
		},
		render: function () {
			var renderedContent = this.template(this.model.toJSON());
			$(this.el).html(renderedContent);
			return this;
		}
	});

	SetGameView = GameView.extend({});

	SetView = Backbone.View.extend({
		tagName: 'section',
		initialize: function () {
			this.collection.bind('reset', this.render, this);
			this.template = _.template($('#set-template').html());
		},
		render: function () {
			var $games;
			var collection = this.collection;
			$(this.el).html(this.template({}));
			$games = this.$('.games');
			collection.each(function (game) {
				var view = new SetGameView({
					model: game,
					collection: collection
				});
				$games.append(view.render().el);
			});
			return this;
		}
	});

	NTTStats = Backbone.Router.extend({
		routes: {
			'': 'home'
		},
		initialize: function () {
			this.setView = new SetView({
				collection: gameSet
			});
		},
		home: function () {
			var $container = $('.container');
			$container.empty();
			$container.append(this.setView.render().el);
		}
	});

	$(document).ready(function () {
		App = new NTTStats();
		Backbone.history.start({ pushState: true });
	});

})();