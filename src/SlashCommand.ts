import BotClient from './BotClient';

class SlashCommand{
    public data;
    public onRun : (bot : BotClient, interaction, args : string[])=>void;

    public constructor(data, onRun){
        this.data=data;
        this.onRun=onRun;
    }
}

export=SlashCommand;