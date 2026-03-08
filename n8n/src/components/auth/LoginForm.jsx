import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, GraduationCap, UserCog, BookOpen } from "lucide-react";

export default function LoginForm({ onLogin }) {
  const [role, setRole] = useState("student");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (role === "student") {
      if (!/^\d{8}$/.test(studentId)) {
        setError("กรุณากรอกรหัสนิสิต 8 หลัก");
        setLoading(false);
        return;
      }
      onLogin({ role: "student", studentId, name, identifier: studentId });
    } else {
      if (!email || !email.includes("@")) {
        setError("กรุณากรอก Email ให้ถูกต้อง");
        setLoading(false);
        return;
      }
      if (!name.trim()) {
        setError("กรุณากรอกชื่อ-สกุล");
        setLoading(false);
        return;
      }
      onLogin({ role, email, name, identifier: email });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">ระบบจองห้อง</h1>
          <p className="text-slate-500 mt-1">ภาควิชาคณิตศาสตร์</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-center">เข้าสู่ระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-3 block">สถานะผู้จอง</Label>
                <RadioGroup value={role} onValueChange={(v) => { setRole(v); setError(""); }} className="grid grid-cols-3 gap-3">
                  {[
                    { value: "student", icon: GraduationCap, label: "นิสิต" },
                    { value: "teacher", icon: BookOpen, label: "อาจารย์" },
                    { value: "staff", icon: UserCog, label: "เจ้าหน้าที่" },
                  ].map((item) => (
                    <Label
                      key={item.value}
                      htmlFor={item.value}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        role === item.value
                          ? "border-indigo-500 bg-indigo-50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <RadioGroupItem value={item.value} id={item.value} className="sr-only" />
                      <item.icon className={`w-5 h-5 ${role === item.value ? "text-indigo-600" : "text-slate-400"}`} />
                      <span className={`text-xs font-medium ${role === item.value ? "text-indigo-700" : "text-slate-600"}`}>
                        {item.label}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm text-slate-600">ชื่อ-สกุล</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อ-สกุล"
                    className="mt-1"
                    required
                  />
                </div>

                {role === "student" ? (
                  <div>
                    <Label htmlFor="studentId" className="text-sm text-slate-600">รหัสนิสิต</Label>
                    <Input
                      id="studentId"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      placeholder="กรอกรหัสนิสิต 8 หลัก"
                      maxLength={8}
                      className="mt-1 tracking-widest"
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="email" className="text-sm text-slate-600">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="กรอก Email"
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base"
                disabled={loading}
              >
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}