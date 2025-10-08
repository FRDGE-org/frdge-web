'use client'
import { SidebarGroupContent as SidebarGroupContentShadCN, SidebarMenu, SidebarMenuItem } from "./sidebar";
import Fuse from 'fuse.js'

type Props = {
    notes: Note[]
}

import { Note } from "@prisma/client";
import { SearchIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "./input";
import SelectNoteButton from "./SelectNoteButton";
import DeleteNoteButton from "./DeleteNoteButton";

function SidebarGroupContent({ notes }: Props) {
    // console.log(notes)
    const [searchText, setSearchText] = useState('')
    const [localNotes, setLocalNotes] = useState(notes)

    useEffect(() => {
        setLocalNotes(notes)
    }, [notes])

    // This function only gets recreated when the notes change
    const fuse = useMemo(() => {
        return new Fuse(localNotes, {
            keys: ['text'],
            threshold: 0.4
        })
    }, [localNotes])

    const filteredNotes = searchText
        ? fuse.search(searchText).map(result => result.item)
        : localNotes

    const deleteNoteLocally = (noteId: string) => {
        setLocalNotes(prevNotes =>
            prevNotes.filter(note => note.id !== noteId)
        )
    }

    return (
        <SidebarGroupContentShadCN>
            <div className="relative flex items-center">
                <SearchIcon className="absolute left-2 size-4"></SearchIcon>
                <Input
                    className="bg-muted pl-8"
                    placeholder="Search your notes..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>
            <SidebarMenu className="mt-4">
                {filteredNotes.map((note) => (
                    <SidebarMenuItem key={note.id} className="group/item">
                        <SelectNoteButton note={note}/>
                        <DeleteNoteButton noteId={note.id}
                            deleteNoteLocally={deleteNoteLocally}/>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroupContentShadCN>
    )
}

export default SidebarGroupContent