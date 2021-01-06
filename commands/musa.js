const Command=require("../Command");
const fs=require('fs');
const readline=require('readline');

const command=new Command("musa");
command.description="musa tingz";
command.run=async(bot, message, args)=>{
    const fileStream=fs.createReadStream(`lines/musa.txt`);

    const rl=readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const data=[];

    for await (const line of rl){
    data.push(line);
    }

    message.channel.send(data[Math.floor(Math.random()*data.length)]);
};

module.exports=command;