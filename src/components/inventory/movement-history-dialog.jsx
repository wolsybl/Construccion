
import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"

export function MovementHistoryDialog({ open, onOpenChange, movements = [] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Historial de Movimientos</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {movement.type === "entrada" ? "Entrada" : "Salida"}:{" "}
                  <span className="font-normal">{movement.quantity} unidades</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {movement.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(movement.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
