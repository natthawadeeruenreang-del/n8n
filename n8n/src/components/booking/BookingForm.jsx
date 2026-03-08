import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, AlertTriangle, Info } from "lucide-react";
import { getRoomsForRole, checkNeedsApproval, validateBooking, ROOMS } from "./RoomRules";

export default function BookingForm({ currentUser, onSubmit, existingBookings }) {
  const [room, setRoom] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApprovalNote, setShowApprovalNote] = useState(false);

  const availableRooms = getRoomsForRole(currentUser.role);

  const handleTimeChange = (start, end, selectedDate, selectedRoom) => {
    const s = start || startTime;
    const e = end || endTime;
    const d = selectedDate || date;
    const r = selectedRoom || room;
    if (s && e && d && r) {
      const needs = checkNeedsApproval(currentUser.role, r, d, s, e);
      setShowApprovalNote(needs);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const validationErrors = validateBooking(currentUser.role, room, date, startTime, endTime);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // เช็คห้องซ้ำ
    const overlapping = existingBookings?.filter(b =>
      b.room === room &&
      b.date === date &&
      b.status !== "cancelled" &&
      b.status !== "rejected" &&
      !(endTime <= b.start_time || startTime >= b.end_time)
    );

    if (overlapping && overlapping.length > 0) {
      setErrors(["ช่วงเวลานี้มีการจองห้องนี้แล้ว กรุณาเลือกเวลาอื่น"]);
      return;
    }

    setLoading(true);
    const needsApproval = checkNeedsApproval(currentUser.role, room, date, startTime, endTime);

    await onSubmit({
      booker_name: currentUser.name,
      booker_role: currentUser.role,
      student_id: currentUser.studentId || "",
      booker_email: currentUser.email || "",
      room,
      date,
      start_time: startTime,
      end_time: endTime,
      purpose,
      status: needsApproval ? "pending" : "approved",
      requires_approval: needsApproval,
    });

    // Reset form
    setRoom("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setPurpose("");
    setShowApprovalNote(false);
    setLoading(false);
  };

  const roomInfo = ROOMS.find(r => r.id === room);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarPlus className="w-5 h-5 text-indigo-600" />
          จองห้อง
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm text-slate-600">ห้องที่ขอใช้</Label>
            <Select value={room} onValueChange={(v) => { setRoom(v); handleTimeChange(null, null, null, v); }}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="เลือกห้อง" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {roomInfo && (
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {roomInfo.purpose}
                {roomInfo.maxHours && currentUser.role === "student" && ` (จองได้สูงสุด ${roomInfo.maxHours} ชม.)`}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm text-slate-600">วันที่จอง</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); handleTimeChange(null, null, e.target.value, null); }}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm text-slate-600">เวลาเริ่มต้น</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => { setStartTime(e.target.value); handleTimeChange(e.target.value, null, null, null); }}
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label className="text-sm text-slate-600">เวลาสิ้นสุด</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => { setEndTime(e.target.value); handleTimeChange(null, e.target.value, null, null); }}
                className="mt-1"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-sm text-slate-600">วัตถุประสงค์การขอใช้ห้อง</Label>
            <Textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ระบุวัตถุประสงค์..."
              className="mt-1 h-20"
              required
            />
          </div>

          {showApprovalNote && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-800 space-y-0.5">
                <p className="font-medium">ต้องรอการอนุมัติจากอาจารย์</p>
                <p className="text-xs text-amber-700">
                  เนื่องจากการจองอยู่นอกเวลาราชการ (08:00–17:00) หรือเป็นวันเสาร์–อาทิตย์
                </p>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-1">
              {errors.map((err, i) => (
                <p key={i} className="text-sm text-red-700">{err}</p>
              ))}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-11"
            disabled={loading}
          >
            {loading ? "กำลังจอง..." : "ยืนยันการจอง"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}