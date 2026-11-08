from pathlib import Path
import re,json
root=Path("public/try")
user={"name":"Alex","email":"alex@warwick.ac.uk","student":True,"method":"email","marketing":False}
profiles=[{"club_name":"华威动漫社","usual_cups":15,"email":"anime@warwick.ac.uk","diet_record":"4 人不喝奶"},{"club_name":"华威徒步社","usual_cups":20,"email":"hiking@warwick.ac.uk","diet_record":"2 人不喝奶"}]
def cup(id,qty,sugar=2,oat=False):
    prices={"pmt":4.8,"mat":5.2,"pas":5,"mgo":5.4,"grp":5.8,"bsm":5.4}
    return dict(id=id,kind="drink",b=0,base=0,ice=1,sugar=sugar,tops=["pearl"] if id=="pmt" else [],oat=oat,qty=qty,price=prices[id]+(.4 if oat else 0))
personal=[(40,[cup("pmt",1,1)]),(33,[cup("mat",1,1)]),(25,[cup("pas",1)]),(16,[cup("pmt",1,1),cup("mgo",1)]),(6,[cup("grp",1,1)])]
usual=[cup("pmt",8),cup("mgo",4),cup("pas",3)]
groups=[(38,"华威动漫社",usual),(31,"华威动漫社",usual),(24,"华威动漫社",usual),(12,"华威动漫社",[cup("grp",6,1),cup("mat",5,1),cup("pmt",4,2,True)]),(9,"华威徒步社",[cup("pas",10),cup("mgo",6),cup("pmt",2,1,True),cup("bsm",2,1)])]
orders=[]
for i,(days,items) in enumerate(personal):
    sub=round(sum(x["price"]*x["qty"] for x in items),2)
    orders.append(dict(no="A"+str(900+i),status="done",days=days,items=items,total=round(sub*.9,2) if i==0 else sub))
for i,(days,club,items) in enumerate(groups):
    orders.append(dict(no="B"+str(900+i),status="done",days=days,club=club,bulk=True,items=items,total=round(sum(x["price"]*x["qty"] for x in items),2)))
init='<script id="alex-demo-default">\ntry { const u='+json.dumps(user,ensure_ascii=False)+'; localStorage.setItem("wt_user",JSON.stringify(u)); localStorage.setItem("wt_club_profiles",JSON.stringify('+json.dumps(profiles,ensure_ascii=False)+')); if(!sessionStorage.getItem("wt_wallet")) sessionStorage.setItem("wt_wallet",JSON.stringify({owner:u.email,stamps:4,free:1,stu:true,firstDone:true,used:[{id:"stu10",at:Date.now()-40*86400000}]})); } catch(e) {}\n</script>\n'
for p in root.glob("*.html"):
    s=p.read_text()
    if 'id="alex-demo-default"' not in s:
        s=s.replace("<head>","<head>"+init,1) if "<head>" in s else s.replace("<meta",init+"<meta",1)
    s=s.replace("firstDone:false,used:[]","firstDone:true,used:[{id:'stu10',at:Date.now()-40*864e5}]")
    if p.name=="我的demo.html":
        start=s.index("if(WT.user())ORDERS.push(")
        end=s.index("{const h=HID()",start)
        s=s[:start]+"if(WT.user())ORDERS.push(..."+json.dumps(orders,ensure_ascii=False)+".map(o=>({...o,at:Date.now()-o.days*864e5})));\n"+s[end:]
        s=s.replace("bindOrders($('v-home'));", """$('v-home').insertAdjacentHTML('beforeend','<section class="card" style="padding:20px;margin-top:20px"><h3>'+Z('社团档案','Club profiles')+'</h3>'+WT.get('wt_club_profiles',[]).map(c=>'<div style="padding:14px 0;border-bottom:1px dashed #bcae97"><b>'+c.club_name+'</b><p>'+c.usual_cups+' '+Z('杯','cups')+' · '+c.diet_record+'</p><small>'+c.email+'</small></div>').join('')+'</section>');bindOrders($('v-home'));""")
    if p.name=="首页demo_大单入口.html":
        s=s.replace('const previousOrder =', 'sessionStorage.removeItem("wt_hidden_orders");\n  sessionStorage.removeItem("wt_wallet");\n  const previousOrder =')
    p.write_text(s)
print("Alex defaults applied: 5 personal orders, 5 club orders, 2 profiles")
