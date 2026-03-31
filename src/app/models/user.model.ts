export interface User {
  id: string,
  password: string,
  email: string,
  username: string,
  allXP : number,
  emission : number,
  streak : number,
  friends : string[],
  badges : string[],
}

export interface Badge {
    id: string,
    name : string,
    xp : number,
    icon: string
}