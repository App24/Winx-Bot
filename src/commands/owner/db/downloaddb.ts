import fs from "fs";
import archiver from "archiver";
import { Message, MessageAttachment } from "discord.js";
import { Owner } from "../../../structs/Category";
import { Command, CommandAccess } from "../../../structs/Command";
import { DATABASE_FOLDER } from "../../../Constants";
import { Localisation } from "../../../localisation";

class DownloadDBCommand extends Command{
    public constructor(){
        super();
        this.access=CommandAccess.BotOwner;
        this.category=Owner;
    }

    public async onRun(message : Message, args : string[]){
        const file="databases.zip";
        const output=fs.createWriteStream(file);
        const archive=archiver("zip");
        archive.on("error", (err)=>{
            throw err;
        });
        
        const msg=await message.channel.send(Localisation.getTranslation("downloaddb.wait"));

        archive.directory(DATABASE_FOLDER, false);

        archive.pipe(output);

        await archive.finalize();

        await msg.delete();
        await message.channel.send(new MessageAttachment(file));
        fs.unlinkSync(file);
    }
}

export=DownloadDBCommand;