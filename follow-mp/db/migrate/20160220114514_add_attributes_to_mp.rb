class AddAttributesToMp < ActiveRecord::Migration
  def change
    add_column :mps, :link, :string
    add_column :mps, :name, :string
  end
end
