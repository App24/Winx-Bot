import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { CREATORS_ID } from "../../Constants";
import { getBotMember } from "../../utils/GetterUtils";
import { Localisation } from "../../localisation";
import { Info } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { createMessageEmbed } from "../../utils/Utils";

class AboutCommand extends Command {
    public constructor() {
        super();
        this.category = Info;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const embed = new MessageEmbed();
        const data = [];
        CREATORS_ID().forEach(creator => {
            data.push(`<@${creator}>`);
        });
        const botMember = await getBotMember(cmdArgs.guild);
        embed.setAuthor({ name: (botMember && botMember.nickname) || BotUser.user.username, iconURL: BotUser.user.avatarURL() });
        embed.addField(Localisation.getTranslation("about.title.about"), Localisation.getTranslation("about.description.output"));
        embed.addField(Localisation.getTranslation("about.title.creators"), data.join(", "));
        embed.addField(Localisation.getTranslation("about.title.version"), process.env.npm_package_version);

        const row = new MessageActionRow().addComponents(
            new MessageButton({ style: "LINK", url: process.env.npm_package_config_github, label: Localisation.getTranslation("about.title.github") })
        );

        cmdArgs.message.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)], components: [row] });
    }
}

export = AboutCommand;