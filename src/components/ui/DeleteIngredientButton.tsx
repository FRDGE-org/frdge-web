'use client'

import { deleteIngredientAction } from "@/actions/ingredients"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "./button"

type Props = {
    ingredientId: string
}

export default function DeleteIngredientButton({ ingredientId }: Props) {
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        const { errorMessage } = await deleteIngredientAction(ingredientId)

        if (errorMessage) {
            toast.error(errorMessage)
        } else {
            toast.success('Ingredient deleted!')
        }
        setIsLoading(false)
    }

    return (
        <Button
            onClick={handleDelete}
            disabled={isLoading}
            // className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded disabled:opacity-50"
        >
            {isLoading ? '...' : '✕'}
        </Button>
    )
}
