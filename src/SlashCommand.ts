import BotClient from './BotClient';

class SlashCommand{
    public data;
    public onRun : (bot : BotClient, interaction, args : string[])=>void;
    public options;

    public constructor(data, options, onRun){
        this.data=data;
        this.options=options;
        this.onRun=onRun;
    }
}

export=SlashCommand;