import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandAvailable, CommandUsage, CommandArguments } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { DEFAULT_USER_SETTING } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { isHexColor } from "../../utils/Utils";

class CustomisationCodeCommand extends Command{
    public constructor(){
        super();
        this.category=Customisation;
        this.available=CommandAvailable.Guild;
        this.aliases=["customcode", "customizationcode"];
        this.minArgs=1;
        this.usage=[new CommandUsage(true, "argument.get", "argument.set"), new CommandUsage(false, "argument.code")];
        this.subCommands=[new SetSubCommand(), new GetSubCommand()];
    }

    public async onRun(cmdArgs:CommandArguments){
        const name=cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class SetSubCommand extends SubCommand{
    public constructor(){
        super("set");
        this.minArgs=1;
    }

    public async onRun(cmdArgs:CommandArguments){
        const code=cmdArgs.args[0];

        const values=code.split("|");

        if(values.length<5) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));

        const nameColor=values[0];
        const cardColor=values[1];
        const circleColor=values[2];
        const barStartColor=values[3];
        const barEndColor=values[4];

        const nameEnabled=nameColor!=="??????";

        if(nameEnabled&&!isHexColor(nameColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(cardColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(circleColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(barStartColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(barEndColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings=await UserSettings.get(cmdArgs.author.id);
        if(!userSettings){
            userSettings=DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }


        userSettings.nameColor=nameEnabled?nameColor:DEFAULT_USER_SETTING.nameColor;
        userSettings.cardColor=cardColor;
        userSettings.specialCircleColor=circleColor;
        userSettings.barStartColor=barStartColor;
        userSettings.barEndColor=barEndColor;

        cmdArgs.message.reply("Updated Customisation Settings!");
        await UserSettings.set(cmdArgs.author.id, userSettings);
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
    }

    public async onRun(cmdArgs:CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        let userSettings=await UserSettings.get(cmdArgs.author.id);
        if(!userSettings){
            userSettings=DEFAULT_USER_SETTING;
            await UserSettings.set(cmdArgs.author.id, userSettings);
        }

        let code="";
        code+=(userSettings.nameColor===DEFAULT_USER_SETTING.nameColor?"??????":userSettings.nameColor)+"|";
        code+=userSettings.cardColor+"|";
        code+=userSettings.specialCircleColor+"|";
        code+=userSettings.barStartColor+"|";
        code+=userSettings.barEndColor;

        cmdArgs.message.reply(Localisation.getTranslation("customisationcode.get", code));
    }
}

export=CustomisationCodeCommand;