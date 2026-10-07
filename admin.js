const c=window.DDS_CONFIG;
const sb=(!c.SUPABASE_URL.startsWith("YOUR_")&&!c.SUPABASE_KEY.startsWith("YOUR_"))?supabase.createClient(c.SUPABASE_URL,c.SUPABASE_KEY):null;
const loginBox=document.getElementById("loginBox"),panel=document.getElementById("panel");
document.getElementById("loginBtn").onclick=async()=>{if(!sb)return loginMsg.textContent="Connect Supabase first.";
const {error}=await sb.auth.signInWithPassword({email:email.value,password:password.value});if(error)loginMsg.textContent=error.message;else{loginBox.hidden=true;panel.hidden=false}};
document.getElementById("logoutBtn").onclick=async()=>{await sb.auth.signOut();location.reload()};
document.getElementById("publishBtn").onclick=async()=>{if(!sb)return;msg.textContent="Publishing...";
const file=image.files[0];let image_url=null;if(file){const path=`news/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
const up=await sb.storage.from("dds-media").upload(path,file);if(up.error)return msg.textContent=up.error.message;
image_url=sb.storage.from("dds-media").getPublicUrl(path).data.publicUrl}
const {data:u}=await sb.auth.getUser();const {error}=await sb.from("posts").insert({title:title.value,category:category.value||"Updates",content:content.value,image_url,published:true,author_id:u.user.id});
msg.textContent=error?error.message:"Published successfully."};
(async()=>{if(sb){const {data}=await sb.auth.getSession();if(data.session){loginBox.hidden=true;panel.hidden=false}}})();