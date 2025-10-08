"use client"

import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { error } from "console";
import { toast, useSonner } from "sonner"
import { useRouter } from "next/navigation";
import { logOutAction } from "@/actions/users";

export default function LogOutButton() {
    // const toast = useSonner()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogOut = async () => {
        setLoading(true)
        
        const { errorMessage } = await logOutAction()

        if (!errorMessage) {
            toast.success("Logged out", {
                description: "You have successfully logged out",
                style: { color: 'green'}
            })
            router.push('/')
        } else {
            toast.error("Error", {
                description: errorMessage,
                style: { color: 'red' }
            })
        }
        setLoading(false)
    }

    return (
        <Button
            variant="outline"
            onClick={handleLogOut}
            disabled={loading}
            className="w-24"
            >
            {loading
                ? <Loader2 className="animate-spin"/>
                : "Log Out"
            }
        </Button>
    )
}