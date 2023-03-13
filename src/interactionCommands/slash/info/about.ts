import { ApplicationCommandType } from "discord.js";
import { AboutBaseCommand } from "../../../baseCommands/info/About";
import { SlashCommand } from "../../../structs/SlashCommand";

class AboutCommand extends SlashCommand {
    public constructor() {
        super({ name: "", type: ApplicationCommandType.ChatInput, description: "About the bot!" });

        this.baseCommand = new AboutBaseCommand();
    }

    /*public async onRun(cmdArgs: SlashCommandArguments) {
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

        cmdArgs.interaction.followUp({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)], components: [row] });
    }*/
}

export = AboutCommand;