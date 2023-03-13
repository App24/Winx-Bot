import { ApplicationCommandType } from "discord.js";
import { CharacterLinesBaseCommand } from "../../../baseCommands/characters/CharacterLines";
import { MultiSlashCommand } from "../../../structs/MultiCommand";
import { SlashCommand } from "../../../structs/SlashCommand";
import { capitalise } from "../../../utils/FormatUtils";

class CharacterLinesCommand extends SlashCommand {
    public constructor(name: string) {
        super({ name, description: `${capitalise(name)} Thingz`, type: ApplicationCommandType.ChatInput });
        this.baseCommand = new CharacterLinesBaseCommand(name);
    }

    /*public async onRun(cmdArgs: SlashCommandArguments) {
        if (!existsSync(`lines/${this.commandData.name}.txt`)) {
            reportError(Localisation.getTranslation("error.missing.character.lines", this.commandData.name), cmdArgs.interaction);
            return;
        }

        const fileStream = createReadStream(`lines/${this.commandData.name}.txt`);

        const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const data = [];

        for await (const line of rl) {
            data.push(line);
        }

        if (!data.length) {
            reportError(Localisation.getTranslation("error.empty.character.lines", this.commandData.name), cmdArgs.interaction);
            return;
        }

        if (data.length > 1) {
            await createGenericButtons({
                sendTarget: cmdArgs.interaction, options: this.getLine(data), settings: { time: 1000 * 60 * 5 }, buttons: [
                    {
                        customId: "reroll", style: ButtonStyle.Primary, emoji: "♻️",
                        onRun: async ({ interaction }) => {
                            let line: string;
                            do {
                                line = this.getLine(data);
                            } while (line === interaction.message.content);
                            await interaction.update(line);
                            // const line = this.getLine(data);
                            // if (interaction.message.content !== line)
                            //     await interaction.update(line);
                        }
                    }
                ]
            });
        } else {
            cmdArgs.reply(this.getLine(data));
        }
    }

    getLine(data: string[]) {
        return data[Math.floor(data.length * Math.random())];
    }*/
}

class CharacterLinesMultiCommand extends MultiSlashCommand {
    public generateCommand(): SlashCommand | Promise<SlashCommand> {
        return new CharacterLinesCommand(this.name);
    }
}

export = [
    new CharacterLinesMultiCommand("aisha"),
    new CharacterLinesMultiCommand("bloom"),
    new CharacterLinesMultiCommand("darcy"),
    new CharacterLinesMultiCommand("flora"),
    new CharacterLinesMultiCommand("icy"),
    new CharacterLinesMultiCommand("musa"),
    new CharacterLinesMultiCommand("stella"),
    new CharacterLinesMultiCommand("stormy"),
    new CharacterLinesMultiCommand("tecna"),
];