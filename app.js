
const defaults = {
  valuations: { cash: 1, mr: 1.5, bilt: 1.5, delta: 1.2, wf: 1.0 },
  cards: [
    {name:'Amex Delta Reserve', annualFee:650, rewardType:'delta', rewardLabel:'Delta miles',
      rates:{other:1,travel:1,dining:1,grocery:1,costco:0}},
    {name:'Amex Gold', annualFee:325, rewardType:'mr', rewardLabel:'MR points',
      rates:{other:1,travel:3,dining:4,grocery:4,costco:0}},
    {name:'Bilt Obsidian', annualFee:95, rewardType:'bilt', rewardLabel:'Bilt points',
      rates:{other:1,dining:3,travel:2,grocery:1,costco:1}},
    {name:'Wells Fargo Autograph', annualFee:0, rewardType:'wf', rewardLabel:'Wells Fargo points',
      rates:{other:1,dining:3,travel:3,grocery:1,costco:1}},
    {name:'Wells Fargo Active Cash', annualFee:0, rewardType:'cash', rewardLabel:'cash back',
      rates:{other:2,dining:2,travel:2,grocery:2,costco:2}},
    {name:'Costco Visa', annualFee:0, rewardType:'cash', rewardLabel:'Costco cash back',
      rates:{other:1,dining:3,travel:3,grocery:1,costco:2}}
  ],
  memberships: [
    {name:'Rakuten',detail:'Shopping portal • earning preference configurable'},
    {name:'Bilt Rewards',detail:'Rent + partner rewards'},
    {name:'Delta SkyMiles',detail:'Airline rewards & Medallion tracking'},
    {name:'Costco',detail:'Warehouse membership'}
  ]
};

let stored = JSON.parse(localStorage.getItem('rewardsData') || 'null');
let data = stored || structuredClone(defaults);

// Migrate V1 data without deleting the user's local data.
data.valuations = {...defaults.valuations, ...(data.valuations || {})};
data.cards = defaults.cards.map(def => {
  const old = (data.cards || []).find(c => c.name === def.name);
  return {...def, ...(old || {}), rewardType:def.rewardType, rewardLabel:def.rewardLabel};
});
data.memberships = data.memberships || defaults.memberships;

const save = () => localStorage.setItem('rewardsData', JSON.stringify(data));
const cents = type => data.valuations[type] ?? 1;
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);

function rawReward(card, amount, category) {
  const rate = card.rates[category] || 0;
  if (card.rewardType === 'cash') {
    return {
      raw: money(amount * rate / 100),
      value: amount * rate / 100,
      rateText: `${rate}% cash back`
    };
  }
  const points = amount * rate;
  return {
    raw: `${points.toLocaleString(undefined,{maximumFractionDigits:0})} ${card.rewardLabel}`,
    value: points * cents(card.rewardType) / 100,
    rateText: `${rate}× ${card.rewardLabel}`
  };
}

function render() {
  cards.innerHTML = data.cards.map(c => {
    const tags = Object.entries(c.rates).filter(([,v])=>v>1).map(([k,v]) =>
      `<span class="tag">${k} ${c.rewardType==='cash' ? v+'%' : v+'×'}</span>`).join('');
    return `<div class="card"><strong>${c.name}</strong>
      <div class="muted">${c.rewardLabel}${c.annualFee ? ` • $${c.annualFee}/yr` : ''}</div>
      <div>${tags || '<span class="tag">Base rewards</span>'}</div></div>`;
  }).join('');

  memberships.innerHTML = data.memberships.map(m =>
    `<div class="card"><strong>${m.name}</strong><div class="muted">${m.detail}</div></div>`
  ).join('');
}
render(); save();

optimize.onclick = () => {
  const a = +amount.value || 0;
  const c = category.value;
  const m = merchant.value || 'this purchase';
  if (!a) {
    result.innerHTML = `<strong>Enter a purchase amount.</strong>`;
    return;
  }

  const ranked = data.cards
    .filter(card => (card.rates[c] || 0) > 0)
    .map(card => ({card, ...rawReward(card,a,c)}))
    .sort((x,y)=>y.value-x.value);

  if (!ranked.length) return;
  const best = ranked[0];

  result.innerHTML = `<strong>Use ${best.card.name}</strong><br>
    ${best.rateText}<br>
    <b>You'll earn: ${best.raw}</b><br>
    Estimated reward value: <b>${money(best.value)}</b>
    <div class="muted" style="margin-top:8px">
      Compared using your point-value assumptions: MR ${data.valuations.mr}¢,
      Bilt ${data.valuations.bilt}¢, Delta ${data.valuations.delta}¢,
      Wells Fargo ${data.valuations.wf}¢ per point. Cash back is valued at face value.
      Rakuten and card-linked offers are not included yet.
    </div>
    <div class="muted" style="margin-top:8px">For ${m}.</div>`;
};

reset.onclick = () => {
  if (confirm('Reset app data?')) {
    localStorage.removeItem('rewardsData');
    location.reload();
  }
};
document.querySelectorAll('[data-go]').forEach(b =>
  b.onclick=()=>document.getElementById(b.dataset.go)?.scrollIntoView({behavior:'smooth'})
);
navopt.onclick=()=>document.querySelector('.hero').scrollIntoView({behavior:'smooth'});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
