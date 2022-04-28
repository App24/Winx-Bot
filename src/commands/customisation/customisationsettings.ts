import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailable, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { createMessageEmbed } from "../../utils/Utils";

class CustomisationSettingsCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["csettings", "customizationsettings"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const UserSettings = BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings = await UserSettings.get(cmdArgs.author.id);
        if (!userSettings) {
            userSettings = DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }

        const embed = new MessageEmbed();
        embed.addField(Localisation.getTranslation("customisationsettings.cardColor"), `#${userSettings.cardColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.nameColor"), `#${userSettings.nameColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.barStartColor"), `#${userSettings.barStartColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.barEndColor"), `#${userSettings.barEndColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.specialCircleColor"), `#${userSettings.specialCircleColor}`);
        cmdArgs.message.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
    }
}

export = CustomisationSettingsCommand;