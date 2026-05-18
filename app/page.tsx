"use client";

import { useState, useEffect } from "react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const CATS = [
  { id:"1", name:"Alimentation", icon:"🛒", color:"#f59e0b" },
  { id:"2", name:"Transport",    icon:"🚗", color:"#3b82f6" },
  { id:"3", name:"Logement",     icon:"🏠", color:"#8b5cf6" },
  { id:"4", name:"Loisirs",      icon:"🎮", color:"#ec4899" },
  { id:"5", name:"Santé",        icon:"💊", color:"#10b981" },
  { id:"6", name:"Restaurants",  icon:"🍕", color:"#f97316" },
];
const INIT_EXP = [
  { id:"e1",  description:"Courses Lidl",    amount:87.50,  category_id:"1", date:"2026-05-15", type:"expense" },
  { id:"e2",  description:"Abonnement RATP", amount:86.40,  category_id:"2", date:"2026-05-14", type:"expense" },
  { id:"e3",  description:"Loyer mai",       amount:980.00, category_id:"3", date:"2026-05-01", type:"expense" },
  { id:"e4",  description:"Netflix",         amount:17.99,  category_id:"4", date:"2026-05-10", type:"expense" },
  { id:"e5",  description:"Pharmacie",       amount:24.30,  category_id:"5", date:"2026-05-12", type:"expense" },
  { id:"e6",  description:"Sushi Samba",     amount:62.00,  category_id:"6", date:"2026-05-11", type:"expense" },
  { id:"e7",  description:"Salaire mai",     amount:3200.00,category_id:null,date:"2026-05-05", type:"income"  },
  { id:"e8",  description:"Marché bio",      amount:43.20,  category_id:"1", date:"2026-05-04", type:"expense" },
  { id:"e9",  description:"Essence",         amount:75.00,  category_id:"2", date:"2026-05-08", type:"expense" },
  { id:"e10", description:"Spotify",         amount:10.99,  category_id:"4", date:"2026-05-10", type:"expense" },
];
const MONTHLY = [
  {m:"Déc",d:1820,r:3100},{m:"Jan",d:2140,r:3200},{m:"Fév",d:1650,r:3200},
  {m:"Mar",d:2380,r:3400},{m:"Avr",d:1990,r:3200},{m:"Mai",d:1387,r:3200},
];
const GOALS = [
  {id:"g1",name:"Voyage Japon",  target:5000, current:2340,icon:"✈️",color:"#3b82f6",date:"Mars 2027"},
  {id:"g2",name:"MacBook Pro",   target:2500, current:1850,icon:"💻",color:"#8b5cf6",date:"Sep 2026"},
  {id:"g3",name:"Fonds urgence", target:10000,current:6200,icon:"🛡️",color:"#10b981",date:null},
];

const fmt = (n:number) => new Intl.NumberFormat("fr-FR", {style: "currency", currency: "EUR"}).format(n);
const pct = (v:number, t:number) =>t===0?0:Math.min(100,Math.round(v/t*100));

function PBar({value,color,h=6}){
  const [w,setW]=useState(0);
  useEffect(()=>{const t=setTimeout(()=>setW(value),350);return()=>clearTimeout(t);},[value]);
  return <div style={{height:h,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden"}}>
    <div style={{height:"100%",width:`${w}%`,background:color,borderRadius:99,transition:"width 1.1s cubic-bezier(.16,1,.3,1)",boxShadow:`0 0 8px ${color}55`}}/>
  </div>;
}
function KCard({label,value,icon,color,sub,i=0}){
  const [v,setV]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setV(true),i*90);return()=>clearTimeout(t);},[i]);
  return <div style={{padding:"18px 20px",borderRadius:16,border:`1px solid ${color}28`,background:`${color}0c`,opacity:v?1:0,transform:v?"translateY(0)":"translateY(14px)",transition:"opacity .5s,transform .5s cubic-bezier(.16,1,.3,1)"}}>
    <div style={{fontSize:20,marginBottom:8}}>{icon}</div>
    <div style={{fontSize:10,color:"#9ca3af",marginBottom:3,fontWeight:600,letterSpacing:.8,textTransform:"uppercase"}}>{label}</div>
    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:11,color:"#6b7280",marginTop:4}}>{sub}</div>}
  </div>;
}
function CT({active,payload,label}){
  if(!active||!payload?.length) return null;
  return <div style={{background:"#12121e",border:"1px solid #252535",borderRadius:12,padding:"10px 14px",fontSize:12,fontFamily:"'DM Sans',sans-serif"}}>
    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,color:"#fff",marginBottom:6}}>{label}</div>
    {payload.map(p=><div key={p.dataKey||p.name} style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:p.fill||p.stroke||p.color}}/>
      <span style={{color:"#9ca3af"}}>{p.name||p.dataKey}</span>
      <span style={{color:"#fff",fontWeight:600,marginLeft:"auto",paddingLeft:12}}>{fmt(p.value)}</span>
    </div>)}
  </div>;
}

