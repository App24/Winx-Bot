import { Message } from "discord.js";
import { Localisation } from "../../localisation";
import { Command } from "../../structs/Command";
import { isHexColor, canvasToMessageAttachment, canvasColor } from "../../Utils";

class ColorPickerCommand extends Command{
    public constructor(){
        super();
        this.minArgs=1;
        this.usage="<hex>";
        this.aliases=["colourpicker"];
    }

    public async onRun(message : Message, args : string[]){
        let color=args[0].toLowerCase();
        if(color.startsWith("#")){
            color=color.substring(1);
        }
        if(!isHexColor(color)) return message.reply(Localisation.getTranslation("error.invalid.hexcolor"));
        message.channel.send(Localisation.getTranslation("generic.hexcolor", color), canvasToMessageAttachment(canvasColor(color)));
    }
}

export=ColorPickerCommand;