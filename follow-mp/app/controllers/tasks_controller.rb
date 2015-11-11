class TasksController < ApplicationController
  skip_before_action :verify_authenticity_token

	def updateMPVoteRecords
    parser = MPVoteParser.new

		render json: {:hello=>parser.func}
	end
end
