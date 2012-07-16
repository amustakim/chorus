class ImagesController < ApplicationController
  before_filter :load_entity

  def create
    @entity.image = params[:files][0]
    @entity.save!
    present @entity.image, :content_type => 'text/html'
  end

  protected
  def load_entity
    raise  NotImplementedError, "Method Not implemented"
  end
end
