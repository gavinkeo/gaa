const cfg = window.CHAMP_DATA;
const { games, groupTeams } = cfg;

function scoreVal(s){
  if(!s) return null;
  const [g,p]=s.split('-').map(Number);
  return g*3+p;
}
function goals(s){ return s ? Number(s.split('-')[0]) : 0; }
function crossCmp(a,b){ return (b.pts-a.pts)||(b.diff-a.diff)||(b.f-a.f)||(b.gf-a.gf)||a.team.localeCompare(b.team); }

function groupTable(g){
  const rows=Object.fromEntries(groupTeams[g].map(t=>[t,{team:t,p:0,w:0,d:0,l:0,f:0,a:0,gf:0,pts:0,diff:0}]));
  const results=games.filter(x=>x.g===g&&x.status==='result');
  results.forEach(m=>{
    const h=scoreVal(m.hs),a=scoreVal(m.as),rh=rows[m.home],ra=rows[m.away];
    rh.p++;ra.p++;rh.f+=h;rh.a+=a;ra.f+=a;ra.a+=h;rh.gf+=goals(m.hs);ra.gf+=goals(m.as);
    if(h>a){rh.w++;ra.l++;}else if(a>h){ra.w++;rh.l++;}else{rh.d++;ra.d++;}
  });
  Object.values(rows).forEach(r=>{r.pts=r.w*2+r.d;r.diff=r.f-r.a;});
  const arr=Object.values(rows),byPts={};arr.forEach(r=>(byPts[r.pts]??=[]).push(r));
  return arr.sort((a,b)=>{
    if(b.pts!==a.pts)return b.pts-a.pts;
    const tied=byPts[a.pts];
    if(tied.length===2){
      const m=results.find(x=>((x.home===a.team&&x.away===b.team)||(x.home===b.team&&x.away===a.team)));
      if(m){const hv=scoreVal(m.hs),av=scoreVal(m.as);if(hv!==av){const winner=hv>av?m.home:m.away;return winner===a.team?-1:1;}}
    }
    return (b.diff-a.diff)||(b.f-a.f)||(b.gf-a.gf)||a.team.localeCompare(b.team);
  });
}

function liveSeeds(){
  const tables=[1,2,3].map(groupTable);
  const winners=tables.map(t=>t[0]).sort(crossCmp);
  const runners=tables.map(t=>t[1]).sort(crossCmp);
  return [...winners,...runners];
}
function teamGroup(team){return Number(Object.keys(groupTeams).find(g=>groupTeams[g].includes(team)));}
function sameGroup(a,b){return teamGroup(a.team)===teamGroup(b.team);}
function fmtDate(iso){const d=new Date(iso+'T12:00:00');return {full:d.toLocaleDateString('en-IE',{weekday:'short',day:'numeric',month:'short'})};}

