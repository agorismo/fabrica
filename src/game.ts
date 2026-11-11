// @ts-nocheck
/* Motor original do jogo, preservado e isolado do ponto de entrada React. */

const DAY=60,GOAL=50000,KEYS=['car','bus','truck'];
const PR={car:{n:'Carro',s:'C',res:1,vid:1,inj:2,col:2,mon:2,emb:1,price:80},
bus:{n:'Ônibus',s:'Ô',res:2,vid:2,inj:4,col:2,mon:2,emb:1,price:150},
truck:{n:'Caminhão',s:'T',res:3,vid:2,inj:5,col:3,mon:3,emb:2,price:200}};
const MAT={resina:{n:'Resina PP (kg)',p:10,lot:60},vidro:{n:'Espelho de vidro',p:14,lot:40},kit:{n:'Kit motor e regulagem',p:10,lot:40},cola:{n:'Adesivo PU',p:3,lot:60},caixa:{n:'Caixa de papelão',p:4,lot:60}};
const CLI={car:['Volkswagen','Fiat','Chevrolet','Toyota','Hyundai','Honda','Renault','Ford','Jeep','Nissan','Peugeot','Citroën'],bus:['Marcopolo','Mercedes-Benz Ônibus','Volvo Ônibus','Scania Ônibus','Comil','Caio','Neobus','Agrale'],truck:['Scania','Volvo Caminhões','Mercedes-Benz Caminhões','DAF','Iveco','MAN / Volkswagen Caminhões','Ford Cargo','Agrale']};
const SEC={col:{inn:'hous',out:'glued',mats:p=>({vidro:PR[p].vid,cola:1})},mon:{inn:'glued',out:'asm',mats:p=>({kit:1})},emb:{inn:'asm',out:'pack',mats:p=>({caixa:1})}};
const z=()=>({car:0,bus:0,truck:0});
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
let G,timer=null,uid=1,AC=null,SND=false;
function sfx(t){if(!SND)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime,f={ok:[660,880],bad:[140,90],click:[500,500],day:[392,523]}[t];o.type=t==='bad'?'sawtooth':'square';o.frequency.setValueAtTime(f[0],n);o.frequency.setValueAtTime(f[1],n+.08);g.gain.setValueAtTime(.05,n);g.gain.exponentialRampToValueAtTime(.001,n+.25);o.connect(g);g.connect(AC.destination);o.start();o.stop(n+.26)}catch(e){}}
function fresh(){return{t:0,day:1,money:9000,rep:60,speed:0,prod:0,sent:0,won:false,over:false,
 raw:{resina:60,vidro:40,kit:40,cola:60,caixa:60},hous:z(),glued:z(),asm:z(),pack:z(),
 inj:[{p:'auto',cur:null,prog:0,setup:0,rep:0,broken:false,st:'idle'},{p:'car',cur:null,prog:0,setup:0,rep:0,broken:false,st:'idle'}],
 col:[{p:null,t:0},{p:null,t:0}],mon:[{p:null,t:0},{p:null,t:0}],emb:[{p:null,t:0}],
 docks:1,dl:[],queue:[],unl:[],trucks:[{busy:0,ord:null},{busy:0,ord:null}],offers:[],orders:[],log:['Fábrica aberta. Aceite propostas e mantenha o estoque abastecido.']};}
const say=m=>{G.log.unshift(m);G.log.length=Math.min(G.log.length,40)};
const R$=n=>'R$ '+Math.round(n).toLocaleString('pt-BR');
function pipe(p){let n=G.hous[p]+G.glued[p]+G.asm[p]+G.pack[p];
 for(const k of ['col','mon','emb'])G[k].forEach(s=>{if(s.p===p)n++});
 G.inj.forEach(m=>{if(m.prog>0&&m.cur===p)n++});return n}
