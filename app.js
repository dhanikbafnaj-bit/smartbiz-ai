const $ = (id) => document.getElementById(id);
const KEY = "smartbiz-ai-starter-v1";
const seed = {
  businessName: "My Business",
  products: [
    {id:1,name:"Blue electrical wire 2.5 sq.mm",price:85,details:"Sample product · per metre"},
    {id:2,name:"Modular switch 6 amp",price:65,details:"Sample product"},
    {id:3,name:"LED bulb 9W",price:90,details:"Sample product"}
  ],
  enquiries: [
    {id:1,customer:"Customer A",need:"Price of blue wire",status:"New",created:Date.now()},
    {id:2,customer:"Customer B",need:"Bulk quotation",status:"Interested",created:Date.now()}
  ]
};
let data;
try { data = JSON.parse(localStorage.getItem(KEY)) || structuredClone(seed); } catch { data = structuredClone(seed); }
function save(){localStorage.setItem(KEY,JSON.stringify(data));render();}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function money(n){return "₹"+Number(n).toLocaleString("en-IN",{maximumFractionDigits:2});}
function go(tab){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===tab));}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>go(b.dataset.tab)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
function render(){
 $("productCount").textContent=data.products.length;
 $("enquiryCount").textContent=data.enquiries.length;
 $("openCount").textContent=data.enquiries.filter(e=>e.status!=="Completed").length;
 $("businessName").value=data.businessName;
 $("productList").innerHTML=data.products.length?data.products.map(p=>`<div class="item"><div><strong>${escapeHtml(p.name)}</strong><small>${money(p.price)} · ${escapeHtml(p.details||"No details")}</small></div><div class="item-actions"><button class="danger" data-delete-product="${p.id}">Delete</button></div></div>`).join(""):'<div class="empty">No products saved yet.</div>';
 $("enquiryList").innerHTML=data.enquiries.length?data.enquiries.map(e=>`<div class="item"><div><strong>${escapeHtml(e.customer)}</strong><small>${escapeHtml(e.need)} · ${new Date(e.created).toLocaleDateString()}</small></div><div class="item-actions"><select aria-label="Enquiry status" data-status="${e.id}"><option ${e.status==="New"?"selected":""}>New</option><option ${e.status==="Interested"?"selected":""}>Interested</option><option ${e.status==="Completed"?"selected":""}>Completed</option></select><button class="danger" data-delete-enquiry="${e.id}">Delete</button></div></div>`).join(""):'<div class="empty">No enquiries recorded yet.</div>';
 $("recentEnquiries").innerHTML=data.enquiries.length?data.enquiries.slice(-3).reverse().map(e=>`<div class="item"><div><strong>${escapeHtml(e.customer)}</strong><small>${escapeHtml(e.need)}</small></div><small>${escapeHtml(e.status)}</small></div>`).join(""):'No enquiries yet. Add your first enquiry.';
 document.querySelectorAll("[data-delete-product]").forEach(b=>b.onclick=()=>{data.products=data.products.filter(p=>p.id!==Number(b.dataset.deleteProduct));save();});
 document.querySelectorAll("[data-delete-enquiry]").forEach(b=>b.onclick=()=>{data.enquiries=data.enquiries.filter(e=>e.id!==Number(b.dataset.deleteEnquiry));save();});
 document.querySelectorAll("[data-status]").forEach(s=>s.onchange=()=>{const e=data.enquiries.find(x=>x.id===Number(s.dataset.status));if(e){e.status=s.value;save();}});
}
$("productForm").addEventListener("submit",e=>{e.preventDefault();data.products.push({id:Date.now(),name:$("pName").value.trim(),price:Number($("pPrice").value),details:$("pDetails").value.trim()});e.target.reset();save();});
$("enquiryForm").addEventListener("submit",e=>{e.preventDefault();data.enquiries.push({id:Date.now(),customer:$("eCustomer").value.trim(),need:$("eNeed").value.trim(),status:$("eStatus").value,created:Date.now()});e.target.reset();save();});
$("askBtn").onclick=()=>{
 const q=$("question").value.trim().toLowerCase(); if(!q){$("answer").textContent="Please enter a customer question.";return;}
 const matches=data.products.filter(p=>q.split(/\W+/).some(w=>w.length>2&&(p.name+" "+p.details).toLowerCase().includes(w)));
 if(matches.length){$("answer").textContent=matches.map(p=>`${p.name}: ${money(p.price)}. ${p.details||""}`).join("\n")+"\n\nSuggested reply: Thank you for your enquiry. Please confirm the required quantity and availability with our team."; }
 else {$("answer").textContent="I couldn't find a confirmed answer in the saved catalogue. Suggested reply: Thank you for contacting us. Our team will check this and get back to you shortly.";}
};
$("saveSettings").onclick=()=>{data.businessName=$("businessName").value.trim()||"My Business";save();alert("Business name saved on this device.");};
$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="smartbiz-backup.json";a.click();URL.revokeObjectURL(a.href);};
$("importFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!Array.isArray(x.products)||!Array.isArray(x.enquiries))throw Error();data={businessName:String(x.businessName||"My Business"),products:x.products,enquiries:x.enquiries};save();alert("Backup restored.");}catch{alert("That backup file is not valid.");}e.target.value="";};
$("resetBtn").onclick=()=>{if(confirm("Delete this app's saved demo data from this browser?")){data=structuredClone(seed);save();}};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
let installPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;$("installBtn").hidden=false;});
$("installBtn").onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$("installBtn").hidden=true;};
render();
