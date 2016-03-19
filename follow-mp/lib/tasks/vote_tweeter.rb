module MpVoteTweeter
    class VoteTweeter
        def tweet_votes(votes)
            tweets = votes.map {|vote| build_tweet(vote)}
            puts tweets
        end

        def build_tweet(vote)
            vote.title
        end

        def send_tweets(tweets)
            vote_table = page.css('.votes')[0]
            return vote_table.css('.odd') + vote_table.css('.even')
        end

        private :build_tweet, :send_tweets
    end
        def tweet_votes(votes)
            return VoteTweeter.new().tweet_votes(votes)
        end
end
