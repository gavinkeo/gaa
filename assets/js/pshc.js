const { games, groupTeams } = window.PSHC_DATA;
function scoreVal(s){if(!s)return null;const [g,p]=s.split('-').map(Number);return g*3+p}function goals(s){return s?Number(s.split('-')[0]):0}
function groupTable(g){const rows=Object.fromEntries(groupTeams[g].map(t=>[t,{team:t,p:0,w:0,d:0,l:0,f:0,a:0,gf:0}]));
 games.filter(x=>x.g===g&&x.status==='result').forEach(m=>{const h=scoreVal(m.hs),a=scoreVal(m.as),rh=rows[m.home],ra=rows[m.away];rh.p++;ra.p++;rh.f+=h;rh.a+=a;ra.f+=a;ra.a+=h;rh.gf+=goals(m.hs);ra.gf+=goals(m.as);if(h>a){rh.w++;ra.l++}else if(a>h){ra.w++;rh.l++}else{rh.d++;ra.d++}});
 Object.values(rows).forEach(r=>{r.pts=r.w*2+r.d;r.diff=r.f-r.a});
 const arr=Object.values(rows); const byPts={};arr.forEach(r=>(byPts[r.pts]??=[]).push(r));
 return arr.sort((a,b)=>{if(b.pts!==a.pts)return b.pts-a.pts;const tied=byPts[a.pts];if(tied.length===2){const m=games.find(x=>x.g===g&&x.status==='result'&&((x.home===a.team&&x.away===b.team)||(x.home===b.team&&x.away===a.team)));if(m){const hv=scoreVal(m.hs),av=scoreVal(m.as);if(hv!==av){const winner=hv>av?m.home:m.away;return winner===a.team?-1:1}}}return (b.diff-a.diff)||(b.f-a.f)||(b.gf-a.gf)||a.team.localeCompare(b.team)});
}
function liveSeeds(){const tables=[1,2,3].map(groupTable);const winners=tables.map(t=>t[0]).sort(crossCmp), runners=tables.map(t=>t[1]).sort(crossCmp);return [...winners,...runners]}function crossCmp(a,b){return (b.pts-a.pts)||(b.diff-a.diff)||(b.f-a.f)||(b.gf-a.gf)}
function renderGroups(){
 const el=document.getElementById('groups');el.innerHTML='';
 [1,2,3].forEach(g=>{
  const t=groupTable(g);
  const groupGames=games.filter(m=>m.g===g).sort((a,b)=>a.round-b.round||a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
  const rounds=[1,2,3].map(round=>{
   const matches=groupGames.filter(m=>m.round===round);
   const dateLabel=matches.length?[...new Set(matches.map(m=>fmtDate(m.date).full))].join(' · '):'';
   const status=matches.every(m=>m.status==='result')?'complete':'upcoming';
   return `<div class="group-round ${status}">
    <div class="group-round-head"><strong>Round ${round}</strong><span>${dateLabel}</span></div>
    ${matches.map(m=>{
      const h=m.status==='result'?scoreVal(m.hs):null,a=m.status==='result'?scoreVal(m.as):null;
      const hw=m.status==='result'&&h>a,aw=m.status==='result'&&a>h;
      return `<div class="group-game">
       <div class="group-game-meta"><span>${m.time}</span><span>${m.venue}</span></div>
       <div class="group-game-team ${hw?'winner':''}"><span>${m.home}</span><strong>${m.status==='result'?m.hs:'—'}</strong></div>
       <div class="group-game-team ${aw?'winner':''}"><span>${m.away}</span><strong>${m.status==='result'?m.as:'—'}</strong></div>
      </div>`;
    }).join('')}
   </div>`;
  }).join('');
  const card=document.createElement('article');
  card.className='group-card';card.dataset.group=g;
  card.innerHTML=`<div class="group-title"><strong>Group ${g}</strong><span>2 of 3 rounds played</span></div>
   <div class="table-wrap"><table><thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>F</th><th>A</th><th>+/-</th><th>Pts</th></tr></thead><tbody>${t.map((r,i)=>`<tr><td class="teamcell"><span class="pos ${i<2?'q':i===3?'r':''}">${i+1}</span>${r.team}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.f}</td><td>${r.a}</td><td class="diff ${r.diff>0?'posv':r.diff<0?'negv':''}">${r.diff>0?'+':''}${r.diff}</td><td class="pts">${r.pts}</td></tr>`).join('')}</tbody></table></div>
   <div class="group-schedule"><div class="group-schedule-label">Fixtures &amp; results</div>${rounds}</div>`;
  el.appendChild(card);
 });
}
function fmtDate(iso){const d=new Date(iso+'T12:00:00');return {day:d.toLocaleDateString('en-IE',{day:'numeric'}),mon:d.toLocaleDateString('en-IE',{month:'short'}),full:d.toLocaleDateString('en-IE',{weekday:'short',day:'numeric',month:'short'})}}
function renderSeeds(){const s=liveSeeds(),el=document.getElementById('seedList');el.innerHTML=s.map((r,i)=>`<div class="seed-row"><div class="rank">${i+1}</div><div class="seed-team">${r.team}</div><div class="seed-role">${i<3?'group winner':'runner-up'} · ${r.pts} pts · ${r.diff>=0?'+':''}${r.diff}</div><div class="${i===0?'bye':''}">${i===0?'SF BYE':''}</div></div>`).join('')}
function teamGroup(team){return Number(Object.keys(groupTeams).find(g=>groupTeams[g].includes(team)))}
function quarterFinalProjection(s){
 const repeatA=teamGroup(s[1].team)===teamGroup(s[4].team); // 2 v 5
 const repeatB=teamGroup(s[2].team)===teamGroup(s[3].team); // 3 v 4
 const flipped=repeatA||repeatB;
 return {
  flipped,repeatA,repeatB,
  a:flipped?[s[1],s[3]]:[s[1],s[4]],
  b:flipped?[s[2],s[4]]:[s[2],s[3]],
  aSeeds:flipped?'2 v 4':'2 v 5',bSeeds:flipped?'3 v 5':'3 v 4'
 };
}
function oneStepFlipScenarios(s){
 const out=[];
 [1,2,3].forEach(g=>{
  const winnerIndex=s.findIndex((r,i)=>i<3&&teamGroup(r.team)===g);
  const runnerIndex=s.findIndex((r,i)=>i>=3&&teamGroup(r.team)===g);
  if(winnerIndex<0||runnerIndex<0)return;
  const winnerSeed=winnerIndex+1,runnerSeed=runnerIndex+1;
  const targetRunner=winnerSeed===2?5:winnerSeed===3?4:null;
  if(!targetRunner||runnerSeed===targetRunner)return;
  const hypo=[...s];
  const targetIndex=targetRunner-1;
  [hypo[runnerIndex],hypo[targetIndex]]=[hypo[targetIndex],hypo[runnerIndex]];
  const q=quarterFinalProjection(hypo);
  if(!q.flipped)return;
  out.push(`<div class="scenario"><strong>If ${s[runnerIndex].team} finish #${targetRunner}</strong> while ${s[winnerIndex].team} remain #${winnerSeed}, that creates a Group ${g} rematch. The club QFs would flip to <strong>${q.a[0].team} v ${q.a[1].team}</strong> and <strong>${q.b[0].team} v ${q.b[1].team}</strong>.</div>`);
 });
 return out;
}
function relegationProjection(){
 const bottoms=[1,2,3].map(g=>({...groupTable(g)[3],group:g})).sort((a,b)=>(a.pts-b.pts)||(a.diff-b.diff));
 const boundaryTie=bottoms[1]&&bottoms[2]&&bottoms[1].pts===bottoms[2].pts&&bottoms[1].diff===bottoms[2].diff;
 return {bottoms,boundaryTie};
}
function renderKnockout(){
 const s=liveSeeds(),q=quarterFinalProjection(s),rel=relegationProjection(),bottoms=rel.bottoms;
 const repeatTeams=[];
 if(q.repeatA)repeatTeams.push(`${s[1].team} v ${s[4].team}`);
 if(q.repeatB)repeatTeams.push(`${s[2].team} v ${s[3].team}`);
 const scenarios=oneStepFlipScenarios(s);
 const ruleBox=q.flipped
  ? `<div class="rule-alert active"><div class="rule-kicker">Current projection triggers QF flip <span class="rule-pill active">Official rule</span></div><div class="rule-text">${repeatTeams.join(' and ')} would repeat a group-stage fixture if the groups ended with today’s seed order. Cork’s rule therefore changes <strong>both</strong> projected club quarter-finals to <strong>${q.a[0].team} v ${q.a[1].team}</strong> and <strong>${q.b[0].team} v ${q.b[1].team}</strong>. <span class="unresolved">Round 3 can still change the seed order; if neither nominal 2 v 5 nor 3 v 4 is a same-group rematch, the bracket reverts to the normal formula.</span></div></div>`
  : `<div class="rule-alert"><div class="rule-kicker">Flip watch <span class="rule-pill">Official rule</span></div><div class="rule-text">No repeat pairing in the current projection. If either nominal 2 v 5 or 3 v 4 contains teams from the same group, <strong>both</strong> club quarter-finals automatically switch to 2 v 4 and 3 v 5.</div>${scenarios.join('')}</div>`;
 document.getElementById('knockoutGrid').innerHTML=`
<div class="round-col"><h3>Quarter-finals · 18–20 Sept</h3>
<div class="slot"><div class="slot-head"><span>QF A</span><span>${q.aSeeds}</span></div><div class="slot-team">#${q.flipped?2:2} ${q.a[0].team}</div><div class="slot-team">#${q.flipped?4:5} ${q.a[1].team}</div><div class="slot-note">${q.flipped?'Adjusted automatically under the repeat-pairing rule.':'Provisional pairing if the groups ended today.'}</div></div>
<div class="slot"><div class="slot-head"><span>QF B</span><span>${q.bSeeds}</span></div><div class="slot-team">#${q.flipped?3:3} ${q.b[0].team}</div><div class="slot-team">#${q.flipped?5:4} ${q.b[1].team}</div><div class="slot-note">${q.flipped?'Adjusted automatically under the repeat-pairing rule.':'Provisional pairing if the groups ended today.'}</div></div>
${ruleBox}
<div class="slot"><div class="slot-head"><span>QF C</span><span>6 v Div/Col</span></div><div class="slot-team">#6 ${s[5].team}</div><div class="slot-team">Imokilly / Seandún</div><div class="slot-note">Denis O’Riordan Cup winner enters the PSHC here.</div></div>
<div class="slot relegation"><div class="slot-head"><span>Relegation</span><span>18–20 Sept</span></div><div class="slot-team">${bottoms[0].team}</div><div class="slot-team">${bottoms[1].team}</div><div class="slot-note">Current two lowest group-bottom teams, ranked only by championship points then scoring difference.${rel.boundaryTie?' <span class="unresolved">Published PSHC rules do not state a further separator for the current tie.</span>':''}</div></div></div>
<div class="round-col"><h3>Semi-finals · October</h3><div class="slot"><div class="slot-head"><span>Semi-final 1</span><span>1 v QF B</span></div><div class="slot-team">#1 ${s[0].team}</div><div class="slot-team">Winner QF B</div><div class="slot-note">Default bracket. If this creates a repeat group pairing, Cork GAA adjusts the semi-final pairings.</div></div><div class="slot"><div class="slot-head"><span>Semi-final 2</span><span>QF A v QF C</span></div><div class="slot-team">Winner QF A</div><div class="slot-team">Winner QF C</div><div class="slot-note">Default bracket only; repeat group pairings are avoided where necessary.</div></div><div class="rule-alert"><div class="rule-kicker">Semi-final rule</div><div class="rule-text">The regulations require repeat group pairings to be avoided, but do not prescribe a fixed numerical swap. These remain provisional until the quarter-finals are complete.</div></div></div>
<div class="round-col"><h3>County final · October</h3><div class="slot"><div class="slot-head"><span>Seán Óg Murphy Cup</span><span>TBC</span></div><div class="slot-team">Winner Semi-final 1</div><div class="slot-team">Winner Semi-final 2</div><div class="slot-note">Final date and throw-in time to be confirmed.</div></div></div>`
}
renderGroups();renderSeeds();renderKnockout();
document.querySelectorAll('#groupTabs .tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('#groupTabs .tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');document.querySelectorAll('.group-card').forEach(c=>c.classList.toggle('hide',b.dataset.g!=='all'&&c.dataset.group!==b.dataset.g))});

