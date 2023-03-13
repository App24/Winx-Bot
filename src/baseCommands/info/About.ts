import { EmbedBuilder, ActionRowBuilder, MessageActionRowComponentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { BotUser } from "../../BotClient";
import { CREATORS_ID } from "../../Constants";
import { Localisation } from "../../localisation";
import { getBotMember } from "../../utils/GetterUtils";
import { createMessageEmbed } from "../../utils/Utils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class AboutBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const embed = new EmbedBuilder();
        const data = [];
        CREATORS_ID().forEach(creator => {
            data.push(`<@${creator}>`);
        });
        const botMember = await getBotMember(cmdArgs.guild);
        embed.setAuthor({ name: (botMember && botMember.nickname) || BotUser.user.username, iconURL: BotUser.user.avatarURL() });
        embed.addFields({ name: Localisation.getTranslation("about.title.about"), value: Localisation.getTranslation("about.description.output") });
        embed.addFields({ name: Localisation.getTranslation("about.title.creators"), value: data.join(", ") });
        embed.addFields({ name: Localisation.getTranslation("about.title.version"), value: process.env.npm_package_version });

        const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            new ButtonBuilder({ style: ButtonStyle.Link, url: process.env.npm_package_config_github, label: Localisation.getTranslation("about.title.github") })
        );

        cmdArgs.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)], components: [row] });
    }
}