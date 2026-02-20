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

export namespace debt {
	
	export class InstallmentData {
	    dueDate: string;
	    amount: number;
	    status: string;
	    paidDate: string;
	
	    static createFrom(source: any = {}) {
	        return new InstallmentData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dueDate = source["dueDate"];
	        this.amount = source["amount"];
	        this.status = source["status"];
	        this.paidDate = source["paidDate"];
	    }
	}
	export class DebtData {
	    id: number;
	    name: string;
	    amount: number;
	    notes: string;
	    installments: InstallmentData[];
	
	    static createFrom(source: any = {}) {
	        return new DebtData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.amount = source["amount"];
	        this.notes = source["notes"];
	        this.installments = this.convertValues(source["installments"], InstallmentData);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
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

