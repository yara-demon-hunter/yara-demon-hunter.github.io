# Yara, Demon Hunter

Official website and web serial for the **Yara, Demon Hunter** dark fantasy series, released chapter by chapter. Individual books use their own subtitles, such as **The Awakening of Vengeance** for Book 1.

The project is initially published in **Portuguese and English**, with the possibility of adding more languages in the future.

[⚔️ Yara, Demon Hunter](https://yara-demon-hunter.github.io)

## About the Project

This repository contains the source code for the official web serial website.

The website will include:

* 📖 Chapter-by-chapter publication
* 🇧🇷 Portuguese version
* 🇬🇧 English version
* 🌎 Possibility of adding more languages
* 👤 Character pages
* 🌍 World and lore information
* 📚 Chapter navigation
* 🔄 Language switching
* 📱 Responsive design for desktop and mobile
* 🔎 SEO-friendly structure
* 📢 Google AdSense integration
* 🛒 Links to the book and Amazon/KDP
* 🌑 Dark fantasy visual style

## Technology

The website is being built using:

* **Jekyll** — Static site generator
* **Ruby** — Programming language used by Jekyll
* **Bundler** — Ruby dependency manager
* **Markdown** — Chapter and content writing
* **HTML** — Page structure
* **CSS** — Visual design
* **JavaScript** — Client-side interactivity
* **Git** — Version control
* **GitHub Pages** — Website hosting

---

# Development Environment

The development environment is currently configured on:

* Ubuntu Linux
* Ruby 3.3.8
* RubyGems 3.6.7
* Bundler 2.6.7
* Jekyll 4.x

The project uses a **local Bundler installation path** so that project dependencies are not installed into the system Ruby directories.

## Books, Languages and Translations

Every book has a stable `book_id`. The current book uses:

```text
book-1
```

Chapter and book-related pages must include both `book_id` and `lang` in their front matter. Translated pages should also share a `translation_id` when they represent the same chapter or story page.

The book catalog lives in [`_data/books.yml`](_data/books.yml). The source structure is organized as `language/books/book/chapters`, and chapter lists and chapter navigation filter by both `book_id` and `lang`, so chapters from future books will not be mixed with book 1.

Canonical URLs use this pattern:

```text
/en/books/book-1/
/en/books/book-1/chapters/001/
/pt/books/book-1/
/pt/books/book-1/chapters/001/
```

The previous chapter URLs are kept as redirects for backwards compatibility:

```text
/en/chapters/001/
/pt/chapters/001/
```

When a new book is added, use a new identifier, for example `book-3`, add its metadata to [`_data/books.yml`](_data/books.yml), and create its pages under both language directories as translations become available. Do not reuse chapter identifiers across books without also setting the correct `book_id`.

---

# Initial Setup

These are the steps used to configure the development environment.

## 1. Install Ruby

Update the Ubuntu package list:

```bash
sudo apt update
```

Install Ruby and the required development tools:

```bash
sudo apt install ruby-full build-essential zlib1g-dev
```

Verify Ruby:

```bash
ruby --version
```

Expected result:

```text
ruby 3.3.x
```

Verify RubyGems:

```bash
gem --version
```

---

## 2. Install Bundler

Install Bundler using Ubuntu's package manager:

```bash
sudo apt install ruby-bundler
```

Verify:

```bash
bundle --version
```

The current environment uses:

```text
Bundler version 2.6.7
```

### Note

A user-level Bundler installation was initially attempted with:

```bash
gem install bundler --user-install
```

However, this placed the executable inside the VS Code Snap environment and caused PATH complications.

That installation was removed.

For this project, Bundler is therefore managed through the Ubuntu package:

```bash
sudo apt install ruby-bundler
```

---

# Jekyll Project Configuration

## 3. Create the Gemfile

The project uses a `Gemfile` to define its Ruby dependencies.

The current `Gemfile` contains:

```ruby
source "https://rubygems.org"

gem "jekyll"
```

The Gemfile tells Bundler which dependencies the project requires.

---

## 4. Configure Bundler to use the project directory

We do **not** want Bundler installing project dependencies into the system Ruby directory:

```text
/var/lib/gems/3.3.0
```

Instead, dependencies are installed inside the project.

Run:

```bash
bundle config set --local path 'vendor/bundle'
```

This creates a project-specific Bundler configuration.

The resulting structure is approximately:

```text
yara-demon-hunter/
├── Gemfile
├── Gemfile.lock
├── .bundle/
│   └── config
└── vendor/
    └── bundle/
```

---

## 5. Install project dependencies

Run:

```bash
bundle install
```

Do **not** use:

```bash
sudo bundle install
```

The dependencies should be installed inside:

```text
vendor/bundle/
```

This keeps the project independent from the system Ruby installation.

---

# Dependency Management

The project uses two important files:

### Gemfile

Defines the dependencies required by the project.

```text
Gemfile
    ↓
"What software does this project need?"
```

### Gemfile.lock

Records the specific versions resolved by Bundler.

```text
Gemfile.lock
    ↓
"Which versions are currently being used?"
```

Both files should be committed to Git.

The actual installed dependencies in:

```text
vendor/bundle/
```

should **not** be committed to Git.

---

# Git Configuration

The following directories should be ignored by Git:

```gitignore
.bundle/
vendor/bundle/
_site/
.sass-cache/
.jekyll-cache/
.jekyll-metadata
```

These contain local configuration, generated files, caches, or installed dependencies that do not need to be stored in the repository.

---

# Running the Website Locally

Once the Jekyll project structure is ready, the website can be started locally with:

```bash
bundle exec jekyll build
bundle exec jekyll serve
```

Jekyll will generate the static website and start a local development server.

The website should normally be available at:

```text
http://localhost:4000
```

The browser can then be used to preview the website before publishing it to GitHub Pages.

---

# Project Structure

The planned structure is:

```text
yara-demon-hunter/
│
├── _config.yml
├── Gemfile
├── Gemfile.lock
├── README.md
├── .gitignore
│
├── _layouts/
│   ├── default.html
│   ├── home.html
│   └── chapter.html
│
├── _includes/
│   ├── header.html
│   ├── footer.html
│   ├── language-switcher.html
│   └── chapter-navigation.html
│
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       └── common/
│           ├── books/
│           │   ├── book-1/
│           │   │   ├── cover.jpeg
│           │   │   └── chapters/
│           │   └── book-2/
│           │       ├── cover.jpeg
│           │       └── chapters/
│           └── characters/
│               └── yara/
│
├── pt/
│   ├── index.md
│   ├── chapters/
│   │   └── 001.md
│   ├── characters/
│   │   └── index.md
│   ├── world/
│   │   └── index.md
│   └── about.md
│
└── en/
    ├── index.md
    ├── chapters/
    │   └── 001.md
    ├── characters/
    │   └── index.md
    ├── world/
    │   └── index.md
    └── about.md
```

This structure may evolve as development continues.

---

# Language Structure

The website will initially support:

```text
/pt/
```

for Portuguese and:

```text
/en/
```

for English.

The canonical structure is:

```text
/pt/books/book-1/chapters/001/
/en/books/book-1/chapters/001/
```

The corresponding chapters link to each other using `translation_id`, and generated pages include canonical and `hreflang` metadata when a translation exists.

---

# Images

Images that are language-neutral should be stored in:

```text
assets/images/common/
```

Portuguese-specific images:

```text
assets/images/pt/
```

English-specific images:

```text
assets/images/en/
```

Whenever possible, artwork will be shared between languages while titles and other text are rendered as HTML/CSS.

Final book covers may have separate Portuguese and English versions.

---

# Development Workflow

The general development workflow is:

```text
1. Edit files in VS Code
        ↓
2. Run Jekyll locally
        ↓
3. Preview at localhost:4000
        ↓
4. Fix/test changes
        ↓
5. git add
        ↓
6. git commit
        ↓
7. git push
        ↓
8. GitHub Pages publishes the website
```

---

# Current Status

### Environment

* [x] Ubuntu configured
* [x] Ruby installed
* [x] RubyGems installed
* [x] Bundler installed
* [x] Project-specific Bundler path configured
* [x] Jekyll added to Gemfile
* [x] Jekyll dependencies installed

### Website

* [ ] Jekyll configuration
* [ ] Basic layouts
* [ ] Home page
* [ ] Portuguese section
* [ ] English section
* [ ] Chapter template
* [ ] Chapter navigation
* [ ] Language switcher
* [ ] Character pages
* [ ] World/lore pages
* [ ] Dark fantasy visual design
* [ ] Responsive/mobile design
* [ ] SEO configuration
* [ ] Google AdSense
* [ ] GitHub Pages deployment
* [ ] Custom domain
* [ ] Book/Amazon links

---

# Important Commands

### Install dependencies

```bash
bundle install
```

### Start local Jekyll server

```bash
bundle exec jekyll serve
```

### Check Jekyll version

```bash
bundle exec jekyll --version
```

### Check Bundler

```bash
bundle --version
```

### Check Ruby

```bash
ruby --version
```

### Check RubyGems

```bash
gem --version
```

---

# Notes

The project intentionally uses Jekyll rather than a dynamic web framework.

Jekyll generates static HTML pages from Markdown, templates, CSS and JavaScript. This makes it well suited to a chapter-based web serial because the website does not need a database or server-side application for normal reading.

Ruby is required by Jekyll, but the project itself does not require extensive Ruby programming. Most of the content will be written in Markdown, while the site's structure and appearance will be handled using HTML, CSS and JavaScript.
