import { ApplicationCommandType, Client, ClientOptions, Collection, GatewayIntentBits, IntentsBitField, Options, Partials } from "discord.js";
import path from "path";
import { Localisation } from "./localisation";
import { asyncForEach, loadFiles } from "./utils/Utils";
import { Command } from "./structs/Command";
import { SlashCommand } from "./structs/SlashCommand";
import { Category } from "./structs/Category";
import { MultiCommand, MultiSlashCommand } from "./structs/MultiCommand";

interface BotOptions {
    clientOptions?: ClientOptions;
    logLoading: 'none' | 'simplified' | 'complex' | 'all';
}

class BotClient extends Client {
    private commands = new Collection<string, Command>();
    public SlashCommands = new Collection<string, SlashCommand>();

    private botOptions: BotOptions;

    public constructor(options: BotOptions) {
        super(options.clientOptions);

        this.botOptions = options;

        this.loadLocalisation();

        (async () => {
            await this.loadSlashCommands();
            await this.loadCommands();
            await this.loadEvents();
        })();
    }

    private async loadCommands() {
        const files = loadFiles("dist/commands", ".js");
        if (!files) return;
        let loaded = 0;
        for (const file of files) {
            try {
                const commandImport = await import(`./${file.substr(5, file.length)}`);
                const { default: cClass } = commandImport;
                const cClasses = [];
                if (!Array.isArray(cClass)) {
                    cClasses.push(cClass);
                } else {
                    cClasses.push(...cClass);
                }

                await asyncForEach(cClasses, async (c) => {
                    let command = c;
                    let name = path.basename(file).slice(0, -3);
                    if (c instanceof MultiCommand) {
                        command = await c.generateCommand();
                        name = c.name;
                    }
                    if (this.loadCommand(command, name)) {
                        loaded++;
                    }
                });

            } catch { }
        }
        switch (this.botOptions.logLoading) {
            case 'simplified':
            case 'all':
                console.log(Localisation.getTranslation("bot.load.command.simple", loaded));
                break;
        }
    }

    private loadCommand(cClass, name: string) {
        try {
            let command: Command;
            if (cClass instanceof Command) {
                command = cClass;
            } else {
                command = new cClass();
            }
            if (!command.deprecated) {
                if (!command.description)
                    command.description = `${name}.command.description`;
                command.commandName = name;
                //Localisation.getTranslation(command.description);
                this.commands.set(name, command);
                switch (this.botOptions.logLoading) {
                    case 'complex':
                    case 'all':
                        console.log(Localisation.getTranslation("bot.load.command.complex", name));
                        break;
                }
                // loaded++;
                return true;
            }
            return false;
        }
        catch { return false; }
    }

    private async loadEvents() {
        const files = loadFiles("dist/events", ".js");
        if (!files) return;
        let loaded = 0;
        for (const file of files) {
            const event = await import(`./${file.substr(5, file.length)}`);
            const { default: func } = event;
            const name = path.basename(file).slice(0, -3);

            if (typeof func !== "function") continue;

            func();

            switch (this.botOptions.logLoading) {
                case "complex":
                case "all":
                    console.log(Localisation.getTranslation("bot.load.event.complex", name));
                    break;
            }
            loaded++;
        }

        switch (this.botOptions.logLoading) {
            case "simplified":
            case "all":
                console.log(Localisation.getTranslation("bot.load.event.simple", loaded));
                break;
        }
    }

