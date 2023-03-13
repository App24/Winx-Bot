import { Localisation } from "../../localisation";
import { Fairy } from "../../structs/fairy/Fairy";
import { editFairy } from "../../utils/FairyUtils";
import { getStringReply } from "../../utils/ReplyUtils";
import { BaseCommand, BaseCommandType } from "../BaseCommand";

export class CreateFairyBaseCommand extends BaseCommand {
    public constructor() {
        super();
    }

    public async onRun(cmdArgs: BaseCommandType) {
        const serverFairies = await Fairy.getServerFairies(cmdArgs.guildId);

        let fairyIndex = serverFairies.findIndex(u => u.userId === cmdArgs.author.id);
        if (fairyIndex < 0) {
            serverFairies.push({ userId: cmdArgs.author.id, fairy: new Fairy() });
            fairyIndex = serverFairies.length - 1;
        } else {
            return cmdArgs.reply("You already have a fairy created!");
        }
        const userFairy = serverFairies[fairyIndex];

        const { value: name, message } = await getStringReply({ author: cmdArgs.author, sendTarget: cmdArgs.body, options: "argument.reply.fairyname" });
        if (!name) return;

        const fairy = new Fairy();

        fairy.name = name;

        const { message: msg, finished } = await editFairy(message, cmdArgs.author, cmdArgs.guild, fairy);

        if (!finished) {
            msg.reply(Localisation.getTranslation("generic.canceled"));
            return;
        }

        console.log("finised");
    }
}