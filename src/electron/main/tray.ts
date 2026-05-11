import { Menu, Tray } from "electron"
import { join } from "path"

export async function TracyRender() {
    try {

        const contextMenu = Menu.buildFromTemplate([
            {
                label: "Open App",
                click: () => {
                }
            },
        ]);

        const tray = new Tray(join(__dirname, "../assets/icon.png"))
        tray.setContextMenu(contextMenu);
    }
    catch (err) {
        console.log(err);
    }
}
