const snmp = require("net-snmp")
const mail = require("nodemailer")
const log  = (...v)=>console.log(...v)
const sett = require("./settings.js")
const transporter= mail.createTransport( sett.mailServer )

const below = sett.below
const devices = sett.printers

checkDevices()
setInterval( checkDevices, sett.interval )

function checkDevices() {
  let checked=0
  devices.forEach( (k,n)=>{
    let session= snmp.createSession( k.ip, "public" )
    let values=[]
    session.get( k.oids, (e,vb)=>{
      checked++
      if(!e) {
        if( vb.length==8 ) color_check(vb,n)
        if( vb.length==2 ) black_check(vb,n)
      }
      if(checked==devices.length) send_report()
    })
    session.trap ( snmp.TrapType.LinkDown, e=>e?log("Trap error: "+e):[] )
  })
}
function color_check(vb,n) {
  let Cy= (vb[1].value*100)/vb[0].value
  let Ma= (vb[3].value*100)/vb[2].value
  let Ye= (vb[5].value*100)/vb[4].value
  let Bk= (vb[7].value*100)/vb[6].value
  if( Cy <below ) { devices[n].st|= 0x08 } else { devices[n].st&=0x77 }
  if( Ma <below ) { devices[n].st|= 0x04 } else { devices[n].st&=0xBB }
  if( Ye <below ) { devices[n].st|= 0x02 } else { devices[n].st&=0xDD }
  if( Bk <below ) { devices[n].st|= 0x01 } else { devices[n].st&=0xEE }
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
      text += k.name+' '
      if ( status&0x01 ) { k.st|=0x10; text += "Bk " }
      if ( status&0x02 ) { k.st|=0x20; text += "Ye " }
      if ( status&0x04 ) { k.st|=0x40; text += "Ma " }
      if ( status&0x08 ) { k.st|=0x80; text += "Cy " }
      text += `running low.\n`
    }
  })
  // log(":"+text) // -> Output to console for debuging
  if( text!='' ) {
    sett.mailSend.text= text
    transporter.sendMail(sett.mailSend, (e,i)=>{
      if (e) log("err: "+e)
      else log("Sent: "+ info.response)
    })
  }
}
