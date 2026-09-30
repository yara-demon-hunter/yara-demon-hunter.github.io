require "date"
require "pathname"
require "yaml"

ROOT = File.expand_path("..", __dir__)
BOOKS_PATH = File.join(ROOT, "_data", "books.yml")
LANGUAGES = %w[en pt].freeze
BOOK_FIELDS = %w[number slug cover default_language status title subtitle description].freeze
LOCALIZED_BOOK_FIELDS = %w[title subtitle description].freeze
CHAPTER_INDEX_FIELDS = %w[
  book_label
  cover_prefix
  message
  start_label
  prologue_type
  chapter_type
  read_label
  coming_soon_label
].freeze

errors = []

def load_yaml(path, errors)
  YAML.safe_load_file(path, permitted_classes: [Date])
rescue Psych::Exception, SystemCallError => error
  errors << "#{path.delete_prefix("#{ROOT}/")}: #{error.message}"
  nil
end

def validate_front_matter(path, errors)
  source = File.read(path)
  match = source.match(/\A---\s*\r?\n(.*?)\r?\n---(?:\r?\n|\z)/m)
  unless match
    errors << "#{path.delete_prefix("#{ROOT}/")}: missing YAML front matter"
    return {}
  end

  data = YAML.safe_load(match[1], permitted_classes: [Date])
  data.is_a?(Hash) ? data : {}
rescue Psych::Exception, SystemCallError => error
  errors << "#{path.delete_prefix("#{ROOT}/")}: #{error.message}"
  {}
end

def present?(value)
  !value.nil? && !value.to_s.strip.empty?
end

books = load_yaml(BOOKS_PATH, errors)
unless books.is_a?(Hash) && !books.empty?
  errors << "_data/books.yml: expected a non-empty mapping of book IDs"
  books = {}
end

books.each do |book_id, book|
  unless book.is_a?(Hash)
    errors << "_data/books.yml: #{book_id} must contain a mapping"
    next
  end

  BOOK_FIELDS.each do |field|
    errors << "_data/books.yml: #{book_id}.#{field} is required" unless present?(book[field])
  end

  LOCALIZED_BOOK_FIELDS.each do |field|
    LANGUAGES.each do |language|
      value = book.dig(field, language) if book[field].is_a?(Hash)
      errors << "_data/books.yml: #{book_id}.#{field}.#{language} is required" unless present?(value)
    end
  end

  cover = book["cover"].to_s
  unless cover.start_with?("/") && File.file?(File.join(ROOT, cover.delete_prefix("/")))
    errors << "_data/books.yml: #{book_id}.cover does not point to an existing site file"
  end
end

chapter_indexes = Dir.glob(File.join(ROOT, "{en,pt}", "books", "**", "chapters", "index.md"))
if chapter_indexes.empty?
  errors << "No chapter index pages found under en/ or pt/"
end

chapter_indexes.each do |path|
  relative_path = Pathname.new(path).relative_path_from(Pathname.new(ROOT)).to_s
  page = validate_front_matter(path, errors)
  language = relative_path.split(File::SEPARATOR).first
  book_id = page["book_id"].to_s

  errors << "#{relative_path}: chapter_index must be true" unless page["chapter_index"] == true
  errors << "#{relative_path}: title is required" unless present?(page["title"])
  errors << "#{relative_path}: lang must be #{language}" unless page["lang"] == language
  errors << "#{relative_path}: book_id is required" unless present?(page["book_id"])

  book = books[book_id]
  if book.nil?
    errors << "#{relative_path}: book_id '#{book_id}' is not defined in _data/books.yml"
  elsif !book.is_a?(Hash) || !book["title"].is_a?(Hash) || !present?(book["title"][language])
    errors << "#{relative_path}: book '#{book_id}' has no title for language '#{language}'"
  end

  copy = page["chapter_index_copy"]
  unless copy.is_a?(Hash)
    errors << "#{relative_path}: chapter_index_copy must be a mapping"
    next
  end

  CHAPTER_INDEX_FIELDS.each do |field|
    errors << "#{relative_path}: chapter_index_copy.#{field} is required" unless present?(copy[field])
  end
end

if errors.empty?
  puts "Content metadata is valid."
else
  warn errors.map { |error| "ERROR: #{error}" }.join("\n")
  exit 1
end