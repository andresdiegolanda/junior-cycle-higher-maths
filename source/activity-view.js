function activityDate(date,full=false){
 return new Intl.DateTimeFormat('en-IE',{timeZone:'UTC',day:'numeric',month:full?'long':'short',...(full?{weekday:'long',year:'numeric'}:{})}).format(new Date(date+'T12:00:00Z'));
}
function activityMinutes(seconds){return seconds>0&&seconds<60?'<1':String(Math.round(seconds/60))}
function activitySummary(days){
 return days.reduce((sum,d)=>({questions:sum.questions+d.questions,sections:sum.sections+d.sections,activeDays:sum.activeDays+Number(d.sections>0||d.questions>0||d.activeSeconds>0),activeSeconds:sum.activeSeconds+d.activeSeconds}),{questions:0,sections:0,activeDays:0,activeSeconds:0});
}
function activityMetricsHTML(result){
 const s=activitySummary(result.daily);
 return `<div class="activity-metrics" role="group" aria-label="Totals for this period">
  <article class="account-metric"><span class="metric-kicker">Questions attempted</span><strong>${s.questions}</strong><span>Daily question counts added together</span></article>
  <article class="account-metric"><span class="metric-kicker">Sections visited</span><strong>${s.sections}</strong><span>Daily lesson/topic counts added together</span></article>
  <article class="account-metric"><span class="metric-kicker">Days with activity</span><strong>${s.activeDays}<small> / ${result.daily.length}</small></strong><span>Days with recorded study</span></article>
  <article class="account-metric"><span class="metric-kicker">Active minutes</span><strong>${E(activityMinutes(result.activeSeconds))}</strong><span>Estimated time studying</span></article>
 </div>`;
}
function activityChartHTML(result,offset=0){
 const end=result.daily.length-offset,start=Math.max(0,end-7),days=result.daily.slice(start,end);
 const maximum=Math.max(1,...result.daily.flatMap(d=>[d.questions,d.sections]));
 return `<div class="activity-chart-heading"><div><p class="eyebrow">Your study rhythm</p><h2 id="daily-chart-title">Questions & sections each day</h2><p class="small-note">Select a day to see its activity below.</p></div><div class="activity-legend"><span><i class="question-key"></i> Questions</span><span><i class="section-key"></i> Sections</span></div></div>
 <div class="activity-chart-nav"><button data-chart-offset="${offset+7}" ${start===0?'disabled':''} ><span aria-hidden="true">← </span>Earlier<span class="screen-reader"> seven days</span></button><strong>${E(activityDate(days[0].date))} to ${E(activityDate(days.at(-1).date))}</strong><button data-chart-offset="${Math.max(0,offset-7)}" ${offset===0?'disabled':''} >Later<span class="screen-reader"> seven days</span><span aria-hidden="true"> →</span></button></div>
 <div class="activity-plot" role="group" aria-labelledby="daily-chart-title" style="--day-count:${days.length}">${days.map(d=>{
  const weekday=new Intl.DateTimeFormat('en-IE',{timeZone:'UTC',weekday:'short'}).format(new Date(d.date+'T12:00:00Z'));
  return `<button class="activity-day ${d.date===result.range.to?'is-today':''}" data-activity-day="${d.date}" aria-pressed="${result.selectedDay===d.date}" title="${E(activityDate(d.date,true))}"><span class="activity-bar-pair" aria-hidden="true"><span class="activity-bar-track"><span class="activity-bar question-bar" style="height:${d.questions/maximum*100}%"><b>${d.questions}</b></span></span><span class="activity-bar-track"><span class="activity-bar section-bar" style="height:${d.sections/maximum*100}%"><b>${d.sections}</b></span></span></span><span class="activity-day-name">${d.date===result.range.to?'Today':weekday}</span> <span class="activity-day-date">${E(activityDate(d.date))}</span><span class="screen-reader">: ${d.questions} questions attempted, ${d.sections} sections visited. Show activity.</span></button>`;
 }).join('')}</div>
 <p class="small-note activity-chart-foot">Both bars use the same scale. Numbers show exact counts. Empty days are included.</p>`;
}
function activityDailyTableHTML(result){
 return `<details class="account-sessions activity-daily-table"><summary>Daily breakdown · ${result.daily.length} days</summary><div class="account-table-wrap"><table class="account-table"><caption>Daily activity in ${E(result.timeZone)}</caption><thead><tr><th scope="col">Date</th><th scope="col">Questions</th><th scope="col">Sections</th><th scope="col">Clues</th><th scope="col">Active minutes</th></tr></thead><tbody>${[...result.daily].reverse().map(d=>`<tr><th scope="row"><button data-activity-day="${d.date}" aria-pressed="${result.selectedDay===d.date}"><span class="screen-reader">Show activity for </span>${E(activityDate(d.date))}</button></th><td>${d.questions}</td><td>${d.sections}</td><td>${d.clues}</td><td>${E(activityMinutes(d.activeSeconds))}</td></tr>`).join('')}</tbody></table></div></details>`;
}
/* Skill drills: best stars at each level and first-time accuracy, all time. */
function activitySkillsHTML(result){
 const rows=(result.skills||[]).filter(r=>typeof SkillKit!=='undefined'&&SkillKit.byId.has(r.skill));
 if(!rows.length)return '<section class="activity-skills"><h2>Skill drills</h2><p class="account-empty">No drill rounds yet. Open Skill drills and try a round of five questions.</p></section>';
 const stars=n=>`<span class="drill-stars" role="img" aria-label="${n} of 3 stars">${[0,1,2].map(i=>`<span class="${i<n?'on':''}" aria-hidden="true">★</span>`).join('')}</span>`;
 const order=SkillKit.skills.map(s=>s.id),sorted=[...rows].sort((a,b)=>order.indexOf(a.skill)-order.indexOf(b.skill));
 return `<section class="activity-skills" aria-labelledby="activity-skills-title"><h2 id="activity-skills-title">Skill drills</h2><p class="small-note">Best round at each level, and how many answers were right at the first attempt. These totals cover all recorded practice, not only the period above.</p><div class="account-table-wrap"><table class="account-table"><thead><tr><th scope="col">Skill</th><th scope="col">Level 1</th><th scope="col">Level 2</th><th scope="col">Level 3</th><th scope="col">Rounds</th><th scope="col">Answered</th><th scope="col">Right first time</th></tr></thead><tbody>${sorted.map(r=>{const skill=SkillKit.byId.get(r.skill),asked=r.asked|0,right=r.right|0;return `<tr><th scope="row">${E(skill.title)}<br><small>${E(skill.strand)}</small></th>${[0,1,2].map(i=>`<td>${stars(Math.max(0,Math.min(3,(r.stars||[])[i]|0)))}</td>`).join('')}<td>${r.rounds|0}</td><td>${asked}</td><td>${right}${asked?` (${Math.round(100*right/asked)}%)`:''}</td></tr>`}).join('')}</tbody></table></div></section>`;
}
