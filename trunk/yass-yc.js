(function(){var a=function(d,e,c){return a.x[d]&&!c&&!e?a.x[d]:a.v(d,e||a.y)};a.v=function(B,A){var d;if(/^(.)[\w\]*^|=!]+$/.exec(B)){switch(RegExp.$1){case"#":var t=B.slice(1);d=a.y.getElementById(t);if(a.y.all&&d.id!==t&&(d=a.y.all[t])){var e=d.length;while(e--){var z=d[e];if(z.id===t){d=z;e=0}}}break;default:var s=0,r=[];switch(RegExp.$1){case".":var q=B.slice(1);if(a.y.getElementsByClassName){r=A.getElementsByClassName(q);s=r.length}else{var w=A.getElementsByTagName("*"),C=0,z;while(z=w[C++]){var v=z.className,g=new RegExp("/ "+q+"$/"),k=new RegExp("/^"+q+" /");if(v===q||g.test(v)||k.test(v)){r[s++]=z}}}break;case":":var z,w=A.getElementsByTagName("*"),C=0,n=B.replace(/[^(]*\(([^)]*)\)/,"$1"),f=B.replace(/\(.*/,"");while(z=w[C++]){if(a.w[f]&&!a.w[f](z,n)){r[s++]=z}}break;case"[":var w=A.getElementsByTagName("*"),z,C=0,u=/\[([^!~^*|$\s[:=]+)([$^*|]?=)?([^\s:\]]+)?\]/.exec(B),y=u[1]==="class"?"className":u[1],c=u[2]||"",x=u[3];while(z=w[C++]){if(a.u[c]&&a.u[c](z,y,x)){r[s++]=z}}break;default:r=A.getElementsByTagName(B);s=r.length;break}d=s?s>1?r:r[0]:null;break}}else{if(a.y.querySelectorAll){d=A.querySelectorAll(B)}else{var F=0,I=B.split(/ *, */),m,d=null;while(m=I[F++]){var G=m.replace(/(\([^)]*)\+/,"$1%").replace(/(~|>|\+)/," $1 ").split(/ +/),E=G.length,K,C=0,L=" ",w=A;while(K=G[C++]){if(!a.ancestors[K]&&w){K=/([^\s[:.#]+)?(?:#([^\s[:.#]+))?(?:\.([^\s[:.]+))?(?:\[([^!~^*|$\s[:=]+)([!$^*|]?=)?([^\s:\]]+)?\])?(?:\:([^\s(]+)(?:\(([^)]+)\))?)?/.exec(K);var M=K[1]||"*",t=K[2],q=K[3],y=K[4]==="class"?"className":K[4],c=K[5]||"",x=K[6],f=K[7],n=a.z[f]?/(?:(-?\d*)n)?(?:(%|-)(\d*))?/.exec(K[8]==="even"&&"2n"||K[8]==="odd"&&"2n%1"||!/\D/.test(K[8])&&"0n%"+K[8]||K[8]):K[8],r=[],s=0,p=0,l,o=C===E;w=w.length?w:[w];while(l=w[p++]){switch(L){case" ":var j=l.getElementsByTagName(M),H,D=0;while(H=j[D++]){if((!t||(t&&H.id===t))&&(!q||H.className.indexOf(q)!==-1)&&(!y||(a.u[c]&&a.u[c](H,y,x)))&&!H.yeasss&&(!(a.w[f]?a.w[f](H,n):f))){if(o){H.yeasss=1}r[s++]=H}}break;case"~":M=M.toLowerCase();while((l=l.nextSibling)&&!l.yeasss){if(l.nodeType===1&&(M==="*"||l.nodeName.toLowerCase()===M)&&(!t||l.id===t)&&(!q||l.className.indexOf(q)!==-1)&&(!y||(a.u[c]&&a.u[c](l,y,x)))&&!l.yeasss&&(!(a.w[f]?a.w[f](l,n):f))){if(o){l.yeasss=1}r[s++]=l}}break;case"+":while((l=l.nextSibling)&&l.nodeType!==1){}if(l&&(l.nodeName.toLowerCase()===M.toLowerCase()||M==="*")&&(!t||l.id===t)&&(!q||l.className.indexOf(q)!==-1)&&(!y||(a.u[c]&&a.u[c](l,y,x)))&&!l.yeasss&&(!(a.w[f]?a.w[f](l,n):f))){if(o){l.yeasss=1}r[s++]=l}break;case">":var j=l.getElementsByTagName(M),C=0,H;while(H=j[C++]){if(H.parentNode===l&&(!t||H.id===t)&&(!q||H.className.indexOf(q)!==-1)&&(!y||(a.u[c]&&a.u[c](H,y,x)))&&!H.yeasss&&(!(a.w[f]?a.w[f](H,n):f))){if(o){H.yeasss=1}r[s++]=H}}break}}w=s?s===1?r[0]:r:null}else{L=K}}d=d||w;if(w&&F>1){d=(d.length?d:[d]).concat(w)}}var s=d?d.length||(d.yeasss=null):0;while(s--){d[s].yeasss=d[s].nodeIndex=d[s].nodeIndexLast=null}}}return a.x[B]=d};a.x={};a.y=document;a.ancestors={" ":1,"+":1,">":1,"~":1};a.z={"nth-child":1,"nth-last-child":1};a.u={"":function(d,c){return !!d[c]},"=":function(e,c,d){return e[c]&&e[c]===d},"~=":function(e,c,d){return e[c]&&(e[c].indexOf(d)+e[c].indexOf(" "+d)+e[c].indexOf(d+" ")!==-3)},"^=":function(e,c,d){return e[c]&&!!e[c].indexOf(d)},"$=":function(e,c,d){return e[c]&&e[c].indexOf(d)===e[c].length-d.length},"*=":function(e,c,d){return e[c]&&e[c].indexOf(d)!==-1},"|=":function(f,c,e){var d=f[c];return d&&(d===e||!!d.indexOf(e+"-"))},"!=":function(e,c,d){return !e[c]||(e[c].indexOf(d)+e[c].indexOf(" "+d)+e[c].indexOf(d+" ")===-3)}};a.w={"first-child":function(c){return c.parentNode.getElementsByTagName("*")[0]!==c},"last-child":function(d){var c=d;while((c=c.nextSibling)&&c.nodeType!==1){}return !!c},root:function(c){return c.nodeName.toLowerCase()!=="html"},"nth-child":function(f,e){var d=f.nodeIndex||0;e[3]=e[3]?(e[2]==="%"?-1:1)*e[3]:0;if(d){return !((d+e[3])%e[1])}else{var c=f.parentNode.firstChild;d++;do{if(c.nodeType===1){if((c.nodeIndex=++d)&&f===c&&((d+e[3])%e[1])){return 0}}}while(c=c.nextSibling);return 1}},"nth-last-child":function(f,e){var d=f.nodeIndexLast||0;e[3]=e[3]?(e[2]==="%"?-1:1)*e[3]:0;if(d){return !((d+e[3])%e[1])}else{var c=f.parentNode.firstChild;d++;do{if(c.nodeType===1){if((c.nodeIndex=d++)&&f===c&&((d+e[3])%e[1])){return 0}}}while(c=c.nextSibling);return 1}},empty:function(c){return !!c.firstChild},parent:function(c){return !c.firstChild},"only-child":function(c){return c.parentNode.getElementsByTagName("*").length!==1},checked:function(c){return !c.checked},lang:function(d,c){return d.lang!==c&&a.y.getElementsByTagName("html")[0].lang!==c},enabled:function(c){return c.disabled||c.type==="hidden"},disabled:function(c){return !c.disabled},selected:function(c){child.parentNode.selectedIndex;return !child.selected}};if(a.y.addEventListener){function b(){a.x={}}a.y.addEventListener("DOMAttrModified",b,false);a.y.addEventListener("DOMNodeInserted",b,false);a.y.addEventListener("DOMNodeRemoved",b,false)}window.yass=a;window._=window._||a})();