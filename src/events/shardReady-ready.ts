module.exports=(client:import("../BotClient"))=>{
    client.on("shardReady", (shardId)=>{
        console.log(`Shard ${shardId} is ready!`);
    });
}