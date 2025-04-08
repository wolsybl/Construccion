
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"

export function TaskHistoryDialog({ open, onOpenChange, history = [] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Historial de la Tarea</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {history.map((entry, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Estado: <span className="font-normal">{entry.status}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.comment}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(entry.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
