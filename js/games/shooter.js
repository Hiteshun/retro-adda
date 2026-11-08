(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var W=cv.width,H=cv.height,KEY='shooter';
  Retro.bestLine(bestEl,KEY);
  var ship,bullets,enemies,ebul,drops,parts,stars,score,lives,wave,state,frame,fireCd,power,powT,shield,boss,waveLeft,spawnCd,shake,keys={};
  stars=[]; for(var i=0;i<50;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:.4+Math.random()*1.6});
  function burst(x,y,c,n){ for(var i=0;i<n;i++){ var a=Math.random()*6.28,v=.6+Math.random()*2.6; parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:16+Math.random()*14,c:c}); } }
  function newGame(){
    ship={x:W/2,y:H-50,w:22,h:20}; bullets=[]; enemies=[]; ebul=[]; drops=[]; parts=[]; score=0; lives=3; wave=0; state='ready'; frame=0; fireCd=0; power=1; powT=0; shield=0; boss=null; shake=0;
    scoreEl.textContent='0'; msg.textContent='TAP OR SPACE TO START'; nextWave();
  }
  function nextWave(){
    wave++; waveLeft=0; spawnCd=30;
    if(wave%5===0){ boss={x:W/2,y:-50,w:70,h:34,hp:30+wave*4,max:30+wave*4,dx:1.3,cd:60}; enemies.push(boss); waveLeft=0; msg.textContent='BOSS!'; }
    else { waveLeft=6+wave*2; msg.textContent='WAVE '+wave; }
    setTimeout(function(){ if(state==='play') msg.textContent=''; },1200);
  }
  function spawnEnemy(){
    var t=Math.random(); var kind = wave>2 && t<0.25 ? 'zig' : (wave>1 && t<0.45 ? 'shoot':'basic');
    enemies.push({x:20+Math.random()*(W-40),y:-20,w:20,h:16,hp:kind==='basic'?1:2,kind:kind,vy:.8+Math.min(wave*0.08,1.2)+Math.random()*.5,ph:Math.random()*6,cd:60+Math.random()*80});
    waveLeft--;
  }
  function hurt(){
    if(shield>0){ shield=0; burst(ship.x,ship.y,'#7cf',14); Retro.sfx('hit'); return; }
    lives--; Retro.sfx('lose'); shake=8; burst(ship.x,ship.y,'#ff6a00',24); power=1; powT=0; ebul=[];
    if(lives<=0){ state='over'; msg.textContent='GAME OVER · SCORE '+score+' · TAP TO RETRY'; if(Retro.hiSet(KEY,score)) bestEl.textContent=score; }
  }
  function fire(){
    var y=ship.y-12;
    if(power===1) bullets.push({x:ship.x,y:y,vx:0});
    else if(power===2){ bullets.push({x:ship.x-7,y:y,vx:0}); bullets.push({x:ship.x+7,y:y,vx:0}); }
    else { bullets.push({x:ship.x,y:y,vx:0}); bullets.push({x:ship.x-8,y:y,vx:-1.4}); bullets.push({x:ship.x+8,y:y,vx:1.4}); }
    Retro.sfx('move');
  }
  function update(){
    frame++;
    stars.forEach(function(s){ s.y+=s.s*(state==='play'?1.5:.5); if(s.y>H){ s.y=0; s.x=Math.random()*W; } });
    if(state==='play'){
      if(keys.ArrowLeft||keys.a) ship.x-=4.2; if(keys.ArrowRight||keys.d) ship.x+=4.2;
      if(keys.ArrowUp||keys.w) ship.y-=3; if(keys.ArrowDown||keys.s) ship.y+=3;
      ship.x=Math.max(14,Math.min(W-14,ship.x)); ship.y=Math.max(60,Math.min(H-20,ship.y));
      fireCd--; if(fireCd<=0){ fire(); fireCd = power>1?9:12; }
      if(powT>0){ powT--; if(powT===0) power=1; }
      if(!boss && waveLeft>0){ spawnCd--; if(spawnCd<=0){ spawnEnemy(); spawnCd=Math.max(14,46-wave*3); } }
      bullets.forEach(function(b){ b.y-=8; b.x+=b.vx; });
      bullets=bullets.filter(function(b){ return b.y>-10; });
      enemies.forEach(function(e){
        if(e===boss){
          if(e.y<50) e.y+=1; else { e.x+=e.dx; if(e.x<e.w/2||e.x>W-e.w/2) e.dx=-e.dx; }
          e.cd--; if(e.cd<=0){ e.cd=Math.max(28,60-wave); for(var k=-2;k<=2;k++) ebul.push({x:e.x,y:e.y+16,vx:k*0.8,vy:2.6}); }
        } else {
          e.y+=e.vy; if(e.kind==='zig') e.x+=Math.sin(frame/14+e.ph)*2;
          if(e.kind==='shoot'){ e.cd--; if(e.cd<=0){ e.cd=90; ebul.push({x:e.x,y:e.y+8,vx:0,vy:2.8}); } }
        }
      });
      bullets.forEach(function(b){
        enemies.forEach(function(e){
          if(b.dead||e.dead) return;
          if(Math.abs(b.x-e.x)<e.w/2+2 && Math.abs(b.y-e.y)<e.h/2+4){
            b.dead=true; e.hp--; burst(b.x,b.y,'#fff',2);
            if(e.hp<=0){
              e.dead=true; var pts = e===boss?500:(e.kind==='basic'?10:20); score+=pts; scoreEl.textContent=score;
              burst(e.x,e.y,e===boss?'#ffe600':'#ff6a6a',e===boss?50:12); Retro.sfx(e===boss?'win':'clear');
              if(e===boss){ boss=null; shake=12; }
              if(Math.random()<0.13 || e===boss){ var ks=['P','S','H']; drops.push({x:e.x,y:e.y,k:ks[Math.floor(Math.random()*3)]}); }
            }
          }
        });
      });
      bullets=bullets.filter(function(b){return !b.dead;}); enemies=enemies.filter(function(e){ if(e.dead&&e===boss) boss=null; return !e.dead; });
      enemies.forEach(function(e){
        if(Math.abs(e.x-ship.x)<(e.w+ship.w)/2-4 && Math.abs(e.y-ship.y)<(e.h+ship.h)/2-4){ if(e!==boss){ e.dead=true; burst(e.x,e.y,'#ff6a6a',10); } hurt(); }
        if(e.y>H+20 && e!==boss){ e.dead=true; }
      });
      enemies=enemies.filter(function(e){return !e.dead;});
      ebul.forEach(function(b){ b.x+=b.vx; b.y+=b.vy; });
      ebul=ebul.filter(function(b){ if(Math.abs(b.x-ship.x)<ship.w/2-2 && Math.abs(b.y-ship.y)<ship.h/2){ hurt(); return false; } return b.y<H+10&&b.x>-10&&b.x<W+10; });
      drops.forEach(function(d){ d.y+=1.5; });
      drops=drops.filter(function(d){
        if(Math.abs(d.x-ship.x)<18 && Math.abs(d.y-ship.y)<18){
          Retro.sfx('win');
          if(d.k==='P'){ power=Math.min(3,power+1); powT=600; msg.textContent='POWER UP!'; }
          else if(d.k==='S'){ shield=1; msg.textContent='SHIELD!'; }
          else { lives=Math.min(5,lives+1); msg.textContent='+1 LIFE'; }
          setTimeout(function(){ if(state==='play') msg.textContent=''; },800); return false;
        }
        return d.y<H+10;
      });
      if(!boss && waveLeft<=0 && enemies.length===0){ score+=wave*20; scoreEl.textContent=score; nextWave(); }
    }
    draw();
  }
  function ship_(x,y){
    ctx.fillStyle='#8be9ff'; ctx.fillRect(x-3,y-12,6,22); ctx.fillStyle='#3bd6ff'; ctx.fillRect(x-11,y,22,8); ctx.fillRect(x-14,y+4,6,8); ctx.fillRect(x+8,y+4,6,8);
    ctx.fillStyle='#fff'; ctx.fillRect(x-2,y-6,4,6);
    if(frame%6<3){ ctx.fillStyle='#ff9a3b'; ctx.fillRect(x-3,y+10,6,6); }
  }
  function draw(){
    var ox=0,oy=0; if(shake>0){ ox=(Math.random()-.5)*shake; oy=(Math.random()-.5)*shake; shake=Math.max(0,shake-.5); }
    ctx.save(); ctx.translate(ox,oy);
    ctx.fillStyle='#04041a'; ctx.fillRect(-10,-10,W+20,H+20);
    stars.forEach(function(s){ ctx.fillStyle=s.s>1.2?'#fff':'#7783b8'; ctx.fillRect(s.x,s.y,s.s>1.2?2:1,s.s>1.2?2:1); });
    drops.forEach(function(d){ var c={P:'#ff4fd8',S:'#7cf',H:'#ff3b3b'}[d.k]; ctx.fillStyle=c; ctx.fillRect(d.x-8,d.y-8,16,16); ctx.fillStyle='#000'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; ctx.fillText(d.k,d.x,d.y+4); ctx.textAlign='left'; });
    bullets.forEach(function(b){ ctx.fillStyle='#ffe600'; ctx.fillRect(b.x-1,b.y-6,3,9); });
    ebul.forEach(function(b){ ctx.fillStyle='#ff4f4f'; ctx.fillRect(b.x-2,b.y-2,5,5); ctx.fillStyle='#fff'; ctx.fillRect(b.x-1,b.y-1,2,2); });
    enemies.forEach(function(e){
      if(e===boss){
        ctx.fillStyle='#7b2fb0'; ctx.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h); ctx.fillStyle='#c14bff'; ctx.fillRect(e.x-e.w/2,e.y-e.h/2,e.w,5);
        ctx.fillStyle='#ffe600'; ctx.fillRect(e.x-16,e.y-4,8,8); ctx.fillRect(e.x+8,e.y-4,8,8);
        ctx.fillStyle='#300'; ctx.fillRect(e.x-e.w/2,e.y-e.h/2-8,e.w,4); ctx.fillStyle='#39ff14'; ctx.fillRect(e.x-e.w/2,e.y-e.h/2-8,e.w*e.hp/e.max,4);
      } else {
        var c = e.kind==='basic'?'#39ff14':(e.kind==='zig'?'#ff9a3b':'#ff4fd8');
        ctx.fillStyle=c; ctx.fillRect(e.x-10,e.y-6,20,12); ctx.fillRect(e.x-6,e.y-10,12,4); ctx.fillRect(e.x-14,e.y,4,8); ctx.fillRect(e.x+10,e.y,4,8);
        ctx.fillStyle='#000'; ctx.fillRect(e.x-5,e.y-3,3,3); ctx.fillRect(e.x+2,e.y-3,3,3);
      }
    });
    if(state!=='over'){ ship_(ship.x,ship.y); if(shield>0){ ctx.strokeStyle='rgba(120,200,255,.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(ship.x,ship.y+2,18,0,6.28); ctx.stroke(); } }
    parts=parts.filter(function(p){return p.life>0;});
    parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.life--; ctx.globalAlpha=Math.max(0,p.life/26); ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,3,3); });
    ctx.globalAlpha=1;
    ctx.fillStyle='#ff3b3b'; for(var l=0;l<lives;l++) ctx.fillRect(8+l*12,10,8,8);
    ctx.fillStyle='#fff'; ctx.font='8px monospace'; ctx.fillText('WAVE '+wave,W-58,16);
    if(state==='over'){ ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,0,W,H); }
    ctx.restore();
  }
  function start(){ if(state==='over'){ newGame(); state='play'; msg.textContent=''; } else if(state==='ready'){ state='play'; msg.textContent=''; } }
  function moveTo(cx,cy){ var r=cv.getBoundingClientRect(); ship.x=Math.max(14,Math.min(W-14,(cx-r.left)*(W/r.width))); ship.y=Math.max(60,Math.min(H-20,(cy-r.top)*(H/r.height)-26)); }
  cv.addEventListener('mousemove',function(e){ if(state==='play') moveTo(e.clientX,e.clientY); });
  cv.addEventListener('touchstart',function(e){ start(); moveTo(e.touches[0].clientX,e.touches[0].clientY); },{passive:true});
  cv.addEventListener('touchmove',function(e){ e.preventDefault(); if(state==='play') moveTo(e.touches[0].clientX,e.touches[0].clientY); },{passive:false});
  cv.addEventListener('click',start);
  document.addEventListener('keydown',function(e){
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].indexOf(e.key)>-1) e.preventDefault();
    if(e.key===' ') start(); keys[e.key]=true; start();
  });
  document.addEventListener('keyup',function(e){ keys[e.key]=false; });
  document.getElementById('again').addEventListener('click',function(){ newGame(); });
  newGame(); setInterval(update,1000/60);
})();
