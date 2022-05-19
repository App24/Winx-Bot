import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";
import { createMessageSelection, SelectOption } from "../../utils/MessageSelectionUtils";

class TestCommand extends Command {
    public constructor() {
        super();
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const options: SelectOption[] = [];

        for (let index = 0; index < 5; index++) {
            options.push({
                label: index.toString(),
                value: index.toString(),
                onSelect: async ({ interaction }) => {
                    interaction.reply({ content: "clicked", ephemeral: true });
                }
            });
        }

        createMessageSelection({
            sendTarget: cmdArgs.message, author: cmdArgs.author, settings: { max: 1 }, selectMenuOptions: {
                options
            }
        });
    }
}

export = TestCommand;