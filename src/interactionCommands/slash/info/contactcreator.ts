import { Localisation } from "../../../localisation";
import { SlashCommand, SlashCommandArguments } from "../../../structs/SlashCommand";
import { getUserById } from "../../../utils/GetterUtils";

class ContactCreator extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Contact the creator of the bot!", type: "CHAT_INPUT", options: [
                {
                    name: "message",
                    type: "STRING",
                    description: "Message to send to the creator",
                    required: true
                }
            ]
        });
        this.deferEphemeral = true;
    }

    public async onRun(cmdArgs: SlashCommandArguments) {
        const messageContent = cmdArgs.args[0];
        const owner = await getUserById(process.env.OWNER_ID);
        (await owner.createDM()).send(`${cmdArgs.author}: ${messageContent}`);
        cmdArgs.interaction.followUp(Localisation.getTranslation("generic.sent"));
    }
}

export = ContactCreator;