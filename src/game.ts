// @ts-nocheck
/* Motor do jogo da versão atualizada, isolado do bootstrap React. */

const DAY=60,GOAL=120000,KEYS=['car','bus','truck'];
const PR={car:{n:'Carro',s:'C',res:1,vid:1,inj:2,col:2,mon:2,emb:1,price:3.67},
bus:{n:'Ônibus',s:'Ô',res:2,vid:2,inj:4,col:2,mon:2,emb:1,price:7.33},
truck:{n:'Caminhão',s:'T',res:3,vid:2,inj:5,col:3,mon:3,emb:2,price:9.33}};
const MAT={resina:{n:'Resina PP (kg)',p:.333,lot:1800},vidro:{n:'Espelho de vidro',p:.467,lot:1200},kit:{n:'Kit motor e regulagem',p:.333,lot:1200},cola:{n:'Adesivo PU',p:.1,lot:1800},caixa:{n:'Caixa de papelão',p:.133,lot:1800},espuma:{n:'Espuma para mantas',p:.167,lot:1800}};
const CLI={car:['Volkswagen','Fiat','Chevrolet','Toyota','Hyundai','Honda','Renault','Ford','Jeep','Nissan','Peugeot','Citroën'],bus:['Marcopolo','Mercedes-Benz Ônibus','Volvo Ônibus','Scania Ônibus','Comil','Caio','Neobus','Agrale'],truck:['Scania','Volvo Caminhões','Mercedes-Benz Caminhões','DAF','Iveco','MAN / Volkswagen Caminhões','Ford Cargo','Agrale']};
const SEC={col:{inn:'hous',out:'glued',mats:p=>({vidro:PR[p].vid,cola:1})},mon:{inn:'glued',out:'asm',mats:p=>({kit:1})},qa:{inn:'asm',out:'qok',mats:p=>({})},emb:{inn:'qok',out:'pack',mats:p=>({caixa:1,manta:1})}};
const z=()=>({car:0,bus:0,truck:0});
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
let G,timer=null,uid=1,AC=null,SND=false;
function sfx(t){if(!SND)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime,f={ok:[660,880],bad:[140,90],click:[500,500],day:[392,523]}[t];o.type=t==='bad'?'sawtooth':'square';o.frequency.setValueAtTime(f[0],n);o.frequency.setValueAtTime(f[1],n+.08);g.gain.setValueAtTime(.05,n);g.gain.exponentialRampToValueAtTime(.001,n+.25);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+.26)}catch(e){}}
function fresh(){return{t:0,day:1,money:9000,ops:{inj:4,col:4,mon:4,qa:4,emb:4},staff:0,shift:{goal:500,good:0,produced:0,id:1,history:[]},rep:60,speed:0,prod:0,sent:0,won:false,over:false,
 raw:{resina:1800,vidro:1200,kit:1200,cola:1800,caixa:1800,espuma:1800,manta:900},hous:z(),glued:z(),asm:z(),qok:z(),pack:z(),scrap:0,recv:0,delivered:0,res:{},brand:{},hist:[],docRead:{},doc:'',dayRev:0,dayExp:0,mdone:{},diff:1,tab:'fab',qa:[{p:null,t:0},{p:null,t:0}],mnt:[{p:null,t:0}],moi:[{p:null,t:0}],fer:[{p:null,t:0}],reb:0,recycled:0,mold:{car:0,bus:0,truck:0},amb:0,ref:0,brig:0,mult:0,ger:{prod:0,log:0,qual:0,man:0,cam:0,sc:0},moral:70,acc:0,ev:[],fx:{},visit:null,nextVisit:150,vlast:'',nfb:{ph:0,prog:0,run:false,done:false,contract:0},
 inj:[{p:'auto',cur:null,prog:0,setup:0,rep:0,broken:false,st:'idle'},{p:'auto',cur:null,prog:0,setup:0,rep:0,broken:false,st:'idle'}],
 col:[{p:null,t:0},{p:null,t:0}],mon:[{p:null,t:0},{p:null,t:0}],emb:[{p:null,t:0},{p:null,t:0}],
 docks:1,dl:[],queue:[],unl:[],trucks:[{busy:0,ord:null},{busy:0,ord:null}],offers:[],orders:[],log:['Fábrica aberta. Aceite propostas e mantenha o estoque abastecido.']};}
const say=m=>{G.log.unshift(m);G.log.length=Math.min(G.log.length,40)};
const R$=n=>'R$ '+Math.round(n*K).toLocaleString('pt-BR');
function pipe(p){return G.hous[p]+G.glued[p]+G.asm[p]+G.qok[p]+G.pack[p]}
function deficit(p){let d=0;G.orders.forEach(o=>{if(o.state==='open'&&o.p===p)d+=o.qty});return d-pipe(p)}
function pickAuto(){let b=null,bd=0;KEYS.forEach(p=>{const d=deficit(p);if(d>bd){bd=d;b=p}});return b}
const RATE={car:17,bus:4,truck:5},RB=1800,K=30;
const sh=n=>n>=1000?(n/1000).toFixed(1).replace('.',',')+'k':String(Math.round(n));
const tm=n=>{const m=Math.round(n*8.33);return m>=60?Math.floor(m/60)+' h'+(m%60?' '+m%60+' min':''):m+' min'};
const fm=v=>{v*=K;return Math.abs(v)>=1e6?(v/1e6).toFixed(1).replace('.',',')+' mi':Math.abs(v)>=1000?Math.round(v/1000)+' mil':String(Math.round(v))};
function opFactor(k){const stations={inj:G.inj.length,col:G.col.length,mon:G.mon.length,qa:G.qa.length,emb:G.emb.length}[k]||1;return Math.min(1.35,.65+(G.ops?.[k]||0)/Math.max(1,stations*2)*.35)}
function stR(k,p){return RATE[p]*(p==='truck'&&G.ger.cam?1.15:1)*(k==='col'&&G.res.cura?1.25:1)*(k==='col'&&G.fx.colSlow>G.t?.8:1)*(k==='emb'&&G.res.auto?1.3:1)*(G.fx.lineSlow>G.t?.65:1)}
function inject(){G.inj.forEach(m=>{
 if(m.broken){if(m.rep>0&&--m.rep===0){m.broken=false;say('Injetora reparada.')}m.st='broken';m.prog=0;return}
 if(m.setup>0){m.setup--;m.st='setup';m.prog=0;return}
 const p=m.p==='auto'?(m.cur&&deficit(m.cur)>0?m.cur:pickAuto()):m.p;
 if(!p){m.st='idle';m.prog=0;return}
 if(m.cur&&m.cur!==p){m.cur=p;m.setup=G.res.molde?1:3;m.st='setup';m.prog=0;say('Troca de molde: '+PR[p].n+'.');return}
 m.cur=p;
 const n=Math.min(Math.floor(stR('inj',p)*opFactor('inj')),Math.floor(G.raw.resina/PR[p].res));
 if(n<=0||G.reb>=RB||G.mold[p]>=100||G.fx.blackout>G.t){m.st='nomat';m.prog=0;return}
 G.raw.resina-=n*PR[p].res;G.hous[p]+=n;G.prod+=n;G.reb=Math.min(RB*1.3,G.reb+n*PR[p].res*.4);G.mold[p]=Math.min(100,G.mold[p]+n*.02);m.st='run';m.prog=n;
 if(Math.random()<brk()){m.broken=true;m.prog=0;m.st='broken';say('Injetora parou: falha no sistema de aquecimento.');sfx('bad')}})}
function stage(k){const d=SEC[k];G[k].forEach(s=>{
 if(s.down>0){s.down--;s.why='down';s.p=null;s.n=0;s.u=0;return}
 let tl=1,tot=0,main=null,anyIn=false;
 const ord=KEYS.slice().sort((a,b)=>deficit(b)-deficit(a)||G[d.inn][b]-G[d.inn][a]);
 for(const p of ord){if(tl<=.001)break;if(G[d.inn][p]<=0)continue;anyIn=true;
  const mt=d.mats(p),r=stR(k,p)*opFactor(k);let n=Math.min(Math.floor(tl*r),G[d.inn][p]);
  for(const m in mt)n=Math.min(n,Math.floor(G.raw[m]/mt[m]));
  if(n<=0)continue;
  G[d.inn][p]-=n;for(const m in mt)G.raw[m]-=n*mt[m];
  let ok=n;if(k==='qa'){const sc=Math.min(n,Math.max(0,Math.round(n*scrapRate()+(Math.random()-.5))));ok=n-sc;G.scrap+=sc;if(G.scrap-(G.scrapSay||0)>=60){G.scrapSay=G.scrap;say('Inspeção de qualidade: '+G.scrap+' peças refugadas até agora.')}}
  G[d.out][p]+=ok;if(k==='qa'){G.shift.good+=ok;G.shift.produced+=n}tl-=n/r;tot+=n;main=main||p}
 s.p=main;s.n=tot;s.u=1-Math.max(0,tl);s.why=tot?'run':anyIn?'nomat':'noin'})}
function receive(){
 G.dl.forEach(d=>d.eta--);
 G.dl=G.dl.filter(d=>{if(d.eta<=0){G.queue.push(d);return false}return true});
 G.unl=G.unl.filter(u=>{if(--u.left<=0){G.raw[u.item]+=u.qty;G.recv++;say('Recebido e conferido: '+u.qty+' × '+MAT[u.item].n+'.');return false}return true});
 while(G.unl.length<G.docks&&G.queue.length){const d=G.queue.shift();G.unl.push({item:d.item,qty:d.qty,left:3})}}
function logistics(){G.trucks.forEach(tk=>{if(tk.busy>0&&--tk.busy===0){const o=tk.ord;tk.ord=null;
 const late=G.t>o.due,pay=o.pay*(late?.7:1);earn(pay);sfx(late?"bad":"ok");G.sent+=o.qty;G.delivered++;const bb=G.brand[o.client]||(G.brand[o.client]={u:0,late:0,rev:0});bb.u+=o.qty;bb.rev+=pay;if(late)bb.late++;G.rep=Math.max(0,Math.min(100,G.rep+(late?-1:2)));
 say((late?'Entrega atrasada: ':'Entregue: ')+o.qty+' × '+PR[o.p].n+' para '+o.client+' ('+R$(pay)+').');
 G.orders=G.orders.filter(x=>x.id!==o.id)}})}
function market(){
 G.offers=G.offers.filter(o=>o.exp>G.t);
 if(G.offers.length<4&&Math.random()<1/12){
  const p=['car','car','bus','truck'][ri(0,3)],q=p==='car'?ri(10,30)*40:p==='bus'?ri(4,12)*20:ri(4,12)*25;
  const cl=CLI[p][ri(0,CLI[p].length-1)],bb=G.brand[cl],unit=PR[p].price*(.9+G.rep/400+Math.min(.15,(bb?bb.u:0)/18000))*(.92+Math.random()*.2)*(p==='truck'&&G.ger.cam?1.05:1);
  G.offers.push({id:uid++,p,qty:q,pay:Math.round(unit*q),client:cl,win:ri(90,200),exp:G.t+60})}
 G.orders.forEach(o=>{if(o.state==='open'&&G.t>o.due){spend(o.pay*.1);G.rep=Math.max(0,G.rep-5);say('Prazo perdido: '+o.client+' cancelou o pedido (multa '+R$(o.pay*.1)+').');o.dead=1}});
 G.orders=G.orders.filter(o=>!o.dead)}
