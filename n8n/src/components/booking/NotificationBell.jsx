import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, X, CheckCircle, XCircle, Info } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

const typeIcons = {
  approved: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
  info: Info,
};

const typeColors = {
  approved: "text-emerald-600",
  rejected: "text-red-600",
  cancelled: "text-slate-500",
  info: "text-blue-600",
};

export default function NotificationBell({ notifications, onMarkRead, onMarkAllRead }) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => setOpen(!open)}
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
              <h4 className="font-semibold text-sm">การแจ้งเตือน</h4>
              {unreadCount > 0 && (
                <button
                  className="text-xs text-indigo-600 hover:underline"
                  onClick={onMarkAllRead}
                >
                  อ่านทั้งหมด
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">ไม่มีการแจ้งเตือน</p>
              ) : (
                notifications.map(n => {
                  const Icon = typeIcons[n.type] || Info;
                  return (
                    <button
                      key={n.id}
                      className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-slate-50 transition-colors flex gap-3 ${
                        !n.is_read ? "bg-indigo-50/50" : ""
                      }`}
                      onClick={() => onMarkRead(n)}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${typeColors[n.type] || "text-slate-500"}`} />
                      <div className="min-w-0">
                        <p className={`text-sm ${!n.is_read ? "font-medium" : "text-slate-600"}`}>
                          {n.message}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {format(new Date(n.created_date), "d MMM yyyy HH:mm", { locale: th })}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}