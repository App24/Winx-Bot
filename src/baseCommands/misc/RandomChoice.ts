import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class RandomChoiceBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        cmdArgs.reply(cmdArgs.args[Math.floor(cmdArgs.args.length * Math.random())]);
    }
}