#!/usr/bin/env ruby
# Gera uma pasta limpa do jogo para portais (CrazyGames), a partir do mesmo código do site.
# Não precisa do Jekyll: o HTML só perde o front matter e o include de analytics e anúncios.

require "fileutils"
require "pathname"

source_game = Pathname(__dir__).expand_path
build_output = source_game.join("standalone-build")
marker = build_output.join(".generated-by-last-torch-build")

if build_output.exist? && !marker.file?
  abort "Refusing to overwrite #{build_output}: it is not marked as generated output."
end

html = source_game.join("last_torch.html").read
html = html.sub(/\A---\n.*?\n---\n/m, "")
html = html.gsub(/^[ \t]*<!-- Google Analytics.*?-->\n/, "")
html = html.gsub(/^[ \t]*\{% include head-resources\.html %\}\n/, "")

# Lista os módulos de uma vez: sem isso o navegador só descobre cada import depois de baixar quem o importa
# (cerca de 10% mais rápido até o PLAY acender, em HTTP/2 e rede lenta).
entry = source_game.join("js/game.js")
modules = [entry]
modules.each do |path|
  path.read.scan(/(?:from|import)\s+['"](\.[^'"]+)['"]/).flatten.each do |target|
    resolved = path.dirname.join(target).cleanpath
    modules << resolved unless modules.include?(resolved)
  end
end

# Junta todos os módulos em UM arquivo (esbuild): são ~290 pedidos de rede, e no 4G cada um custa uma ida e volta.
# Sem o esbuild o pacote sai como antes (módulos soltos + modulepreload). Onde achar: variável ESBUILD, o PATH ou download automático.
# Não achou? Baixa uma vez (versão fixa, do registro npm) para ~/.cache/last_torch/ e reaproveita nas próximas.
ESBUILD_VERSION = "0.25.0"
def download_esbuild
  cache = File.join(Dir.home, ".cache", "last_torch", "esbuild-#{ESBUILD_VERSION}")
  binary = File.join(cache, "package", "bin", "esbuild")
  return binary if File.executable?(binary)

  platform = { "x86_64-linux" => "linux-x64", "aarch64-linux" => "linux-arm64", "arm64-darwin" => "darwin-arm64",
               "x86_64-darwin" => "darwin-x64" }.find { |key, _| RUBY_PLATFORM.include?(key.split("-").first) && RUBY_PLATFORM.include?(key.split("-").last) }&.last
  return nil unless platform

  puts "Baixando o esbuild #{ESBUILD_VERSION} (só na primeira vez)..."
  FileUtils.mkdir_p(cache)
  url = "https://registry.npmjs.org/@esbuild/#{platform}/-/#{platform}-#{ESBUILD_VERSION}.tgz"
  ok = system("curl", "-fsSL", url, "-o", File.join(cache, "esbuild.tgz")) &&
       system("tar", "xzf", File.join(cache, "esbuild.tgz"), "-C", cache)
  File.executable?(binary) && ok ? binary : nil
end

esbuild = [ENV["ESBUILD"], `command -v esbuild 2>/dev/null`.strip].compact.reject(&:empty?).find { |path| File.executable?(path) }
esbuild ||= download_esbuild unless ENV["NO_BUNDLE"]
warn "AVISO: esbuild indisponível, o pacote sai com módulos soltos (mais lento no celular)." if esbuild.nil? && !ENV["NO_BUNDLE"]
bundle = !esbuild.nil? && ENV["NO_BUNDLE"].nil?
unless bundle
  preloads = (modules - [entry]).map do |path|
    %(    <link rel="modulepreload" href="./#{path.relative_path_from(source_game)}">\n)
  end
  html = html.sub("</head>", "#{preloads.join}</head>")
end

FileUtils.rm_rf(build_output)
FileUtils.mkdir_p(build_output)

# library: a cópia da biblioteca de personagens e monstros (mini_games/_library, copiada pelo sync)
%w[js css data_model library images].each do |directory|
  FileUtils.cp_r(source_game.join(directory), build_output.join(directory))
