'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const pages=$$('.page');

/* rail + reveal */
$('#rail').innerHTML=pages.map((p,i)=>`<a href="#${p.id}"><span>${p.dataset.title}</span>${String(i+1).padStart(2,'0')}<i></i></a>`).join('');
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');const i=pages.indexOf(e.target);$$('#rail a').forEach((a,n)=>a.setAttribute('aria-current',String(n===i)));const v=e.target.querySelector('video');if(v&&!v.closest('[hidden]'))v.play().catch(()=>{})}else{const v=e.target.querySelector('video');if(v)v.pause()}}),{threshold:.45});
pages.forEach(p=>io.observe(p));

/* 04 matrix */
const rows=['任务前','任务中','任务后'],cols=['意图与范围','过程与控制','解释与依据','异常与恢复','纠正与继续'];
const cells=[
['明确目标与输入',['Context','Choice','历史订单卡','Input']],['了解可用操作',['Context','Choice']],['理解能力与条件',['Context','Insight','AI 标签']],['补充缺失信息',['Checklist','Choice']],['调整任务范围',['Context','Choice','Input']],
['澄清新出现的歧义',['Choice']],['查看进展与操作',['Progress','Controls']],['比较选项与来源',['商品卡','Insight','Source']],['处理冲突与失败',['Notice','Controls']],['修改局部内容',['Input','Comparison']],
['确认结果与下一步',['时间选项','OrderList']],['完成或交接',['OrderList','Notice','Controls']],['检查结果与依据',['Insight','Source','AI 标签']],['识别未完成项',['OrderList','Notice']],['纠正或继续',['Feedback','Choice','Input','AI 标签']]];
$('#matrix').innerHTML='<span></span>'+cols.map(c=>`<div class="ch">${c}</div>`).join('')+rows.map((r,i)=>`<div class="rh">${r}</div>`+cells.slice(i*5,i*5+5).map((c,j)=>`<button class="cell" data-i="${i*5+j}" aria-pressed="false">${c[0]}</button>`).join('')).join('');
const specF=$('#spec');let specN=0;
function pick(n){specN=n;$$('.cell').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.i===n)));const set=cells[n][1];$$('.lib [data-c]').forEach(s=>s.classList.toggle('on',set.includes(s.dataset.c)));
 $('#spec-h').textContent=rows[Math.floor(n/5)]+' · '+cols[n%5]+' · '+cells[n][0];specF.contentWindow&&specF.contentWindow.postMessage({type:'spec',n},location.origin)}
$$('.cell').forEach(b=>b.onclick=()=>pick(+b.dataset.i));
$$('.lib [data-c]').forEach(s=>s.onclick=()=>{const c=s.dataset.c;const list=cells.map((x,i)=>x[1].includes(c)?i:-1).filter(i=>i>=0);const nx=list.find(i=>i>specN&&cells[specN][1].includes(c))??list[0];pick(nx)});
specF.onload=()=>pick(specN);

pick(0);

