import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Customisation } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserSetting, copyUserSetting, DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { canvasColor, canvasToMessageAttachment, getServerDatabase, isHexColor } from "../../Utils";

class BarColorCommand extends Command{
    public constructor(){
        super("Sets the color of your bar!");
        this.access=CommandAccess.Patreon;
        this.availability=CommandAvailability.Guild;
        this.category=Customisation;
        this.minArgs=2;
        this.maxArgs=3;
        this.usage="<get/set/reset> <start/end/both> [hex color]";
        this.aliases=["barcolour"];
        this.subCommands=[new GetSubCommand(), new SetSubCommand(), new ResetSubCommand()];
    }

    public async onRun(message : Message, args : string[]){
        this.onRunSubCommands(message, args.shift(), args, true);
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, message.guild.id);
        if(!serverUserSettings.find(u=>u.userId===message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, message.author.id));
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===message.author.id);

        const op=args[0].toLowerCase();
        let mod:BarMode;
        if(op==="start"){
            mod=BarMode.Start;
        }else if(op==="end"){
            mod=BarMode.End;
        }else if(op==="both"){
            mod=BarMode.Start|BarMode.End;
        }else{
            return message.reply("That is not a valid option!");
        }

        if((mod&BarMode.Start)===BarMode.Start){
            await message.channel.send(`Start: #${userSettings.barStartColor}`, canvasToMessageAttachment(canvasColor(userSettings.barStartColor)));
        }
        if((mod&BarMode.End)===BarMode.End){
            await message.channel.send(`End: #${userSettings.barEndColor}`, canvasToMessageAttachment(canvasColor(userSettings.barEndColor)));
        }
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=2;
    }

    public async onRun(message : Message, args : string[]){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, message.guild.id);
        if(!serverUserSettings.find(u=>u.userId===message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, message.author.id));
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===message.author.id);

        const op=args[0].toLowerCase();
        let mod:BarMode;
        let append="";
        if(op==="start"){
            append="start of";
            mod=BarMode.Start;
        }else if(op==="end"){
            append="end of";
            mod=BarMode.End;
        }else if(op==="both"){
            append="both start and end of";
            mod=BarMode.Start|BarMode.End;
        }else{
            return message.reply("That is not a valid option!");
        }

        let color=args[1].toLowerCase();
        if(color.startsWith("#")){
            color=color.substring(1);
        }
        if(!isHexColor(color)) return message.reply("That is not a valid hex color");
        if((mod&BarMode.Start)===BarMode.Start){
            userSettings.barStartColor=color;
        }
        if((mod&BarMode.End)===BarMode.End){
            userSettings.barEndColor=color;
        }
        await UserSettings.set(message.guild.id, serverUserSettings);
        return message.channel.send(`Set the ${append} bar color to #${color}!`);
    }
}

class ResetSubCommand extends SubCommand{
    public constructor(){
        super("reset");
        this.minArgs=1;
    }

    public async onRun(message : Message, args : string[]){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, message.guild.id);
        if(!serverUserSettings.find(u=>u.userId===message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, message.author.id));
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===message.author.id);

        const op=args[0].toLowerCase();
        let mod:BarMode;
        let append="";
        if(op==="start"){
            append="start of";
            mod=BarMode.Start;
        }else if(op==="end"){
            append="end of";
            mod=BarMode.End;
        }else if(op==="both"){
            append="both start and end of";
            mod=BarMode.Start|BarMode.End;
        }else{
            return message.reply("That is not a valid option!");
        }

        if((mod&BarMode.Start)===BarMode.Start){
            userSettings.barStartColor=DEFAULT_USER_SETTING.barStartColor;
        }
        if((mod&BarMode.End)===BarMode.End){
            userSettings.barEndColor=DEFAULT_USER_SETTING.barEndColor;
        }
        await UserSettings.set(message.guild.id, serverUserSettings);
        return message.channel.send(`Resetted ${append} bar color!`);
    }
}

enum BarMode{
    Start=1,
    End=2
}

export=BarColorCommand;