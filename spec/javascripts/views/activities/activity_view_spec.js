describe("chorus.views.Activity", function() {
    beforeEach(function() {
        this.loadTemplate("activity");
    });

    describe("type: NOTE", function() {
        beforeEach(function() {
            var author = {
                id : "1234",
                lastName : "Smith",
                firstName : "Bob"
            }
            this.activity = new chorus.models.Activity({
                author: author,
                type: "NOTE",
                text: "How about that.",
                timestamp: "2011-12-01 00:00:00"
            });

            this.view = new chorus.views.Activity({model: this.activity});
        });

        describe("#render", function() {
            beforeEach(function() {
                this.view.render();
            });

            it("displays the image for the author", function() {
                expect(this.view.$("img").attr("src")).toBe(this.view.model.author().imageUrl());
            });

            it("displays the name of the author", function() {
               expect(this.view.$(".author").text().trim()).toBe(this.view.model.author().displayName());
            });

            it("links the author's name to the author's show page", function() {
                expect(this.view.$("a.author").attr("href")).toBe(this.view.model.author().showUrl());
            });

            it("displays the type of action being taken", function() {
                expect(this.view.$(".verb").text().trim()).not.toBeEmpty();
            });

            it("displays the object of the action", function() {
               expect(this.view.$(".object").text()).toContain(this.view.model._objectName());
            });

            it("links the object to the object's URL", function() {
                expect(this.view.$(".object a").attr("href")).toBe(this.view.model._objectUrl());
            });

            it("displays the name of the workspace", function() {
               expect(this.view.$(".workspace").text()).toContain(this.view.model._workspaceName());
            });

            it("links the object to the object's URL", function() {
                expect(this.view.$(".workspace a").attr("href")).toBe(this.view.model._workspaceUrl());
            });

            it("displays the comment body", function() {
               expect(this.view.$(".body").text().trim()).toBe(this.view.model.get("text"));
            });

            it("displays the timestamp", function() {
                expect(this.view.$(".timestamp").text()).not.toBeEmpty();
            });
        });
    });
});