function endDay(){
 const n=G.qa.length+G.inj.length+G.col.length+G.mon.length+G.emb.length+G.docks+G.trucks.length,c=150+30*(n+G.mnt.length+G.moi.length+G.fer.length)+staffCost();
 spend(c);say('Dia '+G.day+' encerrado. Folha e despesas: '+R$(c)+'.');G.hist.push({d:G.day,m:G.money,r:G.dayRev,e:G.dayExp});if(G.hist.length>60)G.hist.shift();G.dayRev=0;G.dayExp=0;G.day++;sfx("day");
 if(G.money<-3000&&!G.over){G.over=true;pause();modal('lose')}
 else if(G.money>=GOAL&&!G.won){G.won=true;pause();modal('win')}}
function closeShift(){const sh=G.shift,rate=sh.goal?Math.min(150,sh.good/sh.goal*100):0;sh.history.push({id:sh.id,good:sh.good,goal:sh.goal,rate});if(sh.history.length>9)sh.history.shift();say('Turno '+sh.id+' encerrado: '+sh.good+'/'+sh.goal+' peças aprovadas ('+Math.round(rate)+'%).');if(rate>=100){G.rep=Math.min(100,G.rep+1);G.moral=Math.min(100,G.moral+2)}else if(rate<60)G.moral=Math.max(0,G.moral-2);sh.good=0;sh.produced=0;sh.id=sh.id%3+1}
function tick(){G.t++;receive();logistics();if(!(G.fx.blackout>G.t)){stage('emb');stage('qa');stage('mon');stage('col');inject()}market();checkM();extra();if(G.t%20===0)closeShift();if(G.t%DAY===0)endDay();render();if(G.t%10===0)save()}
function pause(){G.speed=0;clearInterval(timer);timer=null}
function setSpeed(s){G.speed=s;clearInterval(timer);timer=null;if(s>0)timer=setInterval(tick,1000/s)}
function save(){try{localStorage.setItem('fabrica-retrovisores',JSON.stringify(G))}catch(e){}}
function load(){try{const s=localStorage.getItem('fabrica-retrovisores');if(s){const g=JSON.parse(s);if(g&&g.inj&&g.qa&&g.hist&&g.nfb&&g.ger&&g.ger.sc!==undefined){g.ops=g.ops||{inj:4,col:4,mon:4,qa:4,emb:4};g.staff=g.staff||0;g.shift=g.shift||{goal:500,good:0,produced:0,id:1,history:[]};g.docRead=g.docRead||{};g.doc=g.doc||'';return g}}}catch(e){}return null}
const UP={mnt:{max:3,cost:n=>2000*n,arr:()=>G.mnt,add:()=>({p:null,t:0}),n:'estação de mantas'},moi:{max:3,cost:n=>2500*n,arr:()=>G.moi,add:()=>({p:null,t:0}),n:'moinho'},fer:{max:3,cost:n=>3500*n,arr:()=>G.fer,add:()=>({p:null,t:0}),n:'ferramenteiro'},qa:{max:4,cost:n=>2500*n,arr:()=>G.qa,add:()=>({p:null,t:0}),n:'posto de inspeção'},inj:{max:6,cost:n=>7000+2500*(n-2),arr:()=>G.inj,add:()=>({p:'auto',cur:null,prog:0,setup:0,rep:0,broken:false,st:'idle'}),n:'injetora'},
col:{max:5,cost:n=>3000*n,arr:()=>G.col,add:()=>({p:null,t:0}),n:'estação de colagem'},
mon:{max:5,cost:n=>3000*n,arr:()=>G.mon,add:()=>({p:null,t:0}),n:'bancada de montagem'},
emb:{max:4,cost:n=>2500*n,arr:()=>G.emb,add:()=>({p:null,t:0}),n:'posto de embalagem'},
dock:{max:3,cost:n=>3500*n,n:'doca de recebimento'},truck:{max:5,cost:n=>4500*n,n:'caminhão da frota'}};
const cnt=k=>k==='dock'?G.docks:k==='truck'?G.trucks.length:UP[k].arr().length;
function A(act,a){
 if(act==='speed')return setSpeed(+a);
 if(act==='tab'){G.tab=a;return render()}\n if(act==='docopen'){G.doc=a;return render()}\n if(act==='docback'){G.doc='';return render()}\n if(act==='docread'){G.docRead=G.docRead||{};G.docRead[a]=1;say('Documento consultado: '+(DOCS.find(d=>d.id===a)?.name||a)+'.');return render()}
 if(act==='goal'){G.shift.goal=Math.max(500,Math.min(5000,G.shift.goal+(+a)));say('Meta do turno ajustada para '+G.shift.goal+' peças.');return render()}
 if(act==='op'){const [k,delta]=a.split(':');if(+delta>0&&G.staff>0){G.ops[k]=(G.ops[k]||0)+1;G.staff--}else if(+delta<0&&(G.ops[k]||0)>0){G.ops[k]--;G.staff++}return render()}
 if(act==='hireOp'){if(G.money>=150){spend(150);G.staff++;say('Novo operador contratado e disponível para alocação.')}return render()}
 if(act==='diff'){G.diff=+a;G.money=[12000,9000,6000][+a];document.querySelectorAll('[data-act=diff]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.a===a)));return render()}
 if(act==='snd'){SND=!SND;sfx('click');return render()}
 if(['buy','up','accept','ship','repair','res','hire','ev','prep','drill','nfb'].includes(act))sfx('click');
 if(act==='buy'){const m=MAT[a],c=m.lot*mp(a);if(G.money>=c){spend(c);G.dl.push({item:a,qty:m.lot,eta:10+ri(0,4)-(G.res.kanban?5:0)-(G.ger.sc?3:0)});say('Pedido de compra: '+m.lot+' × '+m.n+' ('+R$(c)+').')}}
 else if(act==='cycle'){const m=G.inj[+a],o=['auto','car','bus','truck'];m.p=o[(o.indexOf(m.p)+1)%4]}
 else if(act==='repair'){const m=G.inj[+a];if(m.broken&&m.rep===0&&G.money>=150){spend(150);m.rep=4;say('Manutenção chamada (R$ 4.500).')}}
 else if(act==='up'){const u=UP[a],n=cnt(a),c=u.cost(n);if(n<u.max&&G.money>=c){spend(c);
  if(a==='dock')G.docks++;else if(a==='truck')G.trucks.push({busy:0,ord:null});else u.arr().push(u.add());say('Investimento: '+u.n+' ('+R$(c)+').')}}
 else if(act==='accept'){const i=G.offers.findIndex(o=>o.id===+a);if(i>=0){const o=G.offers.splice(i,1)[0];o.state='open';o.due=G.t+o.win;G.orders.push(o);say('Pedido aceito: '+o.qty+' × '+PR[o.p].n+' para '+o.client+'.')}}
 else if(act==='decline'){G.offers=G.offers.filter(o=>o.id!==+a)}
 else if(act==='ship'){const o=G.orders.find(x=>x.id===+a),tk=G.trucks.find(t=>t.busy===0);
  if(o&&tk&&o.state==='open'&&G.pack[o.p]>=o.qty){G.pack[o.p]-=o.qty;o.state='transit';tk.ord=o;tk.busy=tk.trip=9+ri(0,6);shipAt=performance.now()/1000;say('Expedição: carga de '+o.qty+' × '+PR[o.p].n+' saiu para '+o.client+'.')}}
 else if(act==='res'){const r=RES.find(x=>x.id===a);if(r&&!G.res[r.id]&&G.money>=r.c){spend(r.c);G.res[r.id]=1;say('P&D concluído: '+r.n+'.')}}
 else if(act==='hire')hire(a)
 else if(act==='ev'){const p=a.split(':');resolveEv(+p[0],+p[1])}
 else if(act==='prep'){if(G.visit&&G.visit.prep<3&&G.money>=600){spend(600);G.visit.prep++;G.moral=Math.min(100,G.moral+3);say('Preparação da visita: 5S e treinamento (R$ 18.000).')}}
 else if(act==='drill'){if(G.money>=800){spend(800);G.fx.drill=G.t+120;G.moral=Math.min(100,G.moral+2);say('Simulado de emergência feito: brigada mais preparada por 2 dias.')}}
 else if(act==='nfb'){const n=G.nfb,ph=NFB[n.ph];if(ph&&!n.run&&!n.done&&G.money>=ph.cost&&(!ph.deliver||G.pack.truck>=ph.deliver)){spend(ph.cost);if(ph.deliver)G.pack.truck-=ph.deliver;n.run=true;n.prog=0;say('Projeto NFB: fase iniciada ('+ph.n+').')}}
 else if(act==='reset'){pause();G=fresh();modal('intro')}
 else if(act==='go'){document.getElementById('modal').hidden=true;setSpeed(1)}
 render()}
function modal(k){const m=document.getElementById('modal');m.hidden=false;
 const T={intro:['Bem-vindo à linha','Você gerencia uma fábrica de retrovisores para carros, ônibus e caminhões. Compre resina, espelhos, kits de motor, adesivo e caixas. A resina vira carcaça nas injetoras, o espelho é colado, o kit é montado, o conjunto é embalado e a expedição despacha pelo caminhão da frota. Aceite propostas, entregue no prazo e chegue a '+R$(GOAL)+' em caixa. Cada estação processa até 1.020 retrovisores de carro por dia, 240 de ônibus ou 300 de caminhão (36 por hora). Os clientes são montadoras conhecidas, citadas só como referência no jogo, sem vínculo com as empresas.','Abrir a fábrica'],
 win:['Meta batida','A fábrica chegou a '+R$(GOAL)+' em caixa no dia '+G.day+'. Você pode continuar jogando e expandir a operação.','Continuar'],
 lose:['Fábrica falida','O caixa passou de -R$ 90.000 Comece um novo jogo e cuide do capital de giro.','Novo jogo']}[k];
 m.innerHTML='<div role="dialog" aria-modal="true"><h2>'+T[0]+'</h2><p>'+T[1]+'</p>'+(k==='intro'?'<div class="chips" role="group" aria-label="Dificuldade">'+['Fácil','Normal','Difícil'].map((n,i)=>'<button class="btn" data-act="diff" data-a="'+i+'" aria-pressed="'+(G.diff===i)+'">'+n+'</button>').join('')+'</div>':'')+'<button class="btn pri" data-act="'+(k==='lose'?'reset':'go')+'" autofocus>'+T[2]+'</button></div>'}
document.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled){e.preventDefault();b._d=1;A(b.dataset.act,b.dataset.a)}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(b&&!b.disabled&&e.detail===0)A(b.dataset.act,b.dataset.a)});
const $=id=>document.getElementById(id);
const IC={
car:'<path d="M6 52L24 40"/><path d="M22 22Q22 14 32 14H50Q58 14 58 22V38Q58 46 50 46H32Q22 46 22 38Z"/><path d="M28 22H52V38H28Z" fill="currentColor" opacity=".25"/>',
bus:'<path d="M6 20H30M6 44H30"/><rect x="30" y="6" width="26" height="50" rx="4"/><rect x="34" y="10" width="18" height="42" rx="2" fill="currentColor" opacity=".25"/>',
truck:'<path d="M6 24H24M12 50H24"/><rect x="24" y="6" width="34" height="30" rx="3"/><rect x="28" y="10" width="26" height="22" rx="2" fill="currentColor" opacity=".25"/><rect x="24" y="40" width="24" height="14" rx="3"/>',
rec:'<path d="M32 4V26M22 18L32 28L42 18"/><path d="M8 38H56V58H8Z"/><path d="M8 48H56M32 38V58"/>',
inj:'<rect x="6" y="36" width="52" height="14" rx="2"/><path d="M14 36L20 20H32L38 36"/><rect x="42" y="12" width="16" height="24" rx="2"/><path d="M10 50V58M54 50V58M22 43H34"/>',
glue:'<path d="M32 6C32 6 16 26 16 38A16 16 0 0 0 48 38C48 26 32 6 32 6Z"/><path d="M24 40A8 8 0 0 0 32 48" opacity=".6"/>',
gear:'<circle cx="32" cy="32" r="10"/><path d="M32 6V16M32 48V58M6 32H16M48 32H58M13.6 13.6L20.7 20.7M43.3 43.3L50.4 50.4M13.6 50.4L20.7 43.3M43.3 20.7L50.4 13.6"/>',
box:'<path d="M8 22L32 10L56 22V46L32 58L8 46Z"/><path d="M8 22L32 34L56 22M32 34V58"/>',
stack:'<path d="M6 54H58"/><rect x="10" y="34" width="20" height="20"/><rect x="34" y="34" width="20" height="20"/><rect x="22" y="14" width="20" height="20"/>',
qa:'<circle cx="28" cy="28" r="16"/><path d="M40 40L56 56M21 28L26 33L36 22"/>',
mnt:'<rect x="8" y="14" width="48" height="10" rx="5"/><rect x="8" y="29" width="48" height="10" rx="5"/><rect x="8" y="44" width="48" height="10" rx="5"/>',
moi:'<path d="M12 10H52L42 34H22Z"/><path d="M22 34V54H42V34"/><path d="M28 20L36 28M36 20L28 28"/>',
fer:'<path d="M10 54L36 28"/><path d="M26 10H46L54 18L46 26L38 18Z"/>',
amb:'<rect x="8" y="8" width="48" height="48" rx="6"/><path d="M32 18V46M18 32H46"/>',
tr:'<path d="M4 44V20H38V44M38 28H50L60 38V44H38"/><circle cx="16" cy="48" r="5"/><circle cx="48" cy="48" r="5"/>'};
const SI={'01':'rec','02':'inj','03':'glue','04':'gear','05':'qa','06':'box','07':'stack','08':'tr','09':'mnt','10':'moi','11':'fer','12':'amb'};
const ic=(k,s)=>'<svg class="ic" width="'+(s||24)+'" height="'+(s||24)+'" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>';

