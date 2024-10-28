declare namespace NodeJS {
    export interface ProcessEnv {
        readonly TOKEN: string
        readonly OWNER_ID: string
        readonly CREATOR_ID: string
        readonly SUGGESTION_CHANNEL: string
        readonly MONGODB_URI: string
    }
}