function activityDate(date,full=false){
 return new Intl.DateTimeFormat('en-IE',{timeZone:'UTC',day:'numeric',month:full?'long':'short',...(full?{weekday:'long',year:'numeric'}:{})}).format(new Date(date+'T12:00:00Z'));
}
function activityMinutes(seconds){return seconds>0&&seconds<60?'<1':String(Math.round(seconds/60))}
function activitySummary(days){
 return days.reduce((sum,d)=>({questions:sum.questions+d.questions,sections:sum.sections+d.sections,activeDays:sum.activeDays+Number(d.sections>0||d.questions>0||d.activeSeconds>0),activeSeconds:sum.activeSeconds+d.activeSeconds}),{questions:0,sections:0,activeDays:0,activeSeconds:0});
}
function activityMetricsHTML(result){
 const s=activitySummary(result.daily);
 return `<div class="activity-metrics" aria-label="Totals for this period">
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
 <div class="activity-chart-nav"><button data-chart-offset="${offset+7}" ${start===0?'disabled':''} aria-label="Previous seven days">← Earlier</button><strong>${E(activityDate(days[0].date))} – ${E(activityDate(days.at(-1).date))}</strong><button data-chart-offset="${Math.max(0,offset-7)}" ${offset===0?'disabled':''} aria-label="Next seven days">Later →</button></div>
 <div class="activity-plot" role="group" aria-labelledby="daily-chart-title" style="--day-count:${days.length}">${days.map(d=>{
  const weekday=new Intl.DateTimeFormat('en-IE',{timeZone:'UTC',weekday:'short'}).format(new Date(d.date+'T12:00:00Z'));
  return `<button class="activity-day ${d.date===result.range.to?'is-today':''}" data-activity-day="${d.date}" aria-pressed="${result.selectedDay===d.date}" aria-label="${E(activityDate(d.date,true))}: ${d.questions} questions attempted, ${d.sections} sections visited. Show activity."><span class="activity-bar-pair" aria-hidden="true"><span class="activity-bar-track"><span class="activity-bar question-bar" style="height:${d.questions/maximum*100}%"><b>${d.questions}</b></span></span><span class="activity-bar-track"><span class="activity-bar section-bar" style="height:${d.sections/maximum*100}%"><b>${d.sections}</b></span></span></span><span class="activity-day-name">${d.date===result.range.to?'Today':weekday}</span><span class="activity-day-date">${E(activityDate(d.date))}</span></button>`;
 }).join('')}</div>
 <p class="small-note activity-chart-foot">Both bars use the same scale. Numbers show exact counts. Empty days are included.</p>`;
}
function activityDailyTableHTML(result){
 return `<details class="account-sessions activity-daily-table"><summary>Daily breakdown · ${result.daily.length} days</summary><div class="account-table-wrap"><table class="account-table"><caption>Daily activity in ${E(result.timeZone)}</caption><thead><tr><th scope="col">Date</th><th scope="col">Questions</th><th scope="col">Sections</th><th scope="col">Clues</th><th scope="col">Active minutes</th></tr></thead><tbody>${[...result.daily].reverse().map(d=>`<tr><th scope="row"><button data-activity-day="${d.date}" aria-label="Show activity for ${E(activityDate(d.date,true))}" aria-pressed="${result.selectedDay===d.date}">${E(activityDate(d.date))}</button></th><td>${d.questions}</td><td>${d.sections}</td><td>${d.clues}</td><td>${E(activityMinutes(d.activeSeconds))}</td></tr>`).join('')}</tbody></table></div></details>`;
}
