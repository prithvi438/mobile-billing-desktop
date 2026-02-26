const { contextBridge, ipcRenderer } = require("electron");

// 1. General Electron Utilities
contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,

  // Logic for Bluetooth Device Discovery
  onDevicesFound: (callback) => {
    const subscription = (event, devices) => callback(devices);
    ipcRenderer.on("bluetooth-devices-found", subscription);
    // This return function is the "cleanup" React calls in useEffect
    return () => ipcRenderer.removeListener("bluetooth-devices-found", subscription);
  },

  // Tell Main process which device was selected in UI
  selectDevice: (deviceId) => ipcRenderer.invoke("select-device", deviceId),
});

// 2. Specific Printer Commands
contextBridge.exposeInMainWorld("printerAPI", {
  // Triggers the native Bluetooth scan
  startScan: () => ipcRenderer.invoke("start-native-scan"),

  // Background auto-connect using saved MAC address
  autoConnect: (address) => ipcRenderer.invoke("auto-connect-printer", address),

  // Print a specific bill/receipt
  printReceipt: (data) => ipcRenderer.invoke("print-receipt", data),

  // Print the test receipt
  printTest: (data) => ipcRenderer.invoke("print-test-receipt", data),

  // Disconnect the current session
  disconnect: () => ipcRenderer.invoke("disconnect-printer"),
});
