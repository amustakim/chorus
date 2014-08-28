chorus.views.ActivityListHeader = chorus.views.Base.extend({
    constructorName: "ActivityListHeaderView",
    templateName : "activity_list_header",
    additionalClass: 'list_header',
    persistent: true,

    events: {
        "change .activities_filter": "onFilterChange"
    },

    subviews: {
        '.tag_box': 'tagBox'
    },

    setup: function() {
        if(!this.collection) {
            this.collection = this.model.activities();
        }

        this.allTitle = this.options.allTitle;
        this.insightsTitle = this.options.insightsTitle;
        this.tagBox = this.options.tagBox;
    },

    postRender: function() {

        _.defer(_.bind(function () {
            chorus.styleSelect(this.selectElement());
        }, this));
        var value = this.collection.attributes.insights ? "only_insights" : "all_activity";
        this.selectElement().val(value);
    },

    additionalContext: function() {
        return {
            title: this.pickTitle(),
            iconUrl: this.model && this.model.defaultIconUrl(),
            tagBox: this.tagBox
        };
    },

    pickTitle: function() {
        return this.collection.attributes.insights ? this.insightsTitle : this.allTitle;
    },

    reloadCollection: function() {
        this.collection.loaded = false;
        this.collection.reset();
        this.collection.fetch();
        this.render();
    },

    onFilterChange: function(e) {
        e && e.preventDefault();

        this.collection.attributes.insights = this.isInsightsOnly();
        this.reloadCollection();
    },

    isInsightsOnly: function() {
        return this.selectElement().val() === "only_insights";
    },

    selectElement: function() {
        return this.$("select.activities_filter");
    }
});
