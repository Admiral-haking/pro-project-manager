import mongoose from 'mongoose';

type MongooseGlobal = typeof globalThis & {
    _mongooseConn?: Promise<typeof mongoose>;
    _mongooseUri?: string;
};

const globalWithMongoose = global as MongooseGlobal;

function resolveMongoUri(uri?: string): string {
    const envUri = uri ?? process.env.MONGODB_URI;
    if (envUri && envUri.trim()) return envUri.trim();
    return 'mongodb://127.0.0.1:27017/project-manager-pro';
}

export function setMongoUri(uri: string) {
    const resolved = uri.trim();
    process.env.MONGODB_URI = resolved;
    globalWithMongoose._mongooseUri = resolved;
    // Leave the existing connection untouched; caller can decide to reconnect if needed.
}

export async function getMongooseConnection(uri?: string): Promise<typeof mongoose> {
    const targetUri = resolveMongoUri(uri ?? globalWithMongoose._mongooseUri);

    if (!globalWithMongoose._mongooseConn) {
        globalWithMongoose._mongooseConn = (async () => {
            if (mongoose.connection.readyState >= 1) return mongoose;
            await mongoose.connect(targetUri);
            return mongoose;
        })();
        globalWithMongoose._mongooseUri = targetUri;
    }

    return globalWithMongoose._mongooseConn;
}

export default getMongooseConnection;
