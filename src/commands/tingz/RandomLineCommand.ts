import Command from '../../Command';
import fs from 'fs';
import readline from 'readline';
import * as Utils from '../../Utils';
import { Message } from 'discord.js';

class RandomLineCommand extends Command{
    constructor(name : string){
        super(name);
        this.description=`${Utils.capitalise(name)} Tinz`;
        this.category=Command.TingzCategory;
    }

    public async onRun(bot: import("../../BotClient"), message: Message, args: string[]) {
        const fileStream=fs.createReadStream(`lines/${this.name}.txt`);

        const rl=readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        const data=[];

        for await (const line of rl){
            data.push(line);
        }

        message.channel.send(data[Math.floor(Math.random()*data.length)]);
    }
}

export=RandomLineCommand;