    private async loadSlashCommands() {
        const files = loadFiles("dist/interactionCommands", ".js");
        if (!files) return;
        let loaded = 0;
        for (const file of files) {
            try {
                const commandImport = await import(`./${file.substr(5, file.length)}`);
                const { default: cClass } = commandImport;
                const cClasses = [];
                if (!Array.isArray(cClass)) {
                    cClasses.push(cClass);
                } else {
                    cClasses.push(...cClass);
                }

                await asyncForEach(cClasses, async (c, i) => {
                    let command = c;
                    let name = path.basename(file).slice(0, -3);
                    if (c instanceof MultiSlashCommand) {
                        command = await c.generateCommand();
                        name = command.commandData.name;
                        if (name === "" || !name) return console.log(`Command[${i}] in file ${file} does not have a set name!`);
                    }
                    if (this.loadSlashCommand(command, name)) {
                        loaded++;
                    }
                });
                // const command: SlashCommand = new cClass();
                // const name = path.basename(file).slice(0, -3);
                // if (command.commandData.type === ApplicationCommandType.ChatInput) {
                //     if (!command.commandData.description) {
                //         console.log(`Slash Command: \`${name}\` has no description, yet it is a \`${command.commandData.type}\` slash command!`);
                //         continue;
                //     }
                // }
                // this.SlashCommands.set(name, command);
                // switch (this.botOptions.logLoading) {
                //     case 'complex':
                //     case 'all':
                //         console.log(Localisation.getTranslation("bot.load.slashcommand.complex", name));
                //         break;
                // }
                // loaded++;
            } catch { }
        }
        switch (this.botOptions.logLoading) {
            case 'simplified':
            case 'all':
                console.log(Localisation.getTranslation("bot.load.slashcommand.simple", loaded));
                break;
        }
    }

    private loadSlashCommand(cClass, name: string) {
        try {
            let command: SlashCommand;
            if (cClass instanceof SlashCommand) {
                command = cClass;
            } else {
                command = new cClass();
            }
            if (command.commandData.type === ApplicationCommandType.ChatInput) {
                if (!command.commandData.description || command.commandData.description === "") {
                    console.log(`Slash Command: \`${name}\` has no description, yet it is a \`${command.commandData.type}\` slash command!`);
                    return false;
                }
            }
            this.SlashCommands.set(name, command);
            switch (this.botOptions.logLoading) {
                case 'complex':
                case 'all':
                    console.log(Localisation.getTranslation("bot.load.slashcommand.complex", name));
                    break;
            }
            return true;

            // if (!command.deprecated) {
            //     if (!command.description)
            //         command.description = `${name}.command.description`;
            //     this.commands.set(name, command);
            //     switch (this.botOptions.logLoading) {
            //         case 'complex':
            //         case 'all':
            //             console.log(Localisation.getTranslation("bot.load.command.complex", name));
            //             break;
            //     }
            //     // loaded++;
            //     return true;
            // }
            return false;
        }
        catch { return false; }
    }

    public loadLocalisation() {
        Localisation.clearLocalisation();
        const files = loadFiles("lang", ".json");
        if (!files) return;
        for (const file of files) {
            Localisation.loadLocalisation(file);
        }
    }

    public getCommand(commandName: string) {
        return this.commands.get(commandName) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    }

    public getSlashCommand(commandName: string) {
        return this.SlashCommands.get(commandName) || this.SlashCommands.find(cmd => cmd.commandData.name === commandName);
    }

    public getCommands(category: Category) {
        return this.commands.filter(command => command.category === category);
    }

    public getAllCommands() {
        return this.commands;
    }
}

const intents = new IntentsBitField(GatewayIntentBits.MessageContent | GatewayIntentBits.DirectMessages | GatewayIntentBits.DirectMessageReactions | GatewayIntentBits.DirectMessageTyping | GatewayIntentBits.Guilds | GatewayIntentBits.GuildBans | GatewayIntentBits.GuildEmojisAndStickers | GatewayIntentBits.GuildIntegrations | GatewayIntentBits.GuildInvites | GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildMessageReactions | GatewayIntentBits.GuildMessageTyping | GatewayIntentBits.GuildVoiceStates | GatewayIntentBits.GuildWebhooks);
export const BotUser = new BotClient({
    clientOptions: { intents: intents, makeCache: Options.cacheEverything(), allowedMentions: { repliedUser: false }, partials: [Partials.Channel] },
    logLoading: 'simplified'
});