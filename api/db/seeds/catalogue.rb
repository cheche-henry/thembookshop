# Aggregates the section-based catalogue split across catalogue/*.rb.
#
# Each entry is:
#   { title:, category:, subcategory:, rows: [[raw_name, price, stock, badge], ...] }
require_relative "catalogue/books"
require_relative "catalogue/stationery"
require_relative "catalogue/art_and_equipment"

THEM_BOOKSHOP_CATALOGUE = (
  THEM_BOOKSHOP_BOOKS +
  THEM_BOOKSHOP_STATIONERY +
  THEM_BOOKSHOP_ART_AND_EQUIPMENT
).freeze
