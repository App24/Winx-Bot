import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Patreon } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments, CommandAvailability, CommandUsage } from "../../structs/Command";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { copyUserSetting, DEFAULT_USER_SETTING, UserSetting } from "../../structs/databaseTypes/UserSetting";
import { SubCommand } from "../../structs/SubCommand";
import { getServerDatabase, isHexColor } from "../../Utils";

class CustomisationCodeCommand extends Command{
    public constructor(){
        super();
        this.category=Patreon;
        this.availability=CommandAvailability.Guild;
        this.access=CommandAccess.Patreon;
        this.aliases=["customcode"];
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

        if(values.length<5) return cmdArgs.channel.send(Localisation.getTranslation("customisationcode.value.error"));

        const nameColor=values[0];
        const cardColor=values[1];
        const circleColor=values[2];
        const barStartColor=values[3];
        const barEndColor=values[4];

        const nameEnabled=nameColor!=="??????";

        if(nameEnabled&&!isHexColor(nameColor)) return cmdArgs.channel.send(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(cardColor)) return cmdArgs.channel.send(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(circleColor)) return cmdArgs.channel.send(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(barStartColor)) return cmdArgs.channel.send(Localisation.getTranslation("customisationcode.value.error"));
        if(!isHexColor(barEndColor)) return cmdArgs.channel.send(Localisation.getTranslation("customisationcode.value.error"));
        
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings=await getServerDatabase<UserSetting[]>(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);

        userSettings.nameColor=nameEnabled?nameColor:DEFAULT_USER_SETTING.nameColor;
        userSettings.cardColor=cardColor;
        userSettings.specialCircleColor=circleColor;
        userSettings.barStartColor=barStartColor;
        userSettings.barEndColor=barEndColor;

        cmdArgs.channel.send("Updated Customisation Settings!")
        await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
    }
}

class GetSubCommand extends SubCommand{
    public constructor(){
        super("get");
    }

    public async onRun(cmdArgs:CommandArguments){
        const UserSettings=BotUser.getDatabase(DatabaseType.UserSettings);
        const serverUserSettings=await getServerDatabase<UserSetting[]>(UserSettings, cmdArgs.guild.id);
        if(!serverUserSettings.find(u=>u.userId===cmdArgs.author.id)){
            serverUserSettings.push(copyUserSetting(DEFAULT_USER_SETTING, cmdArgs.author.id));
            await UserSettings.set(cmdArgs.guild.id, serverUserSettings);
        }
        const userSettings=serverUserSettings.find(u=>u.userId===cmdArgs.author.id);
        let code="";
        code+=(userSettings.nameColor===DEFAULT_USER_SETTING.nameColor?"??????":userSettings.nameColor)+"|";
        code+=userSettings.cardColor+"|";
        code+=userSettings.specialCircleColor+"|";
        code+=userSettings.barStartColor+"|";
        code+=userSettings.barEndColor;

        cmdArgs.channel.send(Localisation.getTranslation("customisationcode.get", code));
    }
}

export=CustomisationCodeCommand;