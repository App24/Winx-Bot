const Discord=require('discord.js');

module.exports={
    asyncForEach: async(array, callback) => {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    getXPLevel: function(level){
        return level*2*100+50;
    },
    getUserFromMention: async function(mention, client) {
        if(!client||!mention) return;
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@!?(\d+)>$/);
    
        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches) {
            return await this.getUserById(mention, client);
        }
    
        // However the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        const id = matches[1];

        return await this.getUserById(id, client);
    },
    getChannelFromMention: async function(mention, guild) {
        console.log("ds");
        if(!guild||!mention) return;
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<#!?(\d+)>$/);
    
        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches){
            return await this.getChannelById(mention, guild);
        }
    
        // However the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        const id = matches[1];
    
        return await this.getChannelById(id, guild);
    },
    getRoleFromMention: async function(mention, guild) {
        if(!guild||!mention) return;
        // The id is the first and only match found by the RegEx.
        const matches = mention.match(/^<@&?(\d+)>$/);
    
        // If supplied variable was not a mention, matches will be null instead of an array.
        if (!matches){
            return await this.getRoleById(mention, guild);
        }
    
        // However the first element in the matches array will be the entire mention, not just the ID,
        // so use index 1.
        const id = matches[1];
    
        return await this.getRoleById(id, guild);
    },
    getRoleById: async function(id, guild){
        if(!id||!guild) return;
        return await guild.roles.fetch(id).catch(_=>{return undefined;});
    },
    getChannelById: async function(id, guild){
        if(!id||!guild) return;
        return await guild.channels.cache.find(channel=>channel.id===id);
    },
    getUserById: async function(id, client){
        if(!id||!client) return;
        const member=await client.shard.broadcastEval(`(async () => {
        const member=this.users.fetch('${id}');
        if(member){
            return member;
        }else{
            return undefined;
        };
        })();`).then(sentArray=>{
            if(!sentArray[0]) return undefined;

            return new Discord.User(client, sentArray[0]);
        });
        return member;
    },
    getMemberById: async function(id, guild){
        if(!id||!guild) return;
        return await guild.members.fetch(id).catch(_=>{return undefined;});
    },
    capitalize: function(s){
        if (typeof s !== 'string') return '';
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
};