const btn=(act,a,txt,dis,cls)=>'<button class="btn '+(cls||'')+'" data-act="'+act+'" data-a="'+a+'"'+(dis?' disabled':'')+'>'+txt+'</button>';
const sec=(n,t,sub,bd,ft)=>'<div class="sec"><h2><span class="ttl">'+ic(SI[n],26)+t+'</span><span>SETOR '+n+(sub?' · '+sub:'')+'</span></h2><div class="bd">'+bd+'</div>'+(ft?'<div class="ft">'+ft+'</div>':'')+'</div>';
const chips=o=>'<div class="chips">'+KEYS.map(p=>'<span class="chip">'+ic(p,16)+PR[p].n+' '+o[p]+'</span>').join('')+'</div>';
const upf=(k,label)=>{const u=UP[k],n=cnt(k),c=u.cost(n);return '<span>'+label+': <b class="num">'+n+'/'+u.max+'</b></span>'+(n>=u.max?'<span>Máximo</span>':btn('up',k,'+1 por '+R$(c),G.money<c,'sm'))};
const WHY={run:'Em produção',noin:'Aguardando peças',nomat:'Falta material',down:'Afastado (acidente)'};
function lineSec(k,n,t,inLbl,outLbl){
 const tiles=G[k].map((s,i)=>'<div class="mc '+(s.p?'run':s.why==='nomat'?'nomat':'')+'"><div class="st"><i class="led"></i>'+(s.p?PR[s.p].n+' · '+sh(s.n)+' pç por ciclo':WHY[s.why||'noin'])+'</div><div class="bar"><i style="width:'+(s.p?100*s.u:0)+'%"></i></div></div>').join('');
 const d=SEC[k];
 return sec(n,t,'',tiles+'<div class="mut">'+inLbl+'</div>'+chips(G[d.inn])+'<div class="mut">'+outLbl+'</div>'+chips(G[d.out]),upf(k,'Estações'))}
function render(){
 if(!G)return;
 $('k-money').textContent=R$(G.money);$('k-money').className='num'+(G.money<0?' low':'');
 $('k-day').textContent='Dia '+G.day;const mm=Math.floor(360+(G.t%DAY)*8.333);$('k-clock').textContent=String(Math.floor(mm/60)).padStart(2,'0')+':'+String(mm%60).padStart(2,'0');
 $('k-rep').textContent=Math.round(G.rep);const gp=Math.max(0,Math.min(100,G.money/GOAL*100));$('k-goal').textContent=Math.round(gp)+'%';$('k-bar').style.width=gp+'%';
 $('snd').setAttribute('aria-pressed',String(SND));
 [0,1,3,8].forEach(s=>$('sp'+s).setAttribute('aria-pressed',String(G.speed===s)));
 let h='';
 h+=sec('01','Recebimento','DOCAS '+G.docks,Object.entries(MAT).map(([k,m])=>'<div class="row"><span>'+m.n+' <b class="num'+(G.raw[k]<600?' low':'')+'">'+G.raw[k]+'</b></span>'+btn('buy',k,'+'+m.lot+' · '+R$(m.lot*mp(k)),G.money<m.lot*mp(k),'sm')+'</div>').join('')+
  '<div class="mut">A caminho: '+G.dl.length+' · Fila na doca: '+G.queue.length+' · Descarregando: '+G.unl.length+'</div>',upf('dock','Docas'));
 h+=sec('02','Injeção plástica','CARCAÇAS',G.inj.map((m,i)=>{const p=m.cur&&PR[m.cur];
  const lab=m.broken?(m.rep>0?'Em reparo':'Quebrada'):m.setup>0?'Troca de molde':m.st==='nomat'?injWhy(m):m.st==='idle'?'Sem pedido':p.n+' · '+sh(m.prog)+' pç por ciclo';
  return '<div class="mc '+(m.broken?'broken':m.st==='run'?'run':m.st==='setup'||m.st==='nomat'?'setup':'')+'"><div class="row"><b class="mcn">'+ic('inj',24)+'Injetora '+(i+1)+'</b>'+btn('cycle',i,'Molde: '+(m.p==='auto'?'automático':PR[m.p].n),0,'sm')+'</div><div class="st"><i class="led"></i>'+lab+(m.broken&&!m.rep?' '+btn('repair',i,'Chamar manutenção · R$ 4.500',G.money<150,'sm'):'')+'</div><div class="bar"><i style="width:'+(m.st==='run'?100:0)+'%"></i></div></div>'}).join('')+'<div class="mut">Carcaças prontas</div>'+chips(G.hous),upf('inj','Injetoras'));
 h+=lineSec('col','03','Colagem','Carcaças','Espelhos colados');
 h+=lineSec('mon','04','Montagem','Espelhos colados','Retrovisores montados');
 h+=lineSec('qa','05','Qualidade','Montados','Aprovados');
 h+=lineSec('emb','06','Embalagem','Aprovados','Embalados');
 h+=sec('07','Expedição','PRODUTO ACABADO','<div class="mut">Embalados e prontos para despacho</div>'+chips(G.pack)+'<div class="mut">Use "Despachar" na carteira de pedidos.</div>','<span>Peças enviadas: <b class="num">'+G.sent+'</b></span>');
 h+=sec('08','Logística','FROTA',G.trucks.map((tk,i)=>'<div class="mc '+(tk.busy?'run':'')+'"><div class="st"><i class="led"></i>Caminhão '+(i+1)+': '+(tk.busy?'em rota, '+tm(tk.busy)+' · '+tk.ord.client:'livre na doca')+'</div></div>').join(''),upf('truck','Frota'));
 h+=extraSecs();$('floor').innerHTML=h;drawPanes();
 $('offers').innerHTML=G.offers.length?G.offers.map(o=>'<div class="ord"><h3>'+ic(o.p,26)+o.qty+' × '+PR[o.p].n+'</h3><div class="mut">'+o.client+' · prazo '+(o.win/DAY).toFixed(1)+' d · expira em '+tm(o.exp-G.t)+'</div><div class="row"><b class="num">'+R$(o.pay)+'</b><span>'+btn('accept',o.id,'Aceitar',0,'sm pri')+' '+btn('decline',o.id,'Recusar',0,'sm')+'</span></div></div>').join(''):'<span class="mut">Nenhuma proposta no momento.</span>';
 const free=G.trucks.some(t=>t.busy===0);
 $('orders').innerHTML=G.orders.length?G.orders.map(o=>{const left=o.due-G.t,have=Math.min(G.pack[o.p],o.qty);
  return '<div class="ord"><h3>'+ic(o.p,26)+o.qty+' × '+PR[o.p].n+' · '+o.client+'</h3><div class="mut">'+(o.state==='transit'?'Em transporte':'Prazo: '+(left/DAY).toFixed(1)+' d')+' · prontos '+have+'/'+o.qty+'</div><div class="row"><b class="num">'+R$(o.pay)+'</b>'+(o.state==='open'?btn('ship',o.id,'Despachar',!(free&&G.pack[o.p]>=o.qty),'sm pri'):'<span class="mut">a caminho</span>')+'</div></div>'}).join(''):'<span class="mut">Aceite uma proposta para começar a produzir.</span>';
 $('log').innerHTML=G.log.map(l=>'<p>'+l+'</p>').join('')}
const RES=[{id:'molde',n:'Troca rápida de molde',d:'A troca de molde cai de 3 para 1 minuto.',c:6000},{id:'cura',n:'Cura rápida da cola',d:'A colagem fica 1 minuto mais rápida por peça.',c:7000},{id:'spc',n:'Controle estatístico (CEP)',d:'Reduz o refugo na inspeção em 3 pontos percentuais.',c:8000},{id:'prev',n:'Manutenção preditiva',d:'As quebras de injetora ficam 4 vezes mais raras.',c:9000},{id:'contrato',n:'Contrato anual de insumos',d:'Todos os materiais ficam 15% mais baratos.',c:12000},{id:'auto',n:'Embalagem automática',d:'A embalagem passa a levar 1 minuto por peça.',c:10000},{id:'kanban',n:'Kanban com fornecedores',d:'Os materiais chegam 5 minutos mais cedo.',c:5000}];
const M=[{t:'Aceite sua primeira proposta',b:300,ok:()=>G.orders.length+G.delivered>0},{t:'Receba uma compra de material',b:200,ok:()=>G.recv>0},{t:'Produza 600 carcaças',b:300,ok:()=>G.prod>=600},{t:'Entregue seu primeiro pedido',b:500,ok:()=>G.delivered>0},{t:'Conclua uma pesquisa de P&D',b:500,ok:()=>Object.keys(G.res).length>0},{t:'Envie 3.000 retrovisores',b:1000,ok:()=>G.sent>=3000},{t:'Entregue para 5 montadoras',b:1500,ok:()=>Object.keys(G.brand).length>=5},{t:'Chegue a R$ 750.000 em caixa',b:2000,ok:()=>G.money>=25000}];
const mp=k=>MAT[k].p*(G.res.contrato?.85:1)*(G.ger.sc?.92:1);
const brk=()=>[.003,.004,.007][G.diff]*(G.res.prev?.25:1);
const scrapRate=()=>Math.max(.01,.08-(G.res.spc?.03:0)-.01*(G.qa.length-1)-(G.ger.qual?.02:0)-.01*G.mult+(G.moral<40?.03:0)+(G.fx.scrapUp>G.t?.08:0)+Math.max(0,(Math.max(G.mold.car,G.mold.bus,G.mold.truck)-70)/300));
function stT(k,p){return k==='qa'?1:k==='emb'?(G.res.auto?1:PR[p].emb):k==='col'?Math.max(1,PR[p].col-(G.res.cura?1:0))+(G.fx.colSlow>G.t?1:0):PR[p][k]}
const spend=c=>{G.money-=c;G.dayExp+=c};const earn=a=>{G.money+=a;G.dayRev+=a};
function checkM(){M.forEach((m,i)=>{if(!G.mdone[i]&&m.ok()){G.mdone[i]=1;earn(m.b);say('Missão cumprida: '+m.t+' (+'+R$(m.b)+').')}})}

