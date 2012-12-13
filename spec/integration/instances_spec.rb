require File.join(File.dirname(__FILE__), 'spec_helper')

describe "Instances", :database_integration do
  before do
    login(users(:admin))
    visit("#/instances")
    wait_for_ajax
    click_button "Add Data Source"
    wait_for_ajax
  end

  def select_and_do_within(class_name)
    choose class_name
    wait_until(1) { page.evaluate_script("!$('.#{class_name}').hasClass('collapsed');") }
    within ".#{class_name}" do
      yield
    end
  end

  describe "add a gpdb instance" do
    it "creates a instance" do
      within_modal do
        select_and_do_within "register_existing_greenplum" do
          fill_in 'name', :with => "new_gpdb_instance"
          fill_in 'host', :with => WEBPATH['gpdb_instance_db']['gpdb_host']
          fill_in 'port', :with => WEBPATH['gpdb_instance_db']['gpdb_port']
          fill_in 'dbUsername', :with => WEBPATH['gpdb_instance_db']['gpdb_user']
          fill_in 'dbPassword', :with => WEBPATH['gpdb_instance_db']['gpdb_pass']
        end
        click_button "Add Data Source"
      end

      find(".gpdb_instance ul").should have_content("new_gpdb_instance")
    end
  end

  describe "adding a hadoop instance" do
    it "creates an instance" do
      within_modal do
        select_and_do_within "register_existing_hadoop" do
          fill_in 'name', :with => "new_hadoop_instance"
          fill_in 'host', :with => WEBPATH['hadoop_instance_db']['host']
          fill_in 'port', :with => WEBPATH['hadoop_instance_db']['port']
          fill_in 'username', :with => WEBPATH['hadoop_instance_db']['username']
          fill_in 'groupList', :with => WEBPATH['hadoop_instance_db']['group_list']
        end
        click_button "Add Data Source"
      end

      find(".hadoop_instance ul").should have_content("new_hadoop_instance")
    end
  end

  describe "importing a hadoop file into an external table" do
    let(:hadoop_instance) { hadoop_instances(:real) }

    before do
      any_instance_of(ExternalTable) do |table|
        stub(table).save { true }
      end
    end

    xit 'creates an external table', :hdfs_integration => true do
      visit (%Q|#/hadoop_instances/#{hadoop_instance.to_param}/browse|)
      click_link 'level1.txt'
      click_link 'Create as an external table'
      within_modal do
        fill_in 'tableName', :with => 'new_external_table'
        click_button 'Create External Table'
      end
      click_link 'new_external_table'
      page.should have_content 'Sandbox Table - HDFS External'
    end

    after do
      Dataset.find_by_name('new_external_table').destroy
    end
  end
end