"""Mede o custo de um cenário no Last Torch real: ms por render() e MB de canvas criados.

Compara dois pacotes do jogo, um com o cenário atual e outro com o novo, servidos em portas diferentes.
Preparo (não há Node; usa o Chrome instalado):
  python3 -m venv /tmp/venv && /tmp/venv/bin/pip install playwright
  ruby mini_games/last_torch/build-standalone.rb                    # gera standalone-build/ com o cenário de WORLD.scenery
  cp -r mini_games/last_torch/standalone-build /tmp/jogo_novo       # cópia onde se troca o cenário:
  sed -i "s/scenery: 'dark_forest',/scenery: 'dark_forest_2',/" /tmp/jogo_novo/data_model/world.js
  python3 -m http.server 18765 --directory mini_games/last_torch/standalone-build &   # atual
  python3 -m http.server 18772 --directory /tmp/jogo_novo &                            # novo
Uso: ajuste as portas na lista no fim do arquivo e rode  /tmp/venv/bin/python scenery_perf.py
Os números variam uns +-0,08 ms entre execuções: compare os dois lado a lado, na mesma execução. A 60 FPS o quadro tem 16,7 ms.
"""
import time,json
from playwright.sync_api import sync_playwright
INIT="""
(()=>{ window.__cv=[]; const ce=document.createElement.bind(document);
  document.createElement=function(t,...a){const e=ce(t,...a); if(String(t).toLowerCase()==='canvas') window.__cv.push(e); return e;}; })();
"""
RUN="""
async ()=>{
  const O=location.origin; const st=await import(O+'/js/core/state.js'); const g=await import(O+'/js/game.js'); const r=await import(O+'/js/render/renderer.js'); const sc=await import(O+'/js/ui/screens.js');
  const bytes=()=>window.__cv.reduce((s,c)=>s+c.width*c.height*4,0);
  const before=bytes(); sc.startGame(); for(let i=0;i<30;i++){g.update(1/60);r.render();}
  const after=bytes();
  for(let i=0;i<60;i++){g.update(1/60);r.render();}
  const N=400; const t0=performance.now(); for(let i=0;i<N;i++){ r.render(); } const ms=(performance.now()-t0)/N;
  return {msPerRender:+ms.toFixed(3), canvasMB:+(after/1048576).toFixed(2), canvasesAfterStart:window.__cv.length};
}
"""
for name,port in [('dark_forest  (atual)',18765),('dark_forest_2 (novo) ',18772)]:
  with sync_playwright() as p:
    b=p.chromium.launch(channel='chrome',headless=True)
    for vn,vc in [('desk',dict(viewport={'width':1280,'height':720})),('mobL',dict(viewport={'width':844,'height':390},is_mobile=True,has_touch=True,device_scale_factor=2))]:
      ctx=b.new_context(**vc); ctx.add_init_script(INIT); pg=ctx.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
      pg.goto(f'http://127.0.0.1:{port}/index.html'); pg.wait_for_function("document.getElementById('btnStart') && document.getElementById('btnStart').textContent==='PLAY'")
      res=[pg.evaluate(RUN) for _ in range(1)]
      print(name,vn,res[0],'erros',errs[:2]); ctx.close()
