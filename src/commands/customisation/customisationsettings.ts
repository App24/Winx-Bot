import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { CardTemplate, ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { WinxCharacter } from "../../structs/WinxCharacters";
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

        const templates = Object.values(CardTemplate);
        const templatesNames = Object.keys(CardTemplate);

        if (!userSettings.cardTemplate) {
            userSettings.cardTemplate = CardTemplate.Normal;
        }

        if (!userSettings.wingsTemplate) {
            userSettings.wingsTemplate = CardTemplate.Normal;
        }

        const embed = new MessageEmbed();
        embed.addField(Localisation.getTranslation("customisationsettings.cardColor"), `#${userSettings.cardColor}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.cardColorB"), `#${userSettings.cardColorB}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.nameColor"), `#${userSettings.nameColor}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.barStartColor"), `#${userSettings.barStartColor}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.barEndColor"), `#${userSettings.barEndColor}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.specialCircleColor"), `#${userSettings.specialCircleColor}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.wingsLevelA"), `${userSettings.wingsLevel}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.wingsLevelB"), `${userSettings.wingsLevelB}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.winxCharacterA"), `${WinxCharacter[userSettings.winxCharacter]}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.winxCharacterB"), `${WinxCharacter[userSettings.winxCharacterB]}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.cardTemplate"), `${templatesNames[templates.findIndex(t => t === userSettings.cardTemplate)].replace("_", " ")}`, true);
        embed.addField(Localisation.getTranslation("customisationsettings.wingsTemplate"), `${templatesNames[templates.findIndex(t => t === userSettings.wingsTemplate)].replace("_", " ")}`, true);
        cmdArgs.message.reply({ embeds: [await createMessageEmbed(embed, cmdArgs.guild)] });
    }
}

export = CustomisationSettingsCommand;