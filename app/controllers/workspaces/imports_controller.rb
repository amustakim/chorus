module Workspaces
  class ImportsController < ApplicationController
    wrap_parameters :dataset_import, :exclude => [:id]

    def create
      import_params = params[:dataset_import]
      workspace = Workspace.find(params[:workspace_id])
      authorize! :can_edit_sub_objects, workspace

      source_dataset = Dataset.find(import_params[:dataset_id])
      source_dataset.check_duplicate_column(current_user) if source_dataset.is_a?(ChorusView)

      import = workspace.imports.new(import_params)

      import.source_dataset = source_dataset
      import.user = current_user

      import.save!
      import.create_import_event
      QC.enqueue_if_not_queued("ImportExecutor.run", import.id)
      render :json => {}, :status => :created
    end
  end
end