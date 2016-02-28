require 'mp_vote_parser'
class TasksController < ApplicationController
  skip_before_action :verify_authenticity_token
  include MpVoteParser

  def updateMPVoteRecords
  	vote_counts = {}
  	# mps = Mp.where(:id => 458)
  	mps = Mp.all
    mps.each do |mp|
    	puts mp.name
    	begin
		    votes = retrieve_votes(mp.link)
		    votes.map! {|vote| Vote.new(vote)}
		    new_votes = Vote.get_new_votes(votes, mp)
		    new_votes.each do |vote|
		    	vote.mp_id = mp.id
		    	vote.save
		    end
		    vote_counts[mp.name] = new_votes.count
    	rescue Exception => e
    		vote_counts[mp.name] = 'err'
    	end

	end

    render json: vote_counts
  end
end
