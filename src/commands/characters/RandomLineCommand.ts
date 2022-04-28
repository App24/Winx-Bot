import { Localisation } from "../../localisation";
import { Characters } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { reportError } from "../../utils/Utils";
import { createGenericButtons } from "../../utils/MessageButtonUtils";
import fs from 'fs';
import readline from 'readline';
import { capitalise } from "../../utils/FormatUtils";

export abstract class RandomLineCommand extends Command {
    private name: string;

    public constructor(name: string) {
        super(Localisation.getTranslation("tingz.command.description", capitalise(name)));
        this.name = name;
        this.category = Characters;
    }

    public async onRun(cmdArgs: CommandArguments) {
        if (!fs.existsSync(`lines/${this.name}.txt`)) {
            reportError(Localisation.getTranslation("error.missing.character.lines", this.name), cmdArgs.message);
            return;
        }

        const fileStream = fs.createReadStream(`lines/${this.name}.txt`);

        const rl = readline.createInterface({
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

        await createGenericButtons({
            sendTarget: cmdArgs.message, text: this.getLine(data), settings: { time: 1000 * 60 * 5 }, buttons: [
                {
                    customId: "reroll", style: "PRIMARY", emoji: "♻️",
                    onRun: async ({ interaction }) => {
                        await interaction.update(this.getLine(data));
                    }
                }
            ]
        });
    }

    getLine(data: string[]) {
        return data[Math.floor(data.length * Math.random())];
    }
}