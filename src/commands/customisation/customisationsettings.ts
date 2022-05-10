import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { createMessageEmbed, getServerDatabase } from "../../utils/Utils";

class CustomisationSettingsCommand extends Command {
    public constructor() {
        super();
        this.available = CommandAvailable.Guild;
        this.category = Customisation;
        this.aliases = ["csettings", "customizationsettings"];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

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