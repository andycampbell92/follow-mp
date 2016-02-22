class AddHashToVote < ActiveRecord::Migration
  def change
  	add_column :votes, :vote_hash, :string
  end
end
