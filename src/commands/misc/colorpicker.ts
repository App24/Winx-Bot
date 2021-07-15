import { Message } from "discord.js";
import { Command } from "../../structs/Command";
import { isHexColor, canvasToMessageAttachment, canvasColor } from "../../Utils";

class ColorPickerCommand extends Command{
    public constructor(){
        super("Get color from hex");
        this.minArgs=1;
        this.usage="<hex>";
        this.aliases=["colourpicker"];
    }

    public async onRun(message : Message, args : string[]){
        let color=args[0].toLowerCase();
        if(color.startsWith("#")){
            color=color.substring(1);
        }
        if(!isHexColor(color)) return message.reply("That is not a valid hex color");
        message.channel.send(`#${color}`, canvasToMessageAttachment(canvasColor(color)));
    }
}

export=ColorPickerCommand;