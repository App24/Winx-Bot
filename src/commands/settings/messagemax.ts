import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Settings } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getServerDatabase } from "../../utils/Utils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getNumberReply } from "../../utils/ReplyUtils";
import { ButtonStyle } from "discord.js";
import { MessageMaxBaseCommand } from "../../baseCommands/settings/MessageMax";

class SetMaxMessageCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new MessageMaxBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
    //     const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

    //     await createWhatToDoButtons({
    //         sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
    //             {
    //                 customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
    //                     const { value: amount, message: msg } = await getNumberReply({ sendTarget: interaction, author: cmdArgs.author }, { min: 1 });
    //                     if (!amount) return;
    //                     serverInfo.maxMessagePerMinute = amount;
    //                     await ServerInfo.set(cmdArgs.guildId, serverInfo);
    //                     return msg.reply(Localisation.getTranslation("setmaxmessage.set", serverInfo.maxMessagePerMinute));
    //                 }
    //             },
    //             {
    //                 customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async ({ interaction }) => {
    //                     interaction.editReply(Localisation.getTranslation("setmaxmessage.get", serverInfo.maxMessagePerMinute));
    //                 }
    //             }
    //         ]
    //     });
    // }
}

export = SetMaxMessageCommand;