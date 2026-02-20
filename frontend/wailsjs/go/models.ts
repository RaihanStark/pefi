export namespace account {
	
	export class AccountData {
	    id: number;
	    name: string;
	    type: string;
	    balance: number;
	
	    static createFrom(source: any = {}) {
	        return new AccountData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.type = source["type"];
	        this.balance = source["balance"];
	    }
	}

}

export namespace transaction {
	
	export class TransactionData {
	    id: number;
	    accountId: number;
	    date: string;
	    name: string;
	    amount: number;
	    category: string;
	    notes: string;
	
	    static createFrom(source: any = {}) {
	        return new TransactionData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.accountId = source["accountId"];
	        this.date = source["date"];
	        this.name = source["name"];
	        this.amount = source["amount"];
	        this.category = source["category"];
	        this.notes = source["notes"];
	    }
	}

}

