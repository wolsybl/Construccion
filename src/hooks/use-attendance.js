
import { useLocalStorage } from "./use-local-storage"

export function useAttendance() {
  const [attendance, setAttendance] = useLocalStorage("attendance", [])

  const registerEntry = (employeeId) => {
    const today = new Date().toISOString().split('T')[0]
    const hasEntryToday = attendance.some(record => 
      record.employeeId === employeeId && 
      record.type === "entry" &&
      record.timestamp.startsWith(today)
    )

    if (!hasEntryToday) {
      setAttendance([
        ...attendance,
        {
          id: Date.now(),
          employeeId,
          type: "entry",
          timestamp: new Date().toISOString()
        }
      ])
      return true
    }
    return false
  }

  const registerExit = (employeeId) => {
    const today = new Date().toISOString().split('T')[0]
    const hasEntryToday = attendance.some(record => 
      record.employeeId === employeeId && 
      record.type === "entry" &&
      record.timestamp.startsWith(today)
    )
    const hasExitToday = attendance.some(record => 
      record.employeeId === employeeId && 
      record.type === "exit" &&
      record.timestamp.startsWith(today)
    )

    if (hasEntryToday && !hasExitToday) {
      setAttendance([
        ...attendance,
        {
          id: Date.now(),
          employeeId,
          type: "exit",
          timestamp: new Date().toISOString()
        }
      ])
      return true
    }
    return false
  }

  const getAttendanceByDate = (date) => {
    return attendance.filter(record => 
      record.timestamp.startsWith(date)
    )
  }

  const getAttendanceByEmployee = (employeeId) => {
    return attendance.filter(record => 
      record.employeeId === employeeId
    )
  }

  const getAttendanceStats = (date) => {
    const records = getAttendanceByDate(date)
    const uniqueEmployees = [...new Set(records.map(r => r.employeeId))]
    
    return {
      total: uniqueEmployees.length,
      present: uniqueEmployees.length,
      absent: 0, // Esto requeriría una lista completa de empleados
      late: 0 // Esto requeriría una hora de entrada establecida
    }
  }

  return { 
    attendance, 
    registerEntry, 
    registerExit,
    getAttendanceByDate,
    getAttendanceByEmployee,
    getAttendanceStats
  }
}
