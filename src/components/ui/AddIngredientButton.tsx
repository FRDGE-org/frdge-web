'use client'

import { createIngredientAction } from "@/actions/ingredients"
import { Storage, TimeToExpire } from "@prisma/client"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "./button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./dialog"
import { Plus } from "lucide-react"

export default function AddIngredientButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)

        const data = {
            name: formData.get('name') as string,
            storage: formData.get('storage') as Storage,
            dateBought: new Date(formData.get('dateBought') as string),
            isPackaged: formData.get('isPackaged') === 'on',
            timeToExpire: formData.get('timeToExpire') as TimeToExpire
        }

        const { errorMessage } = await createIngredientAction(data)

        if (errorMessage) {
            toast.error(errorMessage)
        } else {
            toast.success('Ingredient added!')
            setIsOpen(false)
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><Plus/></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Ingredient</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            name="name"
                            type="text"
                            required
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Storage</label>
                        <select name="storage" className="w-full border rounded px-2 py-1">
                            <option value="FRIDGE">Fridge</option>
                            <option value="FREEZER">Freezer</option>
                            <option value="PANTRY">Pantry</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Date Bought</label>
                        <input
                            name="dateBought"
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full border rounded px-2 py-1"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input name="isPackaged" type="checkbox" id="isPackaged" />
                        <label htmlFor="isPackaged" className="text-sm font-medium">Is Packaged</label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Time to Expire</label>
                        <select name="timeToExpire" className="w-full border rounded px-2 py-1">
                            <option value="VERYSHORT">Very Short</option>
                            <option value="SHORT">Short</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LONG">Long</option>
                            <option value="VERYLONG">Very Long</option>
                        </select>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
