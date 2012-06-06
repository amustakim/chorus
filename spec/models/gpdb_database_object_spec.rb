require 'spec_helper'

describe GpdbDatabaseObject do
  let(:account) { FactoryGirl.create(:instance_account) }
  let(:schema) { FactoryGirl.create(:gpdb_schema) }
  let(:db_objects_sql) { GpdbDatabaseObject::Query.new(schema).tables_and_views_in_schema.to_sql }
  let(:metadata_sql) { GpdbDatabaseObject::Query.new(schema).metadata_for_tables(["view1", "table1"]).to_sql }

  describe "associations" do
    it { should belong_to(:schema) }
  end

  describe "validations" do
    it { should validate_presence_of :name }
  end

  describe ".with_name_like" do
    it "scopes objects by name" do
      FactoryGirl.create(:gpdb_table, :name => "match")
      FactoryGirl.create(:gpdb_table, :name => "nope")

      GpdbDatabaseObject.with_name_like("match").count.should == 1
    end

    it "matches anywhere in the name, regardless of case" do
      FactoryGirl.create(:gpdb_table, :name => "amatCHingtable")

      GpdbDatabaseObject.with_name_like("match").count.should == 1
      GpdbDatabaseObject.with_name_like("MATCH").count.should == 1
    end

    it "returns all objects if name is not provided" do
      FactoryGirl.create(:gpdb_table)
      GpdbDatabaseObject.with_name_like(nil).count.should == 1
    end
  end

  context ".refresh" do
    before(:each) do
      stub_gpdb(account, db_objects_sql => [
        { 'type' => "r", "name" => "table1", "master_table" => 't' },
        { 'type' => "v", "name" => "view1",  "master_table" => 'f' }
      ])
    end

    it "creates new copies of the db objects in our db" do
      GpdbDatabaseObject.refresh(account, schema)

      db_objects = schema.database_objects.order(:name)
      db_objects.size.should == 2
      db_objects.map(&:class).should == [GpdbTable, GpdbView]
      db_objects.pluck(:name).should == ["table1", "view1"]
      db_objects.pluck(:master_table).should == [true, false]
    end

    it "does not re-create db objects that already exist in our database" do
      GpdbDatabaseObject.refresh(account, schema)
      GpdbDatabaseObject.refresh(account, schema)

      GpdbDatabaseObject.count.should == 2
    end

    it "destroy db objects that no longer exist in gpdb" do
      GpdbDatabaseObject.refresh(account, schema)

      stub_gpdb(account, db_objects_sql => [
        { 'type' => "r", "name" => "table1" }
      ])

      GpdbDatabaseObject.refresh(account, schema)
      database_objects = GpdbDatabaseObject.all

      database_objects.length.should == 1
      database_objects.map(&:name).should == ["table1"]
    end

    it "does not destroy db objects on other schemas" do
      other_schema = FactoryGirl.create(:gpdb_schema)
      to_be_kept = FactoryGirl.create(:gpdb_table, :schema => other_schema, :name => "matching")
      to_be_deleted = FactoryGirl.create(:gpdb_table, :schema => schema, :name => "matching")

      stub_gpdb(account, db_objects_sql => [
          { 'type' => "r", 'name' => "new" }
      ])
      GpdbDatabaseObject.refresh(account, schema)

      other_schema.reload.database_objects.count.should == 1
    end
  end

  describe ".add_metadata!(db_objects, account)" do
    let(:db_objects) { schema.database_objects }

    before(:each) do
      stub_gpdb(account,
        db_objects_sql => [
          { 'type' => "r", "name" => "table1", "master_table" => 't' },
          { 'type' => "v", "name" => "view1",  "master_table" => 'f' }
        ],

        metadata_sql => [
          {
            'name' => 'view1',
            'description' => "view1 is cool",
            "definition" => "select * from foo;",
            "column_count" => "5"
          },
          {
            'name' => 'table1',
            'description' => "table1 is cool",
            "definition" => nil,
            "column_count" => "3"
          }
        ]
      )
    end

    it "fills in the 'description' attribute of each db object in the relation" do
      GpdbDatabaseObject.refresh(account, schema)
      GpdbDatabaseObject.add_metadata!(db_objects, account)

      db_objects[0].description.should == "view1 is cool"
      db_objects[0].definition.should == "select * from foo;"
      db_objects[0].column_count.should == 5

      db_objects[1].description.should == "table1 is cool"
      db_objects[1].definition.should be_nil
      db_objects[1].column_count.should == 3
    end
  end
end
