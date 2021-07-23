import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserSetting, copyUserSetting, DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { canvasColor, canvasToMessageAttachment, getServerDatabase, isHexColor } from "../../Utils";

class BarColorCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.Patreon;
        this.availability=CommandAvailability.Guild;
        this.category=Customisation;
        this.minArgs=2;
        this.maxArgs=3;
        this.usage=[new CommandUsage(true, "argument.get", "argument.set", "argument.reset"), new CommandUsage(true, "argument.start", "argument.end", "argument.both"), new CommandUsage(false, "argument.hexcolor")];
        this.aliases=["barcolour"];
        this.subCommands=[new GetSubCommand(), new SetSubCommand(), new ResetSubCommand()];
    }

    public async onRun(cmdArgs : CommandArguments){
        const name=cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.message.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.message.author.id);

        const op=cmdArgs.args[0].toLowerCase();
        let mod:BarMode;
        if(op==="start"){
            mod=BarMode.Start;
        }else if(op==="end"){
            mod=BarMode.End;
        }else if(op==="both"){
            mod=BarMode.Start|BarMode.End;
        }else{
            return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.option"));
        }

        if((mod&BarMode.Start)===BarMode.Start){
            await cmdArgs.channel.send(Localisation.getTranslation("barcolor.hexcolor.output", "Start", userSettings.barStartColor), canvasToMessageAttachment(canvasColor(userSettings.barStartColor)));
        }
        if((mod&BarMode.End)===BarMode.End){
            await cmdArgs.channel.send(Localisation.getTranslation("barcolor.hexcolor.output", "End", userSettings.barEndColor), canvasToMessageAttachment(canvasColor(userSettings.barEndColor)));
        }
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=2;
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.message.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.message.author.id);

        const op=cmdArgs.args[0].toLowerCase();
        let mod:BarMode;
        let append="";
        if(op==="start"){
            append=Localisation.getTranslation("barcolor.start");
            mod=BarMode.Start;
        }else if(op==="end"){
            append=Localisation.getTranslation("barcolor.end");
            mod=BarMode.End;
        }else if(op==="both"){
            append=Localisation.getTranslation("barcolor.both");
            mod=BarMode.Start|BarMode.End;
        }else{
            return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.option"));
        }

        let color=cmdArgs.args[1].toLowerCase();
        if(color.startsWith("#")){
            color=color.substring(1);
        }
        if(!isHexColor(color)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
        if((mod&BarMode.Start)===BarMode.Start){
            userSettings.barStartColor=color;
        }
        if((mod&BarMode.End)===BarMode.End){
            userSettings.barEndColor=color;
        }
        await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        return cmdArgs.channel.send(Localisation.getTranslation("barcolor.set.output", append, color));
    }
}

class ResetSubCommand extends SubCommand{
    public constructor(){
        super("reset");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.message.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.message.author.id);

        const op=cmdArgs.args[0].toLowerCase();
        let mod:BarMode;
        let append="";
        if(op==="start"){
            append=Localisation.getTranslation("barcolor.start");
            mod=BarMode.Start;
        }else if(op==="end"){
            append=Localisation.getTranslation("barcolor.end");
            mod=BarMode.End;
        }else if(op==="both"){
            append=Localisation.getTranslation("barcolor.both");
            mod=BarMode.Start|BarMode.End;
        }else{
            return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.option"));
        }

        if((mod&BarMode.Start)===BarMode.Start){
            userSettings.barStartColor=DEFAULT_USER_SETTING.barStartColor;
        }
        if((mod&BarMode.End)===BarMode.End){
            userSettings.barEndColor=DEFAULT_USER_SETTING.barEndColor;
        }
        await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        return cmdArgs.channel.send(Localisation.getTranslation("barcolor.reset.output", append));
    }
}

enum BarMode{
    Start=1,
    End=2
}

export=BarColorCommand;