function deficit(p){let d=0;G.orders.forEach(o=>{if(o.state==='open'&&o.p===p)d+=o.qty});return d-pipe(p)}
function pickAuto(){let b=null,bd=0;KEYS.forEach(p=>{const d=deficit(p);if(d>bd){bd=d;b=p}});return b}
function inject(){G.inj.forEach(m=>{
 if(m.broken){if(m.rep>0&&--m.rep===0){m.broken=false;say('Injetora reparada.')}m.st='broken';return}
 if(m.setup>0){m.setup--;m.st='setup';return}
 const p=m.prog>0?m.cur:(m.p==='auto'?pickAuto():m.p);
 if(!p){m.st='idle';return}
 if(m.cur&&m.cur!==p&&m.prog===0){m.cur=p;m.setup=3;m.st='setup';say('Troca de molde: '+PR[p].n+'.');return}
 m.cur=p;
 if(m.prog===0){if(G.raw.resina<PR[p].res){m.st='nomat';return}G.raw.resina-=PR[p].res}
 m.st='run';m.prog++;
 if(Math.random()<.004){m.broken=true;m.prog=0;m.st='broken';say('Injetora parou: falha no sistema de aquecimento.');sfx('bad');return}
 if(m.prog>=PR[p].inj){G.hous[p]++;G.prod++;m.prog=0}})}
function stage(k){const d=SEC[k];G[k].forEach(s=>{
 if(s.p){if(--s.t<=0){G[d.out][s.p]++;s.p=null}s.why='run';return}
 const has=KEYS.filter(p=>G[d.inn][p]>0);
 if(!has.length){s.why='noin';return}
 const ok=has.filter(p=>Object.entries(d.mats(p)).every(([m,q])=>G.raw[m]>=q));
 if(!ok.length){s.why='nomat';return}
 ok.sort((a,b)=>deficit(b)-deficit(a)||G[d.inn][b]-G[d.inn][a]);
 const p=ok[0];G[d.inn][p]--;for(const[m,q]of Object.entries(d.mats(p)))G.raw[m]-=q;
 s.p=p;s.t=PR[p][k];s.why='run'})}
function receive(){
 G.dl.forEach(d=>d.eta--);
 G.dl=G.dl.filter(d=>{if(d.eta<=0){G.queue.push(d);return false}return true});
 G.unl=G.unl.filter(u=>{if(--u.left<=0){G.raw[u.item]+=u.qty;say('Recebido e conferido: '+u.qty+' × '+MAT[u.item].n+'.');return false}return true});
 while(G.unl.length<G.docks&&G.queue.length){const d=G.queue.shift();G.unl.push({item:d.item,qty:d.qty,left:3})}}
function logistics(){G.trucks.forEach(tk=>{if(tk.busy>0&&--tk.busy===0){const o=tk.ord;tk.ord=null;
 const late=G.t>o.due,pay=o.pay*(late?.7:1);G.money+=pay;sfx(late?"bad":"ok");G.sent+=o.qty;G.rep=Math.max(0,Math.min(100,G.rep+(late?-1:2)));
 say((late?'Entrega atrasada: ':'Entregue: ')+o.qty+' × '+PR[o.p].n+' para '+o.client+' ('+R$(pay)+').');
 G.orders=G.orders.filter(x=>x.id!==o.id)}})}
function market(){
 G.offers=G.offers.filter(o=>o.exp>G.t);
 if(G.offers.length<4&&Math.random()<1/12){
  const p=['car','car','bus','truck'][ri(0,3)],q=p==='car'?ri(2,6)*5:p==='bus'?ri(3,8)*2:ri(2,6)*2;
  const unit=PR[p].price*(.9+G.rep/400)*(.92+Math.random()*.2);
  G.offers.push({id:uid++,p,qty:q,pay:Math.round(unit*q),client:CLI[p][ri(0,CLI[p].length-1)],win:ri(90,200),exp:G.t+60})}
 G.orders.forEach(o=>{if(o.state==='open'&&G.t>o.due){G.money-=o.pay*.1;G.rep=Math.max(0,G.rep-5);say('Prazo perdido: '+o.client+' cancelou o pedido (multa '+R$(o.pay*.1)+').');o.dead=1}});
 G.orders=G.orders.filter(o=>!o.dead)}
