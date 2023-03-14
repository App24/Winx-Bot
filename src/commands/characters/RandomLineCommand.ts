import { Localisation } from "../../localisation";
import { Characters } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { capitalise } from "../../utils/FormatUtils";
import { MultiCommand } from "../../structs/MultiCommand";
import { CharacterLinesBaseCommand } from "../../baseCommands/characters/CharacterLines";

class CharacterLinesCommand extends Command {
    private name: string;

    public constructor(name: string) {
        super(Localisation.getTranslation("tingz.command.description", capitalise(name)));
        this.name = name;
        this.category = Characters;

        this.baseCommand = new CharacterLinesBaseCommand(name);
    }

    /*public async onRun(cmdArgs: CommandArguments) {
        if (!existsSync(`lines/${this.name}.txt`)) {
            reportError(Localisation.getTranslation("error.missing.character.lines", this.name), cmdArgs.message);
            return;
        }

        const fileStream = createReadStream(`lines/${this.name}.txt`);

        const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const data = [];

        for await (const line of rl) {
            data.push(line);
        }

        if (!data.length) {
            reportError(Localisation.getTranslation("error.empty.character.lines", this.name), cmdArgs.message);
            return;
        }

        if (data.length > 1) {
            await createGenericButtons({
                sendTarget: cmdArgs.message, options: this.getLine(data), settings: { time: 1000 * 60 * 5 }, buttons: [
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
            cmdArgs.message.reply(this.getLine(data));
        }
    }

    getLine(data: string[]) {
        return data[Math.floor(data.length * Math.random())];
    }*/
}

class CharacterLinesMultiCommand extends MultiCommand {
    public generateCommand() {
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