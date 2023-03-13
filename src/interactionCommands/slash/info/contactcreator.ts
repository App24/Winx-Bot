import { ApplicationCommandOptionType, ApplicationCommandType } from "discord.js";
import { ContactCreatorBaseCommand } from "../../../baseCommands/info/ContactCreator";
import { SlashCommand } from "../../../structs/SlashCommand";

class ContactCreator extends SlashCommand {
    public constructor() {
        super({
            name: "", description: "Contact the creator of the bot!", type: ApplicationCommandType.ChatInput, options: [
                {
                    name: "message",
                    type: ApplicationCommandOptionType.String,
                    description: "Message to send to the creator",
                    required: true
                }
            ]
        });
        this.deferEphemeral = true;

        this.baseCommand = new ContactCreatorBaseCommand();
    }

    /*public async onRun(cmdArgs: SlashCommandArguments) {
        const messageContent = cmdArgs.args[0];
        const owner = await getUserById(process.env.OWNER_ID);
        (await owner.createDM()).send(`${cmdArgs.author}: ${messageContent}`);
        cmdArgs.interaction.followUp(Localisation.getTranslation("generic.sent"));
    }*/
}

export = ContactCreator;