function endDay(){
 const n=G.inj.length+G.col.length+G.mon.length+G.emb.length+G.docks+G.trucks.length,c=200+40*n;
 G.money-=c;say('Dia '+G.day+' encerrado. Folha e despesas: '+R$(c)+'.');G.day++;sfx("day");
 if(G.money<-3000&&!G.over){G.over=true;pause();modal('lose')}
 else if(G.money>=GOAL&&!G.won){G.won=true;pause();modal('win')}}
function tick(){G.t++;receive();logistics();stage('emb');stage('mon');stage('col');inject();market();if(G.t%DAY===0)endDay();render();if(G.t%10===0)save()}
function pause(){G.speed=0;clearInterval(timer);timer=null}
function setSpeed(s){G.speed=s;clearInterval(timer);timer=null;if(s>0)timer=setInterval(tick,1000/s)}
function save(){try{localStorage.setItem('fabrica-retrovisores',JSON.stringify(G))}catch(e){}}
function load(){try{const s=localStorage.getItem('fabrica-retrovisores');if(s){const g=JSON.parse(s);if(g&&g.inj)return g}}catch(e){}return null}
const UP={inj:{max:6,cost:n=>7000+2500*(n-2),arr:()=>G.inj,add:()=>({p:'auto',cur:null,prog:0,setup:0,rep:0,broken:false,st:'idle'}),n:'injetora'},
col:{max:5,cost:n=>3000*n,arr:()=>G.col,add:()=>({p:null,t:0}),n:'estação de colagem'},
mon:{max:5,cost:n=>3000*n,arr:()=>G.mon,add:()=>({p:null,t:0}),n:'bancada de montagem'},
emb:{max:4,cost:n=>2500*n,arr:()=>G.emb,add:()=>({p:null,t:0}),n:'posto de embalagem'},
dock:{max:3,cost:n=>3500*n,n:'doca de recebimento'},truck:{max:5,cost:n=>4500*n,n:'caminhão da frota'}};
const cnt=k=>k==='dock'?G.docks:k==='truck'?G.trucks.length:UP[k].arr().length;
function A(act,a){
 if(act==='speed')return setSpeed(+a);
 if(act==='snd'){SND=!SND;sfx('click');return render()}
 if(['buy','up','accept','ship','repair'].includes(act))sfx('click');
 if(act==='buy'){const m=MAT[a],c=m.lot*m.p;if(G.money>=c){G.money-=c;G.dl.push({item:a,qty:m.lot,eta:10+ri(0,4)});say('Pedido de compra: '+m.lot+' × '+m.n+' ('+R$(c)+').')}}
 else if(act==='cycle'){const m=G.inj[+a],o=['auto','car','bus','truck'];m.p=o[(o.indexOf(m.p)+1)%4]}
 else if(act==='repair'){const m=G.inj[+a];if(m.broken&&m.rep===0&&G.money>=150){G.money-=150;m.rep=4;say('Manutenção chamada (R$ 150).')}}
 else if(act==='up'){const u=UP[a],n=cnt(a),c=u.cost(n);if(n<u.max&&G.money>=c){G.money-=c;
  if(a==='dock')G.docks++;else if(a==='truck')G.trucks.push({busy:0,ord:null});else u.arr().push(u.add());say('Investimento: '+u.n+' ('+R$(c)+').')}}
 else if(act==='accept'){const i=G.offers.findIndex(o=>o.id===+a);if(i>=0){const o=G.offers.splice(i,1)[0];o.state='open';o.due=G.t+o.win;G.orders.push(o);say('Pedido aceito: '+o.qty+' × '+PR[o.p].n+' para '+o.client+'.')}}
 else if(act==='decline'){G.offers=G.offers.filter(o=>o.id!==+a)}
 else if(act==='ship'){const o=G.orders.find(x=>x.id===+a),tk=G.trucks.find(t=>t.busy===0);
  if(o&&tk&&o.state==='open'&&G.pack[o.p]>=o.qty){G.pack[o.p]-=o.qty;o.state='transit';tk.ord=o;tk.busy=9+ri(0,6);say('Expedição: carga de '+o.qty+' × '+PR[o.p].n+' saiu para '+o.client+'.')}}
 else if(act==='reset'){pause();G=fresh();modal('intro')}
 else if(act==='go'){document.getElementById('modal').hidden=true;setSpeed(1)}
 render()}