/* 05 / 06 guided flows */
const MM=(r,c)=>`<div class="mini-m">${Array.from({length:15},(_,i)=>`<i class="${i===r*5+c?'on':''}"></i>`).join('')}</div>`;
const G={
5:{order:['history','confirm','check','products','time','check5','done'],
 history:{n:'01 / 6 · 历史订单卡',j:'“上次”不明确，<br>先让用户选。',c:'AI 找到三张历史订单，用卡片摆出来，由用户指定复用哪一张。',t:[['gen','Generative UI · 组件切换'],['','Choice'],['','历史订单卡']],d:'在右侧点「再来一单」',m:[0,0]},
 confirm:{n:'02 / 6 · 本次要求',j:'历史作为参考，<br>本次要求重新确认。',c:'上次有 4 人不喝奶，但这次人数可能变了，所以不直接沿用。',t:[['','Choice']],d:'选择「有变化」',m:[0,4]},
 check:{n:'03 / 6 · 查询饮品与配方',j:'商品事实来自工具，<br>处理状态如实反馈。',c:'新增素食分组后，系统查询菜单与配方。进度显示的是工具正在做的事，不是装饰动画。',t:[['','Progress']],d:'正在查询…',m:[1,1]},
 products:{n:'04 / 6 · 分组商品卡',j:'现在要选饮品，<br>所以给卡片。',c:'卡片随分组调整配置与提示：素食分组只给符合要求的饮品，用户直接定制、加入。',t:[['gen','Generative UI · 组件切换'],['ada','Adaptive UI · 卡片状态'],['','商品卡']],d:'定制后「加入素食区」，补齐 2 杯',m:[1,2],schema:true},
 time:{n:'05 / 6 · 汇总订单与时间',j:'需要核对时，<br>换成清单和时间选项。',c:'饮品、分组和取餐时间放进同一张清单，还差什么一眼能看到。',t:[['gen','Generative UI · 组件切换'],['','时间选项'],['','OrderList']],d:'选择 17:30，再点「确认预订」',m:[2,0]},
 check5:{n:'06 / 6 · 下单前核对',j:'提交之前，<br>再核对一次。',c:'Checklist 列出分组、时间、金额和付款截止。下单这个动作只能由用户来点。',t:[['','Checklist'],['','Notice'],['','用户确认']],d:'点「确认无误，下单」',m:[2,0]},
 done:{n:'完成 · 已下单',j:'小票打印出来，<br>这一单就点好了。',c:'订单 B905 已下单、待付款。接下来，同一张订单在中途又有了变化。',t:[['','小票']],next:'继续：中途修改 ↓',m:[2,1]}},
6:{order:['ask','recheck','cards','review','check6','done'],
 ask:{n:'01 / 6 · 修改对象不明确',j:'不确定改哪一杯，<br>先追问。',c:'“有一杯”可能是清单里四款中的任意一款。用 Choice 把四款连同所在分组都列出来，让用户指明，而不是猜。',t:[['link','动态组合 · 按当前问题组织组件'],['','Choice']],d:'选一款要换的饮品',m:[1,0]},
 recheck:{n:'02 / 6 · 新增饮食要求',j:'要求变了，<br>重新调用检查。',c:'这位同学不喝奶，分组人数和可选饮品都要重算，不沿用上一轮的结果。',t:[['link','固定联动 · 工具状态 → Progress'],['','Progress']],d:'正在重新检查…',m:[1,1]},
 cards:{n:'03 / 6 · 直接修改',j:'检查结果改变卡片；<br>明确的操作直接点。',c:'每张卡写清怎么改：芝士葡萄去掉奶盖，珍珠奶茶换燕麦奶，果茶本身就可以。甜度和数量在卡片上直接改，不必再经过模型。',t:[['link','条件联动 · 检查结果 → 配置与提示'],['ada','Adaptive UI · 卡片状态']],d:'调整甜度，点「加入」',m:[1,4]},
 review:{n:'04 / 6 · 更新订单',j:'卡片和清单，<br>共用一份订单状态。',c:'加入后，分组进度、杯数和总价同步更新，其余 16 杯保持不变。',t:[['','OrderList'],['','共享订单状态']],d:'核对后点「确认预订」',m:[2,3]},
 check6:{n:'05 / 6 · 修改前后',j:'改了什么，<br>并排给用户看。',c:'Comparison 只列出变动的两行：被换掉的一杯划掉，新的一杯标为新增。其余保持不变。',t:[['','Comparison'],['','Checklist']],d:'点「确认无误，下单」',m:[2,2]},
 done:{n:'06 / 6 · 最后确认',j:'最后的决定，<br>留给用户。',c:'AI 负责理解与组织，工具负责查询与检查；下单始终由用户来点。小票标注「已修改」，单号 B906。',t:[['','用户确认'],['','小票']],m:[2,1]}}};
