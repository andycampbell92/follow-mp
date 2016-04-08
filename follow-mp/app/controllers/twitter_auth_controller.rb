class TwitterAuthController < ApplicationController
	def auth_url
	    consumer = OAuth::Consumer.new(Rails.application.secrets.twitter_api_key, Rails.application.secrets.twitter_api_secret, { :site => "https://api.twitter.com", :scheme => :header })

	    request_token = consumer.get_request_token(:oauth_callback => "http://localhost:3000/TwitterCallbackToToken")
		session[:token] = request_token.token
		session[:secret] = request_token.secret
	    redirect_to request_token.authorize_url
  	end

  	def callback_to_token
	    consumer = OAuth::Consumer.new(Rails.application.secrets.twitter_api_key, Rails.application.secrets.twitter_api_secret, { :site => "https://api.twitter.com", :scheme => :header })
  		request_token = OAuth::RequestToken.new(consumer, session[:token],
                                        session[:secret])
  		access_token = request_token.get_access_token(
                 :oauth_verifier => params[:oauth_verifier])
  		response = access_token.request(:get, "https://api.twitter.com/1.1/statuses/home_timeline.json")
  		render json: {:oauth_token => access_token.token, :oauth_token_secret => access_token.secret}
  	end

	private
	def prepare_access_token(oauth_token, oauth_token_secret)
	    consumer = OAuth::Consumer.new(Rails.application.secrets.twitter_api_key, Rails.application.secrets.twitter_api_secret, { :site => "https://api.twitter.com", :scheme => :header })
	     
	    # now create the access token object from passed values
	    token_hash = { :oauth_token => oauth_token, :oauth_token_secret => oauth_token_secret }
	    access_token = OAuth::AccessToken.from_hash(consumer, token_hash )
	 
	    return access_token
	end
end
