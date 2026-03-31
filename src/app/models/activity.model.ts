export interface Travel {
    mode : string,
    distance : number,
    departedAt : Date,
    arrivedAt : Date,
    from? : string,
    to? : string
}

export interface ShoppingProductSnapshot {
    barcode: string;
    name: string;
    emission: number;
    weight: number;
}

export interface Shopping {
    products: ShoppingProductSnapshot[]; 
    date: Date;
    store?: string;
}

export interface Product {
    id : string,
    name : string,
    emissionProd : number,
    category : string

}

export interface Energy {
    typeEnergy : 'water' | 'gas' | 'electricity',
    amount : number,
    period : 'month' | 'year',
    billingDate?: Date
}

export interface Activity {
    id : string,
    userId : string,
    xp : number,
    emission : number,
    timestamp : Date,
    type : 'travel' | 'shopping' | 'energy',
    details : Travel | Shopping | Energy
}

export interface MonthlyStats {
    year: number;
    month: number;
    totalEmission: number;
    byCategory: {
        travel: number;
        shopping: number;
        energy: number;
    };
    dailyEmissions: Record<number, number>;
    activityCount: number;
}