function Modal({onClose,cats,onAdd}){
  const [form,setForm]=useState({amount:"",description:"",category_id:"",date:new Date().toISOString().slice(0,10),type:"expense"});
  const inp={width:"100%",padding:"10px 14px",borderRadius:10,border:"1px solid #2a2a40",background:"rgba(255,255,255,0.05)",color:"#fff",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"};
  function submit(e){e.preventDefault();if(!form.amount||!form.description)return;onAdd({...form,id:"e"+Date.now(),amount:parseFloat(form.amount)});onClose();}
  return <div style={{position:"fixed",inset:0,zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)"}}/>
    <div style={{position:"relative",width:"100%",maxWidth:420,background:"#0c0c18",border:"1px solid #252535",borderRadius:20,padding:26,boxShadow:"0 32px 80px rgba(0,0,0,.8)",animation:"scIn .22s ease"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#fff",margin:0}}>
          {form.type==="expense"?"💸 Nouvelle dépense":"💰 Nouveau revenu"}
        </h2>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#6b7280",cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
      </div>
      <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:13}}>
        <div style={{display:"flex",gap:6,background:"rgba(255,255,255,0.04)",borderRadius:11,padding:4}}>
          {["expense","income"].map(t=><button key={t} type="button" onClick={()=>setForm({...form,type:t})} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,transition:"all .2s",background:form.type===t?(t==="expense"?"rgba(239,68,68,.2)":"rgba(16,185,129,.2)"):"transparent",color:form.type===t?(t==="expense"?"#f87171":"#34d399"):"#6b7280"}}>
            {t==="expense"?"💸 Dépense":"💰 Revenu"}
          </button>)}
        </div>
        <input type="number" step="0.01" min="0" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} required placeholder="Montant (€)" style={inp}/>
        <input type="text" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required placeholder="Description" style={inp}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} style={inp}>
            <option value="">Sans catégorie</option>
            {cats.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inp}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button type="button" onClick={onClose} style={{flex:1,padding:"11px 0",borderRadius:11,border:"1px solid #2a2a40",background:"transparent",cursor:"pointer",fontSize:14,fontWeight:500,color:"#9ca3af"}}>Annuler</button>
          <button type="submit" style={{flex:1,padding:"11px 0",borderRadius:11,border:"none",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",cursor:"pointer",fontSize:14,fontWeight:700,color:"#fff",boxShadow:"0 4px 16px rgba(124,58,237,.45)"}}>Ajouter</button>
        </div>
      </form>
    </div>
  </div>;
}

function Dashboard({exps,onAdd}){
  const spent=exps.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0);
  const income=exps.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0);
  const B=3200, up=pct(spent,B);
  const cStats=CATS.map(c=>({...c,spent:exps.filter(e=>e.category_id===c.id&&e.type==="expense").reduce((s,e)=>s+e.amount,0)})).filter(c=>c.spent>0).sort((a,b)=>b.spent-a.spent);
  return <div style={{display:"flex",flexDirection:"column",gap:22}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:27,color:"#fff",margin:0}}>Bonjour, Alex 👋</h1>
        <p style={{color:"#6b7280",fontSize:13,margin:"4px 0 0"}}>Samedi 16 mai 2026</p>
      </div>
      <button onClick={onAdd} style={{display:"flex",alignItems:"center",gap:8,padding:"11px 20px",borderRadius:13,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",cursor:"pointer",color:"#fff",fontSize:14,fontWeight:700,boxShadow:"0 4px 22px rgba(124,58,237,.4)",transition:"transform .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>＋ Ajouter</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13}}>
      <KCard i={0} label="Budget" value={fmt(B)} icon="💳" color="#7c3aed"/>
      <KCard i={1} label="Dépensé" value={fmt(spent)} icon="📤" color="#f59e0b" sub={`${up}% du budget`}/>
      <KCard i={2} label="Restant" value={fmt(B-spent)} icon="💰" color={spent<B?"#10b981":"#ef4444"}/>
      <KCard i={3} label="Revenus" value={fmt(income)} icon="📥" color="#3b82f6"/>
    </div>
    <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontSize:14,fontWeight:600,color:"#e5e7eb"}}>Utilisation du budget</span>
        <span style={{fontSize:13,fontWeight:700,color:up>90?"#ef4444":up>70?"#f59e0b":"#10b981"}}>{up}%</span>
      </div>
      <PBar value={up} color={up>90?"#ef4444":up>70?"#f59e0b":"#10b981"} h={8}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12,color:"#6b7280"}}>
        <span>{fmt(spent)} dépensés</span><span>{fmt(B)} budget</span>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1.55fr 1fr",gap:14}}>
      <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:20}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",margin:"0 0 16px"}}>Évolution 6 mois</h3>
        <ResponsiveContainer width="100%" height={190}>
          <AreaChart data={MONTHLY}>
            <defs>
              <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7c3aed" stopOpacity={.35}/><stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/></linearGradient>
              <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={.35}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="m" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#6b7280",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`} width={46}/>
            <Tooltip content={<CT/>}/>
            <Area type="monotone" dataKey="d" name="Dépenses" stroke="#7c3aed" fill="url(#gd)" strokeWidth={2.5} dot={false}/>
            <Area type="monotone" dataKey="r" name="Revenus"  stroke="#10b981" fill="url(#gr)" strokeWidth={2.5} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:20}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",margin:"0 0 8px"}}>Par catégorie</h3>
        <div style={{position:"relative",height:148}}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={cStats} cx="50%" cy="50%" innerRadius={44} outerRadius={65} paddingAngle={3} dataKey="spent">{cStats.map((c,i)=><Cell key={i} fill={c.color} opacity={.9}/>)}</Pie><Tooltip content={<CT/>}/></PieChart>
          </ResponsiveContainer>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:9,color:"#6b7280",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>Total</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff"}}>{fmt(spent)}</div></div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:2}}>
          {cStats.slice(0,5).map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:c.color,flexShrink:0}}/>
            <span style={{fontSize:11,color:"#9ca3af",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.icon} {c.name}</span>
            <span style={{fontSize:11,fontWeight:600,color:"#e5e7eb"}}>{fmt(c.spent)}</span>
          </div>)}
        </div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:20}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",margin:"0 0 14px"}}>Dernières transactions</h3>
        {exps.slice(0,6).map(e=>{const c=CATS.find(c=>c.id===e.category_id);return <div key={e.id} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 7px",borderRadius:10,marginBottom:2,transition:"background .15s"}} onMouseEnter={ev=>ev.currentTarget.style.background="rgba(255,255,255,0.04)"} onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>
          <div style={{width:36,height:36,borderRadius:10,background:c?`${c.color}22`:"rgba(124,58,237,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{c?.icon||"💸"}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:"#e5e7eb",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description}</div><div style={{fontSize:11,color:"#6b7280"}}>{e.date}</div></div>
          <span style={{fontSize:13,fontWeight:700,color:e.type==="income"?"#34d399":"#f1f1f1",flexShrink:0}}>{e.type==="income"?"+":"-"}{fmt(e.amount)}</span>
        </div>;})}
      </div>
      <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:20}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",margin:"0 0 16px"}}>Objectifs d'épargne</h3>
        {GOALS.map(g=>{const p=pct(g.current,g.target);return <div key={g.id} style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <div style={{width:32,height:32,borderRadius:9,background:`${g.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{g.icon}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#e5e7eb"}}>{g.name}</div><div style={{fontSize:11,color:"#6b7280"}}>{fmt(g.current)} / {fmt(g.target)}</div></div>
            <span style={{fontSize:12,fontWeight:700,color:g.color}}>{p}%</span>
          </div>
          <PBar value={p} color={g.color} h={5}/>
        </div>;})}
      </div>
    </div>
  </div>;
}

function Expenses({exps,onAdd,onDel}){
  const [s,setS]=useState("");const [tf,setTf]=useState("");const [cf,setCf]=useState("");
  const f=exps.filter(e=>{if(s&&!e.description.toLowerCase().includes(s.toLowerCase()))return false;if(tf&&e.type!==tf)return false;if(cf&&e.category_id!==cf)return false;return true;});
  const inp={padding:"9px 12px",borderRadius:10,border:"1px solid #252535",background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"};
  return <div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:27,color:"#fff",margin:0}}>Dépenses</h1><p style={{color:"#6b7280",fontSize:13,margin:"4px 0 0"}}>{f.length} transactions</p></div>
      <button onClick={onAdd} style={{padding:"11px 20px",borderRadius:13,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",border:"none",cursor:"pointer",color:"#fff",fontSize:14,fontWeight:700,boxShadow:"0 4px 22px rgba(124,58,237,.4)"}}>＋ Ajouter</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
      {[{l:"Dépenses",col:"#f59e0b",v:f.filter(e=>e.type==="expense").reduce((s,e)=>s+e.amount,0)},{l:"Revenus",col:"#10b981",v:f.filter(e=>e.type==="income").reduce((s,e)=>s+e.amount,0)}].map(t=><div key={t.l} style={{padding:18,borderRadius:14,border:`1px solid ${t.col}28`,background:`${t.col}0c`}}><div style={{fontSize:10,color:"#6b7280",letterSpacing:.6,textTransform:"uppercase",fontWeight:600,marginBottom:4}}>{t.l}</div><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,color:t.col}}>{fmt(t.v)}</div></div>)}
    </div>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",padding:16,borderRadius:14,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)"}}>
      <div style={{position:"relative",flex:1,minWidth:140}}>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#6b7280",fontSize:13}}>🔍</span>
        <input value={s} onChange={e=>setS(e.target.value)} placeholder="Rechercher..." style={{...inp,paddingLeft:30,width:"100%",boxSizing:"border-box"}}/>
      </div>
      <select value={tf} onChange={e=>setTf(e.target.value)} style={inp}><option value="">Tout type</option><option value="expense">Dépenses</option><option value="income">Revenus</option></select>
      <select value={cf} onChange={e=>setCf(e.target.value)} style={inp}><option value="">Toutes catégories</option>{CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
    </div>
    <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",overflow:"hidden"}}>
      {f.length===0?<div style={{padding:48,textAlign:"center",color:"#6b7280"}}><div style={{fontSize:38,marginBottom:12}}>📭</div>Aucune transaction</div>
      :f.map((e,i)=>{const c=CATS.find(c=>c.id===e.category_id);return <div key={e.id} style={{display:"flex",alignItems:"center",gap:13,padding:"13px 18px",borderBottom:i<f.length-1?"1px solid #1a1a2c":"none",transition:"background .15s"}} onMouseEnter={ev=>{ev.currentTarget.style.background="rgba(255,255,255,0.03)";const b=ev.currentTarget.querySelector(".delb");if(b)b.style.opacity="1";}} onMouseLeave={ev=>{ev.currentTarget.style.background="transparent";const b=ev.currentTarget.querySelector(".delb");if(b)b.style.opacity="0";}}>
        <div style={{width:40,height:40,borderRadius:11,background:c?`${c.color}22`:"rgba(124,58,237,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{c?.icon||"💸"}</div>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:500,color:"#e5e7eb",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.description}</div><div style={{fontSize:11,color:"#6b7280",display:"flex",gap:6}}>{e.date}{c&&<><span>·</span><span style={{color:c.color}}>{c.name}</span></>}</div></div>
        <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:e.type==="income"?"#34d399":"#f1f1f1",flexShrink:0}}>{e.type==="income"?"+":"-"}{fmt(e.amount)}</span>
        <button className="delb" onClick={()=>onDel(e.id)} style={{opacity:0,padding:"5px 7px",borderRadius:8,border:"none",background:"rgba(239,68,68,.12)",color:"#f87171",cursor:"pointer",fontSize:14,transition:"opacity .2s",flexShrink:0}}>🗑</button>
      </div>;})}
    </div>
  </div>;
}

function Categories({exps}){
  const [hov,setHov]=useState(null);
  const spent=exps.filter(e=>e.type==="expense");
  return <div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div><h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:27,color:"#fff",margin:0}}>Catégories</h1><p style={{color:"#6b7280",fontSize:13,margin:"4px 0 0"}}>{CATS.length} catégories actives</p></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
      {CATS.map((c,i)=>{const s=spent.filter(e=>e.category_id===c.id).reduce((a,e)=>a+e.amount,0);const h=hov===c.id;return <div key={c.id} onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)} style={{padding:20,borderRadius:16,cursor:"default",border:`1px solid ${h?c.color+"55":"#1e1e2e"}`,background:h?`${c.color}0e`:"rgba(255,255,255,0.02)",transition:"all .25s",animation:`fadeUp .4s ${i*.07}s both`}}>
        <div style={{width:46,height:46,borderRadius:13,background:`${c.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:12}}>{c.icon}</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#e5e7eb",marginBottom:4}}>{c.name}</div>
        <div style={{fontSize:13,color:c.color,fontWeight:600,marginBottom:10}}>{s>0?fmt(s):"Aucune dépense"}</div>
        <div style={{height:3,borderRadius:99,background:`${c.color}22`}}><div style={{height:"100%",width:h?"100%":"0",background:c.color,borderRadius:99,transition:"width .4s ease"}}/></div>
      </div>;})}
      <button style={{padding:20,borderRadius:16,border:"1px dashed #2a2a40",background:"transparent",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",minHeight:110,transition:"all .2s",color:"#6b7280"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="#7c3aed60";e.currentTarget.style.background="rgba(124,58,237,.05)"}} onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a2a40";e.currentTarget.style.background="transparent"}}>
        <div style={{fontSize:26,color:"#7c3aed",opacity:.6}}>＋</div><div style={{fontSize:12}}>Nouvelle catégorie</div>
      </button>
    </div>
    <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:22}}>
      <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",margin:"0 0 16px"}}>Répartition des dépenses (mai)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart barCategoryGap="32%" data={CATS.map(c=>({name:c.name,montant:spent.filter(e=>e.category_id===c.id).reduce((s,e)=>s+e.amount,0),color:c.color}))}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
          <XAxis dataKey="name" tick={{fill:"#6b7280",fontSize:11}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fill:"#6b7280",fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`} width={46}/>
          <Tooltip content={<CT/>}/>
          <Bar dataKey="montant" radius={[7,7,0,0]}>{CATS.map((c,i)=><Cell key={i} fill={c.color}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>;
}

function Savings(){
  const tot=GOALS.reduce((s,g)=>s+g.target,0),sav=GOALS.reduce((s,g)=>s+g.current,0);
  return <div style={{display:"flex",flexDirection:"column",gap:22}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div><h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:27,color:"#fff",margin:0}}>Objectifs d'épargne</h1><p style={{color:"#6b7280",fontSize:13,margin:"4px 0 0"}}>{GOALS.length} objectifs actifs</p></div>
      <button style={{padding:"11px 20px",borderRadius:13,background:"linear-gradient(135deg,#10b981,#059669)",border:"none",cursor:"pointer",color:"#fff",fontSize:14,fontWeight:700,boxShadow:"0 4px 22px rgba(16,185,129,.35)"}}>＋ Nouvel objectif</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13}}>
      <KCard i={0} label="Total objectifs" value={fmt(tot)} icon="🎯" color="#7c3aed"/>
      <KCard i={1} label="Total épargné" value={fmt(sav)} icon="💰" color="#10b981"/>
      <KCard i={2} label="Progression" value={`${pct(sav,tot)}%`} icon="📈" color="#3b82f6"/>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {GOALS.map((g,i)=>{const p=pct(g.current,g.target);return <div key={g.id} style={{borderRadius:16,border:`1px solid ${g.color}30`,background:"rgba(255,255,255,0.02)",padding:24,animation:`fadeUp .45s ${i*.12}s both`}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
          <div style={{width:54,height:54,borderRadius:15,background:`${g.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,flexShrink:0}}>{g.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff"}}>{g.name}</div>
            {g.date&&<div style={{fontSize:12,color:"#6b7280",marginTop:2}}>Objectif : {g.date}</div>}
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:24,color:g.color,lineHeight:1}}>{p}%</div>
            <div style={{fontSize:12,color:"#6b7280",marginTop:2}}>{fmt(g.target-g.current)} restants</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:13}}><span style={{fontWeight:700,color:g.color}}>{fmt(g.current)}</span><span style={{color:"#6b7280"}}>{fmt(g.target)}</span></div>
        <PBar value={p} color={g.color} h={10}/>
      </div>;})}
    </div>
  </div>;
}

