export interface Travel {
    mode : string,
    distance : number,
    departedAt : Date,
    arrivedAt : Date,
    from? : string,
    to? : string
}

export interface Shopping {
    products : string[],
    date : Date,
    store? : string
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
    period : 'week' | 'month' | 'year'
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