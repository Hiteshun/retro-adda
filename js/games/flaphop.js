(function(){
  var cv=document.getElementById('game'), ctx=cv.getContext('2d');
  var scoreEl=document.getElementById('score'), bestEl=document.getElementById('best'), msg=document.getElementById('msg');
  var W=cv.width, H=cv.height, KEY='flaphop', GROUND=H-40;
  var PW=48, GRAV=0.38, FLAP=-6.6;
  var bird, pipes, coins, parts, score, state, frame, speed, gap, spawnIn, night, shield, nCoins;
  Retro.bestLine(bestEl,KEY);
  function newGame(){
    bird={x:80,y:H/2-40,vy:0,r:11};
    pipes=[]; coins=[]; parts=[]; score=0; state='ready'; frame=0; speed=2.2; gap=135; spawnIn=40; night=false; shield=0; nCoins=0;
    scoreEl.textContent='0'; msg.textContent='TAP OR SPACE TO FLAP';
  }
  function burst(x,y,c,n){ for(var i=0;i<n;i++){ var a=Math.random()*6.28,v=.6+Math.random()*2; parts.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:16+Math.random()*10,c:c}); } }
  function flap(){
    if(state==='over'){ newGame(); return; }
    if(state==='ready'){ state='play'; msg.textContent=''; }
    if(state==='play'){ bird.vy=FLAP; Retro.sfx('jump'); burst(bird.x-8,bird.y+6,'#fff',4); }
  }
  function die(){
    if(state!=='play') return;
    if(shield>0){ shield=0; bird.vy=FLAP; burst(bird.x,bird.y,'#7cf',14); Retro.sfx('hit'); msg.textContent='SHIELD SAVED YOU!'; setTimeout(function(){ if(state==='play') msg.textContent=''; },900); return; }
    state='over'; Retro.sfx('lose'); burst(bird.x,bird.y,'#ffe600',26);
    msg.textContent='SCORE '+score+' · TAP TO RETRY';
    if(Retro.hiSet(KEY,score)) bestEl.textContent=score;
  }
  function spawn(){
    var top=30+Math.random()*(GROUND-gap-60);
    var p={x:W, top:top, passed:false, gap:gap};
    pipes.push(p);
    coins.push({x:W+PW/2, y:top+gap/2, got:false, kind: (score>3 && Math.random()<0.18)?'shield':'coin'});
  }
  function update(){
    frame++;
    if(state==='play'){
      bird.vy+=GRAV; bird.y+=bird.vy;
      spawnIn--;
      if(spawnIn<=0){ spawn(); spawnIn=Math.round(210/speed); }
      pipes.forEach(function(p){ p.x-=speed; });
      coins.forEach(function(c){ c.x-=speed; });
      pipes=pipes.filter(function(p){ return p.x+PW>-6; });
      coins=coins.filter(function(c){ return c.x>-20 && !c.got; });
      pipes.forEach(function(p){
        if(!p.passed && p.x+PW<bird.x-bird.r){
          p.passed=true; score++; scoreEl.textContent=score; Retro.sfx('eat');
          if(score%5===0){ speed=Math.min(4.2,speed+0.25); gap=Math.max(105,gap-4); msg.textContent='FASTER!'; setTimeout(function(){ if(state==='play') msg.textContent=''; },700); }
          if(score%10===0){ night=!night; }
        }
        var bx=bird.x-bird.r+3, bxr=bird.x+bird.r-3, by=bird.y-bird.r+3, byb=bird.y+bird.r-3;
        if(bxr>p.x && bx<p.x+PW && (by<p.top || byb>p.top+p.gap)){ die(); if(state==='play'){ p.x-=60; } }
      });
      coins.forEach(function(c){
        var dx=c.x-bird.x, dy=c.y-bird.y;
        if(dx*dx+dy*dy<(bird.r+9)*(bird.r+9)){
          c.got=true;
          if(c.kind==='shield'){ shield=1; burst(c.x,c.y,'#7cf',14); Retro.sfx('win'); msg.textContent='SHIELD!'; setTimeout(function(){ if(state==='play') msg.textContent=''; },800); }
          else { score+=2; nCoins++; scoreEl.textContent=score; burst(c.x,c.y,'#ffe600',10); Retro.sfx('win'); }
        }
      });
      if(bird.y+bird.r>=GROUND){ bird.y=GROUND-bird.r; die(); if(state==='play') bird.vy=FLAP; }
      if(bird.y-bird.r<=0){ bird.y=bird.r; bird.vy=1; }
    } else if(state==='ready'){
      bird.y=H/2-40+Math.sin(frame/12)*6; bird.vy=0;
    } else if(state==='over'){
      if(bird.y+bird.r<GROUND){ bird.vy+=GRAV; bird.y+=bird.vy; if(bird.y+bird.r>GROUND) bird.y=GROUND-bird.r; }
    }
    draw();
  }
  function px(x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); }
  function draw(){
    var bands = night ? ['#0b1030','#101845','#162057','#1d2a6b'] : ['#5ec8ff','#56bdfa','#4eb2f5','#46a7ef'];
    for(var i=0;i<bands.length;i++) px(0,i*(H/bands.length),W,Math.ceil(H/bands.length)+1,bands[i]);
    if(night){ for(var s=0;s<14;s++){ px((s*53+frame*0.1)%W,(s*37)%(GROUND-40),2,2,'#fff'); } px(250,40,22,22,'#f4f1c9'); px(258,36,18,18,bands[0]); }
    var off=(frame*0.3)%(W+120);
    [[40,70],[180,120],[260,50]].forEach(function(c){
      var x=((c[0]-off)%(W+120)+W+120)%(W+120)-60; var cc=night?'#3a4580':'#fff';
      px(x,c[1],50,12,cc); px(x+12,c[1]-8,26,10,cc); px(x+6,c[1]+12,34,4,night?'#2c3668':'#e6f7ff');
    });
    pipes.forEach(function(p){
      var g=p.gap;
      px(p.x,0,PW,p.top,'#2fb83a'); px(p.x,0,4,p.top,'#7cff6b'); px(p.x-4,p.top-14,PW+8,14,'#2fb83a'); px(p.x-4,p.top-14,PW+8,3,'#7cff6b');
      var by=p.top+g;
      px(p.x,by,PW,GROUND-by,'#2fb83a'); px(p.x,by,4,GROUND-by,'#7cff6b'); px(p.x-4,by,PW+8,14,'#2fb83a'); px(p.x-4,by,PW+8,3,'#7cff6b');
    });
    coins.forEach(function(c){
      var bob=Math.sin((frame+c.x)/8)*3;
      if(c.kind==='shield'){ ctx.fillStyle='#7cf'; ctx.beginPath(); ctx.arc(c.x,c.y+bob,9,0,6.28); ctx.fill(); ctx.fillStyle='#fff'; ctx.fillRect(c.x-2,c.y+bob-5,4,10); ctx.fillRect(c.x-5,c.y+bob-2,10,4); }
      else { ctx.fillStyle='#ffd400'; ctx.beginPath(); ctx.arc(c.x,c.y+bob,8,0,6.28); ctx.fill(); ctx.fillStyle='#fff3a0'; ctx.fillRect(c.x-3,c.y+bob-5,3,8); ctx.strokeStyle='#b88a00'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(c.x,c.y+bob,8,0,6.28); ctx.stroke(); }
    });
    px(0,GROUND,W,8,'#7be04a'); px(0,GROUND+8,W,H-GROUND-8,'#c8843a');
    var sh=(frame*speed)%16; for(var g2=-16;g2<W;g2+=16) px(g2-sh+16,GROUND+8,8,4,'#a86a2a');
    var tilt=Math.max(-0.5,Math.min(1.2,bird.vy/8));
    ctx.save(); ctx.translate(bird.x,bird.y); ctx.rotate(tilt);
    if(shield>0){ ctx.strokeStyle='rgba(120,200,255,.9)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,bird.r+5,0,6.28); ctx.stroke(); }
    px(-bird.r,-bird.r,bird.r*2,bird.r*2,'#ffe600');
    px(-bird.r,-bird.r,bird.r*2,3,'#fff6a0');
    px(2,-6,6,6,'#fff'); px(5,-4,3,3,'#000');
    px(bird.r-4,-2,8,5,'#ff7a1a'); px(bird.r-4,2,6,3,'#e05a00');
    var wy = (Math.floor(frame/6)%2)?2:-4;
    px(-bird.r+2,wy+3,8,6,'#ffb347');
    ctx.restore();
    parts=parts.filter(function(p){ return p.life>0; });
    parts.forEach(function(p){ p.x+=p.vx; p.y+=p.vy; p.life--; ctx.globalAlpha=Math.max(0,p.life/24); ctx.fillStyle=p.c; ctx.fillRect(p.x,p.y,3,3); });
    ctx.globalAlpha=1;
    ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.fillText('COINS '+nCoins,8,14);
    if(state==='over'){ ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(0,0,W,H); }
  }
  function onInput(){ flap(); }
  cv.addEventListener('click',onInput);
  document.addEventListener('keydown',function(e){
    if(e.key===' '||e.key==='ArrowUp'||e.key==='w'){ e.preventDefault(); flap(); }
  });
  var flapBtn=document.getElementById('flapbtn');
  if(flapBtn) flapBtn.addEventListener('click',onInput);
  document.getElementById('again').addEventListener('click',newGame);
  newGame();
  setInterval(update,1000/60);
  draw();
})();
