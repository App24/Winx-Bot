import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailability, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserSetting, copyUserSetting, DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { createMessageEmbed, getServerDatabase } from "../../utils/Utils";

class CustomisationSettingsCommand extends Command{
    public constructor(){
        super();
        this.availability=CommandAvailability.Guild;
        this.category=Customisation;
        this.aliases=["csettings"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guildId);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guildId, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);
        const embed=new MessageEmbed();
        embed.addField(Localisation.getTranslation("customisationsettings.cardColor"), `#${userSettings.cardColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.nameColor"), `#${userSettings.nameColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.barStartColor"), `#${userSettings.barStartColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.barEndColor"), `#${userSettings.barEndColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.specialCircleColor"), `#${userSettings.specialCircleColor}`);
        cmdArgs.message.reply({embeds: [await createMessageEmbed(embed, cmdArgs.guild)]});
    }
}

export=CustomisationSettingsCommand;