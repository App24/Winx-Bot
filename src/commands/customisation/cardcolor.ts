import { createCanvas } from "canvas";
import { Channel, Message, MessageAttachment, NewsChannel, TextChannel } from "discord.js";
import { BotUser } from "../../BotClient";
import { Customisation } from "../../structs/Category";
import { Command, CommandAccess, CommandAvailability } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { copyUserSetting, DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { canvasColor, canvasToMessageAttachment, getServerDatabase, isHexColor } from "../../Utils";

class CardColorCommand extends Command{
    public constructor(){
        super("Set the color of your card!");
        this.access=CommandAccess.Patreon;
        this.availability=CommandAvailability.Guild;
        this.category=Customisation;
        this.usage="<get/set/reset> [hex color]";
        this.minArgs=1;
        this.maxArgs=2;
        this.aliases=["cardcolour"];
        this.subCommands=[new GetSubCommand(), new SetSubCommand(), new ResetSubCommand()];
    }

    public async onRun(message : Message, args : string[]){
        await this.onRunSubCommands(message, args.shift(), args, true);
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
    }

    public async onRun(message : Message, args : string[]){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, message.guild.id);
        if(!serverUserSettings.find(u=>u.userId===message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, message.author.id));
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===message.author.id);
        message.channel.send(`#${userSettings.cardColor}`, canvasToMessageAttachment(canvasColor(userSettings.cardColor)));
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
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

        let color=args[0].toLowerCase();
        if(color.startsWith("#")){
            color=color.substring(1);
        }
        if(!isHexColor(color)) return message.reply("That is not a valid hex color");
        userSettings.cardColor=color;
        await UserSettings.set(message.guild.id, serverUserSettings);
        message.channel.send(`Set the card colour to #${color}`);
    }
}

class ResetSubCommand extends SubCommand{
    public constructor(){
        super("reset");
    }

    public async onRun(message : Message, args : string[]){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, message.guild.id);
        if(!serverUserSettings.find(u=>u.userId===message.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, message.author.id));
            await UserSettings.set(message.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===message.author.id);
        userSettings.cardColor=DEFAULT_USER_SETTING.cardColor;
        await UserSettings.set(message.guild.id, serverUserSettings);
        message.channel.send("Resetted card color!");
    }
}

export=CardColorCommand;