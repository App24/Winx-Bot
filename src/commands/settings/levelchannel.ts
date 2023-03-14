import { Settings } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { CommandAccess } from "../../structs/CommandAccess";
import { LevelChannelBaseCommand } from "../../baseCommands/settings/LevelChannel";

class LevelChannelCommand extends Command {
    public constructor() {
        super();
        this.category = Settings;
        this.access = CommandAccess.Moderators;
        this.available = CommandAvailable.Guild;

        this.baseCommand = new LevelChannelBaseCommand();
    }

    // public async onRun(cmdArgs: CommandArguments) {
    //     const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
    //     const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

    //     await createWhatToDoButtons({
    //         sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { time: 1000 * 60 * 5, max: 1 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
    //             {
    //                 customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
    //                     const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
    //                     if (!channel) return;

    //                     serverInfo.levelChannel = channel.id;

    //                     await ServerInfo.set(cmdArgs.guildId, serverInfo);
    //                     msg.reply(Localisation.getTranslation("levelchannel.set", channel));
    //                 }
    //             },
    //             {
    //                 customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async () => {
    //                     if (!serverInfo.levelChannel) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levelchannel"));
    //                     const channel = await getTextChannelFromMention(serverInfo.levelChannel, cmdArgs.guild);
    //                     if (!channel) return cmdArgs.message.reply(Localisation.getTranslation("levelchannel.missing.channel"));
    //                     cmdArgs.message.reply(`${channel}`);
    //                 }
    //             },
    //             {
    //                 customId: "clear", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.clear"), onRun: async () => {
    //                     if (!serverInfo.levelChannel) return cmdArgs.message.reply(Localisation.getTranslation("error.empty.levelchannel"));

    //                     serverInfo.levelChannel = "";

    //                     await ServerInfo.set(cmdArgs.guildId, serverInfo);

    //                     cmdArgs.message.reply(Localisation.getTranslation("levelchannel.remove"));
    //                 }
    //             }
    //         ]
    //     });
    // }
}

export = LevelChannelCommand;