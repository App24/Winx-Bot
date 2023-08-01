import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class DeleteChannelsBaseCommand extends BaseCommand {
    public async onRun(cmdArgs: BaseCommandType) {
        const channels = await cmdArgs.guild.channels.fetch();
        channels.forEach(c => {
            if (c.id === "1085938405080322069" || !c.deletable) return;
            c.delete();
        });
    }
}