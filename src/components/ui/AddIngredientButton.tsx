'use client'

import { Plus } from "lucide-react"
import IngredientModal from "./IngredientModal"

export default function AddIngredientButton() {
    return (
        <IngredientModal>
            <Plus/>
        </IngredientModal>
    )
}
