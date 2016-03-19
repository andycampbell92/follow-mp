module MpVoteTweeter
    class VoteTweeter
        @@base_url = 'http://www.publicwhip.org.uk/'
        def tweet_votes(votes)
            tweets = votes.map {|vote| build_tweet(vote)}
        end

        def truncate_title(tweet_content, title)
            # 140 - 25 - 1 - 1 = 113 Assume 25 chars for link, -1 because we start at 0 index and -1 because of space
            title[0, 113 - tweet_content.length]
        end

        def build_tweet(vote)
            simple_vote_text = vote.simple_vote_text
            vote_action = (simple_vote_text.include? "absent") ? "was absent" : "voted #{simple_vote_text}"
            tweet_content = "#{vote.mp.name} #{vote_action} on "
            short_title = truncate_title(tweet_content, vote.title)
            tweet = "#{tweet_content}#{short_title} #{@@base_url}#{vote.link}"
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
