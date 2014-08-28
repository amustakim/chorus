describe("chorus.views.ActivityListHeader", function () {
    beforeEach(function () {
        this.workspace = backboneFixtures.workspace();
        this.collection = this.workspace.activities();

        this.view = new chorus.views.ActivityListHeader({
            model: this.workspace,
            allTitle: "the_all_title_i_passed",
            insightsTitle: "the_insights_title_i_passed"
        });
    });

    it("doesn't re-render when the activity list changes", function () {
        expect(this.view.persistent).toBeTruthy();
    });

    describe("#pickTitle", function () {
        it("has the right 'insight' title", function () {
            this.view.collection.attributes.insights = true;
            expect(this.view.pickTitle()).toBe("the_insights_title_i_passed");
        });

        it("has the right 'all activities' title", function () {
            this.view.collection.attributes.insights = false;
            expect(this.view.pickTitle()).toBe("the_all_title_i_passed");
        });
    });

    describe("#setup", function () {
        describe("#render", function () {
            beforeEach(function () {
                this.view.render();
            });

            context("when there is no tagBox subview in options", function () {
                it("does not show a tag_box element", function () {
                    expect(this.view.$('.tag_box')).not.toExist();
                });
            });

            context("when it has a tag box subview in options", function () {
                beforeEach(function () {
                    this.workspace = backboneFixtures.workspace(
                        {tags: [
                            {name: 'alpha'}
                        ]
                        });
                    this.view = new chorus.views.ActivityListHeader({
                        model: this.workspace,
                        allTitle: "the_all_title_i_passed",
                        insightsTitle: "the_insights_title_i_passed",
                        tagBox: new chorus.views.TagBox({model: this.workspace})
                    });
                    this.view.render();
                });

                it("has tags", function () {
                    expect(this.view.$('.text-tags')).toContainText("alpha");
                });
            });

            context("when insights mode is true", function () {
                beforeEach(function () {
                    this.view.collection.attributes.insights = true;
                    this.view.render();
                });

                it("displays the title for 'insights'", function () {
                    expect(this.view.$(".workspace_title")).toContainText(this.view.pickTitle());
                    expect(this.view.$(".workspace_title")).toHaveAttr("title", this.view.pickTitle());
                });

                it("displays 'Insight' in activities filter dropdown", function () {
                    expect(this.view.$(".activities_filter").val()).toBe("only_insights");
                });
            });

            context("when insights is set to false", function () {
                it("displays the title for 'all' mode by default", function () {
                    expect(this.view.$(".workspace_title")).toContainText(this.view.pickTitle());
                    expect(this.view.$(".workspace_title")).toHaveAttr("title", this.view.pickTitle());
                });

                it("displays the workspace icon", function () {
                    expect(this.view.$(".title img")).toHaveAttr("src", this.workspace.defaultIconUrl());
                });

                it("displays 'All Activity' in the filter dropdown", function () {
                    expect(this.view.$(".activities_filter").val()).toBe("all_activity");
                });

                describe("selecting 'Insights' in the dropdown", function () {
                    beforeEach(function () {
                        this.server.reset();
                        this.collection.loaded = true;
                        spyOn(this.collection, 'reset');
                        this.view.$(".activities_filter").val("only_insights").change();
                    });

                    it("switches the activity set to 'insights' mode and re-fetches it", function () {
                        expect(this.collection.attributes.insights).toBeTruthy();
                        expect(this.collection).toHaveBeenFetched();
                    });

                    it("switches to the title for 'insights' mode", function () {
                        expect(this.view.$(".workspace_title")).toContainText(this.view.pickTitle());
                        expect(this.view.$(".workspace_title")).toHaveAttr("title", this.view.pickTitle());
                    });

                    it("clears the loaded flag on the collection", function () {
                        expect(this.collection.loaded).toBeFalsy();
                    });

                    it("resets the collection", function () {
                        expect(this.collection.reset).toHaveBeenCalled();
                    });
                });

                describe("selecting 'All Activity' in the dropdown", function () {
                    beforeEach(function () {
                        this.server.reset();
                        spyOn(this.collection, 'reset');
                        this.view.$(".activities_filter").val("all_activity").change();
                    });

                    it("switches the activity set to 'all' mode (not just insights) and re-fetches it", function () {
                        expect(this.collection.attributes.insights).toBeFalsy();
                        expect(this.collection).toHaveBeenFetched();
                    });

                    it("switches back to the title for 'all' mode", function () {
                        expect(this.view.$(".workspace_title")).toContainText(this.view.pickTitle());
                        expect(this.view.$(".workspace_title")).toHaveAttr("title", this.view.pickTitle());
                    });

                    it("clears the loaded flag on the collection", function () {
                        expect(this.collection.loaded).toBeFalsy();
                    });

                    it("resets the collection", function () {
                        expect(this.collection.reset).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
