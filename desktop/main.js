const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let bluetoothCallback = null;
let mainWindow = null;

app.disableHardwareAcceleration();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800,
    title: "EasyHai POS",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Native Hardware Permissions
  mainWindow.webContents.session.setPermissionCheckHandler(() => true);
  mainWindow.webContents.session.setDevicePermissionHandler(() => true);

  // ⭐ Auto-Pairing Handler (0000 PIN)
  mainWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
    if (details.pairingKind === 'providePin') {
      callback({ confirmed: true, pin: '0000' });
    } else {
      callback({ confirmed: true });
    }
  });

  // ⭐ Optimized Device Discovery
  mainWindow.webContents.on("select-bluetooth-device", (event, deviceList, callback) => {
    event.preventDefault();
    bluetoothCallback = callback; 
    
    // Filter junk and sort printers (BT-583) to top
    const validDevices = deviceList
      .filter(d => d.deviceName && d.deviceName.trim() !== "")
      .sort((a, b) => a.deviceName.toLowerCase().includes('bt') ? -1 : 1);

    mainWindow.webContents.send("bluetooth-devices-found", validDevices);
  });

  mainWindow.loadFile(path.join(__dirname, "../frontend/dist/index.html"));
}

// IPC Handlers
ipcMain.handle("start-native-scan", () => ({ success: true }));

ipcMain.handle("select-device", (event, deviceId) => {
  if (bluetoothCallback) {
    try {
      bluetoothCallback(deviceId); // Finalize OS Handshake
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: "Bluetooth session timeout. Re-scan." };
});

app.whenReady().then(createWindow);