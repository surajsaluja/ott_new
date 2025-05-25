
let connection;

let userId;
let deviceId;

function connect(uId, bUrl) {
    console.log(bUrl);
    userId = uId;
    deviceId = getTabDeviceId();

    var key = CryptoJS.enc.Utf8.parse('11A1764225B11AA1');
    var iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");
    var decrypted = CryptoJS.AES.decrypt({ ciphertext: CryptoJS.enc.Hex.parse(apikey) }, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.ZeroPadding });

    //connection = new signalR.HubConnectionBuilder()
    //    .withUrl(`https://localhost:7191/NotificationHub?userId=${userId}&userName=${userName}&deviceId=${deviceId}`)
    //    .build();
    
    connection = new signalR.HubConnectionBuilder()
        .withUrl(bUrl + 'StreamHub', {
            headers: {
                "ApiKey": CryptoJS.enc.Utf8.stringify(decrypted),
                "UserId": userId,
                "DeviceId": deviceId
            }
        }).build();


    connection.on("NotifyStreamingCapability", handleStreamingCapability);

    connection.start()
        .then(() => {
            console.log("SignalR Connected.");
            connectManually();
            //sendHeartbeat();
        })
        .catch((err) => {
            console.error("SignalR Connection Error: ", err);
        });

    connection.onreconnecting(error => {
        console.log(`Connection lost due to error "${error}". Reconnecting...`);
    });

    connection.onreconnected(connectionId => {
        console.log(`Connection reestablished. Connected with connectionId "${connectionId}".`);
        //sendHeartbeat();
    });

    connection.onclose(async () => {
        console.log("SignalR Disconnected.");
    });
}



async function sendHeartbeat() {
    console.log(connection.state);
    console.log(signalR.HubConnectionState.Connected);
    while (connection.state === signalR.HubConnectionState.Connected) {
        console.log('Before heartbeat!');
        try {
            await connection.invoke("Heartbeat", userId, deviceId);
            console.log("Heartbeat sent");
        } catch (err) {
            console.log("Error sending heartbeat: ", err);
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // Send heartbeat every 1 seconds
    }
}

async function connectManually() {
    console.log(connection.state);
    console.log(signalR.HubConnectionState.Connected);
    if (connection.state === signalR.HubConnectionState.Connected) {

        try {
            await connection.invoke("ConnectMannually", userId, deviceId);
            console.log("Connected via custom method");
        } catch (err) {
            console.log("Error Connection via custom method ", err);
        }

    }
}

async function connectManuallyV2() {
    try {
        const streamStatus = await connection.invoke("ConnectMannuallyV2", userId.toString(), deviceInfo.deviceId);
        return streamStatus;
    } catch (err) {
        console.error("Error connecting manually:", err);
        throw err;
    }
}

async function disconnectManually() {
    console.log(connection.state);
    console.log(signalR.HubConnectionState.Connected);
    if (connection.state === signalR.HubConnectionState.Connected) {

        try {
            await connection.invoke("DisconnectMannually", userId, deviceId);
            console.log("Disconnected via custom method");
        } catch (err) {
            console.log("Error Disonnection via custom method ", err);
        }

    }
}

function disconnect() {
    if (connection) {
        connection.stop()
            .then(() => {
                console.log("SignalR Disconnected.");
            })
            .catch((err) => {
                console.error("SignalR Disconnection Error: ", err);
            });
    }
}

function showAlert(message, type) {
    var alertContainer = document.getElementById('alertContainer');
    var alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
    alertContainer.appendChild(alertDiv);


    //setTimeout(() => {
    //    $(alertDiv).alert('close');
    //}, 5000);
}

//window.addEventListener('unload', function (event) {
//    disconnect();
//});

function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 16;
    let uniqueId = '';
    for (let i = 0; i < length; i++) {
        uniqueId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uniqueId;
}

//function getTabDeviceId() {
//    let tabDeviceId = localStorage.getItem('tabDeviceId');
//    if (!tabDeviceId) {
//        tabDeviceId = generateUniqueId();
//        localStorage.setItem('tabDeviceId', tabDeviceId);
//    }
//    return tabDeviceId;
//}

function getTabDeviceId() {
    let machineId = localStorage.getItem('MachineId');
    if (!machineId) {
        machineId = 'id' + (new Date()).getTime();//crypto.randomUUID();

        localStorage.setItem('MachineId', machineId);
    }

    return machineId;
}

window.addEventListener('beforeunload', function (event) {
    //sessionStorage.removeItem('tabDeviceId');
    //disconnect();
    disconnectManually();
    console.log('beforeunload called at signalr.client.js file');
});