(function(){
  if(!(window.AD_CONFIG && window.AD_CONFIG.adsterra)) return;
  var slots = document.querySelectorAll('[data-ad-slot]');
  function banner(slot, key, w, h, host){
    var f = document.createElement('iframe');
    f.width = w; f.height = h; f.setAttribute('scrolling','no'); f.setAttribute('frameborder','0');
    f.style.cssText = 'border:0;max-width:100%;overflow:hidden';
    f.setAttribute('title','Advertisement');
    f.srcdoc = '<!doctype html><html><body style="margin:0"><script>atOptions={"key":"'+key+'","format":"iframe","height":'+h+',"width":'+w+',"params":{}};<\/script><script src="'+host+key+(host.indexOf('highrevenueformat')>-1?'/invoke.js':'')+'"><\/script></body></html>';
    slot.appendChild(f); slot.hidden = false;
  }
  var wide = window.innerWidth >= 760;
  if(slots[0]){
    if(wide) banner(slots[0],'8141283f67d257317d5c4650fc26ab1f',728,90,'https://bauval.org/22/');
    else banner(slots[0],'793e1b4e96ee890963009bc23e8903bc',320,50,'https://bauval.org/22/');
  }
  if(slots[1]){
    banner(slots[1],'3ecb7cf66f5d07ceef735c415d853add',300,250,'https://bauval.org/22/');
    var d = document.createElement('div'); d.id='container-04a6afd8cb03aac7efc927284368ad83'; d.style.marginTop='10px';
    slots[1].appendChild(d);
    var n = document.createElement('script'); n.async = true; n.setAttribute('data-cfasync','false');
    n.src = 'https://bauval.org/21/04a6afd8cb03aac7efc927284368ad83'; document.body.appendChild(n);
  }
  ['https://pl32258068.profitableratecpmnetwork.com/52/78/1b/52781b989551fe9785b1b8f28db2ea06.js','https://bauval.org/14/08a3cb1385c2fa170484497d4f0a4a6e'].forEach(function(u){
    var s = document.createElement('script'); s.src = u; s.setAttribute('data-cfasync','false'); document.body.appendChild(s);
  });
})();
