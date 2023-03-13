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
import { ManageXpBaseCommand } from "../../baseCommands/settings/ManageXp";

class SetXPCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new ManageXpBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
    //     const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

    //     await createWhatToDoButtons({
    //         sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
    //             {
    //                 customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
    //                     const { value: xp, message: msg } = await getNumberReply({ sendTarget: interaction, author: cmdArgs.author }, { min: 1 });
    //                     if (!xp) return;
    //                     serverInfo.maxXpPerMessage = xp;
    //                     await ServerInfo.set(cmdArgs.guildId, serverInfo);
    //                     msg.reply(Localisation.getTranslation("setxp.set", serverInfo.maxXpPerMessage));
    //                 }
    //             },
    //             {
    //                 customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async ({ interaction }) => {
    //                     interaction.editReply(Localisation.getTranslation("setxp.get", serverInfo.maxXpPerMessage));
    //                 }
    //             }
    //         ]
    //     });
    // }
}

export = SetXPCommand;