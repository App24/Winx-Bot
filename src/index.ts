import { ShardingManager } from "discord.js";
import dotenv from "dotenv";
import { Localisation } from "./localisation";
import { loadFiles } from "./utils/Utils";

dotenv.config();

const manager = new ShardingManager("./dist/BotClient.js", {
    execArgv: ["--trace-warnings"],
    shardArgs: ["--ansi", "--color"],
    token: process.env.TOKEN
});

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();