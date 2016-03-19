class Vote < ActiveRecord::Base
    belongs_to :mp
    has_one :twitter_credential
    validates :date, presence: true
    validates_uniqueness_of :vote_hash, :scope => :mp_id

    after_initialize :init

    def self.get_new_votes(votes, mp)
        retrieved_vote_hashes = votes.map(&:vote_hash)
        stored_vote_hashes = mp.votes.all.map(&:vote_hash)

        new_vote_hashes = retrieved_vote_hashes - stored_vote_hashes
        new_votes = []
        votes.each do |vote|
            if new_vote_hashes.include? vote.vote_hash
                new_votes << vote
            end
        end

        return new_votes
    end

    def simple_vote_text
        simple_vote = 'unknown'
        role_lower = self.role.downcase
        case role_lower
            when /teller/
                simple_vote = self.vote_group.gsub('tell', '')
            when /unknown/
                simple_vote = 'unknown'
            when 'loyal'
                simple_vote = self.party_vote
            when 'rebel'
                simple_vote = (self.party_vote.include? 'aye') ? 'no' : 'aye'
            else
                simple_vote = role_lower
        end

        if simple_vote === ''
            byebug
        end
            
        simple_vote
    end

    def build_vote_hash()
        "%s%d%d%d" % [self.title.gsub(" ", ""), self.date.year, self.date.month, self.date.day]
    end

    def init
        self.vote_hash  ||= build_vote_hash()   
    end
end