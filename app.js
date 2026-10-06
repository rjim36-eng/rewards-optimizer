const defaults={cards:[
{name:'Amex Delta Reserve',annualFee:650,rates:{other:1,travel:1,dining:1,grocery:1,costco:0},unit:'Delta miles'},
{name:'Amex Gold',rates:{other:1,travel:3,dining:4,grocery:4,costco:0},unit:'MR points'},
{name:'Bilt Obsidian',annualFee:95,rates:{other:1,dining:3,travel:2,grocery:1,costco:1},unit:'Bilt points'},
{name:'Wells Fargo Autograph',annualFee:0,rates:{other:1,dining:3,travel:3,grocery:1,costco:1},unit:'points'},
{name:'Wells Fargo Active Cash',annualFee:0,rates:{other:2,dining:2,travel:2,grocery:2,costco:2},unit:'% cash back'},
{name:'Costco Visa',annualFee:0,rates:{other:1,dining:3,travel:3,grocery:1,costco:2},unit:'% rewards'}],
memberships:[{name:'Rakuten',detail:'Shopping portal • earning preference configurable'},{name:'Bilt Rewards',detail:'Rent + partner rewards'},{name:'Delta SkyMiles',detail:'Airline rewards & Medallion tracking'},{name:'Costco',detail:'Warehouse membership'}]};
let data=JSON.parse(localStorage.getItem('rewardsData')||'null')||defaults;const save=()=>localStorage.setItem('rewardsData',JSON.stringify(data));
function render(){cards.innerHTML=data.cards.map(c=>`<div class=card><strong>${c.name}</strong><div class=muted>${c.unit}${c.annualFee?` • $${c.annualFee}/yr`:''}</div><div>${Object.entries(c.rates).filter(x=>x[1]>1).map(([k,v])=>`<span class=tag>${k} ${v}×</span>`).join('')||'<span class=tag>Base rewards</span>'}</div></div>`).join('');memberships.innerHTML=data.memberships.map(m=>`<div class=card><strong>${m.name}</strong><div class=muted>${m.detail}</div></div>`).join('')};render();save();
optimize.onclick=()=>{let a=+amount.value||0,c=category.value,m=merchant.value||'this purchase';let eligible=data.cards.filter(x=>x.rates[c]>0);let best=eligible.sort((x,y)=>y.rates[c]-x.rates[c])[0];if(!best)return;let rate=best.rates[c];result.innerHTML=`<strong>Use ${best.name}</strong><br>${rate}× earning rate for ${c}. ${a?`On $${a.toFixed(2)}, that's about ${(a*rate).toFixed(0)} reward units before portal/offer bonuses.`:''}<div class=muted style='margin-top:8px'>For ${m}. V1 uses your stored card rules. Rakuten and card-linked offer stacking will be added next.</div>`};
reset.onclick=()=>{if(confirm('Reset app data?')){localStorage.removeItem('rewardsData');location.reload()}};document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.go)?.scrollIntoView({behavior:'smooth'}));navopt.onclick=()=>document.querySelector('.hero').scrollIntoView({behavior:'smooth'});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
