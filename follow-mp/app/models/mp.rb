class Mp < ActiveRecord::Base
    has_many :votes
    has_one :twitter_credential
end
