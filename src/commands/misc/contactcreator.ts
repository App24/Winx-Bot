import Discord from 'discord.js';
import Command from '../../Command';
import * as Utils from '../../Utils';

class ContactCreator extends Command{
    public constructor(){
        super();
        this.category=Command.InfoCategory;
        this.guildOnly=false;
        this.description="Contact the creator of the bot to report issues or other stuff";
        this.minArgsLength=1;
        this.usage="<message content>";
    }

    public async onRun(bot: import("../../BotClient"), message: Discord.Message, args: string[]) {
        const messageContent=message.content.slice(17,message.content.length);
        const owner = await Utils.getUserByID(process.env.OWNER_ID, bot);
        (await owner.createDM()).send(`${message.author}: ${messageContent}`);
        message.reply("Sent!");
    }
}

module.exports=ContactCreator;