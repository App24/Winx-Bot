import { ButtonStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_SERVER_INFO, ServerInfo } from "../../structs/databaseTypes/ServerInfo";
import { getTextChannelFromMention } from "../../utils/GetterUtils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { getServerDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class LevelChannelBaseCommand extends BaseCommand{
    public async onRun(cmdArgs: BaseCommandType) {
        const ServerInfo = BotUser.getDatabase(DatabaseType.ServerInfo);
        const serverInfo: ServerInfo = await getServerDatabase(ServerInfo, cmdArgs.guildId, DEFAULT_SERVER_INFO);

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { time: 1000 * 60 * 5, max: 1 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
                        const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                        if (!channel) return;

                        serverInfo.levelChannel = channel.id;

                        await ServerInfo.set(cmdArgs.guildId, serverInfo);
                        msg.reply(Localisation.getTranslation("levelchannel.set", channel));
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async () => {
                        if (!serverInfo.levelChannel) return cmdArgs.reply("error.empty.levelchannel");
                        const channel = await getTextChannelFromMention(serverInfo.levelChannel, cmdArgs.guild);
                        if (!channel) return cmdArgs.reply("levelchannel.missing.channel");
                        cmdArgs.reply(`${channel}`);
                    }
                },
                {
                    customId: "clear", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.clear"), onRun: async () => {
                        if (!serverInfo.levelChannel) return cmdArgs.reply("error.empty.levelchannel");

                        serverInfo.levelChannel = "";

                        await ServerInfo.set(cmdArgs.guildId, serverInfo);

                        cmdArgs.reply("levelchannel.remove");
                    }
                }
            ]
        });
    }
}