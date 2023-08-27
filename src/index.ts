import dotenv from "dotenv";

dotenv.config();

import { BotUser } from "./BotClient";
import mongoose from "mongoose";

(async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
        socketTimeoutMS: 0,
        connectTimeoutMS: 0
    });
    BotUser.login(process.env.TOKEN);
})();