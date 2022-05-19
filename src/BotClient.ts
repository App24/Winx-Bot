import { Client, ClientOptions, Collection, Intents, Options } from "discord.js";
import path from "path";
import { DATABASE_FOLDER } from "./Constants";
import { Keyv } from "./keyv/keyv-index";
import { Localisation } from "./localisation";
import { DatabaseType } from "./structs/DatabaseTypes";
import { loadFiles } from "./utils/Utils";
import fs from "fs";
import { Command } from "./structs/Command";
import { SlashCommand } from "./structs/SlashCommand";
import { Category } from "./structs/Category";

interface BotOptions {
    clientOptions?: ClientOptions;
    logLoading: 'none' | 'simplified' | 'complex' | 'all';
}

class BotClient extends Client {
    private databases = new Collection<DatabaseType, Keyv>();
    private commands = new Collection<string, Command>();
    public SlashCommands = new Collection<string, SlashCommand>();

    private botOptions: BotOptions;

    public constructor(options: BotOptions) {
        super(options.clientOptions);

        this.botOptions = options;

        this.loadLocalisation();

        this.loadDatabases();

        (async () => {
            await this.loadSlashCommands();
            await this.loadCommands();
            await this.loadEvents();
        })();
    }

    public loadDatabases() {
        if (!fs.existsSync(DATABASE_FOLDER)) {
            fs.mkdirSync(DATABASE_FOLDER, { recursive: true });
        }

        const values = Object.values(DatabaseType);
        values.forEach((value) => {
            this.databases.set(<DatabaseType>value, new Keyv(`sqlite://${DATABASE_FOLDER}/${value}.sqlite`));
        });
    }

    private async loadCommands() {
        const files = loadFiles("dist/commands", ".js");
        if (!files) return;
        let loaded = 0;
        for (const file of files) {
            try {
                const commandImport = await import(`./${file.substr(5, file.length)}`);
                const { default: cClass } = commandImport;
                const command: Command = new cClass();
                if (!command.deprecated) {
                    const name = path.basename(file).slice(0, -3);
                    if (!command.description)
                        command.description = `${name}.command.description`;
                    this.commands.set(name, command);
                    switch (this.botOptions.logLoading) {
                        case 'complex':
                        case 'all':
                            console.log(Localisation.getTranslation("bot.load.command.complex", name));
                            break;
                    }
                    loaded++;
                }
            } catch { }
        }
        switch (this.botOptions.logLoading) {
            case 'simplified':
            case 'all':
                console.log(Localisation.getTranslation("bot.load.command.simple", loaded));
                break;
        }
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
        const files = loadFiles("dist/slashCommands", ".js");
        if (!files) return;
        let loaded = 0;
        for (const file of files) {
            try {
                const commandImport = await import(`./${file.substr(5, file.length)}`);
                const { default: cClass } = commandImport;
                const command: SlashCommand = new cClass();
                const name = path.basename(file).slice(0, -3);
                if (command.commandData.type === "CHAT_INPUT") {
                    if (!command.commandData.description) {
                        console.log(`Slash Command: \`${name}\` has no description, yet it is a \`${command.commandData.type}\` slash command!`);
                        continue;
                    }
                }
                this.SlashCommands.set(name, command);
                switch (this.botOptions.logLoading) {
                    case 'complex':
                    case 'all':
                        console.log(Localisation.getTranslation("bot.load.slashcommand.complex", name));
                        break;
                }
                loaded++;
            } catch { }
        }
        switch (this.botOptions.logLoading) {
            case 'simplified':
            case 'all':
                console.log(Localisation.getTranslation("bot.load.slashcommand.simple", loaded));
                break;
        }
    }

    public loadLocalisation() {
        Localisation.clearLocalisation();
        const files = loadFiles("lang", ".json");
        if (!files) return;
        for (const file of files) {
            Localisation.loadLocalisation(file);
        }
    }

    public getDatabase(databaseType: DatabaseType): Keyv {
        return this.databases.get(databaseType);
    }

    public getCommand(commandName: string) {
        return this.commands.get(commandName) || this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    }

    public getCommands(category: Category) {
        return this.commands.filter(command => command.category === category);
    }
}

const intents = new Intents(Intents.FLAGS.DIRECT_MESSAGES | Intents.FLAGS.DIRECT_MESSAGE_REACTIONS | Intents.FLAGS.DIRECT_MESSAGE_TYPING | Intents.FLAGS.GUILDS | Intents.FLAGS.GUILD_BANS | Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS | Intents.FLAGS.GUILD_INTEGRATIONS | Intents.FLAGS.GUILD_INVITES | Intents.FLAGS.GUILD_MEMBERS | Intents.FLAGS.GUILD_MESSAGES | Intents.FLAGS.GUILD_MESSAGE_REACTIONS | Intents.FLAGS.GUILD_MESSAGE_TYPING | Intents.FLAGS.GUILD_VOICE_STATES | Intents.FLAGS.GUILD_WEBHOOKS);
export const BotUser = new BotClient({
    clientOptions: { intents: intents, makeCache: Options.cacheEverything(), allowedMentions: { repliedUser: false }, partials: ["CHANNEL"] },
    logLoading: 'simplified'
});