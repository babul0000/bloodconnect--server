import { MongoClient } from 'mongodb';
export declare const client: MongoClient;
export declare const db: import("mongodb").Db;
export declare const donorsCollection: import("mongodb").Collection<import("bson").Document>;
export declare const requestsCollection: import("mongodb").Collection<import("bson").Document>;
export declare const profilesCollection: import("mongodb").Collection<import("bson").Document>;
export declare const usersCollection: import("mongodb").Collection<import("bson").Document>;
export declare function connectDB(): Promise<void>;
//# sourceMappingURL=db.d.ts.map