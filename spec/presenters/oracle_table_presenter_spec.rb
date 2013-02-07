require 'spec_helper'

describe OracleTablePresenter, :type => :view do
  let(:table) { datasets(:table) }
  let(:presenter) { OracleTablePresenter.new(table, view) }

  before(:each) do
    set_current_user(users(:admin))
  end

  describe "#to_hash" do
    let(:hash) { presenter.to_hash }

    it "sets the object type to TABLE" do
      hash[:object_type].should == "TABLE"
    end
  end

  it_behaves_like "dataset presenter", :oracle_table
end
