(function(){var _=function(N,U,w){if(_.cache[N]&&!w&&!U)
return _.cache[N];U=U||_.doc;var E=[];if(/^[\w[:#.][\w\]*^|=!]*$/.test(N)){var AC=N.charAt(0);switch(AC){case'#':var Q=N.slice(1);E=_.doc.getElementById(Q);if(_.doc.all&&E.id!==Q)
E=_.doc.all[Q];E=E?[E]:[];break;case'.':var P=N.slice(1),C=0;if(_.doc.getElementsByClassName)
E=(C=(E=U.getElementsByClassName(P)).length)?E:[];else{P=new RegExp('(^| +)'+P+'($| +)');var T=U.getElementsByTagName('*'),H=0,R;while(R=T[H++]){if(P.test(R.className))
E[C++]=R}
E=C?E:[]}
break;case':':var C=0,R,T=U.getElementsByTagName('*'),H=0,I=N.replace(/[^(]*\(([^)]*)\)/,"$1"),K=N.replace(/\(.*/,'');while(R=T[H++]){if(_.modificators[K]&&!_.modificators[K](R,I))
E[C++]=R}
E=C?E:[];break;case'[':var C=0,T=U.getElementsByTagName('*'),R,H=0,k=/\[([^!~^*|$ [:=]+)([$^*|]?=)?([^ :\]]+)?\]/.exec(N),B=k[1],L=k[2]||'',J=k[3];while(R=T[H++]){if(_.attr[L]&&(_.attr[L](R,B,J)||(B==='class'&&_.attr[L](R,'className',J))))
E[C++]=R}
E=C?E:[];break;default:E=(C=(E=U.getElementsByTagName(N)).length)?E:[];break}}else{if(_.doc.querySelectorAll&&N.indexOf('!=')===-1)
E=U.querySelectorAll(N);else{var r=0,z=N.split(/ *, */),n;while(n=z[r++]){var s=n.replace(/(\([^)]*)\+/,"$1%").replace(/(\[[^\]]+)~/,"$1&").replace(/(~|>|\+)/," $1 ").split(/ +/),u=s.length,G,H=0,q=' ',T=[U];while(G=s[H++]){if(G!==' '&&G!=='>'&&G!=='~'&&G!=='+'&&T){G=/([^[:.#]+)?(?:#([^[:.#]+))?(?:\.([^[:.]+))?(?:\[([^!&^*|$[:=]+)([!$^*|&]?=)?([^:\]]+)?\])?(?:\:([^(]+)(?:\(([^)]+)\))?)?/.exec(G);var V=G[1]||'*',Q=G[2],P=G[3]?new RegExp('(^| +)'+G[3]+'($| +)'):'',B=G[4],L=G[5]||'',K=G[7],I=K==='nth-child'||K==='nth-last-child'?/(?:(-?\d*)n)?(?:(%|-)(\d*))?/.exec(G[8]==='even'&&'2n'||G[8]==='odd'&&'2n%1'||!/\D/.test(G[8])&&'0n%'+G[8]||G[8]):G[8],c=[],C=0,x=0,A,g=H===u;while(A=T[x++]){switch(q){case' ':var i=A.getElementsByTagName(V),F,AA=0;while(F=i[AA++]){if((!Q||F.id===Q)&&(!P||P.test(F.className))&&(!B||(_.attr[L]&&(_.attr[L](F,B,G[6])||(B==='class'&&_.attr[L](F,'className',G[6])))))&&!F.yeasss&&!(_.modificators[K]?_.modificators[K](F,I):K)){if(g)
F.yeasss=1;c[C++]=F}}
break;case'~':V=V.toLowerCase();while((A=A.nextSibling)&&!A.yeasss){if(A.nodeType===1&&(V==='*'||A.nodeName.toLowerCase()===V)&&(!Q||A.id===Q)&&(!P||P.test(F.className))&&(!B||(_.attr[L]&&(_.attr[L](F,B,G[6])||(B==='class'&&_.attr[L](F,'className',G[6])))))&&!A.yeasss&&!(_.modificators[K]?_.modificators[K](A,I):K)){if(g)
A.yeasss=1;c[C++]=A}}
break;case'+':while((A=A.nextSibling)&&A.nodeType!==1){}
if(A&&(A.nodeName.toLowerCase()===V.toLowerCase()||V==='*')&&(!Q||A.id===Q)&&(!P||P.test(F.className))&&(!B||(_.attr[L]&&(_.attr[L](F,B,G[6])||(B==='class'&&_.attr[L](F,'className',G[6])))))&&!A.yeasss&&!(_.modificators[K]?_.modificators[K](A,I):K)){if(g)
A.yeasss=1;c[C++]=A}
break;case'>':var i=A.getElementsByTagName(V),H=0,F;while(F=i[H++]){if(F.parentNode===A&&(!Q||F.id===Q)&&(!P||P.test(F.className))&&(!B||(_.attr[L]&&(_.attr[L](F,B,G[6])||(B==='class'&&_.attr[L](F,'className',G[6])))))&&!F.yeasss&&!(_.modificators[K]?_.modificators[K](F,I):K)){if(g)
F.yeasss=1;c[C++]=F}}
break}}
T=c}else
q=G}
E=E.length?E:T;if(r>1)
E=E.concat(T)}
var C=(E=E||[]).length;while(C--)
E[C].yeasss=E[C].nodeIndex=E[C].nodeIndexLast=null}}
return _.cache[N]=E};_.cache={};_.doc=document;_.win=window;_.attr={'':function(A,B){return!!A.getAttribute(B)},'=':function(A,B,J){return(B=A.getAttribute(B))&&B===J},'&=':function(A,B,J){return(B=A.getAttribute(B))&&(new RegExp('(^| +)'+J+'($| +)').test(B))},'^=':function(A,B,J){return(B=A.getAttribute(B)+'')&&!B.indexOf(J)},'$=':function(A,B,J){return(B=A.getAttribute(B)+'')&&B.indexOf(J)===B.length-J.length},'*=':function(A,B,J){return(B=A.getAttribute(B)+'')&&B.indexOf(J)!==-1},'|=':function(A,B,J){return(B=A.getAttribute(B)+'')&&(B===J||!!B.indexOf(J+'-'))},'!=':function(A,B,J){return!(B=A.getAttribute(B))||!(new RegExp('(^| +)'+J+'($| +)').test(B))}};_.modificators={'first-child':function(A){return A.parentNode.getElementsByTagName('*')[0]!==A},'last-child':function(A){var M=A;while((M=M.nextSibling)&&M.nodeType!==1){}
return!!M},'root':function(A){return A.nodeName.toLowerCase()!=='html'},'nth-child':function(A,I){var H=A.nodeIndex||0,O=I[3]=I[3]?(I[2]==='%'?-1:1)*I[3]:0,f=I[1];if(H)
return!((H+O)%f);else{var M=A.parentNode.firstChild;H++;do{if(M.nodeType===1&&(M.nodeIndex=++H)&&A===M&&((H+O)%f))
return 0}while(M=M.nextSibling);return 1}},'nth-last-child':function(A,I){var H=A.nodeIndexLast||0,O=I[3]?(I[2]==='%'?-1:1)*I[3]:0,f=I[1];if(H)
return!((H+O)%f);else{var M=A.parentNode.lastChild;H++;do{if(M.nodeType===1&&(M.nodeLastIndex=H++)&&A===M&&((H+O)%f))
return 0}while(M=M.previousSibling);return 1}},'empty':function(A){return!!A.firstChild},'parent':function(A){return!A.firstChild},'only-child':function(A){return A.parentNode.getElementsByTagName('*').length!==1},'checked':function(A){return!A.checked},'lang':function(A,I){return A.lang!==I&&_.doc.getElementsByTagName('html')[0].lang!==I},'enabled':function(A){return A.disabled||A.type==='hidden'},'disabled':function(A){return!A.disabled},'selected':function(AD){A.parentNode.selectedIndex;return!A.selected}};if(_.doc.addEventListener){function j(){_.cache={}}
_.doc.addEventListener('DOMAttrModified',j,false);_.doc.addEventListener('DOMNodeInserted',j,false);_.doc.addEventListener('DOMNodeRemoved',j,false)}
_.isReady=0;_.ready=function(Y){if(typeof Y==='function'){if(!_.isReady)
_.ready.list[_.ready.list.length]=Y;else
Y()}else{if(!_.isReady){var C=_.ready.list.length;while(C--)
_.ready.list[C]();_.isReady=1}}};_.ready.list=[];_.bind=function(a,b,Y){if(typeof a==='string'){var v=_(a),C=0;while(a=v[C++])
_.bind(a,b,Y)}else{b='on'+b;var p=a[b];if(p){a[b]=function(){p();Y()}}else
a[b]=Y}}
_.ua=navigator.userAgent.toLowerCase();_.browser={safari:_.ua.indexOf('webkit')!=-1,opera:_.ua.indexOf('opera')!=-1,ie:_.ua.indexOf('msie')!=-1&&_.ua.indexOf('opera')==-1,mozilla:_.ua.indexOf('mozilla')!=-1&&(_.ua.indexOf('compatible')+_.ua.indexOf('webkit')==-2)};if(_.doc.addEventListener&&!_.browser.opera)
_.doc.addEventListener("DOMContentLoaded",_.ready,false);if(_.browser.ie&&_.win==top){(function(){if(_.isReady)
return;try{_.doc.documentElement.doScroll("left")}catch(X){setTimeout(arguments.callee);return}
_.ready()})()}
if(_.browser.opera){_.doc.addEventListener("DOMContentLoaded",function(){if(_.isReady)
return;var H=0,m;while(m=_.doc.styleSheets[H++]){if(m.disabled){setTimeout(arguments.callee);return}}
_.ready()},false)}
if(_.browser.safari){(function(){if(_.isReady)
return;if((_.doc.readyState!=="loaded"&&_.doc.readyState!=="complete")||_.doc.styleSheets.length!==_('style,link[rel=stylesheet]').length){setTimeout(arguments.callee);return}
_.ready()})()}
_.bind(_.win,'load',_.ready);_.modules={'yass':[]};_.load=function(S,d){var t=function(D,d,l,S){if(!(l%100)&&_.modules[D].status<2){_.modules[D].status=0;if(!(l-=1000)){_.modules[D].status=-1;return}}
switch(_.modules[D].status){case 2:try{eval(d)}catch(O){}
case 3:break;default:_.modules[D].status=1;var Z=_.doc.createElement('script');Z.src=D.indexOf('.js')+D.indexOf('/')!=-2?D:'yass.'+D+'.js';Z.type='text/javascript';Z.text=d||'';Z.title=D;Z.onreadystatechange=function(){if(this.readyState==='complete')
_.postloader(this)};Z.onload=function(X){_.postloader(X.srcElement||X.target)};_('head')[0].appendChild(Z);case 1:setTimeout(function(){t(D,d,--l,S)},10);break}},C=0,D,O;S=S.split("-");while(D=S[C++]){if(!_.modules[D]){_.modules[D]={};_.modules['yass'][_.modules['yass'].length]=D}
_.modules[D].deps=_.modules[D].deps||{'yass':[]};_.modules[D].notloaded=_.modules[D].notloaded||0;if((O=S[C-2])&&O!==D&&!_.modules[D].deps[O]){_.modules[D].deps[O]=1;_.modules[D].deps['yass'][_.modules[D].deps['yass'].length]=O;_.modules[D].notloaded++}
if(typeof _.modules[D].status==='undefined'){_.modules[D].status=0;t(D,d,11999,S)}}}
_.postloader=function(X){if(_.browser.opera){try{eval(X.innerHTML)}catch(O){}}
var e=_.modules[X.title],S=e.deps['yass'],C=S.length-1;e.status=3;while(S[C]&&_.modules[S[C]].status==2&&C--){}
if(C>-1)
return;e.status=2;if(e.init)
e.init();var h=_.modules['yass'],o=function(AB){var W,D,C=0;while(D=h[C++]){W=_.modules[D];if(W.deps[AB]&&!(--W.notloaded)&&W.status==3){W.status=2;if(W.init)
W.init();o(D)}}};o(X.title)}
_.win._=_.win._||(_.win.yass=_)})();_.ready(function(){var h=_('[class^=yass-module-]'),F,y=h.length,C=0;while(C<y){F=h[C++];_.load(F.className.slice(F.className.indexOf('yass-module-')+12),F.title);F.title=null}});