/* ===== Planta animada em canvas ===== */
const CV=$('cv'),cx=CV.getContext('2d'),DPR=Math.min(2,window.devicePixelRatio||1);
CV.width=1200*DPR;CV.height=840*DPR;
const C={},PC={car:'#4aa3df',bus:'#f0b323',truck:'#e0673a',M:'#b08968',R:'#9aa5ae',F:'#c9c2b3'},MC={resina:'#f0b323',vidro:'#4aa3df',kit:'#4cc38a',cola:'#9aa5ae',caixa:'#b08968',espuma:'#d8c3a5'};
const ZN=['Recebimento','Injeção plástica','Colagem','Montagem','Qualidade','Embalagem','Expedição','Logística','Mantas','Moinho','Ferramentaria','Apoio e segurança'];
const ZP=[[10,10],[310,10],[610,10],[910,10],[910,290],[610,290],[310,290],[10,290],[10,570],[310,570],[610,570],[910,570]];
let hits=[],hov=-1,shipAt=-9,frame=0;
function theme(){const cs=getComputedStyle(document.documentElement);['bg','panel','panel2','line','fg','mute','accent','ok','bad','info'].forEach(k=>C[k]=cs.getPropertyValue('--'+k).trim())}
const rect=(x,y,w,h,f,s)=>{cx.fillStyle=f;cx.fillRect(x,y,w,h);if(s){cx.strokeStyle=s;cx.lineWidth=1.5;cx.strokeRect(x+.5,y+.5,w-1,h-1)}};
const txt=(s,x,y,sz,col,al)=>{cx.font='600 '+sz+'px "IBM Plex Mono",monospace';cx.fillStyle=col;cx.textAlign=al||'left';cx.fillText(s,x,y)};
const dot=(x,y,r,f)=>{cx.fillStyle=f;cx.beginPath();cx.arc(x,y,r,0,7);cx.fill()};
const stCol=s=>s==='run'?C.ok:s==='broken'?C.bad:s==='idle'?C.mute:C.accent;
function pile(x,y,o,lab){KEYS.forEach((p,i)=>{const n=o[p],bx=x+i*26;for(let k=0;k<Math.min(Math.ceil(n/100),6);k++)rect(bx,y-k*5,20,4,PC[p]);txt(sh(n),bx+10,y+14,10,C.fg,'center')});if(lab)txt(lab,x,y-40,10,C.mute)}
function belt(x,y,w,on,t){rect(x,y,w,8,C.panel2,C.line);if(on){cx.save();cx.strokeStyle=C.accent;cx.lineWidth=2;cx.setLineDash([6,8]);cx.lineDashOffset=-t*30;cx.beginPath();cx.moveTo(x+2,y+4);cx.lineTo(x+w-2,y+4);cx.stroke();cx.restore()}}
function truckS(x,y,col,t,shake){const sh=shake?Math.sin(t*30)*.6:0;rect(x,y+sh,34,16,col,C.line);rect(x+34,y+4+sh,13,12,C.fg);rect(x+38,y+6+sh,6,5,C.info);dot(x+9,y+17,4,'#222');dot(x+38,y+17,4,'#222')}
function worker(x,y,t,on,col){const b=on?Math.sin(t*7+x)*2:0;dot(x,y-9+b,5,'#e9c9a0');rect(x-5,y-4+b,10,12,col||C.info);if(on)rect(x+4,y-2+b,7,3,col||C.info)}
function station(k,s,x,y,t){const on=!!s.p;if(s.down>0){rect(x,y,74,46,C.panel2,C.bad);worker(x+22,y+30,t,false,C.bad);txt('+',x+56,y+30,26,C.bad,'center');return}rect(x,y,74,46,C.panel2,C.line);rect(x+4,y+30,66,10,C.line);
 if(on){worker(x+22,y+22,t,true,PC[s.p]);rect(x+40,y+26,18,10,PC[s.p]);cx.strokeStyle=C.ok;cx.lineWidth=2;cx.strokeRect(x+1,y+1,72,44)}
 else{worker(x+22,y+22,t,false,C.mute)}
 dot(x+66,y+8,4,on?C.ok:s.why==='nomat'?C.accent:C.mute);if(on)txt(PR[s.p]?PR[s.p].s:s.p,x+66,y+27,12,C.fg,'center')}
function drawZone0(i,t){const[ox,oy]=ZP[i];rect(ox,oy,280,260,C.panel,C.line);rect(ox,oy,280,30,C.panel2);txt((i+1)+' · '+ZN[i].toUpperCase(),ox+12,oy+20,13,C.fg);
 if(i===0){const road=oy+96;rect(ox+8,road,264,22,C.panel2);cx.save();cx.strokeStyle=C.mute;cx.setLineDash([10,10]);cx.beginPath();cx.moveTo(ox+8,road+11);cx.lineTo(ox+272,road+11);cx.stroke();cx.restore();
  for(let d=0;d<G.docks;d++){const bx=ox+14+d*90,on=d<G.unl.length;rect(bx,oy+40,80,44,C.panel2,on?C.ok:C.line);txt('DOCA '+(d+1),bx+40,oy+58,11,C.mute,'center');if(on){truckS(bx+14,oy+64,C.accent,t,true);txt('conferindo',bx+40,oy+80,10,C.ok,'center')}}
  if(G.dl.length){const me=Math.min(...G.dl.map(d=>d.eta)),px=ox+280-Math.max(0,5-me)*45;if(me<=5)truckS(px,road+3,C.info,t,false)}
  let j=0;for(const k in MAT){const bx=ox+12+j*44,n=Math.min(8,Math.ceil(G.raw[k]/450));for(let q=0;q<n;q++)rect(bx,oy+200-q*13,34,11,MC[k],C.line);rect(bx-2,oy+206,38,5,C.line);txt(k.slice(0,3).toUpperCase()+' '+sh(G.raw[k]),bx+17,oy+225,9,G.raw[k]<600?C.bad:C.fg,'center');j++}}
 if(i===1){G.inj.forEach((m,q)=>{const x=ox+14+(q%3)*88,y=oy+42+Math.floor(q/3)*82,on=m.st==='run';
   rect(x,y+30,80,28,C.panel2,C.line);const px=on?Math.abs(Math.sin(t*3.2+q))*14:2;rect(x+44-px,y+20,14,38,C.mute,C.line);rect(x+58,y+24,18,30,C.line);
   cx.fillStyle=C.line;cx.beginPath();cx.moveTo(x+6,y+30);cx.lineTo(x+14,y+8);cx.lineTo(x+30,y+8);cx.lineTo(x+38,y+30);cx.fill();
   rect(x+10,y+30,24,4,m.cur?PC[m.cur]:C.mute);dot(x+72,y+14,5,stCol(m.broken?'broken':m.st==='nomat'||m.st==='setup'?'w':m.st));
   txt(m.cur?PR[m.cur].s:'–',x+22,y+52,12,C.fg,'center');txt('I'+(q+1),x+40,y+70,10,C.mute,'center');
   if(m.broken)txt('QUEBRADA',x+40,y+4,10,C.bad,'center');
   if(m.prog&&m.cur)rect(x,y+72,80*m.prog/PR[m.cur].inj,3,C.ok);hits.push({x:ox+14+(q%3)*88,y,w:80,h:60,i:q})});
  pile(ox+20,oy+232,G.hous,'');txt('carcaças prontas',ox+140,oy+248,10,C.mute)}
 if(i>=2&&i<=5){const k=['col','mon','qa','emb'][i-2],d=SEC[k],on=G[k].some(s=>s.p);
  G[k].forEach((s,q)=>station(k,s,ox+14+(q%3)*84,oy+44+Math.floor(q/3)*58,t));
  belt(ox+12,oy+176,256,on,t);txt('entrada',ox+14,oy+198,10,C.mute);pile(ox+14,oy+226,G[d.inn]);txt('saída',ox+150,oy+198,10,C.mute);pile(ox+150,oy+226,G[d.out])}
 if(i===6){KEYS.forEach((p,q)=>{const bx=ox+24+q*84,n=Math.min(14,Math.ceil(G.pack[p]/60));rect(bx-4,oy+218,76,5,C.line);for(let r=0;r<n;r++)rect(bx+(r%2)*34,oy+210-Math.floor(r/2)*14,32,12,PC[p],C.panel);txt(PR[p].n+' '+sh(G.pack[p]),bx+34,oy+240,11,C.fg,'center')});
  const a=t-shipAt;if(a<2.2){const fx=ox+30+Math.min(1,a/2)*190;rect(fx,oy+60,20,12,C.accent);rect(fx-8,oy+66,10,8,C.fg);dot(fx+2,oy+78,3,'#222');dot(fx+16,oy+78,3,'#222');rect(fx+20,oy+54,6,22,C.mute)}}
 if(i===7){const road=oy+200;rect(ox+8,road,264,24,C.panel2);cx.save();cx.strokeStyle=C.mute;cx.setLineDash([10,10]);cx.beginPath();cx.moveTo(ox+8,road+12);cx.lineTo(ox+272,road+12);cx.stroke();cx.restore();
  G.trucks.forEach((tk,q)=>{const bx=ox+14+(q%3)*88,by=oy+44+Math.floor(q/3)*60;rect(bx,by,80,44,C.panel2,C.line);txt('VAGA '+(q+1),bx+40,by+12,10,C.mute,'center');
   if(!tk.busy)truckS(bx+14,by+22,C.info,t,false);else{const f=1-tk.busy/(tk.trip||12),px=ox+14+f*210;truckS(px,road+3,C.accent,t,true);txt(tm(tk.busy),px+24,road-4,10,C.fg,'center');txt('em rota',bx+40,by+30,10,C.accent,'center')}})}}
function arrows(t){cx.save();cx.strokeStyle=C.accent;cx.lineWidth=3;cx.setLineDash([7,7]);cx.lineDashOffset=-t*30;
 const L=(a,b,c,d)=>{cx.beginPath();cx.moveTo(a,b);cx.lineTo(c,d);cx.stroke()};
 L(290,130,310,130);L(590,130,610,130);L(890,130,910,130);L(1050,270,1050,290);L(910,420,890,420);L(610,420,590,420);L(310,420,290,420);cx.restore()}
function loop(ms){requestAnimationFrame(loop);if(G.tab!=='fab'||document.hidden)return;if(frame++%90===0)theme();
 const t=ms/1000;cx.setTransform(DPR,0,0,DPR,0,0);rect(0,0,1200,840,C.bg);hits=[];for(let i=0;i<12;i++)drawZone(i,t);arrows(t);
 if(hov>=0){const m=G.inj[hov],h=hits.find(x=>x.i===hov);if(h){const s='Injetora '+(hov+1)+' · molde '+(m.p==='auto'?'automático':PR[m.p].n)+(m.broken?' · clique para reparar':' · clique para trocar'),w=cx.measureText(s).width+20;rect(Math.min(h.x,1200-w-4),h.y+64,w+10,22,C.fg);txt(s,Math.min(h.x,1200-w-4)+8,h.y+79,11,C.bg)}}}
