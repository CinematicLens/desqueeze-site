(()=>{const N=()=>{if(document.getElementById("fs-carousel-styles-v3"))return;const e=document.createElement("style");e.id="fs-carousel-styles-v3",e.textContent=`
				.fs-pill{
					border-radius: 999px;
					border: 1px solid rgba(255,255,255,0.10);
					background: rgba(0,0,0,0.30);
					padding: 0.25rem 0.75rem;
					font-size: 0.75rem;
					font-weight: 600;
					color: rgba(255,255,255,0.82);
					transition: background 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
				}
				.fs-pill:hover{
					background: rgba(255,255,255,0.06);
					border-color: rgba(255,255,255,0.16);
					box-shadow: 0 0 0 4px rgba(255,106,0,0.12);
					transform: translateY(-1px);
				}
				.fs-carousel-viewport{
					overflow: hidden;
					/* No padding here: padding would be clipped during translateX */
					padding: 14px 0 12px;
				}
				.fs-carousel-track{
					display: flex;
					gap: 22px;
					align-items: center;
					/* Inset lives on the track so corners never clip */
					padding: 6px 26px 18px;
					will-change: transform;
					transform: translateX(0px);
					transition: transform 650ms cubic-bezier(0.2, 0.9, 0.2, 1);
				}
				.fs-slide{
					flex: 0 0 auto;
					width: clamp(210px, 24vw, 300px);
					transform: translateY(0px);
					transition: transform 240ms ease, opacity 240ms ease;
					opacity: 0.9;
				}
				.fs-slide.is-active{ opacity: 1; }
				.fs-slide:hover{ transform: translateY(-12px); opacity: 1; }
				.fs-slide-inner{
					aspect-ratio: 9 / 16;
					border-radius: 22px;
					border: 1px solid rgba(255,255,255,0.14);
					background: rgba(0,0,0,0.55);
					overflow: hidden;
					box-shadow: 0 28px 90px rgba(0,0,0,0.55);
					backdrop-filter: blur(10px);
					transition: border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
				}
				.fs-slide:hover .fs-slide-inner{
					border-color: rgba(255,255,255,0.22);
					box-shadow:
						0 28px 90px rgba(0,0,0,0.55),
						0 0 0 4px rgba(255,106,0,0.14);
				}
				.fs-slide-inner img{
					width: 100%;
					height: 100%;
					object-fit: contain;
					display: block;
				}
				.fs-carousel-controls{
					margin-top: 14px;
					display: flex !important;
					align-items: center;
					justify-content: space-between;
					gap: 14px;
					padding: 10px 12px;
					max-width: 640px;
					margin-left: auto;
					margin-right: auto;
					min-height: 56px;
					visibility: visible;
					opacity: 1;
					border-radius: 999px;
					border: 1px solid rgba(255,255,255,0.14);
					background: rgba(0,0,0,0.45);
					color: rgba(255,255,255,0.92);
					backdrop-filter: blur(12px);
					box-shadow: 0 18px 60px rgba(0,0,0,0.45);
					position: relative;
					z-index: 50;
				}
				.fs-carousel-btn{
					width: 54px;
					height: 40px;
					border-radius: 999px;
					border: 1px solid rgba(255,255,255,0.18);
					background: rgba(255,255,255,0.06);
					color: rgba(255,255,255,0.92);
					display: grid;
					place-items: center;
					transition: transform 160ms ease, background 160ms ease;
					flex: 0 0 auto;
				}
				.fs-carousel-btn:hover{
					background: rgba(255,255,255,0.10);
					transform: translateY(-1px);
				}
				.fs-carousel-btn svg{ width: 22px; height: 22px; }
				.fs-carousel-btn svg path{ stroke: currentColor; }
				.fs-carousel-dots{
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					flex: 1 1 auto;
					min-width: 0;
					overflow: hidden;
				}
				.fs-dot{
					width: 9px;
					height: 6px;
					border-radius: 999px;
					border: 1px solid rgba(255,255,255,0.22);
					background: rgba(255,255,255,0.18);
					transition: width 160ms ease, background 160ms ease;
				}
				.fs-dot.is-active{
					width: 22px;
					background: rgba(255,255,255,0.85);
				}
				.fs-showcase-tab{
					transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
				}
				.fs-showcase-tab:hover{
					background: rgba(255,255,255,0.05);
					border-color: rgba(255,255,255,0.16);
					transform: translateY(-1px);
				}
				.fs-showcase-tab.is-active{
					border-color: rgba(255,106,0,0.55);
					box-shadow: 0 0 0 4px rgba(255,106,0,0.10);
					background: rgba(0,0,0,0.42);
				}
				.fs-showcase-tab.is-active .fs-showcase-tab-icon.fs-icon-cell{
					border-color: rgba(255,106,0,0.55);
					box-shadow:
						0 0 0 1px rgba(255,106,0,0.18),
						0 0 0 4px rgba(255,106,0,0.10),
						0 12px 40px rgba(255,106,0,0.12);
				}
				.fs-icon-cell{
					box-sizing: border-box;
					background: #1a1a1a;
					border-radius: 12px;
					padding: 12px;
					border: 1px solid rgba(255,106,0,0.35);
					box-shadow:
						0 0 0 1px rgba(255,106,0,0.10),
						0 10px 30px rgba(255,106,0,0.08);
					display: grid;
					place-items: center;
					color: rgb(255, 106, 0);
					transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
				}
				.fs-icon-cell svg{
					display: block;
				}
				.fs-icon-cell:hover{
					transform: scale(1.05);
					border-color: rgba(255,106,0,0.55);
					box-shadow:
						0 0 0 1px rgba(255,106,0,0.16),
						0 12px 40px rgba(255,106,0,0.14);
				}
				.fs-icon-cell--row{
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					gap: 6px;
					padding: 10px 11px;
				}
				.fs-icon-cell--sm{
					width: 34px;
					height: 34px;
					padding: 8px;
					border-radius: 10px;
				}
				@media (max-width: 640px){
					.fs-carousel-track{ gap: 14px; }
					.fs-carousel-btn{ width: 46px; height: 38px; }
					.fs-carousel-controls{ padding: 9px 10px; gap: 10px; }
				}
				@media (max-width: 640px){
					.fs-carousel-track{ padding-left: 18px; padding-right: 18px; }
				}
			`.trim(),document.head.appendChild(e)};(()=>{const e=document.querySelector("[data-fs-showcase]");if(!(e instanceof HTMLElement)||e.dataset.fsShowcaseInit==="1")return;e.dataset.fsShowcaseInit="1",N();const o=Array.from(e.querySelectorAll("[data-fs-showcase-tab]")),t=Array.from(e.querySelectorAll("[data-fs-showcase-panel]")),i=c=>{o.forEach(s=>{if(!(s instanceof HTMLButtonElement))return;const n=Number(s.getAttribute("data-fs-showcase-tab")??"-1")===c;s.classList.toggle("is-active",n),s.setAttribute("aria-selected",n?"true":"false")}),t.forEach(s=>{if(!(s instanceof HTMLElement))return;const a=Number(s.getAttribute("data-fs-showcase-panel")??"-1");s.classList.toggle("hidden",a!==c)})};o.forEach(c=>{c instanceof HTMLButtonElement&&c.addEventListener("click",()=>{const s=Number(c.getAttribute("data-fs-showcase-tab")??"0");Number.isFinite(s)&&i(s)})}),i(0)})(),(()=>{const e=document.querySelectorAll("[data-mobile-nav]"),o=window.matchMedia("(min-width: 1024px)");e.forEach(t=>{if(!(t instanceof HTMLElement)||t.dataset.mobileNavBound==="1")return;t.dataset.mobileNavBound="1";const i=t.querySelector("[data-mobile-nav-toggle]"),c=t.querySelector("[data-mobile-nav-panel]");if(!(i instanceof HTMLButtonElement)||!(c instanceof HTMLElement))return;const s=i.querySelector(".sr-only"),a=n=>{c.classList.toggle("hidden",!n),i.setAttribute("aria-expanded",n?"true":"false"),s&&(s.textContent=n?"Close menu":"Open menu")};i.addEventListener("click",()=>{a(c.classList.contains("hidden"))}),c.querySelectorAll("a").forEach(n=>{n.addEventListener("click",()=>a(!1))}),o.addEventListener("change",()=>{o.matches&&a(!1)}),document.addEventListener("keydown",n=>{n.key==="Escape"&&(c.classList.contains("hidden")||a(!1))})})})();let O=()=>{},D=()=>{};const I=document.querySelector("[data-suite-accordion]");if(I instanceof HTMLElement){const e=Array.from(I.querySelectorAll("[data-suite-trigger]")),o=Array.from(I.querySelectorAll("[data-suite-pane]")),t=(a,n)=>{const u=document.getElementById(a);if(!u)return;const m=document.querySelector("header.sticky"),h=m instanceof HTMLElement?Math.ceil(m.getBoundingClientRect().height):0,x=h>0?h+14:86,r=Math.max(0,Math.floor(u.getBoundingClientRect().top+window.scrollY-x));window.scrollTo({top:r,behavior:n})},i=a=>{e.forEach(n=>{if(!(n instanceof HTMLButtonElement))return;const m=(n.getAttribute("data-suite-trigger")??"")===a;n.setAttribute("aria-expanded",m?"true":"false")}),o.forEach(n=>{if(!(n instanceof HTMLElement))return;const u=n.getAttribute("data-suite-pane")??"";n.classList.toggle("hidden",u!==a)}),a==="filmstudio"?O():D()},c=()=>{e.forEach(a=>{a instanceof HTMLButtonElement&&a.setAttribute("aria-expanded","false")}),o.forEach(a=>{a instanceof HTMLElement&&a.classList.add("hidden")})};e.forEach(a=>{a instanceof HTMLButtonElement&&a.addEventListener("click",()=>{const n=a.getAttribute("data-suite-trigger")??"";if(a.getAttribute("aria-expanded")==="true")c();else{i(n);const m=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??!1;t(n,m?"auto":"smooth")}})});const s=()=>{const a=(window.location.hash||"").replace("#","");if(!a||!new Set(["filmstudio","anamorphic","cinelut"]).has(a))return;i(a);const u=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??!1;t(a,u?"auto":"smooth")};window.location.hash?s():i("anamorphic"),window.addEventListener("hashchange",s)}const P=()=>{const e=document.querySelector("[data-fs-carousel-root]");if(!(e instanceof HTMLElement)||e.dataset.fsInit==="1")return;e.dataset.fsInit="1",N();const o=e.querySelector("[data-fs-viewport]"),t=e.querySelector("[data-fs-track]"),i=e.querySelector("[data-fs-prev]"),c=e.querySelector("[data-fs-next]"),s=e.querySelector("[data-fs-dots]");let a=Array.from(e.querySelectorAll("[data-fs-dot]"));const n=Array.from(e.querySelectorAll("[data-fs-slide]")),u=e.querySelector("[data-fs-shot-label]"),m=e.querySelector("[data-fs-shot-count]");if(!(o instanceof HTMLElement)||!(t instanceof HTMLElement)||n.length===0||!(()=>{try{const d=JSON.parse(e.getAttribute("data-fs-shots")??"[]");return(Array.isArray(d)?d.filter(p=>typeof p=="string"):[]).slice().sort((p,y)=>p.localeCompare(y))}catch{return[]}})().length)return;let r=null,l=0,H=3,w=0,z=0;const G=window.matchMedia("(prefers-reduced-motion: reduce)").matches,Y=(d,f,p)=>Math.max(f,Math.min(p,d)),_=(d,f)=>f<=0?0:(d%(f+1)+(f+1))%(f+1);function B(d,f="smooth"){l=_(d,w),A(f==="smooth"?"smooth":"auto")}const W=()=>{const d=o.getBoundingClientRect().width;if(!Number.isFinite(d)||d<40)return!1;d<520?H=1:d<900?H=2:H=3;const f=n.find(E=>E instanceof HTMLElement);if(!(f instanceof HTMLElement))return!1;const p=f.getBoundingClientRect().width,y=parseFloat(getComputedStyle(t).columnGap||getComputedStyle(t).gap||"22")||22;if(z=p+y,w=Math.max(0,Math.ceil(n.length/H)-1),l=Y(l,0,w),s instanceof HTMLElement){s.style.display=w===0?"none":"flex",s.innerHTML="";for(let E=0;E<=w;E++){const k=document.createElement("button");k.type="button",k.className="fs-dot",k.setAttribute("aria-label",`Go to page ${E+1}`),k.setAttribute("data-fs-dot",String(E)),k.addEventListener("click",()=>B(E,"smooth")),s.appendChild(k)}a=Array.from(s.querySelectorAll("[data-fs-dot]"))}return!0},J=()=>{const d=l*H,f=Y(d,0,n.length-1);n.forEach((p,y)=>{p instanceof HTMLElement&&p.classList.toggle("is-active",y===f)}),a.forEach(p=>{if(!(p instanceof HTMLElement))return;const y=Number(p.getAttribute("data-fs-dot")??"-1");p.classList.toggle("is-active",y===l)}),u instanceof HTMLElement&&(u.textContent="FilmStudio screenshots"),m instanceof HTMLElement&&(m.textContent=`${l+1}/${w+1}`)};function A(d){if(!W()){requestAnimationFrame(()=>A(d));return}J();const f=l*H*z;d==="auto"?(t.style.transition="none",t.style.transform=`translateX(${-f}px)`,t.getBoundingClientRect(),t.style.transition="transform 650ms cubic-bezier(0.2, 0.9, 0.2, 1)"):t.style.transform=`translateX(${-f}px)`}const F=()=>{r&&(window.clearInterval(r),r=null)},R=()=>{G||w<=0||(r=window.setInterval(()=>B(l+1,"smooth"),2600))};i instanceof HTMLButtonElement&&i.addEventListener("click",()=>B(l-1,"smooth")),c instanceof HTMLButtonElement&&c.addEventListener("click",()=>B(l+1,"smooth")),e.addEventListener("mouseenter",F),e.addEventListener("mouseleave",()=>{r||R()}),new ResizeObserver(()=>A("auto")).observe(o),A("auto"),R(),O=()=>{F(),A("auto"),R()},D=()=>F()};P(),new MutationObserver(()=>P()).observe(document.documentElement,{childList:!0,subtree:!0});const $=document.querySelector("[data-contact-form]"),L=document.querySelector("[data-contact-status]"),b=document.querySelector("[data-contact-email]"),U=document.querySelector("[data-email-error]"),v=document.querySelector("[data-copy-email]"),M=document.querySelector("[data-copy-status]");if($ instanceof HTMLFormElement){const e=()=>{if(!(b instanceof HTMLInputElement))return!0;b.setCustomValidity("");const o=b.value.trim(),t=b.checkValidity()&&/^\S+@\S+\.\S+$/.test(o);return b.setCustomValidity(t?"":"Invalid email"),U instanceof HTMLElement&&U.classList.toggle("hidden",t),b.classList.toggle("border-[#ff6a00]",!t),t};b instanceof HTMLInputElement&&(b.addEventListener("input",()=>e()),b.addEventListener("blur",()=>e())),$.addEventListener("submit",o=>{if(o.preventDefault(),!e()){L instanceof HTMLElement&&(L.textContent="Please enter a valid email."),b instanceof HTMLInputElement&&b.focus();return}const t=new FormData($),i=String(t.get("name")??"").trim(),c=String(t.get("email")??"").trim(),s=String(t.get("topic")??"").trim(),a=String(t.get("message")??"").trim();if(!i||!c||!a){L instanceof HTMLElement&&(L.textContent="Please fill all fields.");return}const n=s||"Contact",u=`DeSqueeze Studio — ${n} (${i})`,m=`Topic: ${n}
Name: ${i}
Email: ${c}

Message:
${a}
`,h="teamcentersap@gmail.com",x=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(h)}&su=${encodeURIComponent(u)}&body=${encodeURIComponent(m)}`,r=`mailto:${h}?subject=${encodeURIComponent(u)}&body=${encodeURIComponent(m)}`;L instanceof HTMLElement&&(L.textContent="Opening Gmail…"),window.open(x,"_blank","noopener,noreferrer")||(window.location.href=x,window.setTimeout(()=>{window.location.href=r},400))})}v instanceof HTMLButtonElement&&v.addEventListener("click",async()=>{const e="teamcentersap@gmail.com",o=v.querySelector("[data-copy-label]"),t=v.querySelector("[data-copy-check]");try{await navigator.clipboard.writeText(e),o instanceof HTMLElement&&(o.textContent="Copied"),t instanceof SVGElement&&t.classList.remove("hidden"),M instanceof HTMLElement&&(M.textContent="Copied"),v.disabled=!0,window.setTimeout(()=>{o instanceof HTMLElement&&(o.textContent="Copy"),t instanceof SVGElement&&t.classList.add("hidden"),M instanceof HTMLElement&&(M.textContent=""),v.disabled=!1},2e3)}catch{M instanceof HTMLElement&&(M.textContent=e)}});const g=document.querySelector("[data-topic-trigger]"),S=document.querySelector("[data-topic-list]"),V=document.querySelector("[data-topic-value]"),q=document.querySelector("[data-topic-input]"),X=Array.from(document.querySelectorAll("[data-topic-option]")),C=()=>{g instanceof HTMLButtonElement&&S instanceof HTMLElement&&(g.setAttribute("aria-expanded","false"),S.classList.add("hidden"))},j=()=>{if(!(g instanceof HTMLButtonElement)||!(S instanceof HTMLElement))return;g.setAttribute("aria-expanded","true");const e=q instanceof HTMLInputElement?q.value:"";X.forEach(o=>{const t=o.getAttribute("data-topic-option")??"";e&&t===e?o.classList.add("hidden"):o.classList.remove("hidden")}),S.classList.remove("hidden")};g instanceof HTMLButtonElement&&S instanceof HTMLElement&&(g.addEventListener("click",()=>{g.getAttribute("aria-expanded")==="true"?C():j()}),window.addEventListener("keydown",e=>{e.key==="Escape"&&C()}),window.addEventListener("click",e=>{const o=e.target;o instanceof Node&&(g.contains(o)||S.contains(o)||C())})),X.forEach(e=>{e.addEventListener("click",()=>{const o=e.getAttribute("data-topic-option")??"";V instanceof HTMLElement&&(V.textContent=o||"Other"),q instanceof HTMLInputElement&&(q.value=o||"Other"),C()})});{const e=document.querySelector("[data-ba-root]"),o=document.querySelector("[data-ba-before]"),t=document.querySelector("[data-ba-divider]"),i=document.querySelector("[data-ba-handle]");if(e instanceof HTMLElement&&o instanceof HTMLElement&&t instanceof HTMLElement&&i instanceof HTMLElement){let c=!1,s=50;const a=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??!1,n=r=>{s=Math.min(100,Math.max(0,r)),o.style.width=`${s}%`,t.style.left=`${s}%`,t.style.transform="translateX(-50%)",i.style.left=`${s}%`,i.setAttribute("aria-valuenow",String(Math.round(s)))},u=r=>{const l=e.getBoundingClientRect();return l.width<=0?50:(r-l.left)/l.width*100};i.setAttribute("role","slider"),i.setAttribute("aria-valuemin","0"),i.setAttribute("aria-valuemax","100"),i.setAttribute("aria-valuenow","50"),e.style.touchAction="none",e.style.userSelect="none";const m=r=>{if(!(r.pointerType==="mouse"&&r.button!==0)){c=!0;try{e.setPointerCapture(r.pointerId)}catch{}n(u(r.clientX)),r.preventDefault()}},h=r=>{c&&n(u(r.clientX))},x=r=>{if(c){c=!1;try{e.releasePointerCapture(r.pointerId)}catch{}}};e.addEventListener("pointerdown",m),e.addEventListener("pointermove",h),e.addEventListener("pointerup",x),e.addEventListener("pointercancel",x),a||i.addEventListener("keydown",r=>{const l=r.shiftKey?10:2;r.key==="ArrowLeft"||r.key==="ArrowDown"?(r.preventDefault(),n(s-l)):(r.key==="ArrowRight"||r.key==="ArrowUp")&&(r.preventDefault(),n(s+l))}),n(50)}}const T=document.querySelector("[data-scroll-top]");if(T instanceof HTMLButtonElement){const e=window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??!1,o=()=>{T.classList.remove("hidden"),T.classList.add("flex")},t=()=>{T.classList.add("hidden"),T.classList.remove("flex")},i=()=>{window.scrollY>600?o():t()};i(),window.addEventListener("scroll",i,{passive:!0}),T.addEventListener("click",()=>{window.scrollTo({top:0,behavior:e?"auto":"smooth"})})}})();
