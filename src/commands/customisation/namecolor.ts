import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailable, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { canvasColor } from "../../utils/CanvasUtils";
import { isHexColor, canvasToMessageAttachment } from "../../utils/Utils";

class NameColorCommand extends Command{
    public constructor(){
        super();
        this.available=CommandAvailable.Guild;
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
        let userSettings=await UserSettings.get(cmdArgs.author.id);
        if(!userSettings){
            userSettings=DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }

        if(userSettings.nameColor===DEFAULT_USER_SETTING.nameColor||!isHexColor(userSettings.nameColor)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.namecolor"));
        cmdArgs.message.reply({content: Localisation.getTranslation("generic.hexcolor", userSettings.nameColor), files: [canvasToMessageAttachment(canvasColor(userSettings.nameColor))]});
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=1;
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings=await UserSettings.get(cmdArgs.author.id);
        if(!userSettings){
            userSettings=DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }


        if(cmdArgs.args[0].toLowerCase()===DEFAULT_USER_SETTING.nameColor){
            userSettings.nameColor=DEFAULT_USER_SETTING.nameColor;
            cmdArgs.message.reply(Localisation.getTranslation("namecolor.reset.output"));
        }else{
            let color=cmdArgs.args[0].toLowerCase();
            if(color.startsWith("#")){
                color=color.substring(1);
            }
            if(!isHexColor(color)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
            userSettings.nameColor=color;
            cmdArgs.message.reply(Localisation.getTranslation("namecolor.set.output", color));
        }
        await UserSettings.set(cmdArgs.author.id, userSettings);
    }
}

class ResetSubCommand extends SubCommand{
    public constructor(){
        super("reset");
    }

    public async onRun(cmdArgs : CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings=await UserSettings.get(cmdArgs.author.id);
        if(!userSettings){
            userSettings=DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }

        userSettings.nameColor=DEFAULT_USER_SETTING.nameColor;
        await UserSettings.set(cmdArgs.author.id, userSettings);
        cmdArgs.message.reply(Localisation.getTranslation("namecolor.reset.output"));
    }
}

export=NameColorCommand;