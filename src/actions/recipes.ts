'use server'

import { getUser } from "@/auth/server"
import openai from "@/openai.index"
import { handleError } from "@/lib/utils"
import { Ingredient } from "@prisma/client"

export const getRecipeAction = async (ingredients: Ingredient[]) => {
    try {
        const user = await getUser()
        if (!user) throw new Error('You must be logged in to get recipes')

        const ingredientList = ingredients.map(i => i.name).join(', ')

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a chef. Given a list of ingredients provided by the user, suggest a simple recipe that uses all of them, and only those (plus spices commonly found at home, which you should specify if you think theyre needed). Return a JSON object as specified in response_format.'
                },
                {
                    role: 'user',
                    content: ingredientList
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "recipe",
                    strict: true,
                    schema: {
                        type: "object",
                        properties: {
                            title: { type: "string" },
                            timeNeeded: {
                                type : "object",
                                properties: {
                                    amount: { type: "number" },
                                    unit: { type: "string", enum: ["minutes", "hours"]}
                                },
                                required: ["amount","unit"],
                                additionalProperties: false
                            },
                            steps: {
                                type: "array",
                                items: { type: "string" }
                            },
                            macros: {
                                type: "array",
                                items: { type: "string" }
                            }
                        },
                        required: ["title","timeNeeded","steps","macros"],
                        additionalProperties: false
                    }
                }
            }
        })

        const recipe = JSON.parse(response.choices[0]?.message?.content ?? '{}')

        if (!recipe) throw new Error('Failed to generate recipe')
        
        return { recipe, errorMessage: null }
    } catch (error) {
        return { recipe: null, ...handleError(error)}
    }
}