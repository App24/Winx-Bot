import { MessageEmbed } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Patreon } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { copyUserSetting, DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { getBotRoleColor, getServerDatabase } from "../../Utils";

class CustomisationSettingsCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.Patreon;
        this.availability=CommandAvailability.Guild;
        this.category=Patreon;
        this.aliases=["csettings"];
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);
        const embed=new MessageEmbed();
        embed.addField(Localisation.getTranslation("customisationsettings.cardColor"), `#${userSettings.cardColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.nameColor"), `#${userSettings.nameColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.barStartColor"), `#${userSettings.barStartColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.barEndColor"), `#${userSettings.barEndColor}`);
        embed.addField(Localisation.getTranslation("customisationsettings.specialCircleColor"), `#${userSettings.specialCircleColor}`);
        embed.setColor((await getBotRoleColor(cmdArgs.guild)));
        cmdArgs.channel.send(embed);
    }
}

export=CustomisationSettingsCommand;