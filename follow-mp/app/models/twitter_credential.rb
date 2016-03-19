class TwitterCredential < ActiveRecord::Base
	belongs_to :mp
	belongs_to :vote

	alias_attribute :last_vote_tweeted, :vote
end
