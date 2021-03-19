import dotenv from 'dotenv';

dotenv.config();

import {ShardingManager} from 'discord.js';
const manager=new ShardingManager("dist/bot.js", {
    execArgv: ["--trace-warnings"],
    shardArgs: ["--ansi", "--color"],
    token: process.env.TOKEN
});

manager.spawn();
manager.on(`shardCreate`, shard=>console.log(`Launched shard ${shard.id}`));