function cvPos(e){const r=CV.getBoundingClientRect();return[(e.clientX-r.left)*1200/r.width,(e.clientY-r.top)*840/r.height]}
CV.addEventListener('pointermove',e=>{const[x,y]=cvPos(e),h=hits.find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);hov=h?h.i:-1;CV.style.cursor=h?'pointer':'default'});
CV.addEventListener('pointerleave',()=>{hov=-1});
CV.addEventListener('pointerdown',e=>{const[x,y]=cvPos(e),h=hits.find(h=>x>=h.x&&x<=h.x+h.w&&y>=h.y&&y<=h.y+h.h);if(h){const m=G.inj[h.i];A(m.broken&&!m.rep?'repair':'cycle',h.i)}});

/* ===== Abas, finanças, P&D, clientes, missões ===== */
const TABS=[['fab','Fábrica'],['prod','Produção'],['doc','Documentos'],['pes','Pessoas'],['nfb','Projeto NFB'],['fin','Finanças'],['res','P&D'],['cli','Clientes']];
function finChart(H,fn){const W=640,Ht=190,L=46,B=24,mx=fn.max,mn=fn.min||0,y=v=>Ht-B-((v-mn)/(mx-mn))*(Ht-B-10);let s='<svg viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="'+fn.label+'">';
 for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4;s+='<line x1="'+L+'" x2="'+W+'" y1="'+y(v)+'" y2="'+y(v)+'" class="gr"/><text x="'+(L-6)+'" y="'+(y(v)+4)+'" text-anchor="end" class="ax">'+fm(v)+'</text>'}
 return s+fn.body(y,(W-L)/Math.max(H.length,1),L,Ht,B)+'</svg>'}
function finPane(){
 const H=G.hist.slice(-16),emp='<span class="mut">Os gráficos aparecem depois do primeiro dia fechado.</span>';
 const mx=Math.max(1000,...H.map(h=>Math.max(h.r,h.e)));
 const bars=H.length?finChart(H,{label:'Receita e despesa por dia',max:mx,body:(y,bw,L,Ht,B)=>H.map((h,i)=>{const x=L+i*bw;return '<rect x="'+(x+bw*.12)+'" y="'+y(h.r)+'" width="'+bw*.36+'" height="'+(Ht-B-y(h.r))+'" class="br"/><rect x="'+(x+bw*.52)+'" y="'+y(h.e)+'" width="'+bw*.36+'" height="'+(Ht-B-y(h.e))+'" class="be"/><text x="'+(x+bw/2)+'" y="'+(Ht-8)+'" text-anchor="middle" class="ax">'+h.d+'</text>'}).join('')}):emp;
 const mn=Math.min(0,...H.map(h=>h.m)),mxm=Math.max(GOAL*1.05,...H.map(h=>h.m));
 const line=H.length?finChart(H,{label:'Caixa por dia',max:mxm,min:mn,body:(y,bw,L)=>'<line x1="'+L+'" x2="640" y1="'+y(GOAL)+'" y2="'+y(GOAL)+'" class="gl2"/><text x="640" y="'+(y(GOAL)-4)+'" text-anchor="end" class="ax">meta</text><polyline class="ln2" points="'+H.map((h,i)=>(L+i*bw+bw/2)+','+y(h.m)).join(' ')+'"/>'}):emp;
 const k=(v,l,c)=>'<div class="kpi"><b class="num '+(c||'')+'">'+v+'</b><span>'+l+'</span></div>';
 return '<div class="box"><h2>Indicadores</h2><div class="kp">'+k(R$(G.dayRev),'Receita hoje')+k(R$(G.dayExp),'Despesa hoje')+k((scrapRate()*100).toFixed(1)+'%','Taxa de refugo')+k(G.scrap,'Peças refugadas')+k(G.sent,'Peças enviadas')+k(G.delivered,'Pedidos entregues')+k(Math.round(G.rep),'Reputação')+'</div></div>'+
 '<div class="box"><h2>Receita e despesa por dia</h2><div class="svgc">'+bars+'<div class="mut"><span class="good">■</span> receita &nbsp; <span class="low">■</span> despesa (R$)</div></div></div>'+
 '<div class="box"><h2>Caixa por dia</h2><div class="svgc">'+line+'</div></div>'}
function resPane(){return '<div class="grid2">'+RES.map(r=>{const d=G.res[r.id];return '<div class="ord"><h3>'+r.n+'</h3><div class="mut">'+r.d+'</div><div class="row"><b class="num">'+R$(r.c)+'</b>'+(d?'<span class="good">Concluído</span>':btn('res',r.id,'Investir',G.money<r.c,'sm pri'))+'</div></div>'}).join('')+'</div>'}
function cliPane(){const all=ALLCLI().concat(['VWCO · Projeto NFB']);
 return '<div class="box"><h2>Relacionamento com as montadoras</h2><div class="tw"><table><thead><tr><th>Cliente</th><th>Peças entregues</th><th>Faturamento</th><th>Atrasos</th><th>Bônus de preço</th></tr></thead><tbody>'+all.map(n=>{const b=G.brand[n]||{u:0,rev:0,late:0};return '<tr><td>'+n+'</td><td class="num">'+b.u+'</td><td class="num">'+R$(b.rev)+'</td><td class="num">'+b.late+'</td><td class="num">+'+(Math.min(.15,b.u/18000)*100).toFixed(1)+'%</td></tr>'}).join('')+'</tbody></table></div></div>'}
function drawPanes(){
 if(!$('tabs').children.length)$('tabs').innerHTML=TABS.map(([k,n])=>'<button role="tab" data-act="tab" data-a="'+k+'">'+n+'</button>').join('');
 [...$('tabs').children].forEach(b=>b.setAttribute('aria-selected',String(b.dataset.a===G.tab)));
 TABS.forEach(([k])=>$('pane-'+k).hidden=G.tab!==k);if(G.tab==='prod')$('pane-prod').innerHTML=prodPane();if(G.tab==='doc')$('pane-doc').innerHTML=docsPane();
 if(G.tab==='fin')$('pane-fin').innerHTML=finPane();else if(G.tab==='res')$('pane-res').innerHTML=resPane();else if(G.tab==='cli')$('pane-cli').innerHTML=cliPane();
 drawX();
 $('miss').innerHTML=M.map((m,i)=>'<div class="row"><span class="'+(G.mdone[i]?'good':'')+'">'+(G.mdone[i]?'✔ ':'○ ')+m.t+'</span><span class="mut num">'+R$(m.b)+'</span></div>').join('')}
/* ===== Mantas, moinho, ferramentaria, pessoas, ocorrências, visitas e Projeto NFB ===== */

const DOCS=[
{id:'rvp',code:'DOC-OP-001',name:'RVP · Roteiro de Verificação do Processo',sector:'Todos os setores',rev:'03',purpose:'Padronizar as verificações básicas antes, durante e depois da produção.',sections:[
['1. Antes de iniciar',['Confirmar código e revisão do produto na ordem de produção.','Verificar identificação da matéria-prima e situação de liberação.','Conferir limpeza, organização e condição segura do posto.','Confirmar que os documentos disponíveis correspondem ao produto em fabricação.']],
['2. Durante o processo',['Observar parâmetros definidos na instrução de trabalho fictícia.','Separar imediatamente qualquer peça suspeita ou fora do padrão.','Registrar paradas, ajustes e desvios no apontamento do turno.']],
['3. Ao finalizar',['Identificar e proteger o produto conforme o padrão de embalagem.','Registrar quantidade produzida, aprovada e segregada.','Comunicar anormalidades ao líder e à Qualidade.']]],
note:'Material didático fictício. Em uma fábrica real, seguir sempre a documentação vigente e aprovada da unidade.'},
{id:'controle',code:'DOC-QA-014',name:'Plano de Controle',sector:'Processo completo',rev:'02',purpose:'Definir o que verificar, como verificar e qual reação tomar diante de um desvio.',sections:[
['Recebimento de componentes',[ 'Item: resina, espelho, adesivo, kit e embalagem.','Controle: identificação, lote, integridade e condição visual.','Frequência ilustrativa: cada lote recebido.','Reação: identificar, segregar e solicitar avaliação da Qualidade.']],
['Injeção e acabamento',['Item: carcaça injetada.','Controle: aspecto visual, rebarba, trinca e deformação.','Frequência ilustrativa: primeira peça e amostras periódicas.','Reação: parar/segregar desde a última verificação conforme orientação do líder.']],
['Colagem e montagem',['Item: conjunto colado e mecanismo montado.','Controle: posicionamento, limpeza, fixação e funcionamento.','Frequência ilustrativa: início de lote e amostragem durante o turno.','Reação: bloquear peças suspeitas e chamar o responsável do processo.']],
['Inspeção final e embalagem',['Item: retrovisor acabado.','Controle: aparência, integridade, identificação e proteção.','Frequência ilustrativa: inspeção definida na ordem de produção.','Reação: não liberar produto não conforme.']]],
note:'Valores, amostragens e critérios são exemplos de jogo, não especificações técnicas reais.'},
{id:'operacao',code:'DOC-PR-008',name:'Plano de Operação',sector:'Linha de retrovisores',rev:'04',purpose:'Apresentar a sequência lógica de fabricação e os pontos de passagem entre operações.',sections:[
['Sequência operacional',['10 · Recebimento e identificação dos materiais.','20 · Injeção da carcaça conforme ordem e molde liberado.','30 · Preparação e colagem do espelho.','40 · Montagem do mecanismo e componentes.','50 · Inspeção de qualidade do conjunto.','60 · Embalagem e identificação do produto acabado.','70 · Expedição conforme pedido liberado.']],
['Regras de passagem',['Só encaminhar peças identificadas e liberadas.','Não misturar códigos, modelos ou lotes diferentes.','Manter quantidade e rastreabilidade entre operações.','Em caso de dúvida, interromper a movimentação e consultar a liderança.']]],
note:'Sequência simplificada e fictícia para fins de simulação.'},
{id:'it',code:'DOC-IT-021',name:'Instrução de Trabalho · Montagem',sector:'Montagem',rev:'01',purpose:'Orientar o operador na execução segura e padronizada da montagem.',sections:[
['Preparação do posto',['Higienizar a bancada e retirar materiais de ordens anteriores.','Conferir componentes, código e quantidade da ordem.','Verificar ferramentas e dispositivos antes do uso.']],
['Execução',['Posicionar a carcaça no dispositivo adequado.','Instalar os componentes previstos para a versão do produto.','Executar a fixação conforme orientação aprovada do processo.','Realizar a verificação funcional definida para a operação.']],
['Cuidados e reação',['Não improvisar ferramentas ou alterar dispositivos.','Não utilizar componente danificado ou sem identificação.','Segregar a peça em caso de montagem incompleta ou funcionamento irregular.']]],
note:'Instrução genérica fictícia. Não contém torque, força ou parâmetros reais de montagem.'},
{id:'inspecao',code:'DOC-QA-022',name:'Ficha de Inspeção Final',sector:'Qualidade',rev:'02',purpose:'Registrar o resultado da avaliação do produto antes da liberação.',sections:[
['Identificação do registro',['Data e turno: preencher no apontamento.','Produto / código: conforme ordem de produção.','Lote: conforme etiqueta de rastreabilidade.','Operador e inspetor: identificação funcional.']],
['Itens de verificação',['Aparência: sem riscos, trincas ou danos aparentes.','Espelho: íntegro e corretamente posicionado.','Mecanismo: funcionamento conforme padrão aplicável.','Acabamento: sem rebarbas ou contaminação visível.','Embalagem: proteção e identificação corretas.']],
['Resultado',['Aprovado: liberar conforme fluxo do processo.','Reprovado: identificar, segregar e registrar o defeito.','Dúvida: manter bloqueado até avaliação da Qualidade.']]],
note:'Registro ilustrativo. Os critérios de aceitação reais devem vir da engenharia e da qualidade.'},
{id:'setup',code:'DOC-SEG-005',name:'Checklist de Segurança e Setup',sector:'Injeção e postos produtivos',rev:'01',purpose:'Lembrar as verificações essenciais de segurança e preparação antes de operar.',sections:[
['Segurança',['Usar os EPIs definidos para a atividade.','Manter proteções e dispositivos de segurança instalados.','Não acessar zonas de risco com equipamento em movimento.','Comunicar ruídos, vazamentos ou falhas imediatamente.']],
['Setup e liberação',['Conferir ordem, produto e molde/dispositivo previsto.','Verificar limpeza e condição geral do equipamento.','Confirmar parâmetros com a pessoa autorizada.','Realizar primeira peça e solicitar validação quando aplicável.']],
['Se houver anormalidade',['Parar a operação de forma segura.','Identificar e proteger o material em processo.','Acionar liderança ou manutenção.','Retomar somente após liberação.']]],
note:'Checklist fictício. Nunca substitui treinamento, análise de risco ou procedimento oficial de segurança.'}
];
function docsPane(){
 const selected=DOCS.find(d=>d.id===G.doc),read=G.docRead||{},count=DOCS.filter(d=>read[d.id]).length;
 if(selected)return '<div class="box"><h2>Central de documentos · '+selected.code+'</h2><div><div class="row"><span class="chip">'+selected.sector+'</span><span class="mut">Revisão '+selected.rev+' · Modelo fictício</span></div><h2 style="font:700 24px var(--f-d);border:0;padding:8px 0">'+selected.name+'</h2><p class="mut">'+selected.purpose+'</p>'+selected.sections.map(sec=>'<div class="ord"><h3>'+sec[0]+'</h3><ul style="margin:0;padding-left:20px">'+sec[1].map(x=>'<li style="margin:5px 0">'+x+'</li>').join('')+'</ul></div>').join('')+'<div class="mut">'+selected.note+'</div><div class="chips">'+btn('docback',0,'← Voltar aos documentos',0,'sm')+' '+btn('docread',selected.id,read[selected.id]?'✓ Documento consultado':'Marcar como consultado',0,'sm pri')+'</div></div></div>';
 return '<div class="box"><h2>Central de documentos da produção</h2><div><p class="mut">Biblioteca de documentos simulados para treinamento dos operadores. Consulte os padrões antes de iniciar cada etapa. Os documentos são fictícios e não representam procedimentos oficiais de nenhuma empresa.</p><div class="kp"><div class="kpi"><b class="num">'+count+'/'+DOCS.length+'</b><span>Documentos consultados</span></div><div class="kpi"><b class="num">'+DOCS.length+'</b><span>Modelos disponíveis</span></div></div><div class="bar"><i style="width:'+(100*count/DOCS.length)+'%"></i></div></div></div><div class="grid2">'+DOCS.map(d=>'<div class="ord"><div class="row"><span class="chip">'+d.code+'</span><span class="mut">Rev. '+d.rev+'</span></div><h3>'+d.name+'</h3><div class="mut">'+d.sector+' · '+d.purpose+'</div><div class="row"><span class="'+(read[d.id]?'good':'mut')+'">'+(read[d.id]?'✓ Consultado':'Não consultado')+'</span>'+btn('docopen',d.id,'Abrir documento',0,'sm pri')+'</div></div>').join('')+'</div><div class="box"><h2>Orientação ao operador</h2><div class="mut">Em caso de divergência entre documentos, ordem de produção ou condição encontrada no posto, não improvisar. Segregar o produto quando necessário e procurar a liderança ou a Qualidade.</div></div>';
}

