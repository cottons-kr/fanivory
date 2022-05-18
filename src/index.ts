import { app, BrowserWindow} from "electron"

let window: BrowserWindow
app.on("ready", () => {
    window = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1280,
        minHeight: 720,
        backgroundColor: "#ffffff",
        title: "Fanivory",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    window.setAspectRatio(16/9)
    window.setMenuBarVisibility(false)
    require('@electron/remote/main').initialize()
    require("@electron/remote/main").enable(window.webContents)
    
    window.loadFile("./index.html")
    //window.on("close", (e) => { e.preventDefault(); window.minimize() }) //Publishing Code
    window.on("close", () => { window.destroy(); app.exit(0) }) //Developing Code
})