function modal(k){const m=document.getElementById('modal');m.hidden=false;
 const T={intro:['Bem-vindo à linha','Você gerencia uma fábrica de retrovisores para carros, ônibus e caminhões. Compre resina, espelhos, kits de motor, adesivo e caixas. A resina vira carcaça nas injetoras, o espelho é colado, o kit é montado, o conjunto é embalado e a expedição despacha pelo caminhão da frota. Aceite propostas, entregue no prazo e chegue a '+R$(GOAL)+' em caixa. Os clientes são montadoras conhecidas, citadas só como referência no jogo, sem vínculo com as empresas.','Abrir a fábrica'],
 win:['Meta batida','A fábrica chegou a '+R$(GOAL)+' em caixa no dia '+G.day+'. Você pode continuar jogando e expandir a operação.','Continuar'],
 lose:['Fábrica falida','O caixa passou de -R$ 3.000. Comece um novo jogo e cuide do capital de giro.','Novo jogo']}[k];
 m.innerHTML='<div role="dialog" aria-modal="true"><h2>'+T[0]+'</h2><p>'+T[1]+'</p><button class="btn pri" data-act="'+(k==='lose'?'reset':'go')+'" autofocus>'+T[2]+'</button></div>'}
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
tr:'<path d="M4 44V20H38V44M38 28H50L60 38V44H38"/><circle cx="16" cy="48" r="5"/><circle cx="48" cy="48" r="5"/>'};
const SI={'01':'rec','02':'inj','03':'glue','04':'gear','05':'box','06':'stack','07':'tr'};
const ic=(k,s)=>'<svg class="ic" width="'+(s||24)+'" height="'+(s||24)+'" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[k]+'</svg>';

const btn=(act,a,txt,dis,cls)=>'<button class="btn '+(cls||'')+'" data-act="'+act+'" data-a="'+a+'"'+(dis?' disabled':'')+'>'+txt+'</button>';
const sec=(n,t,sub,bd,ft)=>'<div class="sec"><h2><span class="ttl">'+ic(SI[n],26)+t+'</span><span>SETOR '+n+(sub?' · '+sub:'')+'</span></h2><div class="bd">'+bd+'</div>'+(ft?'<div class="ft">'+ft+'</div>':'')+'</div>';
const chips=o=>'<div class="chips">'+KEYS.map(p=>'<span class="chip">'+ic(p,16)+PR[p].n+' '+o[p]+'</span>').join('')+'</div>';
const upf=(k,label)=>{const u=UP[k],n=cnt(k),c=u.cost(n);return '<span>'+label+': <b class="num">'+n+'/'+u.max+'</b></span>'+(n>=u.max?'<span>Máximo</span>':btn('up',k,'+1 por '+R$(c),G.money<c,'sm'))};
const WHY={run:'Em produção',noin:'Aguardando peças',nomat:'Falta material'};
function lineSec(k,n,t,inLbl,outLbl){
 const tiles=G[k].map((s,i)=>'<div class="mc '+(s.p?'run':s.why==='nomat'?'nomat':'')+'"><div class="st"><i class="led"></i>'+(s.p?PR[s.p].n+' ('+s.t+')':WHY[s.why||'noin'])+'</div><div class="bar"><i style="width:'+(s.p?100-100*s.t/PR[s.p][k]:0)+'%"></i></div></div>').join('');
 const d=SEC[k];
 return sec(n,t,'',tiles+'<div class="mut">'+inLbl+'</div>'+chips(G[d.inn])+'<div class="mut">'+outLbl+'</div>'+chips(G[d.out]),upf(k,'Estações'))}
