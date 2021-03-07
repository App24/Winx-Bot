const Command=require("../../Command");
const fs=require('fs');
const readline=require('readline');

class Stella extends Command{
    constructor(){
        super("stella");
        this.description="Stella Tingz";
        this.category=Command.TingzCategory;
    }

    async onRun(bot, message, args){
        const fileStream=fs.createReadStream(`lines/stella.txt`);

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

module.exports=Stella;