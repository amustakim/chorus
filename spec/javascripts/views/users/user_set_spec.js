describe("chorus.views.UserIndexMain", function() {
    beforeEach(function() {
        this.loadTemplate("header");
        this.loadTemplate("breadcrumbs");
        this.loadTemplate("main_content");
        this.loadTemplate("default_content_header");
        this.loadTemplate("user_count");
        this.loadTemplate("user_set");
        this.loadTemplate("user_set_sidebar");

        chorus.user = new chorus.models.User({
            "firstName" : "Daniel",
            "lastName" : "Burkes",
            "fullName": "Daniel Francis Burkes"
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            this.view = new chorus.views.UserIndexMain();
            this.view.content.collection.loaded = true
            this.view.render();
        })
        it("displays the number of users", function() {
            expect(this.view.$(".user_count").text().trim()).toBe("0 Users");
        });
    })
})

describe("chorus.views.UserSet", function() {
    beforeEach(function() {
        this.loadTemplate("user_set");
        this.loadTemplate("main_content");
        fixtures.model = 'UserSet';
    });

    describe("#render", function() {
        describe("when the collection has loaded", function() {
            beforeEach(function() {
                this.collection = fixtures.modelFor('fetch');
                this.collection.loaded = true;
                this.view = new chorus.views.UserSet({collection: this.collection});
                this.view.render();
            });

            it("should not have a loading element", function() {
                expect(this.view.$(".loading")).not.toExist();
            });


            it("displays the list of users", function() {
                expect(this.view.$("ul.users")).toExist();
                expect(this.view.$("ul.users li").length).toBe(2);
            });

            it("displays the Administrator tag for admin users", function() {
                expect(this.view.$("ul.users li[data-userName=edcadmin] .administrator")).toExist();
            });

            it("does not display the Administrator tag for non-admin users", function() {
                expect(this.view.$("ul.users li[data-userName=markr]")).toExist();
                expect(this.view.$("ul.users li[data-userName=markr] .administrator")).not.toExist();
            });

            it("displays an image for each user", function() {
                expect(this.view.$("ul.users li img").length).toBe(2);
                expect(this.view.$("ul.users li img").attr("src")).toBe("/edc/userimage/edcadmin?size=icon");
            });

            it("displays a name for each user", function() {
                expect(this.view.$("ul.users li:nth-child(1) .fullname").text()).toBe("EDC Admin");
                expect(this.view.$("ul.users li:nth-child(2) .fullname").text()).toBe("Mark Rushakoff");
            })
        });
    })
});
