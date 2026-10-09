import { SITE } from "@/lib/site-config";

// Meta Pixel — standard base code, shared by the static landing pages
// (injected by lib/landing.ts) and the app's sign-up flow
// (components/MetaPixel.tsx). Nothing loads while SITE.metaPixelId is empty.
//
// Events sent:
//   PageView              every landing / auth page view
//   ViewContent           a landing visitor kept the page on screen ≥ 15 s
//   Lead                  click on a sign-up button ("Essai gratuit", tiers)
//   Contact               click on a WhatsApp link (demo request, FAQ)
//   CompleteRegistration  account created
export const META_PIXEL_ID: string = SITE.metaPixelId;

export function pixelBaseSnippet(id: string): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`;
}

/** Landing-page version: base code + engagement / lead / contact events. */
export function landingPixelScript(id: string): string {
  return `<script>${pixelBaseSnippet(id)}
(function(){var seen=0,t0=Date.now(),vc=false;
function vis(){return !document.hidden}
setInterval(function(){if(vc)return;if(vis()){seen+=1000}if(seen>=15000){vc=true;fbq('track','ViewContent')}},1000);
document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a||e.defaultPrevented)return;var h=a.getAttribute("href")||"";
if(h.indexOf("/signup")===0){fbq('track','Lead',{content_name:a.getAttribute("data-cta")||"signup"})}
else if(h.indexOf("https://wa.me/")===0){fbq('track','Contact',{content_name:a.getAttribute("data-cta")||"whatsapp"})}});
})();</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1" alt=""/></noscript>`;
}