function renderGroups(){
  const el=document.getElementById('groups');el.innerHTML='';
  [1,2,3].forEach(g=>{
    const t=groupTable(g);
    const groupGames=games.filter(m=>m.g===g).sort((a,b)=>a.round-b.round||a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
    const completed=groupGames.filter(m=>m.status==='result').length;
    const rounds=[1,2,3].map(round=>{
      const matches=groupGames.filter(m=>m.round===round);
      const dateLabel=matches.length?[...new Set(matches.map(m=>fmtDate(m.date).full))].join(' · '):'';
      const allDone=matches.length&&matches.every(m=>m.status==='result');
      const mixed=matches.some(m=>m.status==='result')&&matches.some(m=>m.status!=='result');
      const status=allDone?'complete':'upcoming';
      return `<div class="group-round ${status}">
        <div class="group-round-head"><strong>Round ${round}</strong><span>${dateLabel}${mixed?' · partial':''}</span></div>
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
    const card=document.createElement('article');card.className='group-card';card.dataset.group=g;
    card.innerHTML=`<div class="group-title"><strong>Group ${g}</strong><span>${completed} of 6 group games complete</span></div>
      <div class="table-wrap"><table><thead><tr><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>F</th><th>A</th><th>+/-</th><th>Pts</th></tr></thead><tbody>
      ${t.map((r,i)=>`<tr><td class="teamcell"><span class="pos ${i<2?'q':i===3?'r':''}">${i+1}</span>${r.team}</td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.f}</td><td>${r.a}</td><td class="diff ${r.diff>0?'posv':r.diff<0?'negv':''}">${r.diff>0?'+':''}${r.diff}</td><td class="pts">${r.pts}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="group-schedule"><div class="group-schedule-label">Fixtures &amp; results</div>${rounds}</div>`;
    el.appendChild(card);
  });
}

function renderSeeds(){
  const s=liveSeeds(),el=document.getElementById('seedList');
  const byeCount=cfg.format==='seniorA'?2:1;
  el.innerHTML=s.map((r,i)=>`<div class="seed-row"><div class="rank">${i+1}</div><div class="seed-team">${r.team}</div><div class="seed-role">${i<3?'group winner':'runner-up'} · ${r.pts} pts · ${r.diff>=0?'+':''}${r.diff}</div><div class="${i<byeCount?'bye':''}">${i<byeCount?'SF BYE':''}</div></div>`).join('');
  const meta=document.getElementById('seedMeta');
  if(meta)meta.textContent=cfg.projectionNote?'live projection · incomplete group schedule':'live projection';
}

function premierProjection(s){
  const repeatA=sameGroup(s[1],s[4]); // 2 v 5
  const repeatB=sameGroup(s[2],s[3]); // 3 v 4
  const flipped=repeatA||repeatB;
  return {
    flipped,repeatA,repeatB,
    a:flipped?[s[1],s[3]]:[s[1],s[4]],
    b:flipped?[s[2],s[4]]:[s[2],s[3]],
    aNums:flipped?[2,4]:[2,5],bNums:flipped?[3,5]:[3,4],
    aSeeds:flipped?'2 v 4':'2 v 5',bSeeds:flipped?'3 v 5':'3 v 4'
  };
}
function seniorAProjection(s){
  const repeatA=sameGroup(s[2],s[5]); // 3 v 6
  const flipped=repeatA;
  return {
    flipped,repeatA,repeatB:false,
    a:flipped?[s[2],s[4]]:[s[2],s[5]],
    b:flipped?[s[3],s[5]]:[s[3],s[4]],
    aNums:flipped?[3,5]:[3,6],bNums:flipped?[4,6]:[4,5],
    aSeeds:flipped?'3 v 5':'3 v 6',bSeeds:flipped?'4 v 6':'4 v 5'
  };
}
function qfProjection(s){return cfg.format==='seniorA'?seniorAProjection(s):premierProjection(s);}

function flipWatch(s,q){
  if(q.flipped){
    const repeats=[];
    if(cfg.format==='seniorA')repeats.push(`${s[2].team} v ${s[5].team}`);
    else{
      if(q.repeatA)repeats.push(`${s[1].team} v ${s[4].team}`);
      if(q.repeatB)repeats.push(`${s[2].team} v ${s[3].team}`);
    }
    const normal=cfg.format==='seniorA'?'3 v 6 and 4 v 5':'2 v 5 and 3 v 4';
    return `<div class="rule-alert active"><div class="rule-kicker">Current projection triggers QF flip <span class="rule-pill active">Official rule</span></div><div class="rule-text"><strong>${repeats.join(' and ')}</strong> would repeat a group-stage fixture. Cork’s regulations therefore flip the projected club quarter-finals from ${normal} to <strong>${q.aNums[0]} v ${q.aNums[1]}</strong> and <strong>${q.bNums[0]} v ${q.bNums[1]}</strong>: <strong>${q.a[0].team} v ${q.a[1].team}</strong> and <strong>${q.b[0].team} v ${q.b[1].team}</strong>. <span class="unresolved">These are projections only; remaining group games can change the seed order and remove or create the flip.</span></div>${cfg.projectionNote?`<div class="scenario"><strong>Extra volatility:</strong> ${cfg.projectionNote}</div>`:''}</div>`;
  }
  if(cfg.format==='seniorA'){
    const g3=teamGroup(s[2].team),sameRunner=s.find((r,i)=>i>=3&&teamGroup(r.team)===g3);
    const scenario=sameRunner?` If <strong>${sameRunner.team}</strong> ends up #6 while <strong>${s[2].team}</strong> remains #3, that would create a repeat and both QFs would switch to 3 v 5 and 4 v 6.`:'';
    return `<div class="rule-alert"><div class="rule-kicker">Flip watch <span class="rule-pill">Official rule</span></div><div class="rule-text">No repeat in today’s nominal 3 v 6 projection. If #3 and #6 come from the same group, both QFs switch from 3 v 6 / 4 v 5 to 3 v 5 / 4 v 6.${scenario}</div>${cfg.projectionNote?`<div class="scenario"><strong>Note:</strong> ${cfg.projectionNote}</div>`:''}</div>`;
  }
  return `<div class="rule-alert"><div class="rule-kicker">Flip watch <span class="rule-pill">Official rule</span></div><div class="rule-text">No repeat in the current projection. If either nominal 2 v 5 or 3 v 4 is a same-group rematch, <strong>both</strong> club QFs automatically switch to 2 v 4 and 3 v 5.</div>${cfg.projectionNote?`<div class="scenario"><strong>Note:</strong> ${cfg.projectionNote}</div>`:''}</div>`;
}

function relegationProjection(){
  const bottoms=[1,2,3].map(g=>({...groupTable(g)[3],group:g})).sort((a,b)=>(a.pts-b.pts)||(a.diff-b.diff)||a.team.localeCompare(b.team));
  const boundaryTie=bottoms[1]&&bottoms[2]&&bottoms[1].pts===bottoms[2].pts&&bottoms[1].diff===bottoms[2].diff;
  return {bottoms,boundaryTie};
}

function renderKnockout(){
  const s=liveSeeds(),q=qfProjection(s),rel=relegationProjection(),bottoms=rel.bottoms;
  const relSecond=rel.boundaryTie?`${bottoms[1].team} / ${bottoms[2].team}`:bottoms[1].team;
  const ruleBox=flipWatch(s,q);
  const qfC=cfg.format==='premier'?`<div class="slot"><div class="slot-head"><span>QF C</span><span>6 v Div/Col</span></div><div class="slot-team">#6 ${s[5].team}</div><div class="slot-team">${cfg.feeder||'Divisions / Colleges winner'}</div><div class="slot-note">${cfg.feederNote||'Divisions / Colleges qualifier enters the championship here.'}</div></div>`:'';
  const sf1=cfg.format==='seniorA'
    ? `<div class="slot"><div class="slot-head"><span>Semi-final 1</span><span>1 v QF B</span></div><div class="slot-team">#1 ${s[0].team}</div><div class="slot-team">Winner QF B</div><div class="slot-note">Default bracket; repeat group pairings are adjusted if necessary.</div></div>`
    : `<div class="slot"><div class="slot-head"><span>Semi-final 1</span><span>1 v QF B</span></div><div class="slot-team">#1 ${s[0].team}</div><div class="slot-team">Winner QF B</div><div class="slot-note">Default bracket; repeat group pairings are adjusted if necessary.</div></div>`;
  const sf2=cfg.format==='seniorA'
    ? `<div class="slot"><div class="slot-head"><span>Semi-final 2</span><span>2 v QF A</span></div><div class="slot-team">#2 ${s[1].team}</div><div class="slot-team">Winner QF A</div><div class="slot-note">Default bracket; repeat group pairings are adjusted if necessary.</div></div>`
    : `<div class="slot"><div class="slot-head"><span>Semi-final 2</span><span>QF A v QF C</span></div><div class="slot-team">Winner QF A</div><div class="slot-team">Winner QF C</div><div class="slot-note">Default bracket only; repeat group pairings are avoided where necessary.</div></div>`;

  document.getElementById('knockoutGrid').innerHTML=`
    <div class="round-col"><h3>Quarter-finals · ${cfg.qfWindow}</h3>
      <div class="slot"><div class="slot-head"><span>QF A</span><span>${q.aSeeds}</span></div><div class="slot-team">#${q.aNums[0]} ${q.a[0].team}</div><div class="slot-team">#${q.aNums[1]} ${q.a[1].team}</div><div class="slot-note">${q.flipped?'Adjusted automatically under the repeat-pairing rule.':'Provisional pairing if the groups ended today.'}</div></div>
      <div class="slot"><div class="slot-head"><span>QF B</span><span>${q.bSeeds}</span></div><div class="slot-team">#${q.bNums[0]} ${q.b[0].team}</div><div class="slot-team">#${q.bNums[1]} ${q.b[1].team}</div><div class="slot-note">${q.flipped?'Adjusted automatically under the repeat-pairing rule.':'Provisional pairing if the groups ended today.'}</div></div>
      ${ruleBox}${qfC}
      <div class="slot relegation"><div class="slot-head"><span>Relegation</span><span>${cfg.qfWindow}</span></div><div class="slot-team">${bottoms[0].team}</div><div class="slot-team">${relSecond}</div><div class="slot-note">Current lowest group-bottom teams, ranked only by championship points then scoring difference.${rel.boundaryTie?' <span class="unresolved">The second relegation place is unresolved because the next two teams are level on both published criteria.</span>':''}</div></div>
    </div>
    <div class="round-col"><h3>Semi-finals · 2–11 Oct</h3>${sf1}${sf2}<div class="rule-alert"><div class="rule-kicker">Semi-final rule</div><div class="rule-text">The competition regulations require repeat group pairings to be avoided, with the semi-final pairings adjusted where necessary.</div></div></div>
    <div class="round-col"><h3>County final · October</h3><div class="slot"><div class="slot-head"><span>${cfg.cup}</span><span>TBC</span></div><div class="slot-team">Winner Semi-final 1</div><div class="slot-team">Winner Semi-final 2</div><div class="slot-note">County final window remains provisional in the Master Fixture Plan.</div></div></div>`;
}

renderGroups();renderSeeds();renderKnockout();
document.querySelectorAll('#groupTabs .tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#groupTabs .tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');
  document.querySelectorAll('.group-card').forEach(c=>c.classList.toggle('hide',b.dataset.g!=='all'&&c.dataset.group!==b.dataset.g));
});
