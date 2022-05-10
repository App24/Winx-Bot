import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SubCommand } from "../../structs/SubCommand";
import { getServerDatabase, isHexColor } from "../../utils/Utils";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { getServerUserSettings } from "../../utils/RankUtils";

class CustomisationCodeCommand extends Command {
    public constructor() {
        super();
        this.category = Customisation;
        this.available = CommandAvailable.Guild;
        this.aliases = ["customcode", "customizationcode"];
        this.usage = [new CommandUsage(true, "argument.get", "argument.set"), new CommandUsage(false, "argument.code")];
        this.subCommands = [new SetSubCommand(), new GetSubCommand()];
    }

    public async onRun(cmdArgs: CommandArguments) {
        const name = cmdArgs.args.shift();
        this.onRunSubCommands(cmdArgs, name);
    }
}

class SetSubCommand extends SubCommand {
    public constructor() {
        super("set");
        this.minArgs = 1;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const code = cmdArgs.args[0];

        const values = code.split("|");

        if (values.length < 5) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));

        const nameColor = values[0];
        const cardColor = values[1];
        const circleColor = values[2];
        const barStartColor = values[3];
        const barEndColor = values[4];
        const winxCharacterInt = parseInt(values[5]);
        if (isNaN(winxCharacterInt)) {
            return cmdArgs.message.reply("Invalid winx character");
        }

        const nameEnabled = nameColor !== "??????";
        const circleEnabled = circleColor !== "??????";

        if (nameEnabled && !isHexColor(nameColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (circleEnabled && !isHexColor(cardColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (!isHexColor(circleColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (!isHexColor(barStartColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (!isHexColor(barEndColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));

        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        let winxCharacter;
        try {
            winxCharacter = <WinxCharacter>winxCharacterInt;
        } catch {
            return cmdArgs.message.reply("Invalid winx character");
        }

        userSettings.nameColor = nameEnabled ? nameColor : new ServerUserSettings(cmdArgs.author.id).nameColor;
        userSettings.cardColor = cardColor;
        userSettings.specialCircleColor = circleEnabled ? circleColor : new ServerUserSettings(cmdArgs.author.id).specialCircleColor;
        userSettings.barStartColor = barStartColor;
        userSettings.barEndColor = barEndColor;
        userSettings.winxCharacter = winxCharacter;

        serverUserSettings[userIndex] = userSettings;

        cmdArgs.message.reply("Updated Customisation Settings!");
        await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
    }
}

class GetSubCommand extends SubCommand {
    public constructor() {
        super("get");
    }

    public async onRun(cmdArgs: CommandArguments) {
        const userSettings = await getServerUserSettings(cmdArgs.author.id, cmdArgs.guildId);

        let code = "";
        code += (userSettings.nameColor === new ServerUserSettings(cmdArgs.author.id).nameColor ? "??????" : userSettings.nameColor) + "|";
        code += userSettings.cardColor + "|";
        code += (userSettings.specialCircleColor === new ServerUserSettings(cmdArgs.author.id).specialCircleColor ? "??????" : userSettings.specialCircleColor) + "|";
        code += userSettings.barStartColor + "|";
        code += userSettings.barEndColor + "|";
        code += userSettings.winxCharacter;

        cmdArgs.message.reply(Localisation.getTranslation("customisationcode.get", code));
    }
}

export = CustomisationCodeCommand;