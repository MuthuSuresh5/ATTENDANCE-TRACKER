import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '@/hooks/useApi';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

interface StudentFormProps {
  formData: { name: string; rollNumber: string; password: string };
  setFormData: React.Dispatch<React.SetStateAction<{ name: string; rollNumber: string; password: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  editingStudent: any;
}

const StudentForm: React.FC<StudentFormProps> = ({ formData, setFormData, onSubmit, onCancel, editingStudent }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Full Name</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        required
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="rollNumber">Roll Number</Label>
      <Input
        id="rollNumber"
        value={formData.rollNumber}
        onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
        required
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="password">
        Password {editingStudent && <span className="text-muted-foreground">(leave blank to keep current)</span>}
      </Label>
      <Input
        id="password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        required={!editingStudent}
      />
    </div>
    
    <div className="flex gap-2 pt-4">
      <Button type="submit" className="flex-1">
        {editingStudent ? 'Update Student' : 'Create Student'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </form>
);

const AdminStudents: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', rollNumber: '', password: '' });
  const { toast } = useToast();

  const { data: studentsData, isLoading } = useStudents();
  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const students = studentsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStudent) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await updateMutation.mutateAsync({ id: editingStudent._id, ...updateData });
        toast({ title: 'Student Updated', description: 'Student has been updated successfully.' });
        setEditingStudent(null);
      } else {
        await createMutation.mutateAsync(formData);
        toast({ title: 'Student Created', description: 'New student has been created successfully.' });
        setIsCreateOpen(false);
      }
      setFormData({ name: '', email: '', rollNumber: '', password: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Student Deleted', description: 'Student has been deleted successfully.' });
      } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    }
  };

  const openEditDialog = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      password: ''
    });
  };

  const handleCancel = () => {
    setIsCreateOpen(false);
    setEditingStudent(null);
    setFormData({ name: '', rollNumber: '', password: '' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Students</h1>
            <p className="text-muted-foreground">Add, edit, and manage student accounts</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <StudentForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                editingStudent={editingStudent}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({students.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <div className="space-y-2">
                {students.map((student: any) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <p className="text-sm text-muted-foreground">Roll: {student.rollNumber}</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={editingStudent?._id === student._id} onOpenChange={(open) => !open && setEditingStudent(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Student</DialogTitle>
                          </DialogHeader>
                          <StudentForm 
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            editingStudent={editingStudent}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(student._id, student.name)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No students yet</p>
                <p className="text-sm">Add your first student to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminStudents;