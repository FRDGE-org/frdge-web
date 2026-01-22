'use client'

import { Ingredient } from "@prisma/client"
import IngredientModal from "./IngredientModal"
import { Edit } from "lucide-react"

type Props = {
    ingredient?: Ingredient,
    disabled?: boolean
}

export default function EditIngredientButton({ ingredient, disabled }: Props) {
    return (
        <IngredientModal ingredient={ingredient} disabled={disabled}>
            <Edit/>
        </IngredientModal>
    )
}

