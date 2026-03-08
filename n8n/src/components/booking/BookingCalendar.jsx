import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getStatusName, getStatusColor, getRoleName } from "./RoomRules";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from "date-fns";
import { th } from "date-fns/locale";

export default function BookingCalendar({ bookings }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPad = getDay(monthStart); // 0=Sunday

  const dayBookings = useMemo(() => {
    const map = {};
    bookings.forEach(b => {
      if (b.status === "cancelled" || b.status === "rejected") return;
      const key = b.date;
      if (!map[key]) map[key] = [];
      map[key].push(b);
    });
    return map;
  }, [bookings]);

  const selectedDayBookings = selectedDate
    ? bookings.filter(b => b.date === format(selectedDate, "yyyy-MM-dd") && b.status !== "cancelled" && b.status !== "rejected")
    : [];

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            ปฏิทินการจอง
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy", { locale: th })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map(d => (
            <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array(startPad).fill(null).map((_, i) => (
            <div key={`pad-${i}`} className="aspect-square" />
          ))}
          {days.map(day => {
            const key = format(day, "yyyy-MM-dd");
            const dayData = dayBookings[key] || [];
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all text-sm relative ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md"
                    : isToday
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <span className="text-xs">{format(day, "d")}</span>
                {dayData.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayData.length <= 3 ? (
                      dayData.map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-indigo-400"}`} />
                      ))
                    ) : (
                      <span className={`text-[9px] ${isSelected ? "text-white/80" : "text-indigo-500"}`}>
                        {dayData.length}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-4 border-t pt-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              {format(selectedDate, "d MMMM yyyy", { locale: th })}
            </h4>
            {selectedDayBookings.length === 0 ? (
              <p className="text-sm text-slate-400">ไม่มีการจองในวันนี้</p>
            ) : (
              <div className="space-y-2">
                {selectedDayBookings.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{b.room}</span>
                      <Badge className={`${getStatusColor(b.status)} border text-[10px]`}>
                        {getStatusName(b.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{b.start_time} - {b.end_time} • {b.booker_name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Booking Detail Popup */}
        {selectedBooking && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBooking(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">รายละเอียดการจอง</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedBooking(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">ห้อง</span>
                  <span className="font-medium">{selectedBooking.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วันที่</span>
                  <span className="font-medium">{format(new Date(selectedBooking.date), "d MMM yyyy", { locale: th })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">เวลา</span>
                  <span className="font-medium">{selectedBooking.start_time} - {selectedBooking.end_time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ผู้จอง</span>
                  <span className="font-medium">{selectedBooking.booker_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">สถานะ</span>
                  <span className="font-medium">{getRoleName(selectedBooking.booker_role)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">สถานะการจอง</span>
                  <Badge className={`${getStatusColor(selectedBooking.status)} border`}>
                    {getStatusName(selectedBooking.status)}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500">วัตถุประสงค์</span>
                  <p className="mt-1 text-slate-700">{selectedBooking.purpose}</p>
                </div>
                {selectedBooking.approved_by && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">อนุมัติโดย</span>
                    <span className="text-emerald-600 font-medium">{selectedBooking.approved_by}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}