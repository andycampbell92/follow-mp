require 'tasks/mp_vote_parser'
require 'tasks/vote_tweeter'
class TasksController < ApplicationController
  skip_before_action :verify_authenticity_token
  include MpVoteParser
  include MpVoteTweeter

  def update_mp_vote_records
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

  def tweet_new_votes
  	twitterAccounts = TwitterCredential.all;
  	all_new_votes = []
  	twitterAccounts.each do |tc|
  		if !tc.last_vote_tweeted.nil?
  		  new_votes = tc.mp.votes.where('id > ?', tc.last_vote_tweeted.id)
  		  tweet_votes(tc, new_votes)
        all_new_votes.push(*new_votes)
      end
      tc.last_vote_tweeted = tc.mp.votes.last
      tc.save
  	end

  	render json: {tweets_sent: all_new_votes.count}
  end

end
