var snmp= require("net-snmp")
var mail= require("nodemailer")
var log = (...vars)=>console.log(...vars)
var transporter= mail.createTransport({ host:'yourserver', pool:false, secure:false, auth: { user: 'yourmailaccount@yourdomain.es', pass: 'yourPass' }, tls: { rejectUnauthorized: false } })

const below=10    // Below 10%, send email
const total_devices=6
const color_oids=["1.3.6.1.2.1.43.11.1.1.8.1.1","1.3.6.1.2.1.43.11.1.1.9.1.1","1.3.6.1.2.1.43.11.1.1.8.1.2","1.3.6.1.2.1.43.11.1.1.9.1.2","1.3.6.1.2.1.43.11.1.1.8.1.3","1.3.6.1.2.1.43.11.1.1.9.1.3","1.3.6.1.2.1.43.11.1.1.8.1.4","1.3.6.1.2.1.43.11.1.1.9.1.4"]
const black_oids= color_oids.slice(0,2)
var devices=[ { name:"Kyocera", ip:"192.168.0.9", oids:color_oids, st:0}, { name:"Brother", ip:"192.168.0.7", oids:black_oids, st:0},
              { name:"HP MF77", ip:"192.168.0.8", oids:color_oids, st:0}, { name:"Dell_black", ip:"192.168.0.6", oids:black_oids, st:0} ]

setInterval( checkDevices, 600000 ) // check at 10min or 43200000 to check every 12hs (2 times per day)

function checkDevices() {
  let checked=0
  devices.forEach( (k,n)=>{
    let session= snmp.createSession( k.ip, "public" )
    let values=[]
    session.get( k.oids, (e,vb)=>{
      checked++
      if(e) return
      if( vb.length==8 ) color_check(vb,n)
      if( vb.length==2 ) black_check(vb,n)
      if(checked==total_devices) send_report()
    })
    session.trap ( snmp.TrapType.LinkDown, e=>e?log("Trap error: "+e):[] )
  })
}

function color_check(vb,n) {
  let Cy= (vb[1].value*100)/vb[0].value
  let Ma= (vb[3].value*100)/vb[2].value
  let Ye= (vb[5].value*100)/vb[4].value
  let Bk= (vb[7].value*100)/vb[6].value
  if( Cy <below ) { devices[n].st|= 0x08 } else { devices[n].st&=0xF7 }
  if( Ma <below ) { devices[n].st|= 0x04 } else { devices[n].st&=0xFB }
  if( Ye <below ) { devices[n].st|= 0x02 } else { devices[n].st&=0xFD }
  if( Bk <below ) { devices[n].st|= 0x01 } else { devices[n].st&=0xFE }
}

function black_check(vb,n) {
  let Bk= (vb[1].value*100)/vb[0].value
  if( Bk <below ) { devices[n].st|= 0x01 } else { devices[n].st&=0xFE }
}

function send_report() {
  var text=''
  devices.forEach( k=> {
    let status= k.st>>4 ^ k.st&0x0F
    if( status ) {
      text += k.name+" "
      if (status&0x1) text += "Bk "
      if (status&0x2) text += "Ye "
      if (status&0x4) text += "Ma "
      if (status&0x8) text += "Cy "
      text += "running low.\n"
    }
  })
  log(text)
  let mOpt= { from:'yourmailaccount@yourdomain.es', to:'destionation@x_domain.es', subject:'Printer Stats',text: text }
  transporter.sendMail(mOpt, (e,i)=>{
    if (e) log("err: "+e)
    else log("Sent: "+ info.response)
  })
}
