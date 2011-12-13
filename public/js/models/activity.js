;(function(ns) {
    var generateHeader = {
        "NOTE" : function(activity) {
            var author = activity.author();
            return t("activity_stream.header.html.NOTE", author.showUrl(), author.displayName(),
                activity._objectUrl(), activity._objectName(), activity._workspaceUrl(), activity._workspaceName());
        }
    };

    ns.Activity = chorus.models.Base.extend({
        author : function() {
            this._author = this._author || new chorus.models.User(this.get("author"));
            return this._author;
        },

        headerHtml : function() {
            return generateHeader[this.get("type")](this);
        },

        _objectName : function() {
            return "NEED_OBJECT_FROM_API";
        },

        _objectUrl : function() {
            return "/NEED/OBJECT/FROM/API"
        },

        _workspaceName : function() {
            return "NEED_WORKSPACE_FROM_API";
        },

        _workspaceUrl : function() {
            return "/NEED/WORKSPACE/FROM/API"
        }
    });
})(chorus.models);
