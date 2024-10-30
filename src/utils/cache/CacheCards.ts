import { Collection } from "discord.js";
import { CacheData } from "./CacheData";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { CARD_CACHE } from "../../Constants";
import { join } from "path";
import { Canvas, Image, loadImage } from "canvas";

class UserCachedCard {
    public readonly userId: string;
    public readonly guildId: string;
    public readonly cachePath: string;
    public cardLayers: { layerName: string, file: string }[] = [];

    public constructor(userId: string, guildId: string) {
        this.userId = userId;
        this.guildId = guildId;
        this.cachePath = join(CARD_CACHE, guildId, userId);

        this.clearCache();
        mkdirSync(this.cachePath);
    }

    public clearCache() {
        if (!existsSync(this.cachePath)) return;
        rmSync(this.cachePath, { force: true, recursive: true });
        this.cardLayers = [];
    }

    public async getCache(layerName: string, createCache: () => Promise<Canvas> | Canvas) {
        const layerData = this.cardLayers.find(l => l.layerName === layerName);
        if (!layerData) {
            const newImage = await createCache();
            const img = newImage.toDataURL();
            const data = img.replace(/^data:image\/\w+;base64,/, "");
            const buf = Buffer.from(data, "base64");
            const fileName = `${layerName}.png`;
            writeFileSync(join(this.cachePath, fileName), buf);
            this.cardLayers.push({ layerName, file: fileName });
            return newImage;
        }

        const image = await loadImage(join(this.cachePath, layerData.file));
        return image;
    }
}

class CacheCards extends CacheData {
    private cache: Collection<string, Collection<string, UserCachedCard>> = new Collection();

    // public getCachesByGuildId(guildId: string) {
    //     if (!this.cache.has(guildId)) {
    //         this.cache.set(guildId, new Collection());
    //     }
    //     return this.cache.get(guildId).clone();
    // }

    public constructor() {
        super();
        this.resetCache();
    }

    public resetCache() {
        this.cache.forEach((guildCache) => {
            guildCache.forEach(user => {
                user.clearCache();
            });
        });

        this.cache.clear();

        rmSync(CARD_CACHE, { force: true, recursive: true });
        mkdirSync(CARD_CACHE);
    }

    public getCache(guildId: string, userId: string) {
        if (!this.cache.has(guildId)) {
            this.cache.set(guildId, new Collection());
        }
        const guildCache = this.cache.get(guildId);
        if (!guildCache.has(userId)) {
            guildCache.set(userId, new UserCachedCard(userId, guildId));
        }
        return guildCache.get(userId);
    }
}

export const CachedCards = new CacheCards();