function Settings(){
  const [b,setB]=useState("3200");const [ok,setOk]=useState(false);
  return <div style={{display:"flex",flexDirection:"column",gap:20}}>
    <div><h1 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:27,color:"#fff",margin:0}}>Paramètres</h1><p style={{color:"#6b7280",fontSize:13,margin:"4px 0 0"}}>Compte et préférences</p></div>
    <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:22}}>
      <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",margin:"0 0 14px"}}>👤 Profil</h3>
      <div style={{display:"flex",alignItems:"center",gap:14,padding:14,borderRadius:12,background:"rgba(255,255,255,0.03)"}}>
        <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#fff",flexShrink:0}}>A</div>
        <div><div style={{fontWeight:600,color:"#e5e7eb"}}>Alex Martin</div><div style={{fontSize:12,color:"#6b7280"}}>alex.martin@exemple.com · Plan Free</div></div>
      </div>
    </div>
    <div style={{borderRadius:16,border:"1px solid #1e1e2e",background:"rgba(255,255,255,0.02)",padding:22}}>
      <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,color:"#fff",margin:"0 0 14px"}}>💳 Budget mensuel</h3>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <input value={b} onChange={e=>setB(e.target.value)} type="number" style={{flex:1,padding:"11px 14px",borderRadius:11,border:"1px solid #252535",background:"rgba(255,255,255,0.04)",color:"#fff",fontSize:15,outline:"none",fontFamily:"'DM Sans',sans-serif"}}/>
        <span style={{color:"#6b7280",fontSize:14}}>€ / mois</span>
      </div>
      <button onClick={()=>{setOk(true);setTimeout(()=>setOk(false),2200);}} style={{marginTop:14,padding:"11px 22px",borderRadius:11,border:"none",cursor:"pointer",background:ok?"linear-gradient(135deg,#10b981,#059669)":"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",fontSize:14,fontWeight:700,transition:"background .3s",boxShadow:ok?"0 4px 16px rgba(16,185,129,.4)":"0 4px 16px rgba(124,58,237,.4)"}}>
        {ok?"✓ Sauvegardé !":"Sauvegarder"}
      </button>
    </div>
    <div style={{borderRadius:16,border:"1px solid #7c3aed40",background:"linear-gradient(135deg,rgba(124,58,237,.1),rgba(109,40,217,.04))",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(124,58,237,.12)",filter:"blur(30px)",pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,background:"rgba(124,58,237,.25)",fontSize:11,color:"#a78bfa",fontWeight:700,marginBottom:10}}>⭐ Plan actuel : Free</div>
          <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:17,color:"#fff",margin:"0 0 6px"}}>Passez à BudgetFlow Pro</h3>
          <div style={{fontSize:13,color:"#9ca3af",lineHeight:1.6}}>✓ Catégories illimitées · ✓ Export CSV<br/>✓ Graphiques avancés · ✓ Support prioritaire</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0,marginLeft:16}}><div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:26,color:"#a78bfa",lineHeight:1}}>9,99€</div><div style={{fontSize:12,color:"#6b7280"}}>par mois</div></div>
      </div>
      <button style={{marginTop:18,padding:"11px 24px",borderRadius:11,border:"none",background:"linear-gradient(135deg,#7c3aed,#6d28d9)",cursor:"pointer",color:"#fff",fontSize:14,fontWeight:700,boxShadow:"0 4px 22px rgba(124,58,237,.45)"}}>Passer à Pro →</button>
    </div>
  </div>;
}

