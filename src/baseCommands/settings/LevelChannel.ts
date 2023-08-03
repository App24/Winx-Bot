import { ButtonStyle } from "discord.js";
import { Localisation } from "../../localisation";
import { getTextChannelFromMention } from "../../utils/GetterUtils";
import { createWhatToDoButtons } from "../../utils/MessageButtonUtils";
import { getTextChannelReply } from "../../utils/ReplyUtils";
import { getOneDatabase } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { ServerData } from "../../structs/databaseTypes/ServerData";

export class LevelChannelBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const serverInfo = await getOneDatabase(ServerData, { guildId: cmdArgs.guildId }, () => new ServerData({ guildId: cmdArgs.guildId }));

        await createWhatToDoButtons({
            sendTarget: cmdArgs.body, author: cmdArgs.author, settings: { time: 1000 * 60 * 5, max: 1 }, beforeButton: async ({ interaction }) => await interaction.update({ components: [] }), buttons: [
                {
                    customId: "set", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.set"), onRun: async ({ interaction }) => {
                        const { value: channel, message: msg } = await getTextChannelReply({ sendTarget: interaction, author: cmdArgs.author, guild: cmdArgs.guild });
                        if (!channel) return;

                        serverInfo.document.levelChannel = channel.id;

                        await serverInfo.save();
                        msg.reply(Localisation.getTranslation("levelchannel.set", channel));
                    }
                },
                {
                    customId: "get", style: ButtonStyle.Primary, label: Localisation.getTranslation("button.get"), onRun: async () => {
                        if (!serverInfo.document.levelChannel) return cmdArgs.reply("error.empty.levelchannel");
                        const channel = await getTextChannelFromMention(serverInfo.document.levelChannel, cmdArgs.guild);
                        if (!channel) return cmdArgs.reply("levelchannel.missing.channel");
                        cmdArgs.reply(`${channel}`);
                    }
                },
                {
                    customId: "clear", style: ButtonStyle.Danger, label: Localisation.getTranslation("button.clear"), onRun: async () => {
                        if (!serverInfo.document.levelChannel) return cmdArgs.reply("error.empty.levelchannel");

                        serverInfo.document.levelChannel = "";

                        await serverInfo.save();

                        cmdArgs.reply("levelchannel.remove");
                    }
                }
            ]
        });
    }
}