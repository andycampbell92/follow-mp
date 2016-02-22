# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160221114113) do

  create_table "mps", force: :cascade do |t|
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.string   "link",       limit: 255
    t.string   "name",       limit: 255
  end

  create_table "votes", force: :cascade do |t|
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.string   "house",      limit: 255
    t.text     "link",       limit: 65535
    t.text     "title",      limit: 65535
    t.string   "vote_group", limit: 255
    t.string   "party_vote", limit: 255
    t.string   "role",       limit: 255
    t.datetime "date"
    t.integer  "mp_id",      limit: 4
    t.text     "vote_hash",  limit: 65535
  end

  add_index "votes", ["mp_id"], name: "index_votes_on_mp_id", using: :btree

end
