require 'mp_vote_parser'
class TasksController < ApplicationController
  skip_before_action :verify_authenticity_token
  include MpVoteParser

  def updateMPVoteRecords
    # parser = MPVoteParser.new
    votes = retrieve_votes("http://publicwhip.org.uk/mp.php?mpn=Diane_Abbott&mpc=Hackney_North_and_Stoke_Newington&house=commons")
    render json: votes
  end
end
