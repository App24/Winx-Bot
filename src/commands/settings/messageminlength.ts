import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { MessageMinLengthBaseCommand } from "../../baseCommands/settings/MessageMinLength";

class SetMinLengthCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.GuildOwner;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new MessageMinLengthBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
    //     const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

    //     await createWhatToDoButtons({
    //         sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1, time: 1000 * 60 * 6 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
    //             {
    //                 customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
    //                     const { value: len, message: msg } = await getNumberReply({ sendTarget: interaction, author: cmdArgs.author }, { min: 1 });
    //                     if (!len) return;
    //                     if (len > serverInfo.maxMessageLength) return msg.reply(Localisation.getTranslation("setminlength.error"));
    //                     serverInfo.minMessageLength = len;
    //                     await ServerInfo.set(cmdArgs.guildId, serverInfo);
    //                     cmdArgs.message.reply(Localisation.getTranslation("setminlength.set", serverInfo.minMessageLength));
    //                 }
    //             },
    //             {
    //                 customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async ({ interaction }) => {
    //                     interaction.editReply(Localisation.getTranslation("setminlength.get", serverInfo.minMessageLength));
    //                 }
    //             }
    //         ]
    //     });
    // }
}

export = SetMinLengthCommand;