import { Link } from "react-router";
import {
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Facebook,
  Youtube,
  Twitter,
} from "lucide-react";

const footerLinks = [
  {
    title: "Khám phá",
    items: [
      { label: "Khóa học", path: "/courses" },
      { label: "Giảng viên", path: "/teachers" },
      { label: "Tin tức", path: "/news" },
      { label: "Về chúng tôi", path: "/about" },
    ],
  },
  {
    title: "Hỗ trợ",
    items: [
      { label: "Feedback", path: "/feedback" },
      { label: "Trung tâm trợ giúp", path: "/feedback" },
      { label: "Chính sách bảo mật", path: "/feedback" },
      { label: "Điều khoản sử dụng", path: "/feedback" },
    ],
  },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "Youtube" },
  { icon: Twitter, href: "#", label: "Twitter" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#FFFDFB] to-[#FFF5EC] border-t border-[#FFE4CC]">


      {/* Main links */}
      <div className="mx-auto max-w-[1500px] px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand column */}
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                <GraduationCap className="h-6 w-6" />
              </span>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                GenZ<span className="text-orange-500">Bio</span>
              </span>
            </Link>
            <p className="mt-5 text-sm font-medium leading-7 text-slate-500">
              Nền tảng học Sinh học trực tuyến chất lượng cao dành cho học sinh,
              sinh viên và người yêu thích Sinh học. Học mọi lúc, mọi nơi với
              phương pháp hiện đại.
            </p>

            {/* Social links */}
            <div className="mt-8 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-500"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-black uppercase tracking-widest text-orange-600">
                {group.title}
              </h4>
              <ul className="mt-6 space-y-4">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-sm font-semibold text-slate-500 transition hover:text-orange-600"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact bar */}
        <div className="mt-16 grid gap-6 rounded-2xl border border-[#FFE4CC]/60 bg-white/85 backdrop-blur-sm px-8 py-6 md:grid-cols-3 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Email
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-600">
                support@genzbio.vn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Điện thoại
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-600">
                028 1234 5678
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Địa chỉ
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-600">
                TP. Hồ Chí Minh, Việt Nam
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#FFE4CC]/60">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-4 px-6 py-6 text-sm font-medium text-slate-400 md:flex-row">
          <p>© 2026 GenZBio. Tất cả quyền được bảo lưu.</p>
          <p>Phiên bản 1.0.0 · Made with ❤️ for education</p>
        </div>
      </div>
    </footer>
  );
}
