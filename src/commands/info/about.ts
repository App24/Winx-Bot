import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageActionRowComponentBuilder } from "discord.js";
import { BotUser } from "../../BotClient";
import { CREATORS_ID } from "../../Constants";
import { getBotMember } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Info } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { createMessageEmbed } from "../../utils/Utils";
import { AboutBaseCommand } from "../../baseCommands/info/About";

class AboutCommand extends Command {
    public constructor() {
        super();
        this.category = Info;

        this.baseCommand = new AboutBaseCommand();
    }

    /*public async onRun(cmdArgs: CommandArguments) {
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

        cmdArgs.message.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)], components: [row] });
    }*/
}

export = AboutCommand;