const c=window.DDS_CONFIG;
const sb=(!c.SUPABASE_URL.startsWith("YOUR_")&&!c.SUPABASE_KEY.startsWith("YOUR_"))?supabase.createClient(c.SUPABASE_URL,c.SUPABASE_KEY):null;
async function load(){const box=document.getElementById("posts");if(!sb){box.innerHTML="<p>Supabase is not connected yet. Connect it in the next step.</p>";return}
const {data,error}=await sb.from("posts").select("*").eq("published",true).order("created_at",{ascending:false});
if(error){box.innerHTML="<p>Unable to load news.</p>";return} if(!data.length){box.innerHTML="<p>No published news yet.</p>";return}
box.innerHTML=data.map(p=>`<article class="post">${p.image_url?`<img src="${p.image_url}" alt="">`:""}<div><small>${esc(p.category||"Updates")} • ${new Date(p.created_at).toLocaleString()}</small><h3>${esc(p.title)}</h3><p>${esc(p.content||"")}</p></div></article>`).join("");
document.getElementById("trending").innerHTML=data.slice(0,5).map(p=>`<li>${esc(p.title)}</li>`).join("");document.getElementById("tickerText").textContent=data[0].title}
function esc(s){return String(s).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[x]))}load();