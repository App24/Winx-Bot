import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailability, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { UserSetting, copyUserSetting, DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { getServerDatabase, canvasToMessageAttachment, canvasColor, isHexColor } from "../../utils/Utils";

class CircleColorCommand extends Command{
    public constructor(){
        super();
        this.availability=CommandAvailability.Guild;
        this.category=Customisation;
        this.usage=[new CommandUsage(true, "argument.get", "argument.set", "argument.reset"), new CommandUsage(false, "argument.hexcolor")];
        this.minArgs=1;
        this.maxArgs=2;
        this.aliases=["circlecolour"];
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
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guildId);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guildId, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);
        cmdArgs.message.reply({content: Localisation.getTranslation("generic.hexcolor", userSettings.specialCircleColor), files: [canvasToMessageAttachment(canvasColor(userSettings.specialCircleColor))]});
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guildId);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guildId, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);

        let color=cmdArgs.args[0].toLowerCase();
        if(color.startsWith("#")){
            color=color.substring(1);
        }
        if(!isHexColor(color)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
        userSettings.specialCircleColor=color;
        await UserSettings.set(cmdArgs.guildId, serverUserSettings);
        cmdArgs.message.reply(Localisation.getTranslation("circlecolor.set.output", color));
    }
}

class ResetSubCommand extends SubCommand{
    public constructor(){
        super("reset");
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings:UserSetting[]=await getServerDatabase(UserSettings, cmdArgs.guildId);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guildId, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);
        userSettings.specialCircleColor=DEFAULT_USER_SETTING.specialCircleColor;
        await UserSettings.set(cmdArgs.guildId, serverUserSettings);
        cmdArgs.message.reply(Localisation.getTranslation("circlecolor.resetset.output"));
    }
}

export=CircleColorCommand;