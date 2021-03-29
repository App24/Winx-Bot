import Discord from 'discord.js';
import BotClient from './BotClient';
import { ERROR_HEX } from './Constants';
import { reply } from './Utils';

const intents=new Discord.Intents(Discord.Intents.NON_PRIVILEGED);
intents.add('GUILD_MEMBERS');
const client=new BotClient({
    clientOptions: {ws: {intents: intents}},
    logLoading: 'simplified',
    loadCommands: true,
    loadEvents: true,
    loadSlashes: true
});

(<any>client).ws.on("INTERACTION_CREATE", async(interaction)=>{
    const {name, options}=interaction.data;
    const commandName=name.toLowerCase();
    const newOptions=[];
    if(options)
    for(const option of options){
        newOptions.push(option.value);
    }

    const command=client.Slashes.get(commandName);

    if(!command)
        return (<any>client).api.interactions(interaction.id, interaction.token).callback.post({
            data:{
                type: 4,
                data:{
                    content: "Not Yet Implemented! (Yell at Discord to release slash commands in discordjs :sob:)"
                }
            }
        });
    
    if(command.data.guildOnly&&!interaction.guild_id){
        const embed=new Discord.MessageEmbed();
        embed.setDescription("Server Only Slash Command!");
        embed.setColor(ERROR_HEX);
        return reply(client, interaction, embed);
    }

    await command.onRun(client, interaction, newOptions);
});

client.login(process.env.TOKEN);