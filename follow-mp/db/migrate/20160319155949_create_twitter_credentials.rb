class CreateTwitterCredentials < ActiveRecord::Migration
  def change
    create_table :twitter_credentials do |t|
      t.string :token
      t.string :secret
      t.belongs_to :mp, index: true
      t.timestamps null: false
    end
  end
end
