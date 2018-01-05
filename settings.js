const color_oids= [ "1.3.6.1.2.1.43.11.1.1.8.1.1","1.3.6.1.2.1.43.11.1.1.9.1.1",  // Cy
                    "1.3.6.1.2.1.43.11.1.1.8.1.2","1.3.6.1.2.1.43.11.1.1.9.1.2",  // Ma
                    "1.3.6.1.2.1.43.11.1.1.8.1.3","1.3.6.1.2.1.43.11.1.1.9.1.3",  // Ye
                    "1.3.6.1.2.1.43.11.1.1.8.1.4","1.3.6.1.2.1.43.11.1.1.9.1.4" ] // Bk
const black_oids= [ "1.3.6.1.2.1.43.11.1.1.8.1.1","1.3.6.1.2.1.43.11.1.1.9.1.1" ] // Black

exports.mailServer = { host:'yourMailServer', pool:false, secure:false, auth: { user: 'user@domain.es', pass: 'yourPass' } }
exports.mailSend   = { from:'mail@domain.es', to:'mail@domain.es', subject:'Printer Alert Stats' }
exports.below      = 10       // Alert below 10% toner
exports.interval   = 600000   // Check every 10 minutes (1000ms * 60sec * 10min)
exports.printers   = [
        { ip:"192.168.0.18", oids:color_oids, st:0, name:"Kyocera_Accounting_dept" },
        { ip:"192.168.0.19", oids:color_oids, st:0, name:"Dell_Marketing_dept" },
        { ip:"192.168.0.22", oids:black_oids, st:0, name:"Brother_POS" },
        { ip:"192.168.0.23", oids:black_oids, st:0, name:"HP_IT" }
                   ]
