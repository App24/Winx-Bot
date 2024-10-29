import { BaseCommand } from "../../structs/BaseCommand";
import { CommandArgumentsType } from "../../structs/CommandTypes";

export class HelpBaseCommand extends BaseCommand{
    public constructor(){
        super();
    }

    public async onRun(cmdArgs: CommandArgumentsType) {
        
    }
}