"""Teste de regressão do cenário: renderiza o Last Torch com sorteio e relógio fixos e grava o hash de cada imagem.

Serve para provar que uma mudança no motor/kit de cenários, ou a migração de um cenário, NÃO mudou nenhum pixel.
Rode antes e depois e compare os dois JSON (se forem iguais, nada mudou).

Preparo (Node não existe nesta máquina; usa o Chrome instalado):
  python3 -m venv /tmp/venv && /tmp/venv/bin/pip install playwright
  # versão ANTES: git archive HEAD mini_games/last_torch | tar -x -C /tmp/base
  #               (cd /tmp/base && ruby mini_games/last_torch/build-standalone.rb)
  #               python3 -m http.server 18766 --directory /tmp/base/mini_games/last_torch/standalone-build
  # versão DEPOIS: ruby mini_games/last_torch/build-standalone.rb
  #               python3 -m http.server 18765 --directory mini_games/last_torch/standalone-build
Uso:
  /tmp/venv/bin/python scenery_regression.py <porta> <saida.json>
  (rode duas vezes na versão antiga primeiro: os dois JSON precisam ser iguais, senão o teste não é determinístico)
Cobre 4 tamanhos de tela x 3 níveis de detalhe x 9 situações (quadros 1, 30 e 150, vida baixa da tocha, quase morta,
amanhecer 50% e 100%, zoom, tremor de tela). A porta 8765 costuma estar ocupada: use outra.
"""
import sys, hashlib, json, time
from playwright.sync_api import sync_playwright
PORT=sys.argv[1]; OUT=sys.argv[2]
INIT="""
(()=>{ let a=1; window.__seed=(n)=>{a=n>>>0}; Math.random=()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
  window.__now=1000; performance.now=()=>window.__now; window.requestAnimationFrame=()=>0; })();
"""
RUN="""
async (cfg)=>{
  const O=location.origin;
  const st=await import(O+'/js/core/state.js'); const g=await import(O+'/js/game.js'); const r=await import(O+'/js/render/renderer.js');
  const rs=await import(O+'/js/core/resize.js'); const sc=await import(O+'/js/ui/screens.js');
  Object.keys(st.audio).forEach(k=>{ if(typeof st.audio[k]==='function') st.audio[k]=()=>{}; });
  const out=[]; const snap=(label)=>{ out.push([label, st.canvas.toDataURL()]); };
  st.state.quality=cfg.q; rs.resize();
  window.__seed(42); window.__now=1000;
  sc.startGame(); st.state.quality=cfg.q; rs.resize(); sc.startGame();
  window.__seed(7);
  for(let i=1;i<=150;i++){ window.__now+=16.7; g.update(1/60); r.render(); if(i===1||i===30||i===150) snap('f'+i); }
  // situações do cenário
  st.state.coreHp=st.state.coreHpMax*0.3; for(let i=0;i<40;i++){window.__now+=16.7;g.update(1/60);r.render();} snap('lowhp');
  st.state.coreHp=st.state.coreHpMax*0.02; for(let i=0;i<60;i++){window.__now+=16.7;r.render();} snap('nearlydead');
  st.state.dawn=0.5; window.__now+=100; r.render(); snap('dawn50');
  st.state.dawn=1; window.__now+=100; r.render(); snap('dawn100'); st.state.dawn=0;
  st.state.coreHp=st.state.coreHpMax; st.state.zoomPunch=0.1; window.__now+=100; r.render(); snap('zoom'); st.state.zoomPunch=0;
  st.state.shakeIntensity=8; window.__now+=100; r.render(); snap('shake'); st.state.shakeIntensity=0;
  return out;
}
"""
VIEWS={'desk':dict(viewport={'width':1280,'height':720}),'ultra':dict(viewport={'width':1920,'height':800}),
 'mobL':dict(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2),
 'mobP':dict(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=2)}
res={}
with sync_playwright() as p:
  b=p.chromium.launch(channel='chrome',headless=True)
  for vn,vc in VIEWS.items():
    for q in (0,1,2):
      ctx=b.new_context(**vc); ctx.add_init_script(INIT); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
      pg.goto(f'http://127.0.0.1:{PORT}/index.html'); pg.wait_for_function("document.getElementById('btnStart') && document.getElementById('btnStart').textContent==='PLAY'")
      snaps=pg.evaluate(RUN,{'q':q})
      for label,url in snaps: res[f'{vn}|q{q}|{label}']=hashlib.sha1(url.encode()).hexdigest()
      if errs: res[f'{vn}|q{q}|ERRORS']=errs[:2]
      ctx.close()
json.dump(res,open(OUT,'w'),indent=0); print(len(res),'hashes')
