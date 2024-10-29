import { basename, Client, ClientOptions, Collection, GatewayIntentBits, IntentsBitField, Options, Partials } from "discord.js";
import { asyncForEach, loadFiles } from "./utils/Utils";
import { Localisation } from "./localisation";
import { LocalisationKeys } from "./structs/LocalKeys";
import path from "path";
import { Command } from "./structs/Command";

class BotClient extends Client {
    public commands = new Collection<string, Command>();

    public constructor(options?: ClientOptions) {
        super(options);

        this.loadLocalisation();

        this.loadCommands();
        this.loadEvents();
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
                    // if (c instanceof MultiCommand) {
                    //     command = await c.generateCommand();
                    //     name = c.name;
                    // }
                    if (this.loadCommand(command, name)) {
                        loaded++;
                    }
                });

            } catch { }
        }
        console.log(Localisation.getLocalisation({ key: LocalisationKeys.bot_load_command, args: [loaded] }));
    }

    private loadCommand(cClass, name: string) {
        try {
            let command: Command;
            if (cClass instanceof Command) {
                command = cClass;
            } else {
                command = new cClass();
            }
            if (!command.baseCommand.description)
                command.baseCommand.description = `${name}.command.description`;
            command.commandName = name;
            this.commands.set(name, command);
            return true;
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
            const name = basename(file).slice(0, -3);

            if (typeof func !== "function") continue;

            func();

            loaded++;
        }

        console.log(Localisation.getLocalisation({ key: LocalisationKeys.bot_load_event, args: [loaded] }));
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
}

const intents = new IntentsBitField(GatewayIntentBits.MessageContent | GatewayIntentBits.DirectMessages | GatewayIntentBits.DirectMessageReactions | GatewayIntentBits.DirectMessageTyping | GatewayIntentBits.Guilds | GatewayIntentBits.GuildBans | GatewayIntentBits.GuildEmojisAndStickers | GatewayIntentBits.GuildIntegrations | GatewayIntentBits.GuildInvites | GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildMessageReactions | GatewayIntentBits.GuildMessageTyping | GatewayIntentBits.GuildVoiceStates | GatewayIntentBits.GuildWebhooks);
export const BotUser = new BotClient({ intents: intents, makeCache: Options.cacheEverything(), allowedMentions: { repliedUser: false }, partials: [Partials.Channel] });
BotUser.login(process.env.TOKEN);