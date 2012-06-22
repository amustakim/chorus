require 'spec_helper'

describe ActivityMigrator, :data_migration => true do
  describe ".migrate" do
    before do
      UserMigrator.new.migrate
      WorkspaceMigrator.new.migrate
      InstanceMigrator.new.migrate
      HadoopInstanceMigrator.new.migrate
      WorkfileMigrator.new.migrate
    end

    context "importing data" do
      before do
        ActivityMigrator.new.migrate
      end

      it "creates new events for all legacy activities" do
        Events::Base.count.should > 0
      end

      it "copies WORKFILE CREATED data fields from the legacy activity" do
        event = Events::WORKFILE_CREATED.find(event_id_for('10010'))

        event.workspace.should be_instance_of(Workspace)
        event.actor.should be_instance_of(User)
        event.workfile.should be_instance_of(Workfile)
      end

      it "copies INSTANCE CREATED (greenplum) data fields from the legacy activity" do
        event = Events::GREENPLUM_INSTANCE_CREATED.find(event_id_for('10036'))

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.greenplum_instance.should be_instance_of(Instance)
      end

      it "copies INSTANCE CREATED (hadoop) data fields from the legacy activity" do
        event = Events::HADOOP_INSTANCE_CREATED.find(event_id_for('10006'))

        event.workspace.should be_blank
        event.actor.should be_instance_of(User)
        event.hadoop_instance.should be_instance_of(HadoopInstance)
      end
    end

    context "foreign key" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id).should be_false
        ActivityMigrator.new.migrate
      end

      it "adds the new foreign key column to legacy table" do
        Legacy.connection.column_exists?(:edc_activity_stream, :chorus_rails_event_id).should be_true
      end

      it "sets the Event id when successfully imported" do
        count = Legacy.connection.exec_query("SELECT COUNT(1) FROM edc_activity_stream WHERE chorus_rails_event_id IS NOT NULL")
        count[0]['count'].to_i.should > 0
      end
    end
  end

  def event_id_for(id)
    activity_stream = Legacy.connection.exec_query("SELECT chorus_rails_event_id FROM edc_activity_stream WHERE id = '#{id}'")
    activity_stream[0]['chorus_rails_event_id']
  end
end