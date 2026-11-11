import { useEffect, useRef, useState } from "react";

const gameMarkup = String.raw`


<style>
/* Layout: barra de comando fixa no topo; linha de produção em colunas (setores 01 a 07) ao lado da carteira de pedidos e do registro. */
:root{
  --bg:#e6e9ec;--panel:#f6f7f8;--panel2:#eceff1;--line:#c5ccd2;--fg:#151b20;--mute:#566470;
  --accent:#e0a800;--accent-ink:#1a1400;--ok:#137a4b;--bad:#c4372b;--info:#1d6fb0;
  --f-d:'Barlow Condensed','Arial Narrow',sans-serif;--f-b:'IBM Plex Sans',system-ui,sans-serif;--f-m:'IBM Plex Mono',ui-monospace,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#101418;--panel:#181d22;--panel2:#1f252b;--line:#2c343c;--fg:#e8ecef;--mute:#8d99a3;
  --accent:#f5be1a;--accent-ink:#1a1400;--ok:#4cc38a;--bad:#ff6b5e;--info:#5aa9e6;color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#101418;--panel:#181d22;--panel2:#1f252b;--line:#2c343c;--fg:#e8ecef;--mute:#8d99a3;
  --accent:#f5be1a;--accent-ink:#1a1400;--ok:#4cc38a;--bad:#ff6b5e;--info:#5aa9e6;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--fg);font:14px/1.45 var(--f-b);padding-inline:max(16px,env(safe-area-inset-left,0px)) max(16px,env(safe-area-inset-right,0px));padding-block:0 32px}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:30;background:var(--panel)}
button{font:inherit;color:inherit;cursor:pointer}
.num{font-variant-numeric:tabular-nums;font-family:var(--f-m)}
header{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;background:var(--panel);border-bottom:2px solid var(--accent);margin-inline:calc(-1*max(16px,env(safe-area-inset-left,0px))) calc(-1*max(16px,env(safe-area-inset-right,0px)));padding:10px max(16px,env(safe-area-inset-right,0px)) 10px max(16px,env(safe-area-inset-left,0px));display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center}
h1{font:700 24px/1 var(--f-d);letter-spacing:.04em;text-transform:uppercase;margin:0}
h1 small{display:block;font:500 11px var(--f-m);color:var(--mute);letter-spacing:.08em;margin-top:3px}
.kpi{display:flex;flex-direction:column;min-width:0}
.kpi b{font:500 18px var(--f-m)}
.kpi span{font-size:11px;color:var(--mute);text-transform:uppercase;letter-spacing:.08em}
.goal{flex:1 1 180px;min-width:140px}
.bar{height:8px;background:var(--panel2);border:1px solid var(--line)}
.bar i{display:block;height:100%;background:var(--accent);width:0}
.ctl{display:flex;gap:4px;margin-left:auto}
.ctl button,.btn{background:var(--panel2);border:1px solid var(--line);padding:5px 10px;border-radius:2px;font-weight:600}
.ctl button[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.btn:hover:not(:disabled),.ctl button:hover{border-color:var(--accent)}
.btn:focus-visible,.ctl button:focus-visible{outline:2px solid var(--info);outline-offset:1px}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn.pri{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.btn.sm{padding:2px 8px;font-size:12px}
main{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,360px);gap:18px;margin-top:18px;align-items:start}
@media (max-width:900px){main{grid-template-columns:minmax(0,1fr)}}
#floor{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px;min-width:0}
.sec{background:var(--panel);border:1px solid var(--line);min-width:0;display:flex;flex-direction:column}
.sec h2{margin:0;padding:8px 12px;font:700 17px var(--f-d);letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;gap:8px;background:var(--panel2)}
.sec h2 span{font:500 11px var(--f-m);color:var(--mute);letter-spacing:.06em;align-self:center}
.sec .bd{padding:10px 12px;display:flex;flex-direction:column;gap:8px;flex:1}
.sec .ft{padding:8px 12px;border-top:1px dashed var(--line);display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:var(--mute)}
.row{display:flex;justify-content:space-between;align-items:center;gap:8px;min-width:0}
.row>span:first-child{min-width:0;overflow-wrap:anywhere}
.mut{color:var(--mute);font-size:12px}
.low{color:var(--bad)}
.good{color:var(--ok)}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font:500 12px var(--f-m);border:1px solid var(--line);background:var(--panel2);padding:2px 7px}
.mc{border:1px solid var(--line);padding:7px 9px;display:flex;flex-direction:column;gap:5px;background:var(--panel2)}
.mc .st{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--mute)}
.led{width:9px;height:9px;border-radius:50%;background:var(--mute);flex:none}
.run .led{background:var(--ok)}.setup .led,.nomat .led{background:var(--accent)}.broken .led{background:var(--bad)}
.mc .bar{height:5px}
.mc.run .bar i{background:var(--ok)}
.tabs{display:flex;gap:4px;flex-wrap:wrap}
aside{display:flex;flex-direction:column;gap:12px;min-width:0}
.ord{border:1px solid var(--line);padding:9px 10px;display:flex;flex-direction:column;gap:6px;background:var(--panel2)}
.ord h3{margin:0;font:600 14px var(--f-b)}
.box{background:var(--panel);border:1px solid var(--line)}
.box>h2{margin:0;padding:8px 12px;font:700 17px var(--f-d);letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid var(--line)}
.box>div{padding:10px 12px;display:flex;flex-direction:column;gap:8px}.box>.grid2{display:grid}
#log{max-height:240px;overflow:auto;font-size:12px}
#log p{margin:0 0 4px;color:var(--mute)}#log p:first-child{color:var(--fg)}
#modal{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:16px}
#modal>div{background:var(--panel);border:2px solid var(--accent);max-width:520px;width:100%;padding:20px;display:flex;flex-direction:column;gap:12px;max-height:100%;overflow:auto}
#modal h2{margin:0;font:700 28px var(--f-d);text-transform:uppercase}
#modal p{margin:0}
@media (prefers-reduced-motion:no-preference){.bar i{transition:width .3s linear}}
.ic{flex:none;vertical-align:-.25em}
.sec h2 .ttl{font:inherit;color:inherit;letter-spacing:inherit;display:flex;align-items:center;gap:8px}
.ord h3{display:flex;align-items:center;gap:8px}
.ord h3 .ic{color:var(--accent)}
.chip{display:inline-flex;align-items:center;gap:4px}
.mcn{display:inline-flex;align-items:center;gap:6px}
.run .mcn .ic{color:var(--ok)}
.banner{margin-top:14px;border:1px solid var(--line);background:var(--panel);overflow:hidden}
.banner svg{display:block;width:100%;height:auto;max-height:150px}
.banner .bl{fill:var(--panel2);stroke:var(--line);stroke-width:2}
.banner .ac{fill:var(--accent)}
.banner .gl{fill:var(--info);opacity:.5}
.banner .ln{stroke:var(--mute);stroke-width:3;fill:none;stroke-linecap:round}
.banner .smoke{fill:var(--mute);opacity:.35}
.banner text{font:700 22px var(--f-d);fill:var(--fg);letter-spacing:.08em}
@media (prefers-reduced-motion:no-preference){
.belt{animation:belt 3s linear infinite}@keyframes belt{to{transform:translateX(120px)}}
.smoke{animation:smk 4s ease-out infinite}.smoke.s2{animation-delay:2s}@keyframes smk{from{transform:translateY(0);opacity:.4}to{transform:translateY(-34px);opacity:0}}
.run .mcn .ic{animation:pls 1s ease-in-out infinite}@keyframes pls{50%{transform:scale(1.15)}}}
.plant{margin-top:12px;border:1px solid var(--line);background:var(--panel)}
.plant h2{margin:0;padding:8px 12px;font:700 17px var(--f-d);letter-spacing:.05em;text-transform:uppercase;border-bottom:1px solid var(--line);background:var(--panel2)}
.plant .sc{overflow-x:auto}
.plant svg{display:block;width:100%;min-width:760px;height:auto}
.zn{fill:var(--bg);stroke:var(--line);stroke-width:1.5}
.zt{font:700 15px var(--f-d);fill:var(--mute);letter-spacing:.08em;text-transform:uppercase}
.bk{stroke:var(--line);stroke-width:1.5;fill:var(--panel2)}
.bk.r{fill:var(--ok)}.bk.w{fill:var(--accent)}.bk.b{fill:var(--bad)}
.bt{font:600 15px var(--f-m);fill:var(--accent-ink)}
.bt.d{fill:var(--fg)}
.fl{stroke:var(--accent);stroke-width:3;stroke-dasharray:6 6;fill:none}
.bar2{fill:var(--accent)}.bar2.lo{fill:var(--bad)}
.zc{font:500 13px var(--f-m);fill:var(--mute)}
@media (prefers-reduced-motion:no-preference){.fl{animation:dsh .8s linear infinite}@keyframes dsh{to{stroke-dashoffset:-12}}.bk.r{animation:glow 1.2s ease-in-out infinite}@keyframes glow{50%{opacity:.65}}}
.tabbar{display:flex;gap:2px;border-bottom:1px solid var(--line);margin-bottom:12px;overflow-x:auto}
.tabbar button{background:none;border:0;border-bottom:3px solid transparent;padding:8px 14px;font:700 17px var(--f-d);letter-spacing:.05em;text-transform:uppercase;color:var(--mute);white-space:nowrap}
.tabbar button[aria-selected="true"]{color:var(--fg);border-color:var(--accent)}
.btn[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:var(--accent)}
.plant{overflow-x:auto}.plant canvas{display:block;width:100%;min-width:720px;height:auto}
.plant h2 small{font:500 11px var(--f-m);color:var(--mute);margin-left:8px;text-transform:none;letter-spacing:0}
.gr{stroke:var(--line);stroke-width:1}.ax{font:11px var(--f-m);fill:var(--mute)}.br{fill:var(--ok)}.be{fill:var(--bad)}.ln2{fill:none;stroke:var(--info);stroke-width:2.5}.gl2{stroke:var(--accent);stroke-dasharray:6 4;stroke-width:1.5}
.svgc svg{display:block;width:100%;height:auto}
.box>.kp{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}
.vs{display:flex;flex-direction:column;gap:12px;min-width:0}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)}th{font:600 11px var(--f-m);color:var(--mute);text-transform:uppercase;letter-spacing:.06em}.tw{overflow-x:auto}
</style>
<header>
  <h1>Fábrica de Retrovisores<small>CARROS · ÔNIBUS · CAMINHÕES</small></h1>
  <div class="kpi"><b id="k-money" class="num">R$ 0</b><span>Caixa</span></div>
  <div class="kpi"><b id="k-day" class="num">Dia 1</b><span id="k-clock">06:00</span></div>
  <div class="kpi"><b id="k-rep" class="num">60</b><span>Reputação</span></div>
  <div class="goal"><div class="row mut"><span>Meta: R$ 3.600.000 em caixa</span><span id="k-goal" class="num">0%</span></div><div class="bar"><i id="k-bar"></i></div></div>
  <div class="ctl" role="group" aria-label="Velocidade">
    <button data-act="snd" id="snd" aria-pressed="false">Som</button>
    <button data-act="speed" data-a="0" id="sp0" aria-pressed="false">Pausa</button>
    <button data-act="speed" data-a="1" id="sp1" aria-pressed="true">1x</button>
    <button data-act="speed" data-a="3" id="sp3" aria-pressed="false">3x</button>
    <button data-act="speed" data-a="8" id="sp8" aria-pressed="false">8x</button>
  </div>
</header>
<main>
  <div class="vs"><nav class="tabbar" id="tabs" role="tablist" aria-label="Seções"></nav>
    <div id="pane-fab" class="vs"><div class="plant"><h2>Planta da fábrica ao vivo<small>clique numa injetora para trocar o molde ou chamar a manutenção</small></h2><canvas id="cv" role="img" aria-label="Planta animada da fábrica"></canvas></div>
    <div class="mut">Capacidade base por estação: Carro 1.020 por dia · Ônibus 240 por dia · Caminhão 300 por dia (36 por hora). P&D e gerentes aumentam esses números.</div>
    <section id="floor" aria-label="Painéis dos setores"></section></div>
    <div id="pane-pes" class="vs" hidden></div><div id="pane-nfb" class="vs" hidden></div><div id="pane-fin" class="vs" hidden></div><div id="pane-res" class="vs" hidden></div><div id="pane-cli" class="vs" hidden></div></div>
  <aside>
    <div class="box"><h2>Ocorrências nas linhas</h2><div id="evs"></div></div>
    <div class="box"><h2>Agenda de visitas</h2><div id="vis"></div></div>
    <div class="box"><h2>Propostas de clientes</h2><div id="offers"></div></div>
    <div class="box"><h2>Carteira de pedidos</h2><div id="orders"></div></div>
    <div class="box"><h2>Missões</h2><div id="miss"></div></div>
    <div class="box"><h2>Registro da fábrica</h2><div><div id="log"></div><button class="btn sm" data-act="reset">Novo jogo</button></div></div>
  </aside>
</main>
<p class="mut" style="margin-top:16px">Marcas citadas apenas como referência de clientes fictícios. Sem vínculo ou patrocínio das empresas.</p>
<div id="modal" hidden></div>`;

export default function App() {
  const host = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!host.current) return;
    host.current.innerHTML = gameMarkup;
    import("./game").catch((cause) => {
      console.error("Falha ao iniciar a fábrica:", cause);
      setError("Não foi possível iniciar o jogo. Abra o console do navegador para ver o erro.");
    });
  }, []);

  return (
    <>
      {error && <p role="alert" style={{ padding: 16, color: "#b42318" }}>{error}</p>}
      <div ref={host} />
    </>
  );
}
