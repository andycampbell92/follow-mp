class Vote < ActiveRecord::Base
  validates :date, presence: true

  after_initialize :init

  def build_vote_hash()
    return "%s%d%d%d" % [self.title.gsub(" ", ""), self.date.year, self.date.month, self.date.day]
  end

  def init
    self.hash  ||= build_vote_hash()   
  end
end