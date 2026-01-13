'use server'

import { getUser } from "@/auth/server"
import { prisma } from "@/db/prisma"
import { handleError } from "@/lib/utils"
import { Storage, TimeToExpire } from "@prisma/client"
import { revalidatePath } from "next/cache"

type CreateIngredientData = {
    name: string
    storage: Storage
    dateBought: Date
    isPackaged: boolean
    timeToExpire: TimeToExpire
}

export const createIngredientAction = async (data: CreateIngredientData) => {
    try {
        const user = await getUser()
        if (!user) throw new Error('You must be logged in to create an ingredient')

        await prisma.ingredient.create({
            data: {
                authorId: user.id,
                name: data.name,
                storage: data.storage,
                dateBought: data.dateBought,
                isPackaged: data.isPackaged,
                timeToExpire: data.timeToExpire
            }
        })

        revalidatePath('/')
        return { errorMessage: null }
    } catch (error) {
        return handleError(error)
    }
}

export const deleteIngredientAction = async (ingredientId: string) => {
    try {
        const user = await getUser()
        if (!user) throw new Error('You must be logged in to delete an ingredient')

        await prisma.ingredient.delete({
            where: {
                id: ingredientId,
                authorId: user.id
            }
        })

        revalidatePath('/')
        return { errorMessage: null }
    } catch (error) {
        return handleError(error)
    }
}

export const deleteIngredientsAction = async (ingredientIds: string[]) => {
    try {
        const user = await getUser()
        if (!user) throw new Error('You must be logged in to delete ingredients')

        await prisma.ingredient.deleteMany({
            where: {
                id: { in: ingredientIds },
                authorId: user.id
            }
        })

        revalidatePath('/')
        return { errorMessage: null }
    } catch (error) {
        return handleError(error)
    }
}
