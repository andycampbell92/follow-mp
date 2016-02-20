class CreateMps < ActiveRecord::Migration
  def change
    create_table :mps do |t|

      t.timestamps null: false
    end
  end
end