function prodPane(){
 const names={inj:'Injeção',col:'Colagem',mon:'Montagem',qa:'Qualidade',emb:'Embalagem'},stations={inj:G.inj.length,col:G.col.length,mon:G.mon.length,qa:G.qa.length,emb:G.emb.length},items=Object.keys(names);
 const line=items.map((k,i)=>{const factor=opFactor(k),cap=Math.round(RATE.car*stations[k]*DAY*factor),stock=k==='inj'?G.hous.car:k==='col'?G.glued.car:k==='mon'?G.asm.car:k==='qa'?G.qok.car:G.pack.car;return '<div class="ord"><div class="row"><h3>'+(i+1)+'. '+names[k]+'</h3><span class="chip">'+Math.round(factor*100)+'% capacidade</span></div><div class="mut">'+stations[k]+' estações · '+G.ops[k]+' operadores · capacidade estimada '+cap.toLocaleString('pt-BR')+' peças/dia</div><div class="row"><span class="mut">Operadores</span><b class="num">'+G.ops[k]+'</b></div><div class="chips">'+btn('op',k+':-1','−',G.ops[k]<=0,'sm')+btn('op',k+':1','+ operador',G.staff<=0,'sm')+'</div><div class="mut">Peças acumuladas na saída: <b class="num">'+sh(stock)+'</b></div></div>'}).join('');
 const shf=G.shift,rate=shf.goal?Math.min(150,shf.good/shf.goal*100):0,total=items.reduce((a,k)=>a+G.ops[k],0);
 return '<div class="box"><h2>Controle do turno '+shf.id+'/3</h2><div class="kp"><div class="kpi"><b class="num">'+shf.good.toLocaleString('pt-BR')+'</b><span>Peças aprovadas</span></div><div class="kpi"><b class="num">'+shf.goal.toLocaleString('pt-BR')+'</b><span>Meta do turno</span></div><div class="kpi"><b class="num">'+Math.round(rate)+'%</b><span>Atingimento</span></div><div class="kpi"><b class="num">'+shf.produced.toLocaleString('pt-BR')+'</b><span>Inspecionadas</span></div></div><div class="bar"><i style="width:'+Math.min(100,rate)+'%"></i></div><div class="row"><span class="mut">Ajustar meta por turno</span><span>'+btn('goal',-500,'− 500',shf.goal<=500,'sm')+' '+btn('goal',500,'+ 500',shf.goal>=5000,'sm')+'</span></div></div><div class="box"><h2>Linha integrada · fluxo de produção</h2><div class="grid2">'+line+'</div><div class="mut">Fluxo: Injeção → Colagem → Montagem → Qualidade → Embalagem. Cada etapa consome a saída da anterior; falta de peças ou capacidade insuficiente cria gargalos.</div></div><div class="box"><h2>Equipe operacional</h2><div class="row"><span>Operadores alocados</span><b class="num">'+total+'</b></div><div class="row"><span>Operadores disponíveis</span><b class="num">'+G.staff+'</b></div><div class="row"><span>Contratar operador</span>'+btn('hireOp',0,'Contratar · '+R$(150),G.money<150,'sm pri')+'</div><div class="mut">Cada operador custa R$ 90 por dia. Alocar operadores melhora a capacidade da etapa; retirar um operador devolve-o ao quadro disponível.</div></div><div class="box"><h2>Histórico dos turnos</h2><div class="tw"><table><thead><tr><th>Turno</th><th>Aprovadas</th><th>Meta</th><th>Atingimento</th></tr></thead><tbody>'+(shf.history.length?shf.history.slice().reverse().map(x=>'<tr><td>'+x.id+'</td><td class="num">'+x.good+'</td><td class="num">'+x.goal+'</td><td class="num">'+Math.round(x.rate)+'%</td></tr>').join(''):'<tr><td colspan="4" class="mut">O primeiro turno ainda está em andamento.</td></tr>')+'</tbody></table></div></div>'}
const mxMold=()=>Math.max(...KEYS.map(p=>G.mold[p]));
const worstMold=()=>KEYS.slice().sort((a,b)=>G.mold[b]-G.mold[a])[0];
const EV=[
{k:'esteira',t:'Esteira de transferência travada',d:'Uma esteira entre setores parou. A linha continua, mas com fluxo reduzido até a manutenção agir.',o:[{l:'Manutenção corretiva · R$ 7.500',c:250,f:()=>{G.fx.lineSlow=0}},{l:'Operar em velocidade reduzida',f:()=>{G.fx.lineSlow=G.t+30}}],ig:()=>{G.fx.lineSlow=G.t+40}},
{k:'resina',t:'Resina contaminada',d:'O recebimento achou umidade no último lote de resina.',o:[{l:'Descartar 30 kg de resina',f:()=>{G.raw.resina=Math.max(0,G.raw.resina-30)}},{l:'Usar assim mesmo',f:()=>{G.fx.scrapUp=G.t+40}}],ig:()=>{G.fx.scrapUp=G.t+40}},
{k:'sensor',t:'Sensor de cola desregulado',d:'A dosadora da colagem está errando a quantidade de adesivo.',o:[{l:'Chamar a manutenção · R$ 9.000',c:300,f:()=>{}},{l:'Seguir com ajuste manual',f:()=>{G.fx.colSlow=G.t+30}}],ig:()=>{G.fx.colSlow=G.t+30}},
{k:'energia',t:'Queda de energia na linha',d:'O disjuntor geral desarmou na injeção.',o:[{l:'Acionar o gerador · R$ 12.000',c:400,f:()=>{}},{l:'Aguardar a concessionária',f:()=>{G.fx.blackout=G.t+8}}],ig:()=>{G.fx.blackout=G.t+8}},
{k:'cliente',t:'Reclamação de cliente',d:'Uma montadora reportou retrovisores riscados no último lote.',o:[{l:'Abrir relatório 8D · R$ 15.000',c:500,f:()=>{G.rep=Math.min(100,G.rep+2)}},{l:'Ignorar',f:()=>{G.rep=Math.max(0,G.rep-4)}}],ig:()=>{G.rep=Math.max(0,G.rep-6)}},
{k:'forn',t:'Atraso de fornecedor',d:'O transportador avisou que as cargas de material vão atrasar.',o:[{l:'Pagar frete expresso · R$ 10.500',c:350,f:()=>{}},{l:'Aguardar',f:()=>{G.dl.forEach(d=>d.eta+=8)}}],ig:()=>{G.dl.forEach(d=>d.eta+=10)}},
{k:'molde',t:'Molde com rebarba',d:'A ferramentaria encontrou desgaste anormal em um molde.',o:[{l:'Retificar o molde · R$ 18.000',c:600,f:()=>{G.mold[worstMold()]=0}},{l:'Produzir assim mesmo',f:()=>{G.mold[worstMold()]=Math.min(99,G.mold[worstMold()]+15)}}],ig:()=>{G.mold[worstMold()]=Math.min(99,G.mold[worstMold()]+20)}}];
const evD=k=>EV.find(e=>e.k===k),AUTO={esteira:'man',sensor:'man',energia:'man',molde:'man',cliente:'qual',resina:'qual',forn:'sc'};
function resolveEv(id,o){const i=G.ev.findIndex(x=>x.id===id);if(i<0)return;const e=G.ev[i],d=evD(e.k),op=d.o[o];if(!op||(op.c&&G.money<op.c))return;if(op.c)spend(op.c);op.f();G.ev.splice(i,1);say('Ocorrência resolvida: '+d.t+' ('+op.l.split(' · ')[0]+').')}
const staffCost=()=>250*Object.values(G.ger).reduce((a,b)=>a+b,0)+60*G.brig+120*G.mult+150*G.amb+120*G.ref+3*Object.values(G.ops||{}).reduce((a,b)=>a+b,0);
const NFB=[{n:'Engenharia e design do retrovisor',need:120,cost:8000,d:'A engenharia valida os desenhos do retrovisor para a nova geração de cabines da VWCO.'},
{n:'Ferramental do molde',need:150,cost:6000,d:'Ocupa uma ferramentaria dedicada. Com apenas uma, a manutenção dos moldes da fábrica para.'},
{n:'Protótipos e validação',need:60,cost:2000,deliver:50,d:'Consome 50 retrovisores de caminhão embalados, enviados aos testes da VWCO.'},
{n:'Homologação PPAP',need:60,cost:3000,d:'Exige taxa de refugo abaixo de 6% e pelo menos 1 brigadista.',cond:()=>scrapRate()<.06&&G.brig>=1}];
const ALLCLI=()=>[...new Set([].concat(CLI.car,CLI.bus,CLI.truck))];
function visitScore(){const late=Object.values(G.brand).reduce((a,b)=>a+b.late,0),n=Math.max(1,G.delivered),pr=G.visit?G.visit.prep:0;
 const it=[['Qualidade do produto',100-Math.min(100,Math.max(0,(scrapRate()-.01)*900))],['Segurança do trabalho',Math.min(100,G.brig*25+G.amb*25)],['Pontualidade nas entregas',Math.max(0,100-late/n*300)],['Organização e 5S',Math.min(100,G.moral+pr*20)],['Estado dos moldes',100-mxMold()],['Meio ambiente (moinho)',Math.max(0,100-G.reb/RB*72)],['Pessoas e treinamento',Math.min(100,30+G.mult*20+Object.values(G.ger).reduce((a,b)=>a+b,0)*10+G.ref*5)]];
 return{it,total:it.reduce((a,b)=>a+b[1],0)/it.length}}