function plant(){
 const N=['Recebimento','Injeção','Colagem','Montagem','Embalagem','Expedição','Logística'],W=1200/7;
 const stc=s=>s==='run'?'r':s==='broken'?'b':s==='idle'?'':'w';
 const blk=(z,i,cols,s,lab)=>{const x=z*W+18+(i%cols)*50,y=30+Math.floor(i/cols)*44;return '<rect class="bk '+s+'" x="'+x+'" y="'+y+'" width="44" height="36" rx="3"/>'+(lab?'<text class="bt'+(s?'':' d')+'" x="'+(x+22)+'" y="'+(y+24)+'" text-anchor="middle">'+lab+'</text>':'')};
 let h='';
 N.forEach((n,z)=>{const x=z*W;h+='<rect class="zn" x="'+(x+5)+'" y="5" width="'+(W-10)+'" height="220"/><text class="zt" x="'+(x+W/2)+'" y="218" text-anchor="middle">'+n+'</text>';if(z<6)h+='<path class="fl" d="M'+(x+W-5)+' 110H'+(x+W+5)+'"/>'});
 for(let i=0;i<G.docks;i++)h+=blk(0,i,3,i<G.unl.length?'r':'w','D'+(i+1));
 let j=0;for(const k in MAT){const v=G.raw[k],bh=Math.min(80,v*.6),bx=18+j*30;h+='<rect class="bar2'+(v<20?' lo':'')+'" x="'+bx+'" y="'+(180-bh)+'" width="22" height="'+bh+'"/>';j++}
 h+='<text class="zc" x="'+(W/2)+'" y="196" text-anchor="middle">a caminho '+G.dl.length+' · fila '+G.queue.length+'</text>';
 G.inj.forEach((m,i)=>h+=blk(1,i,3,stc(m.st==='nomat'?'nomat':m.st),m.cur?PR[m.cur].s:''));
 [['col',2],['mon',3],['emb',4]].forEach(([k,z])=>G[k].forEach((s,i)=>h+=blk(z,i,3,s.p?'r':s.why==='nomat'?'w':'',s.p?PR[s.p].s:'')));
 KEYS.forEach((p,i)=>{const v=G.pack[p],bh=Math.min(110,v*4),bx=5*W+22+i*48;h+='<rect class="bar2" x="'+bx+'" y="'+(150-bh)+'" width="36" height="'+bh+'"/><text class="zc" x="'+(bx+18)+'" y="170" text-anchor="middle">'+PR[p].s+' '+v+'</text>'});
 G.trucks.forEach((tk,i)=>h+=blk(6,i,3,tk.busy?'r':'','T'+(i+1))+(tk.busy?'<text class="zc" x="'+(6*W+18+(i%3)*50+22)+'" y="'+(30+Math.floor(i/3)*44+50)+'" text-anchor="middle">'+tk.busy+'min</text>':''));
 return h}
