import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { copyUserSetting, DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { canvasColor, canvasToMessageAttachment, getServerDatabase, isHexColor } from "../../Utils";

class NameColorCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.Patreon;
        this.availability=CommandAvailability.Guild;
        this.category=Customisation;
        this.usage=[new CommandUsage(true, "argument.get", "argument.set", "argument.reset"), new CommandUsage(false, "argument.hexcolor")];
        this.minArgs=1;
        this.maxArgs=2;
        this.aliases=["namecolour"];
        this.subCommands=[new GetSubCommand(), new SetSubCommand(), new ResetSubCommand()];
    }

    public async onRun(cmdArgs : CommandArguments){
        const name=cmdArgs.args.shift();
        await this.onRunSubCommands(cmdArgs, name);
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);
        if(userSettings.nameColor===DEFAULT_USER_SETTING.nameColor||!isHexColor(userSettings.nameColor)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.namecolor"));
        cmdArgs.channel.send(Localisation.getTranslation("generic.hexcolor", userSettings.nameColor), canvasToMessageAttachment(canvasColor(userSettings.nameColor)));
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);

        if(cmdArgs.args[0].toLowerCase()===DEFAULT_USER_SETTING.nameColor){
            userSettings.nameColor=DEFAULT_USER_SETTING.nameColor;
            cmdArgs.channel.send(Localisation.getTranslation("namecolor.reset.output"));
        }else{
            let color=cmdArgs.args[0].toLowerCase();
            if(color.startsWith("#")){
                color=color.substring(1);
            }
            if(!isHexColor(color)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
            userSettings.nameColor=color;
            cmdArgs.channel.send(Localisation.getTranslation("namecolor.set.output", color));
        }
        await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
    }
}

class ResetSubCommand extends SubCommand{
    public constructor(){
        super("reset");
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);
        userSettings.nameColor=DEFAULT_USER_SETTING.nameColor;
        await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        cmdArgs.channel.send(Localisation.getTranslation("namecolor.reset.output"));
    }
}

export=NameColorCommand;