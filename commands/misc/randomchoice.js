const Command=require("../../Command");

class RandomChoice extends Command{
    constructor(){
        super("randomchoice");
        this.args=true;
        this.minArgsLength=2;
        this.description="Choose a random option";
        this.usage="<choice1> <choice2> [choice3] ...";
        this.guildOnly=false;
    }

    onRun(bot, message, args){
        message.channel.send(args[Math.floor(Math.random()*args.length)]);
    }
}

module.exports=RandomChoice;