const SCHEMA=`<div class="schema"><h4>这一步的 Schema 映射</h4><ol>
<li><b>任务与工具结果</b><span>素食 2 位 · 查到 3 款符合</span></li>
<li><b>结构化组件描述</b><span><code>{ type: "suggest", ids: [...] }</code></span></li>
<li><b>校验与数据补全</b><span>白名单校验，价格与成分由代码填入</span></li>
<li><b>前端呈现</b><span>3 张素食商品卡</span></li></ol></div>`;
const cur={5:null,6:null};
function guide(p,key){cur[p]=key;const g=G[p],d=g[key],i=g.order.indexOf(key),total=g.order.length-(p===5?1:0);
 $('#g'+p).innerHTML=`<div class="steps">${Array.from({length:total},(_,n)=>`<i class="${n<i?'done':n===i?'now':''}"></i>`).join('')}</div>
 <div class="g-num">${d.n}</div><h3 class="g-judge">${d.j}</h3><p class="g-ctx">${d.c}</p>
 ${d.t.length?`<div class="g-tags">${d.t.map(([k,x])=>`<span class="tag ${k}">${x}</span>`).join('')}</div>`:''}
 ${d.d?`<div class="g-do">${d.d}</div>`:''}${d.next?`<button class="g-next" data-go="p6">${d.next}</button>`:''}
 ${d.schema?SCHEMA:''}
 <div class="mini">${MM(...d.m)}<small>组件框架中的位置<br>${['任务前','任务中','任务后'][d.m[0]]} · ${cols[d.m[1]]}</small></div>`;
 const b=$('#g'+p+' [data-go]');if(b)b.onclick=()=>document.getElementById(b.dataset.go).scrollIntoView({behavior:'smooth'})}
const F={5:$('#f5'),6:$('#f6')};let shared=null;
function post(p,stage,state){F[p].contentWindow.postMessage({type:'tea-scene',stage,state},location.origin)}
F[5].onload=()=>{post(5,'history');guide(5,'history')};
F[6].onload=()=>{post(6,'change',shared||undefined);guide(6,'ask')};
$$('[data-reset]').forEach(b=>b.onclick=()=>{const p=+b.dataset.reset;if(p===5){post(5,'history');guide(5,'history')}else{post(6,'change',shared||undefined);guide(6,'ask')}});
const MAP5={'stage:history':'history','stage:confirm':'confirm','stage:check':'check','stage:products':'products','stage:time':'time','stage:check5':'check5'};
const MAP6={'stage:ask':'ask','stage:recheck':'recheck','stage:cards':'cards','stage:review':'review','stage:check6':'check6'};
window.addEventListener('message',e=>{if(e.origin!==location.origin)return;const m=e.data;
 const p=e.source===F[5].contentWindow?5:e.source===F[6].contentWindow?6:0;if(!p)return;
 if(m.type==='tea-scene-size'){F[p].style.height=Math.max(520,Math.min(1200,m.height+8))+'px';return}
 if(m.type!=='tea-scene-event')return;
 if(p===5){if(MAP5[m.step])guide(5,MAP5[m.step]);if(m.step==='confirmed'){guide(5,'done');shared=m.state;if(cur[6]==='ask')post(6,'change',shared)}}
 if(p===6){if(MAP6[m.step]&&!(m.step==='stage:ask'&&cur[6]&&cur[6]!=='ask'))guide(6,MAP6[m.step]);if(m.step==='confirmed')guide(6,'done')}});
guide(5,'history');guide(6,'ask');

/* 07 card */
$$('[data-mode]').forEach(b=>b.onclick=()=>{const live=b.dataset.mode==='live';$$('[data-mode]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));$('#f7').hidden=!live;$('#v7').hidden=live;live?$('#v7').pause():$('#v7').play().catch(()=>{})});
const DP={m:['☀ 早上好','提神的茶底排在前面',[['pmt','珍珠奶茶','£4.80','高咖啡因','hi'],['mat','抹茶鲜奶','£5.20','中咖啡因','hi'],['pas','百香果双响炮','£5.00','中咖啡因','hi']]],e:['☾ 晚上好','低咖啡因的排在前面',[['bsm','黑糖珍珠鲜奶','£5.40','无咖啡因','lo'],['mgo','芒果冰沙','£5.40','无咖啡因','lo'],['grp','芝士葡萄','£5.80','低咖啡因','lo']]]};
function dp(k){const d=DP[k];$('#dp-h').textContent=d[0];$('#dp-d').textContent=d[1];$('#dp-cups').innerHTML=d[2].map(([id,n,p,b,c])=>`<div class="pc"><div class="im"><img src="assets/cup-${id}.webp" alt="${n}"></div><span class="bd ${c}">${b}</span><h4>${n}</h4><div class="pr"><span>${p}</span><i>+</i></div></div>`).join('');$$('[data-dp]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dp===k)))}
$$('[data-dp]').forEach(b=>b.onclick=()=>dp(b.dataset.dp));dp('m');
