import { Users, BookOpen, FileText, BarChart3, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router";

export default function AdminDashboard() {
  const stats = [
    { label: "Tổng người dùng", value: "2,547", icon: Users, color: "orange" },
    { label: "Khóa học", value: "48", icon: BookOpen, color: "orange" },
    { label: "Bài giảng", value: "1,234", icon: FileText, color: "orange" },
    { label: "Tỷ lệ hoàn thành", value: "78%", icon: BarChart3, color: "orange" },
  ];

  const users = [
    { id: 1, name: "Nguyễn Văn A", email: "student1@test.com", role: "Học sinh" },
    { id: 2, name: "Trần Thị B", email: "teacher1@test.com", role: "Giáo viên" },
    { id: 3, name: "Lê Văn C", email: "student2@test.com", role: "Học sinh" },
    { id: 4, name: "Phạm Thị D", email: "teacher2@test.com", role: "Giáo viên" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản Trị Viên</h1>
          <p className="text-gray-600 mt-2">Tổng quan hệ thống</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Users Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Quản lý người dùng</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-orange-600 hover:text-orange-700 mr-3">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quản lý</h3>
              <nav className="space-y-2">
                <Link
                  to="/admin"
                  className="block px-4 py-2 bg-orange-50 text-orange-700 rounded-lg"
                >
                  Tổng quan
                </Link>
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Quản lý khóa học
                </Link>
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Thống kê hệ thống
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
