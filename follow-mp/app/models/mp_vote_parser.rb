class MPVoteParser

  @@all_vote_extension = "&display=everyvote#divisions"
  # Date uses weird special charecter
  @@date_format = "%d %b %Y".gsub(" ", 160.chr('UTF-8'))

  def initialize(mp_url)
    @mp_url = mp_url+@@all_vote_extension
  end

  def retrieve_votes()
    page = download_page()
    vote_rows = extract_vote_rows(page)
    return vote_rows.map { |vote| parse_vote_row(vote) }
    # return vote_rows
  end

  def build_vote_hash(title, date)
    return "%s%d%d%d" % [title.gsub(" ", ""), date.year, date.month, date.day]
  end

  def parse_vote_row(table_row)
    house = table_row.children[0].children[0].content
    date = Date.strptime(table_row.children[1].children[0].content, @@date_format)
    subject = {:link=>table_row.children[2].children[0].attributes['href'].value, :title=>table_row.children[2].children[0].children[0].content}
    # Skip empty col
    vote_group = table_row.children[4].children[0].content
    party_vote = table_row.children[5].children[0].content
    # Skip empty col
    role = table_row.children[7].children[0].content
    hash = build_vote_hash(subject[:title], date)

    return {:house =>house, :date=>date, :subject=>subject, :vote_group=>vote_group, :party_vote=>party_vote, :role=>role, :hash=>hash}
  end

  def extract_vote_rows(page)
    vote_table = page.css('.votes')[0]
    return vote_table.css('.odd') + vote_table.css('.even')
  end

  def download_page()
    return Nokogiri::HTML(open(@mp_url))
  end

  private :download_page; :extract_vote_rows; :parse_vote_row;
end