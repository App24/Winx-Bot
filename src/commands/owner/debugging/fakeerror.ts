import { Message } from "discord.js";
import { Owner } from "../../../structs/Category";
import { Command, CommandAccess } from "../../../structs/Command";
import { reportError } from "../../../Utils";

class FakeErrorCommand extends Command{
    public constructor(){
        super();
        this.category=Owner;
        this.access=CommandAccess.BotOwner;
    }

    public async onRun(message : Message, args : string[]){
        reportError("Test", message)
    }
}

export=FakeErrorCommand;