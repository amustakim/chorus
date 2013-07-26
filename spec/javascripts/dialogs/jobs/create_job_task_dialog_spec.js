jasmine.sharedExamples.importIntoNewTableIsSelected = function () {
    it("should disable the destination dataset picker link", function () {
        expect(this.dialog.$(".destination a.dataset_picked")).toHaveClass('hidden');
        expect(this.dialog.$(".destination span.dataset_picked")).not.toHaveClass('hidden');
    });

    it("should disable the truncate option", function () {
        expect(this.dialog.$(".truncate")).toBeDisabled();
    });
};

jasmine.sharedExamples.importIntoExistingTableIsSelected = function () {
    it("should enable the destination dataset picker link", function () {
        expect(this.dialog.$(".destination a.dataset_picked")).not.toHaveClass('hidden');
        expect(this.dialog.$(".destination span.dataset_picked")).toHaveClass('hidden');
    });

    it("should enable the truncate option", function () {
        expect(this.dialog.$(".truncate")).toBeEnabled();
    });
};

describe("chorus.dialogs.CreateJobTask", function () {
    beforeEach(function () {
        this.job = backboneFixtures.job();
        this.dialog = new chorus.dialogs.CreateJobTask({job: this.job});
        this.dialog.render();
    });

    it("has all the dialog pieces", function () {
        expect(this.dialog.title).toMatchTranslation("create_job_task_dialog.title");
        expect(this.dialog.$('button.submit').text()).toMatchTranslation("create_job_task_dialog.submit");
        expect(this.dialog.$('button.cancel').text()).toMatchTranslation("actions.cancel");
    });

    it("has a select for the task action defaulting to 'Select one'", function () {
        expect(this.dialog.$('select.action').val()).toBe("");
    });

    context("when 'Select one' is selected", function () {
        it("the import section is hidden", function () {
            expect(this.dialog.$('.import')).toHaveClass('hidden');
        });
    });

    context("selecting 'Import Source Data'", function () {
        beforeEach(function () {
            this.dialog.$('select.action').val('import_source_data').trigger('change');
        });

        it("shows the import section", function () {
            expect(this.dialog.$('.import')).not.toHaveClass('hidden');
        });


        it('creates a JobTask model', function () {
            expect(this.dialog.model).toBeA(chorus.models.JobTask);
        });

        itBehavesLike.importIntoExistingTableIsSelected();

        describe("the source Dataset fieldset zone", function () {
            it("contains a clever 'select Source data' link", function () {
                expect(this.dialog.$(".source a.dataset_picked")).not.toHaveClass("hidden");
                expect(this.dialog.$(".source a.dataset_picked")).toContainTranslation("dataset.import.select_source");
            });

            describe("clicking the dataset picker link", function () {
                beforeEach(function () {
                    this.modalSpy = stubModals();
                    spyOn(chorus.Modal.prototype, 'launchSubModal').andCallThrough();
                    spyOn(this.dialog, "datasetsChosen").andCallThrough();
                    this.dialog.$(".source a.dataset_picked").click();
                });

                itBehavesLike.aDialogLauncher('.source .dataset_picked', chorus.dialogs.DatasetsPicker);

                it("launches the dataset picker dialog as a subModal", function () {
                    expect(chorus.Modal.prototype.launchSubModal).toHaveBeenCalled();
                });

//                    it("uses the workspace sandbox tables", function () {
//                        var collection = this.modalStub.lastModal().collection;
//                        expect(collection).toEqual(this.job.workspace().sandboxTables({allImportDestinations: true}));
//                        expect(collection.attributes.allImportDestinations).toBeTruthy();
//                    });

                context("after selecting a dataset", function () {
                    beforeEach(function () {
                        var datasets = [backboneFixtures.workspaceDataset.datasetTable({ objectName: "myDatasetWithAReallyReallyLongName" })];
                        chorus.modal.trigger("datasets:selected", datasets, '.source');
                    });

                    it("should show the selected dataset in the link, ellipsized", function () {
                        expect(this.dialog.datasetsChosen).toHaveBeenCalled();
                        expect(this.dialog.$(".source a.dataset_picked")).toContainText("myDatasetWithAReally...");
                    });

                    it("stores the un-ellipsized dataset name on the dialog", function () {
                        expect(this.dialog.selectedDatasetName).toBe("myDatasetWithAReallyReallyLongName");
                    });
                });
            });
        });

        describe("the new table section", function () {
            it("should have an 'Import into new table' radio button", function () {
                expect(this.dialog.$(".new_table label")).toContainTranslation("import.new_table");
            });

            it("should have a text entry for new table name", function () {
                expect(this.dialog.$(".new_table .name")).toBeDisabled();
            });
        });

        describe("the existing table section ", function () {
            it("is enabled by default", function () {
                expect(this.dialog.$(".choose_table input:radio")).toBeChecked();
            });

            it("has an 'Import into an existing table' radio button", function () {
                expect(this.dialog.$(".destination label")).toContainTranslation("import.existing_table");
            });
        });

        describe('options', function () {
            it("should have a 'Limit Rows' checkbox", function () {
                expect(this.dialog.$(".limit label")).toContainTranslation("import.limit_rows");
                expect(this.dialog.$(".limit input:checkbox")).not.toBeChecked();
            });

            it("should have a disabled textfield for the 'Limit Rows' value with the appropriate length", function () {
                expect(this.dialog.$(".limit input:text")).toBeDisabled();
                expect(this.dialog.$(".limit input:text").attr("maxlength")).toBe("10");
            });
        });

        it("should have a disabled 'Add' button", function () {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });
    });

    context("when 'Import into Existing Table' is selected", function () {
        beforeEach(function () {
            this.dialog.$(".destination .new_table input:radio").prop("checked", false);
            this.dialog.$(".destination .choose_table input:radio").prop("checked", true).change();
        });

        it("should disable the submit button by default", function () {
            expect(this.dialog.$("button.submit")).toBeDisabled();
        });

        it("should enable the truncate option", function () {
            expect(this.dialog.$(".truncate")).toBeEnabled();
        });

        it("should enable the 'select destination table' link", function () {
            expect(this.dialog.$(".destination a.dataset_picked")).not.toHaveClass("hidden");
            expect(this.dialog.$(".destination span.dataset_picked")).toHaveClass("hidden");
        });

        it("should have a link to the dataset picker dialog", function () {
            expect(this.dialog.$(".destination a.dataset_picked")).toContainTranslation("dataset.import.select_destination");
        });

        context("after clicking the dataset picker link", function () {
            beforeEach(function () {
                this.modalStub = stubModals();
                spyOn(chorus.Modal.prototype, 'launchSubModal').andCallThrough();
                spyOn(this.dialog, "datasetsChosen").andCallThrough();
                this.dialog.$(".destination a.dataset_picked").click();
            });

            it("should launch the dataset picker dialog", function () {
                expect(chorus.Modal.prototype.launchSubModal).toHaveBeenCalled();
            });

            it("uses the workspace sandbox tables", function () {
                var collection = this.modalStub.lastModal().collection;
                expect(collection).toEqual(this.job.workspace().sandboxTables({allImportDestinations: true}));
                expect(collection.attributes.allImportDestinations).toBeTruthy();
            });

            context("after selecting a dataset", function () {
                beforeEach(function () {
                    var datasets = [backboneFixtures.workspaceDataset.datasetTable({ objectName: "myDatasetWithAReallyReallyLongName" })];
                    chorus.modal.trigger("datasets:selected", datasets, '.destination');
                });

                it("should show the selected dataset in the link, ellipsized", function () {
                    expect(this.dialog.datasetsChosen).toHaveBeenCalled();
                    expect(this.dialog.$(".destination a.dataset_picked")).toContainText("myDatasetWithAReally...");
                });

                it("stores the un-ellipsized dataset name on the dialog", function () {
                    expect(this.dialog.selectedDatasetName).toBe("myDatasetWithAReallyReallyLongName");
                });

                context("and then 'import into new table is checked", function () {
                    beforeEach(function () {
                        this.dialog.$(".destination input:radio").prop("checked", false);
                        this.dialog.$(".new_table input:radio").prop("checked", true).change();
                    });

                    it("still shows the selected table name in the existing table section", function () {
                        expect(this.dialog.$(".destination span.dataset_picked")).not.toHaveClass('hidden');
                    });
                });
            });
        });


        describe("the Submit button", function () {
            function theSubmitButtonIs(status) {
                it("the submit button is " + status, function () {
                    if (status === 'disabled') {
                        expect(this.dialog.$("button.submit")).toBeDisabled();
                    } else {
                        expect(this.dialog.$("button.submit")).toBeEnabled();
                    }
                });
            }

            beforeEach(function () {
                this.modalStub = stubModals();
                this.dialog.$(".destination .new_table input:radio").prop("checked", false);
                this.dialog.$(".destination .choose_table input:radio").prop("checked", true).change();
            });

            context("when nothing has been selected", function () {
                theSubmitButtonIs('disabled');
            });

            context("when only a source table has been selected", function () {
                beforeEach(function () {
                    this.dialog.$(".source a.dataset_picked").click();
                    var datasets = [backboneFixtures.workspaceDataset.datasetTable({ objectName: "foo" })];
                    chorus.modal.trigger("datasets:selected", datasets, '.source');
                });
                theSubmitButtonIs('disabled');
            });

            context("when only a destination table has been selected", function () {
                beforeEach(function () {
                    this.dialog.$(".destination a.dataset_picked").click();
                    var datasets = [backboneFixtures.workspaceDataset.datasetTable({ objectName: "foo" })];
                    chorus.modal.trigger("datasets:selected", datasets, '.destination');
                });
                theSubmitButtonIs('disabled');
            });

            context("when a source table has been selected and a new destination table is selected", function () {
                beforeEach(function () {
                    this.dialog.$(".source a.dataset_picked").click();
                    var sourceDatasets = [backboneFixtures.workspaceDataset.datasetTable({ objectName: "foo" })];
                    chorus.modal.trigger("datasets:selected", sourceDatasets, '.source');

                    this.dialog.$(".destination .new_table input:radio").prop("checked", true).change();
                    this.dialog.$(".destination .choose_table input:radio").prop("checked", false).change();

                    this.dialog.$(".new_table input.name").val("good_table_name").trigger("keyup");
                });

                itBehavesLike.importIntoNewTableIsSelected();

                theSubmitButtonIs('enabled');
            });

            context("when a source and destination table have been selected", function () {
                beforeEach(function () {
                    this.dialog.$(".source a.dataset_picked").click();
                    var sourceDatasets = [backboneFixtures.workspaceDataset.datasetTable({ objectName: "foo" })];
                    chorus.modal.trigger("datasets:selected", sourceDatasets, '.source');

                    this.dialog.$(".destination a.dataset_picked").click();
                    var destinationDatasets = [backboneFixtures.workspaceDataset.datasetTable({ objectName: "biz" })];
                    chorus.modal.trigger("datasets:selected", destinationDatasets, '.destination');
                });

                context("when the limit checkbox is not selected", function () {
                    theSubmitButtonIs('enabled');
                });

                context("when the limit checkbox is selected", function () {
                    var limitField;

                    beforeEach(function () {
                        limitField = this.dialog.$('.limit input[type=text]');
                        this.dialog.$('.limit input[type=checkbox]').prop('checked', true);
                    });
                    context("and the limit is valid", function () {
                        beforeEach(function () {
                            limitField.val(500).trigger('keyup');
                        });
                        theSubmitButtonIs('enabled');
                    });
                    context("and the limit is invalid", function () {
                        beforeEach(function () {
                            limitField.val('-1ab').trigger('keyup');
                        });
                        theSubmitButtonIs('disabled');
                    });
                });
            });
        });
    });
});