module MpVoteTweeter
    class VoteTweeter
        @@base_url = 'http://www.publicwhip.org.uk/'
        @access_token

        def initialize(twitter_credentials)
            @access_token = prepare_access_token(twitter_credentials)
        end

        def tweet_votes(votes)
            tweets = votes.map {|vote| build_tweet(vote)}
            result = send_tweets(tweets)
        end

        def build_tweet(vote)
            simple_vote_text = vote.simple_vote_text
            vote_action = (simple_vote_text.include? "absent") ? "was absent" : "voted #{simple_vote_text}"
            tweet_content = "#{vote.mp.name} #{vote_action} on "
            short_title = truncate_title(tweet_content, vote.title)
            tweet = "#{tweet_content}#{short_title} #{@@base_url}#{vote.link}"
        end

        def send_tweets(tweets)
            tweets.each { |tweet| @access_token.request(:post, "https://api.twitter.com/1.1/statuses/update.json", {status: tweet})}            
        end

        def truncate_title(tweet_content, title)
            # 140 - 25 - 1 - 1 = 113 Assume 25 chars for link, -1 because we start at 0 index and -1 because of space
            title[0, 113 - tweet_content.length]
        end

        def prepare_access_token(twitter_credentials)
            consumer = OAuth::Consumer.new(Rails.application.secrets.twitter_api_key, Rails.application.secrets.twitter_api_secret, { :site => "https://api.twitter.com", :scheme => :header })
             
            # now create the access token object from passed values
            token_hash = { :oauth_token => twitter_credentials.token, :oauth_token_secret => twitter_credentials.secret }
            access_token = OAuth::AccessToken.from_hash(consumer, token_hash )
         
            return access_token
        end

        private :build_tweet, :send_tweets, :truncate_title, :prepare_access_token
    end
        def tweet_votes(twitter_credentials, votes)
            return VoteTweeter.new(twitter_credentials).tweet_votes(votes)
        end
end
