import { EventEmitter } from "events";
import { ModuleLoader, IModuleInfo } from "./ModuleLoader";
import * as djs from "discord.js";

export interface IBotConfig {
    /**
     * Bot token
     */
    token:string;
    /**
     * Name of bot
     */
    name:string;
    /**
     * discord's Snowflake ID of bot owner
     */
    botOwner:string;
    /**
     * Modules to automatic load
     */
    autoLoad:Array<string>;
    /**
     * Array of modules info
     */
    modules:Array<IModuleInfo>;
    /**
     * Discord Client's config
     */
    djs_config: djs.ClientOptions;
}

export interface IPublicBotConfig {
    /**
     * Name of bot
     */
    name:string;
    /**
     * ID of bot owner
     */
    botOwner:string;
}

declare global {
    /**
     * Bot itself
     */
    // tslint:disable-next-line:no-unused-variable
    let discordBot:djs.Client;
    /**
     * Public bot config visible to all modules
     */
    // tslint:disable-next-line:no-unused-variable
    let botConfig:IPublicBotConfig;
}

export class SnowballBot extends EventEmitter {
    /**
     * Module loader
     */
    modLoader:ModuleLoader;
    /**
     * Configuration
     */
    config:IBotConfig;
    /**
     * DiscordBot
     */
    discordBot:djs.Client;

    constructor(config:IBotConfig) {
        super();
        this.config = config;
    }

    /**
     * Convert modules object to Map object
     * @param obj {Array} Array of module info entries
     */
    _convertToModulesMap(obj:IModuleInfo[]) {
        let modulesMap = new Map();
        obj.forEach((moduleInfo) => {
            modulesMap.set(moduleInfo.name, moduleInfo);
        });
        return modulesMap;
    }

    /**
     * Prepare module loader
     * It will load all modules / plugins
     */
    prepareModLoader() {
        this.modLoader = new ModuleLoader({
            basePath: "./cogs/",
            name: `${this.config.name}:ModLoader`,
            fastLoad: this.config.autoLoad,
            registry: new Map<string, IModuleInfo>(this._convertToModulesMap(this.config.modules))
        });
    }

    /**
     * Prepare global client variable and client itself
     */
    prepareDiscordClient() {
        // Making new Discord Client
        this.discordBot = new djs.Client(this.config.djs_config);

        // Setting max listeners
        this.discordBot.setMaxListeners(50);

        // Global bot variable, which should be used by plugins
        Object.defineProperty(global, "discordBot", {
            configurable: false, enumerable: false,
            writable: true, value: this.discordBot
        });

        // Public bot config
        Object.defineProperty(global, "botConfig", {
            configurable: false, enumerable: false,
            writable: true, value: {
                name: this.config.name,
                botOwner: this.config.botOwner
            }
        });
    }

    /**
     * Connect to Discord
     * @returns {Promise}
     */
    connect() {
        // Just calling method
        return this.discordBot.login(this.config.token);
    }
}