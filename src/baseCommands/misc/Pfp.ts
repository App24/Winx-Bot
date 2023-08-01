import { GuildMember, User } from "discord.js";
import { getMemberFromMention, getUserFromMention } from "../../utils/GetterUtils";
import { createMessageEmbed } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class PfpBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        if (cmdArgs.args.length === 0) {
            const user = cmdArgs.member ?? cmdArgs.author;
            const urlImg = user.displayAvatarURL({ size: 512, extension: "png" });

            let username = "";
            if (user instanceof User) {
                username = user.username;
            } else {
                username = user.nickname ?? user.user.username;
            }

            const embed = await createMessageEmbed({ title: username }, null);

            embed.setImage(urlImg);

            cmdArgs.reply({ embeds: [embed] });

            return;
        }

        let user: GuildMember | User = await getUserFromMention(cmdArgs.args[0]);

        if (cmdArgs.guild) {
            const temp = await getMemberFromMention(cmdArgs.args[0], cmdArgs.guild);
            if (temp) user = temp;
        }

        if (!user) {
            cmdArgs.reply("error");
            return;
        }

        let username = "";
        if (user instanceof User) {
            username = user.username;
        } else {
            username = user.nickname ?? user.user.username;
        }

        const urlImg = user.displayAvatarURL({ size: 512, extension: "png" });

        const embed = await createMessageEmbed({ title: username }, null);

        embed.setImage(urlImg);

        cmdArgs.reply({ embeds: [embed] });
    }
}