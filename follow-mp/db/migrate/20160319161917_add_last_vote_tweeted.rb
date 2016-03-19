class AddLastVoteTweeted < ActiveRecord::Migration
  def change
  	change_table :twitter_credentials do |t|
      t.belongs_to :vote, index: true
    end
  end
end
