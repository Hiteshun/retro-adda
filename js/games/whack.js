(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var W=cv.width,H=cv.height,KEY='whack';
  Retro.bestLine(bestEl,KEY);
  var COLS=3,ROWS=3, holes=[], score, timeLeft, state, frame, spawnCd, combo, parts, floats, endAt, shake;
  var CW=W/COLS, CH=(H-60)/ROWS;
  function newGame(){
    holes=[]; for(var i=0;i<9;i++) holes.push({kind:null,t:0,life:0,hit:0});
    score=0; timeLeft=30; state='ready'; frame=0; spawnCd=20; combo=0; parts=[]; floats=[]; shake=0;
    scoreEl.textContent='0'; msg.textContent='TAP TO START · 30 SECONDS';
  }
  function burst(x,y,c,n){ for(var i=0;i<n;i++){ var a=Math.random()*6.28,v=.8+Math.random()*2.6; parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,life:16+Math.random()*12,c:c}); } }
  function spawn(){
    var free=[]; holes.forEach(function(h,i){ if(!h.kind) free.push(i); });
    if(!free.length) return;
    var i=free[Math.floor(Math.random()*free.length)], r=Math.random(), prog=1-timeLeft/30;
    var kind = r<0.14+prog*0.06 ? 'bomb' : (r<0.22+prog*0.06 ? 'gold' : 'mole');
    holes[i]={kind:kind,t:0,life:Math.round(70-prog*34)+Math.random()*10,hit:0};
  }
  function update(){
    frame++;
    if(state==='play'){
      if(frame%60===0){ timeLeft--; if(timeLeft<=0){ end(); } }
      spawnCd--; if(spawnCd<=0){ spawn(); if(timeLeft>12 && Math.random()<0.3) spawn(); spawnCd=Math.max(10,34-Math.round((1-timeLeft/30)*24)); }
      holes.forEach(function(h){
        if(!h.kind) return;
        h.t++; if(h.hit){ h.hit--; if(h.hit===0){ h.kind=null; } return; }
        if(h.t>h.life){ if(h.kind==='mole'||h.kind==='gold'){ combo=0; } h.kind=null; }
      });
    }
    draw();
  }
  function end(){
    state='over'; timeLeft=0; holes.forEach(function(h){h.kind=null;});
    msg.textContent='TIME UP! SCORE '+score+' · TAP TO PLAY AGAIN';
    Retro.sfx('win');
    if(Retro.hiSet(KEY,score)) bestEl.textContent=score;
  }
  function cellPos(i){ return {x:(i%COLS)*CW+CW/2, y:60+Math.floor(i/COLS)*CH+CH*0.62}; }
  function draw(){
    var ox=0,oy=0; if(shake>0){ ox=(Math.random()-.5)*shake; oy=(Math.random()-.5)*shake; shake=Math.max(0,shake-.6); }
    ctx.save(); ctx.translate(ox,oy);
    ctx.fillStyle='#5ab34a'; ctx.fillRect(-10,-10,W+20,H+20);
    ctx.fillStyle='#4aa23c'; for(var y=0;y<H;y+=16) ctx.fillRect(0,y,W,8);
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,44);
    ctx.fillStyle='#39ff14'; ctx.font='bold 13px monospace'; ctx.fillText('TIME',10,28);
    ctx.fillStyle=timeLeft<=8?'#ff3b3b':'#ffe600'; ctx.fillText(String(Math.max(0,timeLeft)),52,28);
    ctx.fillStyle='#fff'; ctx.font='9px monospace'; ctx.fillText(combo>1?('COMBO x'+combo):'',W-82,28);
    ctx.fillStyle='#ffe600'; ctx.fillRect(10,34,(W-20)*Math.max(0,timeLeft)/30,4);
    holes.forEach(function(h,i){
      var p=cellPos(i);
      ctx.fillStyle='#3a2410'; ctx.beginPath(); ctx.ellipse(p.x,p.y,34,13,0,0,6.28); ctx.fill();
      if(h.kind){
        var up = Math.min(1, h.t/6); if(h.t>h.life-6) up=Math.max(0,(h.life-h.t)/6); if(h.hit) up=.4;
        var by = p.y + 6 - up*38;
        ctx.save(); ctx.beginPath(); ctx.rect(p.x-40,p.y-60,80,60+0); ctx.clip();
        if(h.kind==='bomb'){
          ctx.fillStyle='#222'; ctx.beginPath(); ctx.arc(p.x,by,17,0,6.28); ctx.fill(); ctx.fillStyle='#555'; ctx.fillRect(p.x-8,by-12,6,6);
          ctx.fillStyle='#ffe600'; ctx.fillRect(p.x+5,by-24,3,8); ctx.fillStyle='#ff3b3b'; ctx.fillRect(p.x+4,by-27,5,5);
          ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.fillText('!',p.x-2,by+4);
        } else {
          var body = h.kind==='gold' ? '#ffd400' : '#8b5a2b', belly = h.kind==='gold' ? '#fff3a0' : '#d9a066';
          ctx.fillStyle=body; ctx.beginPath(); ctx.arc(p.x,by,19,0,6.28); ctx.fill();
          ctx.fillRect(p.x-19,by,38,30);
          ctx.fillStyle=belly; ctx.beginPath(); ctx.ellipse(p.x,by+8,11,8,0,0,6.28); ctx.fill();
          ctx.fillStyle='#fff'; ctx.fillRect(p.x-10,by-7,7,7); ctx.fillRect(p.x+3,by-7,7,7);
          ctx.fillStyle=h.hit?'#f00':'#000'; ctx.fillRect(p.x-7,by-5,3,4); ctx.fillRect(p.x+5,by-5,3,4);
          ctx.fillStyle='#ff7aa8'; ctx.fillRect(p.x-3,by+2,6,4);
          ctx.fillStyle=h.kind==='gold'?'#fff':'#d9a066'; ctx.fillRect(p.x-15,by-17,6,6); ctx.fillRect(p.x+9,by-17,6,6);
        }
        ctx.restore();
      }
      ctx.fillStyle='#2a1808'; ctx.beginPath(); ctx.ellipse(p.x,p.y+3,36,9,0,0,Math.PI); ctx.fill();
    });
    parts=parts.filter(function(p){return p.life>0;});
    parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.vy+=.12; p.life--; ctx.globalAlpha=Math.max(0,p.life/24); ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,4,4); });
    ctx.globalAlpha=1;
    floats=floats.filter(function(f){return f.life>0;});
    floats.forEach(function(f){ f.y-=1; f.life--; ctx.globalAlpha=Math.min(1,f.life/14); ctx.fillStyle=f.c; ctx.font='bold 14px monospace'; ctx.fillText(f.t,f.x-14,f.y); });
    ctx.globalAlpha=1;
    if(state==='over'){ ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(0,44,W,H); }
    ctx.restore();
  }
  function tap(cx,cy){
    if(state==='ready'){ state='play'; msg.textContent=''; return; }
    if(state==='over'){ newGame(); state='play'; msg.textContent=''; return; }
    var r=cv.getBoundingClientRect(), x=(cx-r.left)*(W/r.width), y=(cy-r.top)*(H/r.height);
    for(var i=0;i<holes.length;i++){
      var h=holes[i]; if(!h.kind||h.hit) continue;
      var p=cellPos(i);
      if(Math.abs(x-p.x)<38 && y>p.y-52 && y<p.y+18){
        h.hit=10;
        if(h.kind==='bomb'){
          score=Math.max(0,score-15); combo=0; shake=10; burst(p.x,p.y-20,'#ff6a00',20); Retro.sfx('lose');
          timeLeft=Math.max(1,timeLeft-2); floats.push({x:p.x,y:p.y-30,life:30,t:'-15',c:'#ff3b3b'});
        } else {
          combo++; var base = h.kind==='gold'?30:10; var gain = base + Math.min(combo-1,6)*2;
          score+=gain; burst(p.x,p.y-24,h.kind==='gold'?'#ffe600':'#d9a066',12); Retro.sfx(h.kind==='gold'?'win':'pop');
          if(h.kind==='gold') timeLeft=Math.min(40,timeLeft+2);
          floats.push({x:p.x,y:p.y-30,life:30,t:'+'+gain,c:h.kind==='gold'?'#ffe600':'#fff'});
        }
        scoreEl.textContent=score; return;
      }
    }
    combo=0;
  }
  cv.addEventListener('mousedown',function(e){ tap(e.clientX,e.clientY); });
  cv.addEventListener('touchstart',function(e){ e.preventDefault(); tap(e.touches[0].clientX,e.touches[0].clientY); },{passive:false});
  document.addEventListener('keydown',function(e){ if(e.key===' ' && state!=='play'){ e.preventDefault(); tap(0,0); } });
  document.getElementById('again').addEventListener('click',function(){ newGame(); });
  newGame(); setInterval(update,1000/60);
})();
