import KeyvSql from "@keyv/sql";
import sqlite3 from "sqlite3";
import pify from "pify";

export class KeyvSqlite extends KeyvSql{
    public constructor(opts){
        opts=Object.assign({
            dialect: "sqlite",
            uri: "sqlite://:memory:"
        }, opts);
		opts.db = opts.uri.replace(/^sqlite:\/\//, '');

		opts.connect = () => new Promise((resolve, reject) => {
			const db = new sqlite3.Database(opts.db, err => {
				if (err) {
					reject(err);
				} else {
					if (opts.busyTimeout) {
						db.configure('busyTimeout', opts.busyTimeout);
					}
					resolve(db);
				}
			});
		})
		.then((db:any) => pify(db.all).bind(db));

        super(opts);
    }
}