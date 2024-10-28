import { basename, Client, ClientOptions, GatewayIntentBits, IntentsBitField, Options, Partials } from "discord.js";
import { loadFiles } from "./utils/Utils";
import { Localisation } from "./localisation";
import { LocalisationKeys } from "./structs/LocalKeys";

class BotClient extends Client {
    public constructor(options?: ClientOptions) {
        super(options);

        this.loadLocalisation();

        (async () => {
            await this.loadEvents();
        })();
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
}

const intents = new IntentsBitField(GatewayIntentBits.MessageContent | GatewayIntentBits.DirectMessages | GatewayIntentBits.DirectMessageReactions | GatewayIntentBits.DirectMessageTyping | GatewayIntentBits.Guilds | GatewayIntentBits.GuildBans | GatewayIntentBits.GuildEmojisAndStickers | GatewayIntentBits.GuildIntegrations | GatewayIntentBits.GuildInvites | GatewayIntentBits.GuildMembers | GatewayIntentBits.GuildMessages | GatewayIntentBits.GuildMessageReactions | GatewayIntentBits.GuildMessageTyping | GatewayIntentBits.GuildVoiceStates | GatewayIntentBits.GuildWebhooks);
export const BotUser = new BotClient({ intents: intents, makeCache: Options.cacheEverything(), allowedMentions: { repliedUser: false }, partials: [Partials.Channel] });
BotUser.login(process.env.TOKEN);