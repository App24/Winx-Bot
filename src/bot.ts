import Discord from 'discord.js';
import BotClient from './BotClient';

const intents=new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client=new BotClient({
    clientOptions: {ws: {intents: intents}},
    logLoading: 'simplified',
    loadCommands: true,
    loadEvents: true
});

(<any>client).ws.on("INTERACTION_CREATE", async(interactionObject)=>{

    (<any>client).api.interactions(interactionObject.id, interactionObject.token).callback.post({
        data:{
            type: 4,
            data:{
                content: "Not Yet Implemented! (Yell at Discord to release slash commands in discordjs :sob:)"
            }
        }
    });
});

client.login(process.env.TOKEN);