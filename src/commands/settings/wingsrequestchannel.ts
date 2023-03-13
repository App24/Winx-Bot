import { wingsRequestChannelBaseCommand } from "../../baseCommands/settings/WingsRequestChannel";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { createMessageSelection } from "../../utils/MessageSelectionUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";

class WingsRequestCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.access = CommandAccess.Moderators;
        this.category = Settings;

        this.baseCommand = new wingsRequestChannelBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
    //     const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

    //     createMessageSelection({
    //         sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
    //             options: [
    //                 {
    //                     label: Localisation.getTranslation("button.get"),
    //                     value: "get",
    //                     async onSelect({ interaction }) {
    //                         if (!serverInfo.wingsRequestChannel) {
    //                             return interaction.reply("No Wings Request Channel Set");
    //                         }
    //                         return interaction.reply(`<#${serverInfo.wingsRequestChannel}>`);
    //                     },
    //                     default: false,
    //                     description: null,
    //                     emoji: null
    //                 },
    //                 {
    //                     label: Localisation.getTranslation("button.set"),
    //                     value: "set",
    //                     async onSelect({ interaction }) {
    //                         const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
    //                         if (!channel) return;

    //                         serverInfo.wingsRequestChannel = channel.id;

    //                         ServerInfo.set(cmdArgs.guildId, serverInfo);

    //                         msg.reply(Localisation.getTranslation("generic.done"));
    //                     },
    //                     default: false,
    //                     description: null,
    //                     emoji: null
    //                 },
    //                 {
    //                     label: Localisation.getTranslation("button.clear"),
    //                     value: "clear",
    //                     async onSelect({ interaction }) {
    //                         serverInfo.wingsRequestChannel = "";

    //                         ServerInfo.set(cmdArgs.guildId, serverInfo);

    //                         interaction.reply(Localisation.getTranslation("generic.done"));
    //                     },
    //                     default: false,
    //                     description: null,
    //                     emoji: null
    //                 }
    //             ]
    //         }
    //     });
    // }
}

export = WingsRequestCommand;