export default function App(){
  const [page,setPage]=useState("dashboard");
  const [exps,setExps]=useState(INIT_EXP);
  const [modal,setModal]=useState(false);
  const nav=[{id:"dashboard",ic:"⬡",lb:"Dashboard"},{id:"expenses",ic:"◎",lb:"Dépenses"},{id:"categories",ic:"◐",lb:"Catégories"},{id:"savings",ic:"◑",lb:"Épargne"},{id:"settings",ic:"◉",lb:"Paramètres"}];
  return <>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#060610}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes scIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}select option{background:#12121e;color:#f1f1f1}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(124,58,237,.35);border-radius:99px}`}</style>
    <div style={{display:"flex",minHeight:"100vh",background:"#060610",color:"#f1f1f1"}}>
      <aside style={{width:215,minHeight:"100vh",background:"#09090f",borderRight:"1px solid #141420",display:"flex",flexDirection:"column",padding:"24px 0",flexShrink:0,position:"sticky",top:0,height:"100vh"}}>
        <div style={{padding:"0 20px 24px",borderBottom:"1px solid #141420"}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:20,letterSpacing:-.5,color:"#fff"}}>Budget<span style={{color:"#7c3aed"}}>Flow</span></span>
        </div>
        <nav style={{flex:1,padding:"14px 10px",display:"flex",flexDirection:"column",gap:3}}>
          {nav.map(item=><button key={item.id} onClick={()=>setPage(item.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:11,border:"none",cursor:"pointer",textAlign:"left",transition:"all .2s",fontSize:13,fontWeight:500,background:page===item.id?"rgba(124,58,237,.16)":"transparent",color:page===item.id?"#a78bfa":"#6b7280",borderLeft:page===item.id?"2px solid #7c3aed":"2px solid transparent"}}>
            <span style={{fontSize:15,opacity:.8}}>{item.ic}</span>{item.lb}
          </button>)}
        </nav>
        <div style={{padding:"14px 10px",borderTop:"1px solid #141420"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
            <div style={{width:30,height:30,borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:13,color:"#fff",flexShrink:0}}>A</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"#e5e7eb",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Alex Martin</div><div style={{fontSize:10,color:"#6b7280"}}>Plan Free</div></div>
          </div>
        </div>
      </aside>
      <main style={{flex:1,padding:"32px 36px",overflowY:"auto",maxHeight:"100vh",minWidth:0}}>
        <div style={{maxWidth:940,margin:"0 auto"}}>
          {page==="dashboard"&&<Dashboard exps={exps} onAdd={()=>setModal(true)}/>}
          {page==="expenses"&&<Expenses exps={exps} onAdd={()=>setModal(true)} onDel={id=>setExps(p=>p.filter(e=>e.id!==id))}/>}
          {page==="categories"&&<Categories exps={exps}/>}
          {page==="savings"&&<Savings/>}
          {page==="settings"&&<Settings/>}
        </div>
      </main>
    </div>
    {modal&&<Modal onClose={()=>setModal(false)} cats={CATS} onAdd={e=>{setExps(p=>[e,...p]);setModal(false);}}/>}
  </>;
}