class AddFieldsToVote < ActiveRecord::Migration
  def change
    add_column :votes, :house, :string
    add_column :votes, :link, :string
    add_column :votes, :title, :string
    add_column :votes, :vote_group, :string
    add_column :votes, :party_vote, :string
    add_column :votes, :role, :string
    add_column :votes, :hash, :string
    add_column :votes, :date, :datetime
  end
end
