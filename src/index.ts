import dotenv from "dotenv";

dotenv.config();

import { BotUser } from "./BotClient";
import mongoose from "mongoose";

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    BotUser.login(process.env.TOKEN);
})();