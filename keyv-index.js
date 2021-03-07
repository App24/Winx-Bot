'use strict';

const EventEmitter = require('events');
const JSONB = require('json-buffer');

const loadStore = opts => {
	const adapters = {
		redis: '@keyv/redis',
		mongodb: '@keyv/mongo',
		mongo: '@keyv/mongo',
		sqlite: '@keyv/sqlite',
		postgresql: '@keyv/postgres',
		postgres: '@keyv/postgres',
		mysql: '@keyv/mysql'
	};
	if (opts.adapter || opts.uri) {
		const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
		return new (require(adapters[adapter]))(opts);
	}
	return new Map();
};

class Keyv extends EventEmitter {
	constructor(uri, opts) {
		super();
		this.opts = Object.assign(
			{
				namespace: 'keyv',
				serialize: JSONB.stringify,
				deserialize: JSONB.parse
			},
			(typeof uri === 'string') ? { uri } : uri,
			opts
		);

		if (!this.opts.store) {
			const adapterOpts = Object.assign({}, this.opts);
			this.opts.store = loadStore(adapterOpts);
		}

		if (typeof this.opts.store.on === 'function') {
			this.opts.store.on('error', err => this.emit('error', err));
		}
		// console.log(Object.getOwnPropertyNames(this.opts.store))
		// this.opts.store.entry.columns.forEach(element => {
		// 	console.log(element);
		// });
		// console.log(this.opts.store.entry);
		// console.log(this.opts.store.query("SELECT * FROM keyv"));
		this.opts.store.namespace = this.opts.namespace;
	}

	_getKeyPrefix(key) {
		return `${this.opts.namespace}:${key}`;
	}

	_stripKeyPrefix(fullKey) {
		let nsregexp = new RegExp('^' + this.opts.namespace + ':');
		return fullKey.replace(nsregexp, '');
	}

	_parseValue(data, opts = {}) {
		let value;
		let raw = opts ? opts.raw : false;
		if (typeof data === 'string') {
			value = this.opts.deserialize(data);
		} else {
			value = data;
		}
		if (data === undefined) {
			return undefined;
		}
		if (typeof data.expires === 'number' && Date.now() > data.expires) {
			if (opts.removeExpired === true) {
				this.delete(key);
			}
			return undefined;
		}
		if (raw === true) {
			return value;
		} else {
			return value.value;
		}
	}

	get(key, opts) {
		opts = Object.assign({removeExpired: true}, opts);
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.get(key))
			.then(data => {
				data = (typeof data === 'string') ? this.opts.deserialize(data) : data;
				return this._parseValue(data, opts);
			});
	}

	query(q){
		const store=this.opts.store;

		return store.query(q);
	}

	set(key, value, ttl) {
		key = this._getKeyPrefix(key);
		if (typeof ttl === 'undefined') {
			ttl = this.opts.ttl;
		}
		if (ttl === 0) {
			ttl = undefined;
		}
		const store = this.opts.store;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				value = { value, expires };
				return store.set(key, this.opts.serialize(value), ttl);
			})
			.then(() => true);
	}

	delete(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.delete(key));
	}

	clear() {
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.clear());
	}

	keys() {
		return Promise.resolve()
			.then(()=>this.query("SELECT * FROM keyv"))
			.then(data=>{
				const lst=[];
				data.forEach(element => {
					lst.push(this._stripKeyPrefix(element.key));
				});
				return lst;
			});
	}

	values(opts) {
		return Promise.resolve()
			.then(()=>this.query("SELECT * FROM keyv"))
			.then(data=>{
				const lst=[];
				data.forEach(element => {
					lst.push(this._parseValue(element.value, opts));
				});
				return lst;
			});
	}

	valuesFrom(key, opts){
		return Promise.resolve()
			.then(()=>this.query(`SELECT * FROM keyv`))
			.then(data=>{
				const lst=[];
				data.forEach(element => {
					if(element.key===this._getKeyPrefix(key))
					lst.push(this._parseValue(element.value, opts));
				});
				return lst;
			});
	}

	entries(opts){
		return Promise.resolve()
		.then(()=>this.query("SELECT * FROM keyv"))
		.then(data=>{
			return data.map(e=>[
				this._stripKeyPrefix(e["key"]),
				this._parseValue(e["value"], opts)
			]);
		});
	}

	// entries(opts) {
	// 	let raw = opts ? opts.raw : false;
	// 	return this.opts.store.entries().then(result => result.map(e => [
	// 		this._stripKeyPrefix(e[0]),
	// 		this._parseValue(e[1], opts)
	// 	]));
	// }
}

module.exports = Keyv;
