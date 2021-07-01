import Logger from "../Logger";

module.exports=(client:import("../BotClient"))=>{
    client.on("shardReady", (shardId)=>{
        Logger.Log(`Shard ${shardId} is ready!`);
    });
}