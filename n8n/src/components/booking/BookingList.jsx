import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { List, Check, X, Trash2, Clock } from "lucide-react";
import { getStatusName, getStatusColor, getRoleName } from "./RoomRules";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function BookingList({ bookings, currentUser, onApprove, onReject, onCancel }) {
  const [filterRoom, setFilterRoom] = useState("all");

  const canApprove = currentUser.role === "teacher" || currentUser.role === "staff";

  const filtered = bookings.filter(b => filterRoom === "all" || b.room === filterRoom);

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: th });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <List className="w-5 h-5 text-indigo-600" />
            รายการจองทั้งหมด
          </CardTitle>
          <Select value={filterRoom} onValueChange={setFilterRoom}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกห้อง</SelectItem>
              <SelectItem value="MA103">MA103</SelectItem>
              <SelectItem value="MA105">MA105</SelectItem>
              <SelectItem value="MA106">MA106</SelectItem>
              <SelectItem value="MA107">MA107</SelectItem>
              <SelectItem value="MA208">MA208</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>ไม่มีรายการจอง</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((booking) => (
              <div
                key={booking.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{booking.room}</span>
                      <Badge className={`${getStatusColor(booking.status)} border text-xs`}>
                        {getStatusName(booking.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {formatDate(booking.date)} • {booking.start_time} - {booking.end_time}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {booking.booker_name} ({getRoleName(booking.booker_role)})
                      {booking.student_id && ` • ${booking.student_id}`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{booking.purpose}</p>
                    {booking.approved_by && (
                      <p className="text-xs text-emerald-600 mt-1">อนุมัติโดย: {booking.approved_by}</p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0">
                    {canApprove && booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => onApprove(booking)}
                          title="อนุมัติ"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          onClick={() => onReject(booking)}
                          title="ไม่อนุมัติ"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {(booking.status === "approved" || booking.status === "pending") && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:bg-slate-100"
                        onClick={() => onCancel(booking)}
                        title="ยกเลิก"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}