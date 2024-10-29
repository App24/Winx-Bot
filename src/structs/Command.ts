import { Localisation } from "../localisation";
import { BaseCommand } from "./BaseCommand";
import { Category, Other } from "./Category";
import { CommandArgumentsType } from "./CommandTypes";
import { LocalisationKeys } from "./LocalKeys";

export abstract class Command {
    public category: Category;

    public readonly baseCommand: BaseCommand;

    public commandName: string;

    public aliases: string[];

    public constructor(baseCommand: BaseCommand) {
        this.baseCommand = baseCommand;
        this.category = Other;
    }

    public async onRun(cmdArgs: CommandArgumentsType) {
        if (this.baseCommand) {
            await this.baseCommand.onRun(cmdArgs);
        }
    }
}