import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

// The public homepage is a hand-built static page in landing/ (index.html
// in French, ar.html in Arabic — generated from index.html by
// landing/build_ar.py), served byte-for-byte: no React layout, fonts or CSS
// from the app wrap it. Sign-up buttons point at /signup (?plan=palier1|2
// for the pricing cards); the demo form opens WhatsApp on its own. The
// files are bundled into the server trace via next.config.ts.
const LANDING_DIR = path.join(process.cwd(), "landing");

const cache = new Map<string, string>();

// Anonymous audience beacon (see app/api/visit and /admin/visites),
// appended at serve time so the landing files themselves stay untouched.
// Counts only visible time; flags clicks on sign-up buttons.
const TRACKER = `<script>(function(){
var v;try{v=localStorage.getItem("fx_vid");if(!v){v=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2);localStorage.setItem("fx_vid",v)}}catch(e){v="nostore-"+Math.random().toString(36).slice(2)}
var q=new URLSearchParams(location.search),id=null,active=0,since=Date.now();
fetch("/api/visit",{method:"POST",keepalive:true,body:JSON.stringify({vid:v,path:location.pathname,ref:document.referrer,us:q.get("utm_source"),um:q.get("utm_medium"),uc:q.get("utm_campaign"),fb:q.has("fbclid")})}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j)id=j.id}).catch(function(){});
function tick(){if(!document.hidden){active+=Date.now()-since;since=Date.now()}}
function send(extra){if(!id)return;var b=JSON.stringify(Object.assign({d:active},extra||{}));if(navigator.sendBeacon){navigator.sendBeacon("/api/visit/"+id,b)}else{fetch("/api/visit/"+id,{method:"POST",body:b,keepalive:true})}}
document.addEventListener("visibilitychange",function(){if(document.hidden){active+=Date.now()-since;send()}else{since=Date.now()}});
addEventListener("pagehide",function(){tick();send()});
setInterval(function(){tick();send()},15000);
document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[data-cta]");if(a&&(a.getAttribute("href")||"").indexOf("/signup")===0){tick();send({cta:a.getAttribute("data-cta")})}},true);
})();</script>`;

function withTracker(html: string): string {
  const i = html.lastIndexOf("</body>");
  return i === -1 ? html + TRACKER : html.slice(0, i) + TRACKER + html.slice(i);
}

export async function serveLanding(
  request: NextRequest,
  fileName: "index.html" | "ar.html",
  options: { appLocale?: Locale } = {}
) {
  // Signed-in visitors go straight to their dashboard — except the admin's
  // "Aperçu" link (?preview=1), which wants the public page (and isn't
  // counted as a visit).
  const isPreview = request.nextUrl.searchParams.get("preview") === "1";
  if (!isPreview) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims) return NextResponse.redirect(new URL("/gestion", request.url));
  }

  // Re-read on every request in dev so edits to the files show up live.
  let html = cache.get(fileName);
  if (html === undefined || process.env.NODE_ENV !== "production") {
    html = await readFile(path.join(LANDING_DIR, fileName), "utf8");
    cache.set(fileName, html);
  }

  const response = new NextResponse(isPreview ? html : withTracker(html), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  // Visitors of the Arabic landing get the app in Arabic once they sign up.
  if (options.appLocale) {
    response.cookies.set(LOCALE_COOKIE, options.appLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}