function render(){
 if(!G)return;
 $('k-money').textContent=R$(G.money);$('k-money').className='num'+(G.money<0?' low':'');
 $('k-day').textContent='Dia '+G.day;const mm=360+(G.t%DAY)*12;$('k-clock').textContent=String(Math.floor(mm/60)).padStart(2,'0')+':'+String(mm%60).padStart(2,'0');
 $('k-rep').textContent=Math.round(G.rep);const gp=Math.max(0,Math.min(100,G.money/GOAL*100));$('k-goal').textContent=Math.round(gp)+'%';$('k-bar').style.width=gp+'%';
 $('snd').setAttribute('aria-pressed',String(SND));
 [0,1,3,8].forEach(s=>$('sp'+s).setAttribute('aria-pressed',String(G.speed===s)));
 let h='';
 h+=sec('01','Recebimento','DOCAS '+G.docks,Object.entries(MAT).map(([k,m])=>'<div class="row"><span>'+m.n+' <b class="num'+(G.raw[k]<20?' low':'')+'">'+G.raw[k]+'</b></span>'+btn('buy',k,'+'+m.lot+' · '+R$(m.lot*m.p),G.money<m.lot*m.p,'sm')+'</div>').join('')+
  '<div class="mut">A caminho: '+G.dl.length+' · Fila na doca: '+G.queue.length+' · Descarregando: '+G.unl.length+'</div>',upf('dock','Docas'));
 h+=sec('02','Injeção plástica','CARCAÇAS',G.inj.map((m,i)=>{const p=m.cur&&PR[m.cur];
  const lab=m.broken?(m.rep>0?'Em reparo':'Quebrada'):m.setup>0?'Troca de molde':m.st==='nomat'?'Falta resina':m.st==='idle'?'Sem pedido':p.n+' ('+m.prog+'/'+p.inj+')';
  return '<div class="mc '+(m.broken?'broken':m.st==='run'?'run':m.st==='setup'||m.st==='nomat'?'setup':'')+'"><div class="row"><b class="mcn">'+ic('inj',24)+'Injetora '+(i+1)+'</b>'+btn('cycle',i,'Molde: '+(m.p==='auto'?'automático':PR[m.p].n),0,'sm')+'</div><div class="st"><i class="led"></i>'+lab+(m.broken&&!m.rep?' '+btn('repair',i,'Chamar manutenção · R$ 150',G.money<150,'sm'):'')+'</div><div class="bar"><i style="width:'+(p&&m.prog?100*m.prog/p.inj:0)+'%"></i></div></div>'}).join('')+'<div class="mut">Carcaças prontas</div>'+chips(G.hous),upf('inj','Injetoras'));
 h+=lineSec('col','03','Colagem','Carcaças','Espelhos colados');
 h+=lineSec('mon','04','Montagem','Espelhos colados','Retrovisores montados');
 h+=lineSec('emb','05','Embalagem','Montados','Embalados');
 h+=sec('06','Expedição','PRODUTO ACABADO','<div class="mut">Embalados e prontos para despacho</div>'+chips(G.pack)+'<div class="mut">Use "Despachar" na carteira de pedidos.</div>','<span>Peças enviadas: <b class="num">'+G.sent+'</b></span>');
 h+=sec('07','Logística','FROTA',G.trucks.map((tk,i)=>'<div class="mc '+(tk.busy?'run':'')+'"><div class="st"><i class="led"></i>Caminhão '+(i+1)+': '+(tk.busy?'em rota, '+tk.busy+' min · '+tk.ord.client:'livre na doca')+'</div></div>').join(''),upf('truck','Frota'));
 $('floor').innerHTML=h;$('plant').innerHTML=plant();
 $('offers').innerHTML=G.offers.length?G.offers.map(o=>'<div class="ord"><h3>'+ic(o.p,26)+o.qty+' × '+PR[o.p].n+'</h3><div class="mut">'+o.client+' · prazo '+(o.win/DAY).toFixed(1)+' d · expira em '+(o.exp-G.t)+' min</div><div class="row"><b class="num">'+R$(o.pay)+'</b><span>'+btn('accept',o.id,'Aceitar',0,'sm pri')+' '+btn('decline',o.id,'Recusar',0,'sm')+'</span></div></div>').join(''):'<span class="mut">Nenhuma proposta no momento.</span>';
 const free=G.trucks.some(t=>t.busy===0);
 $('orders').innerHTML=G.orders.length?G.orders.map(o=>{const left=o.due-G.t,have=Math.min(G.pack[o.p],o.qty);
  return '<div class="ord"><h3>'+ic(o.p,26)+o.qty+' × '+PR[o.p].n+' · '+o.client+'</h3><div class="mut">'+(o.state==='transit'?'Em transporte':'Prazo: '+(left/DAY).toFixed(1)+' d')+' · prontos '+have+'/'+o.qty+'</div><div class="row"><b class="num">'+R$(o.pay)+'</b>'+(o.state==='open'?btn('ship',o.id,'Despachar',!(free&&G.pack[o.p]>=o.qty),'sm pri'):'<span class="mut">a caminho</span>')+'</div></div>'}).join(''):'<span class="mut">Aceite uma proposta para começar a produzir.</span>';
 $('log').innerHTML=G.log.map(l=>'<p>'+l+'</p>').join('')}
G=load()||fresh();G.speed=0;render();(G.t>0?(()=>{$('modal').hidden=true;setSpeed(1)})():modal('intro'));

