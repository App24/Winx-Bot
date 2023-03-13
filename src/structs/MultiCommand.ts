import { Command } from "./Command";
import { SlashCommand } from "./SlashCommand";

abstract class MultiGenericCommand<T>{
    public name: string;

    public constructor(name: string) {
        this.name = name;
    }

    public abstract generateCommand(): Promise<T> | T;
}

export abstract class MultiCommand extends MultiGenericCommand<Command> {

    // public abstract generateCommand(): Promise<Command> | Command;
}

export abstract class MultiSlashCommand extends MultiGenericCommand<SlashCommand>{

}