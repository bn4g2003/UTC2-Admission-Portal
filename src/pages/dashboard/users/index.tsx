import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'TRUONGBAN' | 'GIAOVIEN';
  phone_number: string;
  address: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

interface UpdateUserData {
  email?: string;
  full_name?: string;
  role?: 'TRUONGBAN' | 'GIAOVIEN';
  phone_number?: string;
  address?: string;
  date_of_birth?: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'GIAOVIEN',
    phone_number: '',
    address: '',
    date_of_birth: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Không thể tải danh sách người dùng');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 

    // Validate required fields
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      setError('Email, mật khẩu và họ tên là bắt buộc');
      return;
    }

    // Validate email format
    if (!newUser.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Email không hợp lệ');
      return;
    }

    // Validate password length
    if (newUser.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newUser),      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Email đã tồn tại trong hệ thống');
        } else if (response.status === 400) {
          throw new Error(data.message || 'Dữ liệu không hợp lệ');
        } else {
          throw new Error(data.message || 'Không thể thêm người dùng mới');
        }
      }

      // Thêm user mới vào danh sách và đóng modal
      await fetchUsers(); // Refresh danh sách để đảm bảo dữ liệu mới nhất
      setIsAddUserOpen(false);
      
      // Reset form
      setNewUser({
        email: '',
        password: '',
        full_name: '',
        role: 'GIAOVIEN',
        phone_number: '',
        address: '',
        date_of_birth: '',
      });
    } catch (err: any) {
      setError(err.message || 'Không thể thêm người dùng mới');
      console.error('Error adding user:', err);
    }
  };
  const handleUpdateUser = async (data: UpdateUserData) => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update user');
      }

      // Cập nhật user trong danh sách và trong selectedUser
      setUsers(users.map(user => 
        user.id === selectedUser.id ? result.user : user
      ));
      setSelectedUser(result.user);
      setIsEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật thông tin người dùng');
      console.error('Error updating user:', err);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      setError('Không thể xóa người dùng');
      console.error('Error deleting user:', err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number.includes(searchTerm)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <>
      <Head>
        <title>Quản lý Người dùng - Hệ thống Tuyển sinh</title>
      </Head>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý Người dùng</h1>
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button>Thêm Người dùng</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm Người dùng Mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                  <Input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Họ và tên</label>
                  <Input
                    required
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò</label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as 'TRUONGBAN' | 'GIAOVIEN'})}
                  >
                    <option value="GIAOVIEN">Giáo viên</option>
                    <option value="TRUONGBAN">Trưởng ban</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <Input
                    type="tel"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({...newUser, phone_number: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <Input
                    value={newUser.address}
                    onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                  <Input
                    type="date"
                    value={newUser.date_of_birth}
                    onChange={(e) => setNewUser({...newUser, date_of_birth: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Thêm người dùng
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm theo email, tên hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Họ và tên</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Cập nhật lần cuối</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Không tìm thấy người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>
                      {user.role === 'TRUONGBAN' ? 'Trưởng ban' : 'Giáo viên'}
                    </TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{formatDate(user.updated_at)}</TableCell>                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* User Detail Sidebar */}
        {selectedUser && (
          <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-lg overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Thông tin chi tiết</h2>
              <Button variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
                ✕
              </Button>
            </div>

            {isEditMode ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser({
                  email: (e.target as any).email.value,
                  full_name: (e.target as any).full_name.value,
                  role: (e.target as any).role.value,
                  phone_number: (e.target as any).phone_number.value,
                  address: (e.target as any).address.value,
                  date_of_birth: (e.target as any).date_of_birth.value,
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input name="email" defaultValue={selectedUser.email} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Họ và tên</label>
                  <Input name="full_name" defaultValue={selectedUser.full_name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vai trò</label>
                  <select
                    name="role"
                    className="w-full border rounded-md p-2"
                    defaultValue={selectedUser.role}
                  >
                    <option value="GIAOVIEN">Giáo viên</option>
                    <option value="TRUONGBAN">Trưởng ban</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <Input name="phone_number" defaultValue={selectedUser.phone_number} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <Input name="address" defaultValue={selectedUser.address} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                  <Input 
                    name="date_of_birth" 
                    type="date"
                    defaultValue={selectedUser.date_of_birth}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">Lưu</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditMode(false)} className="flex-1">
                    Hủy
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Họ và tên</label>
                  <p className="font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Vai trò</label>
                  <p className="font-medium">
                    {selectedUser.role === 'TRUONGBAN' ? 'Trưởng ban' : 'Giáo viên'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Số điện thoại</label>
                  <p className="font-medium">{selectedUser.phone_number}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Địa chỉ</label>
                  <p className="font-medium">{selectedUser.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ngày sinh</label>
                  <p className="font-medium">{formatDate(selectedUser.date_of_birth)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ngày tạo</label>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Cập nhật lần cuối</label>
                  <p className="font-medium">{formatDate(selectedUser.updated_at)}</p>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button onClick={() => setIsEditMode(true)} className="flex-1">
                    Sửa
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
            </DialogHeader>
            <p>Bạn có chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.</p>
            <div className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="outline"
                onClick={handleDeleteUser}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Xóa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}