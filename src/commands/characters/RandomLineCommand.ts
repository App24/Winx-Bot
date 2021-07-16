import { Message } from "discord.js";
import { Characters } from "../../structs/Category";
import { Command } from "../../structs/Command";
import { capitalise } from "../../Utils";
import fs from 'fs';
import readline from 'readline';
import { Localisation } from "../../localisation";

export class RandomLineCommand extends Command{
    private name : string;
    
    public constructor(name : string){
        super(Localisation.getTranslation("tingz.command.description", capitalise(name)));
        this.name=name;
        this.category=Characters;
    }

    public async onRun(message : Message, args : string[]){
        const fileStream=fs.createReadStream(`lines/${this.name}.txt`);

        const rl=readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const data=[];

        for await(const line of rl){
            data.push(line);
        }

        message.channel.send(data[Math.floor(data.length*Math.random())]);
    }
}