function visitDone(){const v=G.visit,r=visitScore(),t=r.total;let msg;
 if(t>=75){earn(3000);G.rep=Math.min(100,G.rep+5);const b=G.brand[v.cl]||(G.brand[v.cl]={u:0,late:0,rev:0});b.u+=3000;msg='Auditoria aprovada. A '+v.cl+' elogiou a fábrica: bônus de R$ 90.000, reputação +5 e preços melhores.'}
 else if(t>=50){G.rep=Math.min(100,G.rep+1);msg='Auditoria aprovada com ressalvas. A '+v.cl+' pediu um plano de ação.'}
 else{G.rep=Math.max(0,G.rep-6);msg='Auditoria reprovada. A '+v.cl+' reduziu o volume de compras por um tempo: reputação -6.'}
 G.vlast=v.cl+' · '+Math.round(t)+' pontos';say('Visita da '+v.cl+': '+Math.round(t)+' pontos.');G.visit=null;G.nextVisit=G.t+ri(240,360);
 pause();const m=$('modal');m.hidden=false;m.innerHTML='<div role="dialog" aria-modal="true"><h2>Visita da '+v.cl+'</h2><div class="tw"><table><tbody>'+r.it.map(x=>'<tr><td>'+x[0]+'</td><td class="num">'+Math.round(x[1])+'</td></tr>').join('')+'<tr><td><b>Total</b></td><td class="num"><b>'+Math.round(t)+'</b></td></tr></tbody></table></div><p>'+msg+'</p><button class="btn pri" data-act="go" autofocus>Voltar ao trabalho</button></div>'}
function buyMat(k){const m=MAT[k],c=m.lot*mp(k);if(G.money<c)return;spend(c);G.dl.push({item:k,qty:m.lot,eta:10+ri(0,4)-(G.res.kanban?5:0)-(G.ger.sc?3:0)});say('Gerente de produção comprou '+m.lot+' × '+m.n+'.')}
function extra(){
 G.mnt.forEach(s=>{if(s.down>0){s.down--;s.p=null;return}const n=Math.min(12,G.raw.espuma,Math.floor((2700-G.raw.manta)/3));if(n>0){G.raw.espuma-=n;G.raw.manta+=3*n;s.p='M'}else s.p=null});
 G.moi.forEach(s=>{const n=Math.min(40,G.reb);if(n>=2){G.reb-=n;G.raw.resina+=Math.floor(n/2);G.recycled+=Math.floor(n/2);s.p='R'}else s.p=null});
 const free=Math.max(0,G.fer.length-(G.nfb.run&&G.nfb.ph===1?1:0)),w=worstMold();G.fer.forEach(s=>s.p=null);
 if(G.mold[w]>30&&free>0){G.mold[w]=Math.max(0,G.mold[w]-free*3);G.fer.slice(0,free).forEach(s=>s.p='F')}
 const ex=(G.col.length+G.mon.length+G.qa.length+G.emb.length+G.inj.length+G.mnt.length)/10;
 if(Math.random()<.0025*ex*(G.moral<40?2:1)*(1-.15*G.mult)*(G.amb?.9:1)){const arr=[G.col,G.mon,G.qa,G.emb,G.mnt][ri(0,4)],s=arr[ri(0,arr.length-1)];s.down=G.amb?3:7;spend(G.amb?200:600);G.acc++;G.moral=Math.max(0,G.moral-(G.amb?3:6));say('Acidente de trabalho: colaborador afastado'+(G.amb?' (atendido no ambulatório)':' sem atendimento no local')+'.')}
 G.moral=Math.max(0,Math.min(100,G.moral+.02*G.ref+.01*G.mult-.015));
 if(Math.random()<.0008){const ok=Math.random()<Math.min(.95,.3+.22*G.brig+(G.fx.drill>G.t?.1:0));if(ok){spend(300);say('Princípio de incêndio controlado pela brigada de emergência (R$ 9.000).')}else{spend(6000);G.fx.blackout=G.t+12;G.moral=Math.max(0,G.moral-10);say('Incêndio fora de controle: produção parada por cerca de 1h40 e R$ 180.000 em danos. Treine mais brigadistas.')}}
 G.ev=G.ev.filter(x=>{const d=evD(x.k),a=AUTO[x.k];if(G.ger[a]&&(!d.o[0].c||G.money>=d.o[0].c)){if(d.o[0].c)spend(d.o[0].c);d.o[0].f();say('Gerente resolveu: '+d.t+'.');return false}if(x.exp<=G.t){d.ig();say('Ocorrência ignorada: '+d.t+'.');return false}return true});
 if(G.ev.length<2&&Math.random()<1/45){const e=EV[ri(0,EV.length-1)];if(!G.ev.some(x=>x.k===e.k)){G.ev.push({k:e.k,id:uid++,exp:G.t+14});say('Ocorrência na linha: '+e.t+'.')}}
 if(G.ger.prod)Object.keys(MAT).forEach(k=>{if(G.raw[k]<900&&!G.dl.some(d=>d.item===k))buyMat(k)});
 if(G.ger.man)G.inj.forEach((m,i)=>{if(m.broken&&!m.rep&&G.money>=150){spend(150);m.rep=4}});
 if(G.ger.log)G.orders.filter(o=>o.state==='open'&&G.pack[o.p]>=o.qty).forEach(o=>{if(G.pack[o.p]>=o.qty&&G.trucks.some(t=>t.busy===0)){const tk=G.trucks.find(t=>t.busy===0);G.pack[o.p]-=o.qty;o.state='transit';tk.ord=o;tk.busy=tk.trip=9+ri(0,6)}});
 if(!G.visit&&G.t>=G.nextVisit){G.visit={t:G.t+90,cl:ALLCLI()[ri(0,ALLCLI().length-1)],prep:0};say('Visita técnica agendada: '+G.visit.cl+' chega em 1,5 dia.')}
 if(G.visit&&G.t>=G.visit.t)visitDone();
 const n=G.nfb;if(n.run){const ph=NFB[n.ph];n.prog=Math.min(ph.need,n.prog+1);if(n.prog>=ph.need&&(!ph.cond||ph.cond())){n.run=false;n.prog=0;say('Projeto NFB: fase concluída ('+ph.n+').');n.ph++;if(n.ph>=NFB.length){n.done=true;n.contract=15;earn(12000);G.rep=Math.min(100,G.rep+10);say('Projeto NFB homologado pela VWCO! Contrato de fornecimento por 15 dias e bônus de R$ 360.000')}}}
 if(n.contract>0&&G.t%DAY===1){n.contract--;G.orders.push({id:uid++,p:'truck',qty:200,pay:Math.round(200*PR.truck.price*1.35),client:'VWCO · Projeto NFB',win:120,state:'open',due:G.t+120});say('Novo pedido do Projeto NFB: 200 retrovisores de caminhão.')}}

const GER={prod:['Gerente de produção','Compra os materiais sozinho quando o estoque cai abaixo de 30 e resolve atrasos de fornecedor.'],log:['Gerente de logística','Despacha os pedidos prontos assim que há caminhão livre.'],qual:['Gerente de qualidade','Reduz o refugo em 2 pontos e resolve reclamações de cliente e resina contaminada.'],cam:['Gerente de caminhões','Coordena a linha de caminhões: +15% de produção de peças de caminhão em todos os setores e preço 5% melhor nos pedidos.'],sc:['Supply chain','Negocia com fornecedores: materiais 8% mais baratos, cargas chegam mais cedo e resolve atrasos de fornecedor.'],man:['Gerente de manutenção','Conserta as injetoras que quebram e resolve falhas de sensor, energia e molde.']};
const HI={brig:{max:4,c:n=>1500,get:()=>G.brig,set:()=>{G.brig++},nm:'brigadista treinado'},mult:{max:4,c:n=>3500,get:()=>G.mult,set:()=>{G.mult++},nm:'multiplicador'},amb:{max:2,c:n=>n?6000:4000,get:()=>G.amb,set:()=>{G.amb++},nm:'estrutura do ambulatório'},ref:{max:3,c:n=>3000*(n+1),get:()=>G.ref,set:()=>{G.ref++},nm:'melhoria do refeitório'}};
function hire(k){if(k.startsWith('ger:')){const g=k.slice(4);if(!G.ger[g]&&G.money>=6000){spend(6000);G.ger[g]=1;say('Contratado: '+GER[g][0]+'.')}return}
 const h=HI[k],n=h.get();if(n<h.max&&G.money>=h.c(n)){spend(h.c(n));h.set();say('Contratação: '+h.nm+'.')}}
const injWhy=m=>G.fx.blackout>G.t?'Sem energia':G.reb>=RB?'Moinho cheio':(m.cur&&G.mold[m.cur]>=100)?'Molde desgastado':'Falta resina';
const pbar=(v,bad)=>'<div class="bar"><i style="width:'+Math.max(0,Math.min(100,v))+'%;background:'+(bad?'var(--bad)':'var(--accent)')+'"></i></div>';
function extraSecs(){
 const tiles=(k,lab)=>G[k].map(s=>'<div class="mc '+(s.p?'run':'')+'"><div class="st"><i class="led"></i>'+(s.down>0?'Afastado (acidente)':s.p?lab:'Ocioso')+'</div></div>').join('');
 let h=sec('09','Mantas de proteção','EMBALAGEM',tiles('mnt','Cortando manta')+'<div class="row"><span>Espuma <b class="num'+(G.raw.espuma<600?' low':'')+'">'+G.raw.espuma+'</b></span>'+btn('buy','espuma','+60 · '+R$(60*mp('espuma')),G.money<60*mp('espuma'),'sm')+'</div><div class="row"><span>Mantas prontas <b class="num'+(G.raw.manta<300?' low':'')+'">'+G.raw.manta+'</b></span><span class="mut">1 por embalagem</span></div>',upf('mnt','Estações'));
 h+=sec('10','Moinho','RECICLAGEM',tiles('moi','Moendo rebarba')+'<div class="mut">Rebarba acumulada</div>'+pbar(G.reb/RB*100,G.reb>=RB*.75)+'<div class="row"><span class="num">'+sh(G.reb)+'/'+sh(RB)+'</span><span class="mut">Reciclado: '+G.recycled+' kg</span></div><div class="mut">Com a rebarba cheia as injetoras param.</div>',upf('moi','Moinhos'));
 h+=sec('11','Ferramentaria','MOLDES',tiles('fer','Retificando molde')+KEYS.map(p=>'<div class="row"><span>Molde '+PR[p].n+'</span><b class="num'+(G.mold[p]>=70?' low':'')+'">'+Math.round(G.mold[p])+'%</b></div>'+pbar(G.mold[p],G.mold[p]>=70)).join('')+(G.nfb.run&&G.nfb.ph===1?'<div class="mut good">O Projeto NFB ocupa um ferramenteiro.</div>':''),upf('fer','Ferramenteiros'));
 return h+sec('12','Apoio e segurança','PESSOAS','<div class="row"><span>Moral da equipe</span><b class="num">'+Math.round(G.moral)+'</b></div>'+pbar(G.moral,G.moral<40)+'<div class="row"><span>Ambulatório</span><b>'+['Sem estrutura','Enfermaria','Médico do trabalho'][G.amb]+'</b></div><div class="row"><span>Refeitório</span><b class="num">nível '+G.ref+'/3</b></div><div class="row"><span>Brigadistas</span><b class="num">'+G.brig+'/4</b></div><div class="row"><span>Multiplicadores</span><b class="num">'+G.mult+'/4</b></div>','<span>Acidentes: <b class="num">'+G.acc+'</b></span>'+btn('tab','pes','Gerir pessoas',0,'sm'))}
