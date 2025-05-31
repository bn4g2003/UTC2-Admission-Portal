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
import { Badge } from "@/components/ui/badge";

interface EnrollmentPlan {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  stages_count: number;
}

export default function EnrollmentPlansManagement() {
  const router = useRouter();
  const [plans, setPlans] = useState<EnrollmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<EnrollmentPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/enrollment-plans', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      setPlans(data);
    } catch (err) {
      setError('Không thể tải danh sách kế hoạch');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/enrollment-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newPlan),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add plan');
      }

      await fetchPlans();
      setIsAddPlanOpen(false);
      setNewPlan({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
      });
    } catch (err) {
      setError('Không thể thêm kế hoạch mới');
      console.error('Error adding plan:', err);
    }
  };

  const handleEditPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const response = await fetch(`/api/enrollment-plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: selectedPlan.name,
          description: selectedPlan.description,
          start_date: selectedPlan.start_date,
          end_date: selectedPlan.end_date,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update plan');
      }

      await fetchPlans();
      setIsEditPlanOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      setError('Không thể cập nhật kế hoạch');
      console.error('Error updating plan:', err);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kế hoạch này? Tất cả các giai đoạn liên quan sẽ bị xóa.')) {
      return;
    }

    try {
      const response = await fetch(`/api/enrollment-plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete plan');
      }

      await fetchPlans();
    } catch (err) {
      setError('Không thể xóa kế hoạch');
      console.error('Error deleting plan:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="secondary">Sắp diễn ra</Badge>;
      case 'ongoing':
        return <Badge variant="default">Đang diễn ra</Badge>;
      case 'completed':
        return <Badge variant="outline">Đã kết thúc</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <>
      <Head>
        <title>Quản lý Kế hoạch Tuyển sinh - Hệ thống Tuyển sinh</title>
      </Head>

      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý Kế hoạch Tuyển sinh</h1>
          <Dialog open={isAddPlanOpen} onOpenChange={setIsAddPlanOpen}>
            <DialogTrigger asChild>
              <Button>Thêm Kế hoạch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm Kế hoạch Tuyển sinh Mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPlan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên kế hoạch</label>
                  <Input
                    required
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    className="w-full border rounded-md p-2"
                    rows={3}
                    required
                    value={newPlan.description}
                    onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                  <Input
                    type="date"
                    required
                    value={newPlan.start_date}
                    onChange={(e) => setNewPlan({...newPlan, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                  <Input
                    type="date"
                    required
                    value={newPlan.end_date}
                    onChange={(e) => setNewPlan({...newPlan, end_date: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Thêm kế hoạch
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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
                <TableHead>Tên kế hoạch</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Số giai đoạn</TableHead>
                <TableHead>Ngày bắt đầu</TableHead>
                <TableHead>Ngày kết thúc</TableHead>
                <TableHead>Người tạo</TableHead>
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
              ) : plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Chưa có kế hoạch tuyển sinh nào
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{getStatusBadge(plan.status)}</TableCell>
                    <TableCell>{plan.stages_count}</TableCell>
                    <TableCell>{formatDate(plan.start_date)}</TableCell>
                    <TableCell>{formatDate(plan.end_date)}</TableCell>
                    <TableCell>{plan.created_by}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsEditPlanOpen(true);
                          }}
                        >
                          Sửa
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Plan Dialog */}
        <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sửa Kế Hoạch Tuyển Sinh</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditPlan} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-name">Tên kế hoạch</label>
                <Input
                  id="edit-name"
                  value={selectedPlan?.name || ''}
                  onChange={(e) =>
                    setSelectedPlan(prev =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-description">Mô tả</label>
                <Input
                  id="edit-description"
                  value={selectedPlan?.description || ''}
                  onChange={(e) =>
                    setSelectedPlan(prev =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-start-date">Ngày bắt đầu</label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={selectedPlan?.start_date.split('T')[0] || ''}
                  onChange={(e) =>
                    setSelectedPlan(prev =>
                      prev ? { ...prev, start_date: e.target.value } : null
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-end-date">Ngày kết thúc</label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={selectedPlan?.end_date.split('T')[0] || ''}
                  onChange={(e) =>
                    setSelectedPlan(prev =>
                      prev ? { ...prev, end_date: e.target.value } : null
                    )
                  }
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditPlanOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">Lưu thay đổi</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
} 