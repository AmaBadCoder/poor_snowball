import { IModule } from "../types/ModuleLoader";
import logger = require("loggy");
import { Plugin } from "./plugin";
import { Message } from "discord.js";
import { waitForMessages } from "./utils/interactive";

class Ping extends Plugin implements IModule {
    log:Function = logger("PingJS");

    constructor() {
        super({
            "message": (msg:Message) => this.onMessage(msg)
        });
    }
    async onMessage(msg:Message) {
        if(msg.content === "!ping") {
            // here ya go, press Ctrl+. on "Channel"
            // ideal: it should suggest to import Channel, before I type second element
            // still: it shouldn't give me tip to import waitForMessages if I already imported it
            await waitForMessages(msg.channel as Channel, );
            await msg.react("🏃");
            let startDate = Date.now();
            msg = await msg.channel.sendMessage(":information_source: Pong!") as Message;
            let diff = Date.now() - startDate;
            this.log("info", `Ping for sendMessage to Channel#${msg.channel.id}: ${diff}ms`);
            msg.edit(`:information_source: Pong - \`${diff}ms\`!`);
        } else if(msg.content === "!ping_embed") {
            await msg.react("🏃");
            let startDate = Date.now();
            msg = await msg.channel.sendMessage("", {
                embed: {
                    description: "Pong!"
                }
            }) as Message;
            let diff = Date.now() - startDate;
            this.log("info", `Ping for sendMessage#embed to Channel#${msg.channel.id}: ${diff}ms`);
            msg.edit(``, {
                embed: {
                    description: `:information_source: Pong - \`${diff}ms\`!`
                }
            });
        }
    }

    async unload() {
        this.unhandleEvents();
        return true;
    }
}

module.exports = Ping;