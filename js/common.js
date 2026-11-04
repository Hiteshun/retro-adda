
(function(){
  var SOUND_KEY='retro-adda-sound';
  var enabled = false;
  try { enabled = localStorage.getItem(SOUND_KEY)==='on'; } catch(e) {}
  var ctx=null;
  function audio(){
    if(!ctx){ try{ ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return null; } }
    if(ctx.state==='suspended'){ ctx.resume(); }
    return ctx;
  }
  function beep(freq,dur,type,vol){
    if(!enabled) return;
    var c=audio(); if(!c) return;
    var o=c.createOscillator(), g=c.createGain();
    o.type=type||'square'; o.frequency.value=freq||440;
    g.gain.value=vol||0.04;
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime+(dur||0.08));
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime+(dur||0.08)+0.02);
  }
  var SEQ={
    move:[[320,.03]], eat:[[660,.05],[990,.07]], pop:[[780,.04]], flip:[[520,.03]],
    match:[[660,.06],[880,.08]], win:[[523,.1],[659,.1],[784,.1],[1047,.2]],
    lose:[[260,.15],[196,.25]], hit:[[200,.04]], jump:[[420,.05],[620,.05]], clear:[[880,.05]]
  };
  function sfx(name){
    if(!enabled) return;
    var seq=SEQ[name]||[]; var t=0;
    seq.forEach(function(s){ (function(f,d,at){ setTimeout(function(){ beep(f,d,'square',0.035); }, at); })(s[0],s[1],t*1000); t+=s[1]; });
  }
  function initSound(btn){
    function paint(){ btn.textContent='SOUND: '+(enabled?'ON':'OFF'); btn.setAttribute('aria-pressed', String(enabled)); }
    paint();
    btn.addEventListener('click', function(){
      enabled=!enabled;
      try{ localStorage.setItem(SOUND_KEY, enabled?'on':'off'); }catch(e){}
      paint(); if(enabled){ sfx('pop'); }
    });
  }
  function hiGet(k){ try{ return parseInt(localStorage.getItem('retro-adda-hi-'+k)||'0',10)||0; }catch(e){ return 0; } }
  function hiSet(k,v){
    if(v>hiGet(k)){ try{ localStorage.setItem('retro-adda-hi-'+k,String(v)); }catch(e){} return true; }
    return false;
  }
  // swipe on an element; calls cb('left'|'right'|'up'|'down') for a real swipe only.
  // Taps do not call preventDefault, so the element still gets its click.
  function swipe(el,cb,min){
    min=min||24; var sx=0,sy=0,on=false;
    el.addEventListener('touchstart',function(e){ var t=e.touches[0]; sx=t.clientX; sy=t.clientY; on=true; },{passive:true});
    el.addEventListener('touchend',function(e){
      if(!on) return; on=false;
      var t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
      if(Math.max(Math.abs(dx),Math.abs(dy))<min) return;
      e.preventDefault();
      if(Math.abs(dx)>Math.abs(dy)) cb(dx>0?'right':'left'); else cb(dy>0?'down':'up');
    },{passive:false});
  }
  function bestLine(el,key){ el.textContent=hiGet(key); }
  var sbtn=document.getElementById('sound'); if(sbtn) initSound(sbtn);
  window.Retro={beep:beep,sfx:sfx,initSound:initSound,hiGet:hiGet,hiSet:hiSet,swipe:swipe,bestLine:bestLine};
})();
