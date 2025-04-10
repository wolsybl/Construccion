import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase" // Asegúrate de configurar Supabase en tu proyecto

export function useAttendance() {
  const [attendance, setAttendance] = useState([])

  // Cargar registros de asistencia al montar el hook
  useEffect(() => {
    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from("attendance") // Nombre de la tabla en Supabase
        .select("*")

      if (error) {
        console.error("Error fetching attendance:", error)
      } else {
        setAttendance(data)
      }
    }

    fetchAttendance()
  }, [])

  const registerEntry = async (employeeId) => {
    const today = new Date().toISOString().split("T")[0]
    const hasEntryToday = attendance.some(
      (record) =>
        record.employeeId === employeeId &&
        record.type === "entry" &&
        record.timestamp.startsWith(today)
    )

    if (!hasEntryToday) {
      const newEntry = {
        employeeId,
        type: "entry",
        timestamp: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("attendance")
        .insert(newEntry)

      if (error) {
        console.error("Error registering entry:", error)
        return false
      } else {
        setAttendance([...attendance, data[0]])
        return true
      }
    }
    return false
  }

  const registerExit = async (employeeId) => {
    const today = new Date().toISOString().split("T")[0]
    const hasEntryToday = attendance.some(
      (record) =>
        record.employeeId === employeeId &&
        record.type === "entry" &&
        record.timestamp.startsWith(today)
    )
    const hasExitToday = attendance.some(
      (record) =>
        record.employeeId === employeeId &&
        record.type === "exit" &&
        record.timestamp.startsWith(today)
    )

    if (hasEntryToday && !hasExitToday) {
      const newExit = {
        employeeId,
        type: "exit",
        timestamp: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("attendance")
        .insert(newExit)

      if (error) {
        console.error("Error registering exit:", error)
        return false
      } else {
        setAttendance([...attendance, data[0]])
        return true
      }
    }
    return false
  }

  const getAttendanceByDate = async (date) => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .like("timestamp", `${date}%`)

    if (error) {
      console.error("Error fetching attendance by date:", error)
      return []
    }
    return data
  }

  const getAttendanceByEmployee = async (employeeId) => {
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employeeId", employeeId)

    if (error) {
      console.error("Error fetching attendance by employee:", error)
      return []
    }
    return data
  }

  const getAttendanceStats = async (date) => {
    const records = await getAttendanceByDate(date)
    const uniqueEmployees = [...new Set(records.map((r) => r.employeeId))]

    return {
      total: uniqueEmployees.length,
      present: uniqueEmployees.length,
      absent: 0, // Esto requeriría una lista completa de empleados
      late: 0, // Esto requeriría una hora de entrada establecida
    }
  }

  return {
    attendance,
    registerEntry,
    registerExit,
    getAttendanceByDate,
    getAttendanceByEmployee,
    getAttendanceStats,
  }
}