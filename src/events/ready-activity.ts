module.exports=(client : import("../BotClient"))=>{
    client.on("ready", async()=>{
        let i=0;
        setInterval(() => {
            switch (i%3) {
                case 0:
                    client.user.setActivity(`${process.env.PREFIX}help for help!`);
                    break;
                case 1:
                    client.user.setActivity(`${process.env.PREFIX}suggestion for your suggestion!`);
                    break;
                case 2:
                    const promises = [
                        client.shard.broadcastEval('this.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)'),
                    ];
                    Promise.all(promises).then(results=>{
                        const numUsers=results[0].reduce((acc, memberCount) => acc + memberCount, 0);
                        client.user.setActivity(`${numUsers} users earning their transformations!`);
        
                    });
                    break;
            }
            i++;
        }, 1000*10);
    });
};