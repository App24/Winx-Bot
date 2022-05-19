import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Customisation } from "../../structs/Category";
import { Command, CommandUsage, CommandArguments } from "../../structs/Command";
import { CommandAvailable } from "../../structs/CommandAvailable";
import { DatabaseType } from "../../structs/DatabaseTypes";
import { SubCommand } from "../../structs/SubCommand";
import { getServerDatabase, isHexColor } from "../../utils/Utils";
import { WinxCharacter } from "../../structs/WinxCharacters";
import { CardTemplate, ServerUserSettings } from "../../structs/databaseTypes/ServerUserSettings";
import { getServerUserSettings } from "../../utils/RankUtils";

const NONE = "??????";

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

        const templates = Object.values(CardTemplate);

        if (values.length < 12) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));

        const ServerUserSettingsDatabase = BotUser.getDatabase(DatabaseType.ServerUserSettings);
        const serverUserSettings: ServerUserSettings[] = await getServerDatabase(ServerUserSettingsDatabase, cmdArgs.guildId);

        let userIndex = serverUserSettings.findIndex(u => u.userId === cmdArgs.author.id);
        if (userIndex < 0) {
            serverUserSettings.push(new ServerUserSettings(cmdArgs.author.id));
            userIndex = serverUserSettings.length - 1;
        }
        const userSettings = serverUserSettings[userIndex];

        /*const changeSetting = (value, canBeDisabled: boolean, validation: (value) => boolean, invalidLocation: string, convert: (value) => [boolean, any]) => {
            const enabled = canBeDisabled ? (value !== NONE) : true;

            if (enabled && !validation(value)) {
                cmdArgs.message.reply(Localisation.getTranslation(invalidLocation));
                return;
            }

            const convertResult = convert ? convert(value) : [true, value];
            if (!convertResult[0]) {
                cmdArgs.message.reply(Localisation.getTranslation(invalidLocation));
                return;
            }

            return convertResult[1];
        };

        {
            const value = changeSetting(values.shift(), true, isHexColor, "customisationcode.value.error", undefined);
            if (!value) return;
            userSettings.nameColor = value;
        }
        {
            const value = changeSetting(values.shift(), false, isHexColor, "customisationcode.value.error", undefined);
            if (!value) return;
            userSettings.cardColor = value;
        }
        {
            const value = changeSetting(values.shift(), false, isHexColor, "customisationcode.value.error", undefined);
            if (!value) return;
            userSettings.cardColorB = value;
        }
        {
            const value = changeSetting(values.shift(), true, isHexColor, "customisationcode.value.error", undefined);
            if (!value) return;
            userSettings.specialCircleColor = value;
        }
        {
            const value = changeSetting(values.shift(), false, isHexColor, "customisationcode.value.error", undefined);
            if (!value) return;
            userSettings.barStartColor = value;
        }
        {
            const value = changeSetting(values.shift(), false, isHexColor, "customisationcode.value.error", undefined);
            if (!value) return;
            userSettings.barEndColor = value;
        }
        {
            const value = changeSetting(values.shift(), false, (value) => !isNaN(value), "customisationcode.value.character", (value) => {
                try {
                    const winxCharacter = <WinxCharacter>value;
                    return [true, winxCharacter];
                } catch {
                    return [false, undefined];
                }
            });
            if (!value) return;
            userSettings.winxCharacter = value;
        }
        {
            const value = changeSetting(values.shift(), false, (value) => !isNaN(value), "customisationcode.value.character", (value) => {
                try {
                    const winxCharacter = <WinxCharacter>value;
                    return [true, winxCharacter];
                } catch {
                    return [false, undefined];
                }
            });
            if (!value) return;
            userSettings.winxCharacterB = value;
        }*/

        const nameColor = values.shift();
        const cardColor = values.shift();
        const cardColorB = values.shift();
        const circleColor = values.shift();
        const barStartColor = values.shift();
        const barEndColor = values.shift();
        const winxCharacterInt = parseInt(values.shift());
        const winxCharacterBInt = parseInt(values.shift());
        const wingsLevelInt = parseInt(values.shift());
        const wingsLevelBInt = parseInt(values.shift());
        const cardTemplateInt = parseInt(values.shift());
        const wingsTemplateInt = parseInt(values.shift());

        if ([winxCharacterInt, winxCharacterBInt].some(v => isNaN(v))) {
            return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.character"));
        }

        if ([wingsLevelInt, wingsLevelBInt].some(v => isNaN(v) || v < -1)) {
            return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.wings"));
        }

        if ([cardTemplateInt, wingsTemplateInt].some(v => isNaN(v) || v < 0 || v >= templates.length)) {
            return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.template"));
        }

        const nameEnabled = nameColor !== NONE;
        const circleEnabled = circleColor !== NONE;

        if (nameEnabled && !isHexColor(nameColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (circleEnabled && !isHexColor(circleColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (!isHexColor(cardColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (!isHexColor(cardColorB)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (!isHexColor(barStartColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));
        if (!isHexColor(barEndColor)) return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.error"));



        let winxCharacter, winxCharacterB;
        try {
            winxCharacter = <WinxCharacter>winxCharacterInt;
            winxCharacterB = <WinxCharacter>winxCharacterBInt;
        } catch {
            return cmdArgs.message.reply(Localisation.getTranslation("customisationcode.value.character"));
        }

        userSettings.nameColor = nameEnabled ? nameColor : new ServerUserSettings(cmdArgs.author.id).nameColor;
        userSettings.cardColor = cardColor;
        userSettings.cardColorB = cardColorB;
        userSettings.specialCircleColor = circleEnabled ? circleColor : new ServerUserSettings(cmdArgs.author.id).specialCircleColor;
        userSettings.barStartColor = barStartColor;
        userSettings.barEndColor = barEndColor;
        userSettings.winxCharacter = winxCharacter;
        userSettings.winxCharacterB = winxCharacterB;
        userSettings.wingsLevel = wingsLevelInt;
        userSettings.wingsLevelB = wingsLevelBInt;
        userSettings.cardTemplate = templates[cardTemplateInt];
        userSettings.wingsTemplate = templates[wingsTemplateInt];

        serverUserSettings[userIndex] = userSettings;

        cmdArgs.message.reply(Localisation.getTranslation("customisationcode.update"));
        await ServerUserSettingsDatabase.set(cmdArgs.guildId, serverUserSettings);
    }
}

class GetSubCommand extends SubCommand {
    public constructor() {
        super("get");
    }

    public async onRun(cmdArgs: CommandArguments) {
        const userSettings = await getServerUserSettings(cmdArgs.author.id, cmdArgs.guildId);

        const templates = Object.values(CardTemplate);

        const code: string[] = [];
        code.push((userSettings.nameColor === new ServerUserSettings(cmdArgs.author.id).nameColor ? NONE : userSettings.nameColor));
        code.push(userSettings.cardColor);
        code.push(userSettings.cardColorB);
        code.push((userSettings.specialCircleColor === new ServerUserSettings(cmdArgs.author.id).specialCircleColor ? NONE : userSettings.specialCircleColor));
        code.push(userSettings.barStartColor);
        code.push(userSettings.barEndColor);
        code.push(`${userSettings.winxCharacter}`);
        code.push(`${userSettings.winxCharacterB}`);
        code.push(`${userSettings.wingsLevel}`);
        code.push(`${userSettings.wingsLevelB}`);
        code.push(`${templates.findIndex(t => t === userSettings.cardTemplate)}`);
        code.push(`${templates.findIndex(t => t === userSettings.wingsTemplate)}`);

        cmdArgs.message.reply(Localisation.getTranslation("customisationcode.get", code.join("|")));
    }
}

export = CustomisationCodeCommand;