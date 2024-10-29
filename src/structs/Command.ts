import { Localisation } from "../localisation";
import { BaseCommand } from "./BaseCommand";
import { Category, Other } from "./Category";
import { CommandArgumentsType } from "./CommandTypes";
import { LocalisationKeys } from "./LocalKeys";

export abstract class Command {
    public category: Category;

    public description: string;

    public readonly baseCommand: BaseCommand;

    public commandName: string;

    public constructor(baseCommand: BaseCommand, description?: string) {
        this.description = description;
        this.baseCommand = baseCommand;
        this.category = Other;
    }

    public async onRun(cmdArgs: CommandArgumentsType) {
        if (this.baseCommand) {
            await this.baseCommand.onRun(cmdArgs);
        }
    }

    public get localisedDescription(){
        return Localisation.getLocalisation({key: this.description});
    }
}