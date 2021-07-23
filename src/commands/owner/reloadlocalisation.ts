import { Message } from "discord.js";
import { BotUser } from "../../BotClient";
import { Localisation } from "../../localisation";
import { Owner } from "../../structs/Category";
import { Command, CommandAccess, CommandArguments } from "../../structs/Command";

class ReloadLocalisationCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
        this.aliases=["reloadlocal", "relocal"];
    }

    public onRun(cmdArgs : CommandArguments){
        BotUser.loadLocalisation();
        cmdArgs.channel.send(Localisation.getTranslation("reloadlocalisation.reload"));
    }
}

export=ReloadLocalisationCommand;