// Room booking rules and validation logic

export const ROOMS = [
  { id: "MA103", name: "MA103", allowedRoles: ["student", "teacher", "staff"], studentHours: "8:00-17:00", maxHours: 2, purpose: "สัมมนาหรือโครงงาน" },
  { id: "MA105", name: "MA105", allowedRoles: ["student", "teacher", "staff"], studentHours: "8:00-17:00", maxHours: 2, purpose: "สัมมนาหรือโครงงาน" },
  { id: "MA106", name: "MA106 (ห้องคอมพิวเตอร์)", allowedRoles: ["teacher", "staff"], maxHours: null, purpose: "การเรียนการสอน" },
  { id: "MA107", name: "MA107", allowedRoles: ["teacher", "staff"], maxHours: null, purpose: "สอบสัมมนา/โปรเจค/ประชุม" },
  { id: "MA208", name: "MA208", allowedRoles: ["teacher", "staff"], maxHours: null, purpose: "สอบสัมมนา/โปรเจค/ประชุม" },
];

export function getRoomsForRole(role) {
  return ROOMS.filter(r => r.allowedRoles.includes(role));
}

export function checkNeedsApproval(role, room, date, startTime, endTime) {
  // อาจารย์และเจ้าหน้าที่ไม่ต้องขออนุมัติ
  if (role === "teacher" || role === "staff") return false;

  // นิสิต — จองได้เฉพาะ MA103 และ MA105
  if (role === "student" && (room === "MA103" || room === "MA105")) {
    const bookingDate = new Date(date + "T00:00:00"); // ป้องกัน timezone offset
    const dayOfWeek = bookingDate.getDay(); // 0=Sun, 1=Mon..6=Sat

    // วันเสาร์ (6) หรือวันอาทิตย์ (0) → ต้องอนุมัติทุกเวลา
    if (dayOfWeek === 0 || dayOfWeek === 6) return true;

    // วันจันทร์–ศุกร์ → เช็คว่าช่วงเวลาอยู่ใน 08:00–17:00 หรือไม่
    const toMinutes = (t) => parseInt(t.split(":")[0]) * 60 + parseInt(t.split(":")[1]);
    const startMin = toMinutes(startTime);
    const endMin = toMinutes(endTime);
    const OPEN = 8 * 60;   // 480 นาที = 08:00
    const CLOSE = 17 * 60; // 1020 นาที = 17:00

    // เริ่มก่อน 08:00 หรือสิ้นสุดหลัง 17:00 → ต้องอนุมัติ
    if (startMin < OPEN || endMin > CLOSE) return true;

    return false;
  }

  // ห้องอื่นๆ (MA106, MA107, MA208) นิสิตไม่มีสิทธิ์จอง
  return true;
}

export function validateBooking(role, room, date, startTime, endTime) {
  const errors = [];

  // เช็คสิทธิ์ห้อง
  const roomInfo = ROOMS.find(r => r.id === room);
  if (!roomInfo) {
    errors.push("ไม่พบห้องที่เลือก");
    return errors;
  }

  if (!roomInfo.allowedRoles.includes(role)) {
    errors.push(`ห้อง ${room} สงวนสิทธิ์สำหรับอาจารย์และเจ้าหน้าที่เท่านั้น`);
    return errors;
  }

  // เช็คจำนวนชั่วโมง สำหรับนิสิต
  if (role === "student" && roomInfo.maxHours) {
    const startHour = parseInt(startTime.split(":")[0]);
    const startMin = parseInt(startTime.split(":")[1]);
    const endHour = parseInt(endTime.split(":")[0]);
    const endMin = parseInt(endTime.split(":")[1]);
    
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (duration > roomInfo.maxHours * 60) {
      errors.push(`นิสิตจองห้อง ${room} ได้สูงสุด ${roomInfo.maxHours} ชั่วโมง`);
    }
  }

  // เช็คเวลาต้องมากกว่า 0
  const startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
  const endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
  
  if (endMinutes <= startMinutes) {
    errors.push("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น");
  }

  return errors;
}

export function getRoleName(role) {
  const names = { student: "นิสิต", teacher: "อาจารย์", staff: "เจ้าหน้าที่" };
  return names[role] || role;
}

export function getStatusName(status) {
  const names = { pending: "รออนุมัติ", approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ", cancelled: "ยกเลิก" };
  return names[status] || status;
}

export function getStatusColor(status) {
  const colors = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}