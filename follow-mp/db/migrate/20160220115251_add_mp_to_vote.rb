class AddMpToVote < ActiveRecord::Migration
  def change
  	change_table :votes do |t|
  		t.belongs_to :mp, index: true
 	end
  end
end
