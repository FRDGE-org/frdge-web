"use server"

import { createClient } from "@/auth/server"
import { handleError } from "@/lib/utils"
import { prisma } from "@/db/prisma"

export const loginAction = async (email: string, password: string) => {
    try {
        const { auth } = await createClient()

        const { error } = await auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error

        return { errorMessage: null }
    } catch (error) {
        return handleError(error)
    }
}

export const logOutAction = async () => {
    try {
        const { auth } = await createClient()
        
        const { error } = await auth.signOut ()
        if (error) throw error

        return { errorMessage: null }
    } catch (error) {
        return handleError(error)
    }
}

export const signUpAction = async (email: string, password: string) => {
    try {
        const { auth } = await createClient()
        const { data, error } = await auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`
            }
        })
        if (error) {
            // console.log('[signUpAction] error right after auth.signup. The error isnt null: ', error)
            throw error
        } else {
            // console.log('[signUpAction] auth.signup worked. Theres no error.')
        }

        const userId = data.user?.id
        if (!userId) {
            // console.log('[signUpAction] There is no user id')
            throw new Error('Error signing up')
        } else {
            // console.log('[signUpAction] There is a user id: ', userId)
        }

        // add user to database
        await prisma.user.create({
            data: {
                id: userId,
                email
            }
        })

        return { errorMessage: null }
    } catch (error) {
        return handleError(error)
    }
}