function pesPane(){
 const card=(t,d,n,max,c,k,lab)=>'<div class="ord"><h3>'+t+'</h3><div class="mut">'+d+'</div><div class="row"><span class="num">'+n+'/'+max+'</span>'+(n>=max?'<span class="good">Completo</span>':btn('hire',k,(lab||'Contratar')+' · '+R$(c),G.money<c,'sm pri'))+'</div></div>';
 return '<div class="box"><h2>Moral e segurança</h2><div><div class="row"><span>Moral da equipe</span><b class="num">'+Math.round(G.moral)+'</b></div>'+pbar(G.moral,G.moral<40)+'<div class="mut">Moral abaixo de 40 dobra os acidentes e aumenta o refugo. O refeitório e os multiplicadores sobem a moral.</div><div class="row"><span>Acidentes de trabalho</span><b class="num">'+G.acc+'</b></div><div>'+btn('drill',0,'Simulado de emergência · R$ 24.000',G.money<800,'sm')+'</div></div></div>'+
 '<div class="grid2">'+card('Brigada de emergência','Cada brigadista aumenta a chance de controlar um princípio de incêndio.',G.brig,4,1500,'brig','Treinar')+card('Multiplicadores','Funcionário treinado que repassa o padrão de trabalho: menos refugo, menos acidentes e mais moral.',G.mult,4,3500,'mult','Formar')+card('Ambulatório','Nível 1 enfermaria, nível 2 médico do trabalho. Acidentes custam menos e afastam por menos tempo.',G.amb,2,HI.amb.c(G.amb),'amb','Montar')+card('Refeitório','Cada nível sobe a moral da equipe aos poucos.',G.ref,3,HI.ref.c(G.ref),'ref','Melhorar')+'</div>'+
 '<div class="box"><h2>Gerência</h2><div class="grid2">'+Object.entries(GER).map(([k,g])=>'<div class="ord"><h3>'+g[0]+'</h3><div class="mut">'+g[1]+'</div><div class="row"><span class="mut">R$ 7.500 por dia</span>'+(G.ger[k]?'<span class="good">Contratado</span>':btn('hire','ger:'+k,'Contratar · R$ 180.000',G.money<6000,'sm pri'))+'</div></div>').join('')+'</div></div>'}
function nfbPane(){const n=G.nfb;
 const ph=NFB.map((p,i)=>{const cur=i===n.ph&&!n.done,done=n.done||i<n.ph,blk=cur&&n.run&&n.prog>=p.need&&p.cond&&!p.cond();
  return '<div class="ord"><h3>Fase '+(i+1)+' · '+p.n+'</h3><div class="mut">'+p.d+'</div>'+(cur&&n.run?pbar(100*n.prog/p.need):'')+'<div class="row"><span class="'+(done?'good':'mut')+'">'+(done?'Concluída':cur?(blk?'Bloqueada: confira refugo e brigada':n.run?'Em andamento · '+Math.round(100*n.prog/p.need)+'%':'Pronta para iniciar'):'Aguardando')+'</span>'+(cur&&!n.run?btn('nfb',0,'Iniciar · '+R$(p.cost),G.money<p.cost||(p.deliver&&G.pack.truck<p.deliver),'sm pri'):'')+'</div></div>'}).join('');
 return '<div class="box"><h2>Projeto NFB · Novo Veículo Brasil</h2><div><p class="mut" style="margin:0">Projeto da Volkswagen Caminhões e Ônibus (VWCO), desenvolvido no Brasil para uma nova geração de veículos pesados. Conclua as quatro fases para homologar o retrovisor e receber um contrato com pedidos premium de caminhão.</p>'+(n.done?'<div class="good">Homologado. '+(n.contract>0?'Contrato ativo: '+n.contract+' dias restantes.':'Contrato concluído.')+'</div>':'')+'</div></div><div class="vs">'+ph+'</div>'}
function drawX(){
 $('evs').innerHTML=G.ev.length?G.ev.map(x=>{const d=evD(x.k);return '<div class="ord"><h3>'+d.t+'</h3><div class="mut">'+d.d+' Resolva em '+tm(x.exp-G.t)+'.</div><div class="chips">'+d.o.map((o,i)=>btn('ev',x.id+':'+i,o.l,o.c&&G.money<o.c,'sm'+(i?'':' pri'))).join('')+'</div></div>'}).join(''):'<span class="mut">As linhas estão operando sem ocorrências.</span>';
 $('vis').innerHTML=G.visit?'<div class="ord"><h3>Visita da '+G.visit.cl+'</h3><div class="mut">Chega em '+tm(G.visit.t-G.t)+' · preparo '+G.visit.prep+'/3 · pontuação prevista <b class="num">'+Math.round(visitScore().total)+'</b></div>'+btn('prep',0,'Preparar a visita · R$ 18.000',G.visit.prep>=3||G.money<600,'sm pri')+'</div>':'<span class="mut">Nenhuma visita agendada.</span>'+(G.vlast?'<div class="mut">Última visita: '+G.vlast+'</div>':'');
 if(G.tab==='prod')$('pane-prod').innerHTML=prodPane();if(G.tab==='pes')$('pane-pes').innerHTML=pesPane();else if(G.tab==='nfb')$('pane-nfb').innerHTML=nfbPane()}

function drawZone(i,t){if(i<8)return drawZone0(i,t);const[ox,oy]=ZP[i];rect(ox,oy,280,260,C.panel,C.line);rect(ox,oy,280,30,C.panel2);txt((i+1)+' · '+ZN[i].toUpperCase(),ox+12,oy+20,13,C.fg);
 if(i===8){G.mnt.forEach((s,q)=>station('mnt',s,ox+14+(q%3)*84,oy+44+Math.floor(q/3)*58,t));
  const n=Math.min(10,Math.ceil(G.raw.manta/90));for(let q=0;q<n;q++){const x=ox+16+(q%5)*50,y=oy+168-Math.floor(q/5)*26;rect(x,y,44,20,C.panel2,C.line);rect(x,y+8,44,4,C.accent)}
  txt('mantas '+sh(G.raw.manta),ox+16,oy+228,11,C.fg);txt('espuma '+sh(G.raw.espuma),ox+150,oy+228,11,G.raw.espuma<600?C.bad:C.fg)}
 if(i===9){const on=G.moi.some(s=>s.p);cx.fillStyle=C.line;cx.beginPath();cx.moveTo(ox+40,oy+50);cx.lineTo(ox+140,oy+50);cx.lineTo(ox+110,oy+110);cx.lineTo(ox+70,oy+110);cx.fill();rect(ox+60,oy+110,60,50,C.panel2,C.line);
  cx.save();cx.translate(ox+90,oy+135);cx.rotate(on?t*4:0);cx.strokeStyle=C.accent;cx.lineWidth=3;for(let q=0;q<4;q++){cx.rotate(Math.PI/4);cx.beginPath();cx.moveTo(-14,0);cx.lineTo(14,0);cx.stroke()}cx.restore();
  worker(ox+190,oy+110,t,on,C.info);const f=Math.min(1,G.reb/RB);rect(ox+150,oy+150,110,16,C.panel2,C.line);rect(ox+152,oy+152,106*f,12,G.reb>=RB*.75?C.bad:C.accent);
  txt('rebarba '+sh(G.reb)+'/'+sh(RB),ox+205,oy+184,11,G.reb>=RB*.75?C.bad:C.fg,'center');txt('reciclado '+G.recycled+' kg',ox+205,oy+204,11,C.mute,'center')}
 if(i===10){rect(ox+14,oy+44,252,18,C.line);G.fer.forEach((s,q)=>{const x=ox+20+q*80;worker(x+16,oy+98,t,!!s.p,C.info);rect(x,oy+104,60,14,C.line);if(s.p)rect(x+26,oy+96,18,8,C.accent)});
  KEYS.forEach((p,q)=>{const x=ox+20+q*84,w=G.mold[p];rect(x,oy+150,70,40,C.panel2,C.line);rect(x+4,oy+154,62,18,PC[p]);rect(x+4,oy+178,62*Math.min(1,w/100),6,w>=70?C.bad:C.ok);txt(PR[p].n+' '+Math.round(w)+'%',x+35,oy+206,10,w>=70?C.bad:C.fg,'center')});
  if(G.nfb.run&&G.nfb.ph===1){rect(ox+190,oy+70,70,22,C.accent);txt('NFB '+Math.round(100*G.nfb.prog/NFB[1].need)+'%',ox+225,oy+86,11,'#1a1400','center')}}
 if(i===11){const lunch=(G.t%DAY)>=28&&(G.t%DAY)<=34;
  rect(ox+14,oy+40,120,70,C.panel2,C.line);txt('REFEITÓRIO',ox+74,oy+56,10,C.mute,'center');for(let q=0;q<Math.min(12,2+G.ref*3);q++)dot(ox+26+(q%6)*18,oy+78+Math.floor(q/6)*18+(lunch?Math.sin(t*3+q)*2:0),5,lunch?C.accent:C.line);
  rect(ox+146,oy+40,120,70,C.panel2,G.amb?C.ok:C.line);txt('AMBULATÓRIO',ox+206,oy+56,10,C.mute,'center');rect(ox+198,oy+64,16,38,G.amb?C.bad:C.line);rect(ox+188,oy+75,36,16,G.amb?C.bad:C.line);
  for(let q=0;q<4;q++){const x=ox+20+q*30;rect(x,oy+130,14,34,q<G.brig?C.bad:C.line,C.line);rect(x+3,oy+126,8,6,C.mute)}
  txt('brigada '+G.brig+'/4',ox+14,oy+182,11,C.fg);txt('multiplicadores '+G.mult+'/4',ox+14,oy+200,11,C.fg);
  for(let q=0;q<4;q++)worker(ox+170+q*22,oy+150,t,q<G.mult,q<G.mult?C.ok:C.line);
  rect(ox+14,oy+216,252,10,C.panel2,C.line);rect(ox+16,oy+218,248*G.moral/100,6,G.moral<40?C.bad:C.ok);txt('moral '+Math.round(G.moral),ox+140,oy+246,11,C.fg,'center');
  if(G.fx.blackout>G.t){rect(ox,oy,280,260,'rgba(255,60,40,.18)');txt('EMERGÊNCIA',ox+140,oy+130,18,C.bad,'center')}}}

G=load()||fresh();G.speed=0;theme();render();requestAnimationFrame(loop);
(G.t>0?(()=>{$('modal').hidden=true;setSpeed(1)})():modal('intro'));


