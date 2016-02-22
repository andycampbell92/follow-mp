class ChangeLongFieldsToText < ActiveRecord::Migration
  def change
	change_column :votes, :title, :text
	change_column :votes, :vote_hash, :text
	change_column :votes, :link, :text
  end
end
