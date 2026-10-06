
const defaults = {
 valuations:{cash:1,mr:1.5,bilt:1.5,delta:1.2,wf:1.0},
 cards:[
 {name:'Amex Delta Reserve',fee:650,type:'delta',label:'Delta miles',
  rules:{delta:[3,'Direct Delta purchases'],other:[1,'All other eligible purchases']},
  wallet:['Delta purchases 3×','Everything else 1×']},
 {name:'Amex Gold',fee:325,type:'mr',label:'MR points',
  rules:{dining:[4,'Restaurants worldwide • annual cap applies'],grocery:[4,'U.S. supermarkets • annual cap applies'],
   flight_direct:[3,'Flights booked directly with airlines'],flight_amex:[3,'Flights via Amex Travel'],
   hotel_amex_prepaid:[5,'Prepaid hotels via Amex Travel'],rental_amex_prepaid:[2,'Prepaid car rentals via Amex Travel'],
   cruise_amex:[2,'Cruises booked & paid via Amex Travel'],other:[1,'Other eligible purchases']},
  wallet:['Restaurants 4×','U.S. supermarkets 4×','Flights 3× • airline/Amex Travel','Prepaid Amex Travel hotels 5×','Amex Travel cars/cruises 2×']},
 {name:'Bilt Obsidian',fee:95,type:'bilt',label:'Bilt points',
  rules:{dining:[3,'If Dining is your selected 3× category'],grocery:[3,'If Grocery is your selected 3× category'],
   flight_bilt:[3,'Flights through Bilt Travel'],hotel_bilt:[4,'Hotels through Bilt Travel'],
   transit:[2,'Other eligible travel'],flight_direct:[2,'Other eligible travel'],hotel_direct:[2,'Other eligible travel'],
   rental_direct:[2,'Other eligible travel'],travel_agency:[2,'Other eligible travel'],other:[1,'Other eligible purchases']},
  wallet:['Dining OR grocery 3×*','Bilt Travel flights 3×','Bilt Travel hotels 4×','Other travel 2×','*Selected bonus category']},
 {name:'Wells Fargo Autograph',fee:0,type:'wf',label:'Wells Fargo points',
  rules:{dining:[3,'Restaurants'],flight_direct:[3,'Eligible travel'],flight_amex:[3,'Eligible travel'],
   flight_bilt:[3,'Eligible travel'],hotel_direct:[3,'Eligible travel'],hotel_amex_prepaid:[3,'Eligible travel'],
   hotel_bilt:[3,'Eligible travel'],rental_direct:[3,'Eligible travel'],rental_amex_prepaid:[3,'Eligible travel'],
   cruise_amex:[3,'Eligible travel'],travel_agency:[3,'Eligible travel'],transit:[3,'Transit'],
   gas_costco:[3,'Gas station category if merchant codes as eligible gas'],gas_other:[3,'Gas / charging'],
   streaming:[3,'Eligible streaming'],phone:[3,'Phone plans'],other:[1,'Other purchases']},
  wallet:['Travel 3× • broad eligible travel','Transit 3×','Dining 3×','Gas 3×','Streaming 3×','Phone plans 3×']},
 {name:'Wells Fargo Active Cash',fee:0,type:'cash',label:'cash back',
  rules:{other:[2,'2% cash rewards on purchases']},wallet:['All purchases 2%']},
 {name:'Costco Visa',fee:0,type:'cash',label:'Costco cash back',
  rules:{gas_costco:[5,'Costco gas • combined annual gas/EV cap applies'],gas_other:[4,'Eligible gas/EV • combined annual cap applies'],
   dining:[3,'Restaurants'],flight_direct:[3,'Eligible travel'],hotel_direct:[3,'Eligible travel'],
   rental_direct:[3,'Eligible travel'],travel_agency:[3,'Eligible travel'],cruise_amex:[3,'Eligible travel'],
   costco:[2,'Costco and Costco.com'],other:[1,'Other purchases']},
  wallet:['Costco gas 5%*','Other eligible gas/EV 4%*','Dining 3%','Eligible travel 3%','Costco 2%','Other 1%','*Combined $7k annual cap']}
 ],
 memberships:[
  {name:'Rakuten',detail:'Portal rewards • live/manual offer stacking coming next'},
  {name:'Bilt Rewards',detail:'Housing + partner rewards'},
  {name:'Delta SkyMiles',detail:'Airline rewards & Medallion tracking'},
  {name:'Costco',detail:'Warehouse membership'}
 ]
};

let data=JSON.parse(localStorage.getItem('rewardsDataV3')||'null')||structuredClone(defaults);
const save=()=>localStorage.setItem('rewardsDataV3',JSON.stringify(data));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const fallback=(card,key)=>card.rules[key]||card.rules.other||[0,'Not a bonus category'];
function calc(card,amount,key){
 const [rate,note]=fallback(card,key);
 if(card.type==='cash') return {rate,note,raw:money(amount*rate/100),value:amount*rate/100,rateText:`${rate}% cash back`};
 const pts=amount*rate, cpp=data.valuations[card.type]||1;
 return {rate,note,raw:`${pts.toLocaleString(undefined,{maximumFractionDigits:0})} ${card.label}`,value:pts*cpp/100,rateText:`${rate}× ${card.label}`};
}
function render(){
 cards.innerHTML=data.cards.map(c=>`<div class="card"><strong>${c.name}</strong>
 <div class="muted">${c.label}${c.fee?` • $${c.fee}/yr`:''}</div>
 <div>${c.wallet.map(x=>`<span class="tag">${x}</span>`).join('')}</div></div>`).join('');
 memberships.innerHTML=data.memberships.map(m=>`<div class="card"><strong>${m.name}</strong><div class="muted">${m.detail}</div></div>`).join('');
}
render();save();
optimize.onclick=()=>{
 const a=+amount.value||0,key=category.value,m=merchant.value||'this purchase';
 if(!a){result.innerHTML='<strong>Enter a purchase amount.</strong>';return}
 const ranked=data.cards.map(card=>({card,...calc(card,a,key)})).filter(x=>x.rate>0).sort((a,b)=>b.value-a.value);
 const b=ranked[0], runners=ranked.slice(1,4);
 result.innerHTML=`<strong>Best card: ${b.card.name}</strong><br>${b.rateText}<br>
 <b>Earn: ${b.raw}</b><br>Estimated value: <b>${money(b.value)}</b>
 <div class="muted" style="margin-top:6px">${b.note}</div>
 <div style="margin-top:12px"><strong>Next best</strong></div>
 ${runners.map(x=>`<div class="muted">${x.card.name}: ${x.rateText} ≈ ${money(x.value)}</div>`).join('')}
 <div class="muted" style="margin-top:10px">For ${m}. Ranking uses your point valuations. Portal/card-linked offers are not included yet.</div>`;
};
reset.onclick=()=>{if(confirm('Reset app data?')){localStorage.removeItem('rewardsDataV3');location.reload()}};
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.go)?.scrollIntoView({behavior:'smooth'}));
navopt.onclick=()=>document.querySelector('.hero').scrollIntoView({behavior:'smooth'});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
