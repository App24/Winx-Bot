import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailable, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { canvasColor } from "../../utils/CanvasUtils";
import { canvasToMessageAttachment, isHexColor } from "../../utils/Utils";

class CardColorCommand extends Command{
    public constructor(){
        super();
        this.available=CommandAvailable.Guild;
        this.category=Customisation;
        this.usage=[new CommandUsage(true, "argument.get", "argument.set", "argument.reset"), new CommandUsage(false, "argument.hexcolor")];
        this.minArgs=1;
        this.maxArgs=2;
        this.aliases=["cardcolour"];
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

        cmdArgs.message.reply({content: Localisation.getTranslation("generic.hexcolor", userSettings.cardColor), files: [canvasToMessageAttachment(canvasColor(userSettings.cardColor))]});
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


        let color=cmdArgs.args[0].toLowerCase();
        if(color.startsWith("#")){
            color=color.substring(1);
        }
        if(!isHexColor(color)) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
        userSettings.cardColor=color;
        await UserSettings.set(cmdArgs.author.id, userSettings);
        cmdArgs.message.reply(Localisation.getTranslation("cardcolor.set.output", color));
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

        userSettings.cardColor=DEFAULT_USER_SETTING.cardColor;
        await UserSettings.set(cmdArgs.author.id, userSettings);
        cmdArgs.message.reply(Localisation.getTranslation("cardcolor.reset.output"));
    }
}

export=CardColorCommand;