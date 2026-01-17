export interface Challenge {
    id: string,
    name : string,
    xp : number,
    desc : string,
    icon : string,
    status : 'started' | 'done' | 'incomplete',
    category : 'travel' | 'shopping' | 'energy' | 'mixed',
    difficulty : 'easy' | 'medium' | 'hard',
    metric : 'distance' | 'emission_saved' | 'count',
    targetValue : number,
    repeatable : boolean,
    days : number,
    startDate : Date,
    endDate : Date,
    completedAt : Date
}