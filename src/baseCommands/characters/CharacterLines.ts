import { ButtonStyle } from "discord.js";
import { existsSync, createReadStream } from "fs";
import { createInterface } from "readline";
import { Localisation } from "../../localisation";
import { createGenericButtons } from "../../utils/MessageButtonUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";
import { reportBotError } from "../../utils/Utils";

export class CharacterLinesBaseCommand extends BaseCommand {
    public name: string;

    public constructor(name: string) {
        super();
        this.name = name;
    }

    public async onRun(cmdArgs: BaseCommandType) {
        if (!existsSync(`lines/${this.name}.txt`)) {
            reportBotError(Localisation.getTranslation("error.missing.character.lines", this.name), cmdArgs.body);
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
            reportBotError(Localisation.getTranslation("error.empty.character.lines", this.name), cmdArgs.body);
            return;
        }

        if (data.length > 1) {
            await createGenericButtons({
                sendTarget: cmdArgs.body, options: this.getLine(data), settings: { time: 1000 * 60 * 5 }, buttons: [
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
    }
}