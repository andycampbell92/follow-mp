class HealthController < ApplicationController
	def index
		render :json => {instance_health: "OK"}
	end
end
