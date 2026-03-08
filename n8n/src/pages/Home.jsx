import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import LoginForm from "../components/auth/LoginForm";
import BookingForm from "../components/booking/BookingForm";
import BookingList from "../components/booking/BookingList";
import BookingCalendar from "../components/booking/BookingCalendar";
import NotificationBell from "../components/booking/NotificationBell";
import { Button } from "@/components/ui/button";
import { Building2, LogOut, User } from "lucide-react";
import { getRoleName } from "../components/booking/RoomRules";

const SESSION_KEY = "math_room_session";

function getSession() {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

function saveSession(data) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("booking");

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrentUser(session);
    }
    setLoading(false);
  }, []);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    const [allBookings, allNotifs] = await Promise.all([
      base44.entities.RoomBooking.list("-created_date", 200),
      base44.entities.Notification.filter(
        { recipient_identifier: currentUser.identifier },
        "-created_date",
        50
      ),
    ]);
    setBookings(allBookings);
    setNotifications(allNotifs);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) loadData();
  }, [currentUser, loadData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!currentUser) return;
    const unsub1 = base44.entities.RoomBooking.subscribe(() => loadData());
    const unsub2 = base44.entities.Notification.subscribe(() => loadData());
    return () => { unsub1(); unsub2(); };
  }, [currentUser, loadData]);

  const handleLogin = async (userData) => {
    // สำหรับอาจารย์/เจ้าหน้าที่ บันทึกข้อมูลลง StaffAccount
    if (userData.role !== "student" && userData.email) {
      const existing = await base44.entities.StaffAccount.filter({ email: userData.email });
      if (existing.length === 0) {
        await base44.entities.StaffAccount.create({
          email: userData.email,
          name: userData.name,
          role: userData.role,
        });
      }
    }
    saveSession(userData);
    setCurrentUser(userData);
    toast.success("เข้าสู่ระบบสำเร็จ");
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setBookings([]);
    setNotifications([]);
    toast.success("ออกจากระบบแล้ว");
  };

  const handleCreateBooking = async (bookingData) => {
    await base44.entities.RoomBooking.create(bookingData);
    if (bookingData.status === "pending") {
      toast.success("ส่งคำขอจองสำเร็จ รอการอนุมัติจากอาจารย์");
    } else {
      toast.success("จองห้องสำเร็จ!");
    }
    await loadData();
    setActiveTab("list");
  };

  const handleApprove = async (booking) => {
    await base44.entities.RoomBooking.update(booking.id, {
      status: "approved",
      approved_by: currentUser.name,
      approved_date: new Date().toISOString(),
    });
    // สร้างการแจ้งเตือน
    const recipientId = booking.student_id || booking.booker_email;
    await base44.entities.Notification.create({
      booking_id: booking.id,
      recipient_identifier: recipientId,
      message: `การจองห้อง ${booking.room} วันที่ ${booking.date} (${booking.start_time}-${booking.end_time}) ได้รับการอนุมัติแล้ว`,
      type: "approved",
    });
    toast.success("อนุมัติการจองเรียบร้อย");
    await loadData();
  };

  const handleReject = async (booking) => {
    await base44.entities.RoomBooking.update(booking.id, { status: "rejected" });
    const recipientId = booking.student_id || booking.booker_email;
    await base44.entities.Notification.create({
      booking_id: booking.id,
      recipient_identifier: recipientId,
      message: `การจองห้อง ${booking.room} วันที่ ${booking.date} (${booking.start_time}-${booking.end_time}) ไม่ได้รับการอนุมัติ`,
      type: "rejected",
    });
    toast.success("ปฏิเสธการจองเรียบร้อย");
    await loadData();
  };

  const handleCancel = async (booking) => {
    await base44.entities.RoomBooking.update(booking.id, { status: "cancelled" });
    toast.success("ยกเลิกการจองเรียบร้อย");
    await loadData();
  };

  const handleMarkNotifRead = async (notif) => {
    if (!notif.is_read) {
      await base44.entities.Notification.update(notif.id, { is_read: true });
      await loadData();
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    await loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">กำลังโหลด...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const pendingCount = bookings.filter(b => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">ระบบจองห้อง</h1>
              <p className="text-[10px] text-slate-400 leading-tight">ภาควิชาคณิตศาสตร์</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell
              notifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onMarkAllRead={handleMarkAllRead}
            />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400">({getRoleName(currentUser.role)})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-red-600 h-8"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-sm border mb-6 w-full sm:w-auto">
            <TabsTrigger value="booking" className="flex-1 sm:flex-none">จองห้อง</TabsTrigger>
            <TabsTrigger value="list" className="flex-1 sm:flex-none relative">
              รายการจอง
              {pendingCount > 0 && (currentUser.role === "teacher" || currentUser.role === "staff") && (
                <span className="ml-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex-1 sm:flex-none">ปฏิทิน</TabsTrigger>
          </TabsList>

          <TabsContent value="booking">
            <div className="max-w-lg mx-auto">
              <BookingForm
                currentUser={currentUser}
                onSubmit={handleCreateBooking}
                existingBookings={bookings}
              />
            </div>
          </TabsContent>

          <TabsContent value="list">
            <BookingList
              bookings={bookings}
              currentUser={currentUser}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={handleCancel}
            />
          </TabsContent>

          <TabsContent value="calendar">
            <BookingCalendar bookings={bookings} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}