end
if bundle
  out = build_output.join("game.min.js")
  ok = system(esbuild, source_game.join("js/game.js").to_s, "--bundle", "--minify", "--format=esm", "--target=es2020",
              "--legal-comments=none", "--log-level=warning", "--outfile=#{out}")
  abort "esbuild failed" unless ok && out.file?
  # Os módulos soltos não são mais necessários: só ficam css, imagens e o bundle (o código está dentro dele)
  %w[js library data_model].each do |directory|
    Dir.glob(build_output.join(directory, "**/*.js")).each { |path| FileUtils.rm_f(path) }
  end
  # CSS: game.css importa 19 arquivos, e cada @import só é descoberto depois do anterior chegar (uma cadeia de idas e
  # voltas). Junta tudo em css/game.css; o esbuild não reescreve as url() externas, então os caminhos relativos
  # (escritos a partir de css/base e css/components) são ajustados aqui para css/.
  css_out = build_output.join("css/game.css")
  ok = system(esbuild, source_game.join("css/game.css").to_s, "--bundle", "--minify", "--external:*.webp", "--external:*.png",
              "--external:*.woff2", "--log-level=warning", "--outfile=#{css_out}")
  abort "esbuild (css) failed" unless ok && css_out.file?
  css = css_out.read.gsub("url(../fonts/", "url(fonts/").gsub("url(../../images/", "url(../images/")
  abort "CSS: unexpected relative url left" if css.match?(%r{url\(\.\./\.\./|url\(\.\./fonts/|@import})
  css_out.write(css)
  Dir.glob(build_output.join("css/{base,components}")).each { |directory| FileUtils.rm_rf(directory) }
  Dir.glob(build_output.join("**/*"), File::FNM_DOTMATCH).sort_by { |path| -path.length }.each do |path|
    Dir.rmdir(path) if File.directory?(path) && Dir.empty?(path)
  end
  html = html.sub('<script type="module" src="./js/game.js"></script>', '<script type="module" src="./game.min.js"></script>')
  # A barra de carregamento contava os modulepreload; com um arquivo só ela anda por tempo e termina em finishLoading()
  html = html.sub("var expected = links.length || 140;", "var expected = 1;")
  html = html.sub("function tick() { done++; show(done / expected); }",
                  "function tick() { done++; show(done / expected); }\n    var creep = setInterval(function () { show(shown + (0.9 - shown) * 0.08); }, 120);")
  html = html.sub("window.finishLoading = function () {", "window.finishLoading = function () {\n        clearInterval(creep);")
  html = html.sub('<link rel="modulepreload"', '<link rel="modulepreload"') # nada a fazer; mantém o formato
  fonts = %w[inter-latin cinzel-latin].map { |name| %(    <link rel="preload" href="./css/fonts/#{name}.woff2" as="font" type="font/woff2" crossorigin>\n) }
  html = html.sub("</head>", %(    <link rel="modulepreload" href="./game.min.js">\n#{fonts.join}</head>))
end
build_output.join("index.html").write(html)
Dir.glob(build_output.join("**/*.md")).each { |path| FileUtils.rm_f(path) }
FileUtils.rm_f(build_output.join("library/.synced-from-library"))
# As versões grandes são para páginas e prévias: o jogo só carrega as -small (data_model/tree_images.js)
Dir.glob(build_output.join("images/**/*.webp")).each do |path|
  FileUtils.rm_f(path) if File.exist?(path.sub(/\.webp\z/, "-small.webp"))
end

text_files = Dir.glob(build_output.join("**/*.{html,css,js}"))
problems = text_files.flat_map do |path|
  File.readlines(path, encoding: "UTF-8").each_with_index.filter_map do |line, index|
    leftover = line.match?(/\{%|\{\{/) || line.gsub("http://www.w3.org/2000/svg", "").match?(%r{https?://|['"(]//})
    "#{path}:#{index + 1}: #{line.strip}" if leftover
  end
end
unless problems.empty?
  FileUtils.rm_rf(build_output)
  abort "Site-only content left in the package:\n#{problems.join("\n")}"
end

marker.write("Generated by mini_games/last_torch/build-standalone.rb\n")

files = Dir.glob(build_output.join("**/*"), File::FNM_DOTMATCH).select { |path| File.file?(path) }
bytes = files.sum { |path| File.size(path) }
puts "Standalone game package created: #{build_output}"
puts "#{files.length - 1} files, #{format('%.2f', bytes / 1_048_576.0)} MiB"
puts "Upload the contents of this folder; index.html is the entry point."

# `--serve`: depois de gerar, abre o pacote em http://localhost:8000 (o jogo não roda abrindo o index.html do disco:
# o navegador bloqueia módulos em file://). Ctrl+C para parar.
if ARGV.include?("--serve")
  port = (ARGV.find { |arg| arg.start_with?("--port=") } || "--port=8000").split("=").last
  puts "Jogue em http://localhost:#{port}  (Ctrl+C para parar). Para conferir o layout, abra http://localhost:#{port}/?fluid=debug"
  # Sem cache: o navegador não pode reaproveitar um game.min.js ou css/game.css antigo depois de gerar o pacote de novo
  server = "import sys, functools\n" \
           "from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer\n" \
           "class H(SimpleHTTPRequestHandler):\n" \
           "    def end_headers(self):\n" \
           "        self.send_header('Cache-Control', 'no-store')\n" \
           "        super().end_headers()\n" \
           "    def log_message(self, *a): pass\n" \
           "ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), functools.partial(H, directory=sys.argv[2])).serve_forever()\n"
  exec("python3", "-c", server, port, build_output.to_s)
end
