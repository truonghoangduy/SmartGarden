const socketConnection = require('./src/socketIO_Pushdata.js');
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline');
const socketio = require('socket.io-client');
const serverURL = "http://hsu-mini-garden.herokuapp.com";
const socketClient = socketio.connect(serverURL, { reconnection: true });

var isPumpToggle = false;
async function main() {
  const port2 = await getPort();
  console.log(port2)
  const parser = port2.pipe(new Readline({ delimiter: '\n' }),);
  decoy(parser, port2)
  // On the Arduino when call serial comunication frist 
  //time took few secound to reboot
  setTimeout(() => port2.write("0"), 3000)

}
function decoy(parser, port2) {
  onPumpRequest((state) => {
    isPumpToggle = state;
  })
  parser.on("data", (UnFormatedData) => {
    let JsonFormatedData = JSON.parse(UnFormatedData);
    console.log(JsonFormatedData)
    try {
      if (JsonFormatedData.hasOwnProperty("temp")) {
        handleWatering(JsonFormatedData, port2)
      }
    } catch (error) {
      console.log(error)
    }
    console.log("clean cache")
    JsonFormatedData = []
  }
  )
}

async function getPort() {
  const port2 = new SerialPort(await serialScan(), {
    baudRate: 19200,
    autoOpen: true
  })
  return port2;
}
async function serialScan() {
  let ports = await SerialPort.list();
  for (let i = 0; i <= ports.length; i++) {
    if (ports[i]['path'].toLowerCase().includes('usb')
      || ports[i]['path'].toLowerCase().includes('acm0')) {
      return ports[i]['path']
    }
  }
}

function handleWatering(Humninity, port1) {
  console.log(typeof (Humninity))
  if (Humninity['soildhum'] > 700) {
    // PUMP
    port1.write("1")
  }
  else {
    console.log('GET sensor TEMP and HUM')
    // STOP PUMP
    if (isPumpToggle) {
      port1.write("1")
    } else {
      port1.write("0")
      isPumpToggle = false

    }
  }
  //Firebase version

  // firebaseConnection.PushUserData(Humninity)

  // Socket Version
  EmitData('iot-flutter-demo', Humninity)
}


function EmitData(chanel, data) {
  socketClient.emit(chanel, data)
}

function onPumpRequest(callback) {
  socketClient.on("iot-flutter-demo-phone-to-garden", (data) => {
    let dataJSON = JSON.parse(data);
    callback(dataJSON.tooglePump);
  })
}




socketClient.on('connect', (socket) => {
  console.log("Connected to " + serverURL)
  main()
})


// main();

//https://www.raspberrypi.org/forums/viewtopic.php?t=150981