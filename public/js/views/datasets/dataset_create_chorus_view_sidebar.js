chorus.views.CreateChorusViewSidebar = chorus.views.Sidebar.extend({
    className: "dataset_create_chorus_view_sidebar",

    events: {
        "click button.create": "createChorusView",
        "click a.remove": "removeColumnClicked"
    },

    setup: function() {
        this.selectedHandle = chorus.PageEvents.subscribe("column:selected", this.addColumn, this);
        this.deselectedHandle = chorus.PageEvents.subscribe("column:deselected", this.removeColumn, this);
        this.chorusView = this.model.deriveChorusView()
        this.chorusView.aggregateColumnSet = this.options.aggregateColumnSet;
        this.chorusView.bind("change", this.render, this);
    },

    cleanup: function() {
        this._super("cleanup");
        chorus.PageEvents.unsubscribe(this.selectedHandle);
        chorus.PageEvents.unsubscribe(this.deselectedHandle);
    },

    postRender: function() {
        this.$("a.preview").data("parent", this);
        this.$("a.add_join").data("chorusView", this.chorusView)
    },

    additionalContext: function(ctx) {
        return {
            columns: this.chorusView.sourceObjectColumns,
            joins: this.chorusView.joins,
            valid: this.chorusView.valid()
        }
    },

    addColumn: function(column) {
        this.chorusView.addColumn(column)

        this.$("button.create").prop("disabled", false);
    },

    removeColumn: function(column) {
        if (!column) {
            return;
        }
        this.chorusView.removeColumn(column);
    },

    removeColumnClicked: function(e) {
        e.preventDefault();
        var $li = $(e.target).closest("li");
        var column = this.chorusView.aggregateColumnSet.getByCid($li.data('cid'));
        this.removeColumn(column);
        chorus.PageEvents.broadcast("column:removed", column);
    },

    createChorusView: function() {
        var button = this.$("button.create");
        button.startLoading("actions.creating");

        var chorusView = new chorus.models.ChorusView({
            type: "CHORUS_VIEW",
            query: this.sql(),
            instanceId: this.model.get("instance").id,
            databaseName: this.model.get("databaseName"),
            schemaName: this.model.get("schemaName"),
            objectName: _.uniqueId("chorus_view_"),
            workspace: this.model.get("workspace"),
            objectType: "QUERY"
        });

        var dialog = new chorus.dialogs.NameChorusView({ model : chorusView });
        dialog.launchModal();
    },

    whereClause: function() {
        return this.filters.whereClause();
    },

    fromClause: function() {
        return this.chorusView.fromClause();
    },

    sql: function() {
        return [this.chorusView.selectClause(), this.chorusView.fromClause(), this.whereClause()].join("\n");
    }
});
