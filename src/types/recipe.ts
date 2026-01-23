export type Recipe = {
    title: string
    timeNeeded: {
        amount: number,
        unit: 'minutes' | 'hours'
    }
    steps: string[]
    macros: string[]
}