import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandArguments } from "../../structs/Command";
import { CommandAccess } from "../../structs/CommandAccess";

class SetPFP extends Command {
    public constructor() {
        super();
        this.category = Owner;
        this.access = CommandAccess.BotOwner;
    }

    public async onRun(cmdArgs: CommandArguments) {
        const image = cmdArgs.message.attachments.first();
        if (!image) return cmdArgs.message.reply("Please upload an image as well!");

        if (!image.name.toLowerCase().endsWith(".png")) return cmdArgs.message.reply(Localisation.getTranslation("error.invalid.image"));

        BotUser.user.setAvatar(image.url);

        cmdArgs.message.reply("Updated pfp!");
    }
}

export = SetPFP;