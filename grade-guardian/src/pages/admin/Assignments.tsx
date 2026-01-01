import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from '@/hooks/useApi';
import AssignmentCard from '@/components/AssignmentCard';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignmentFormProps {
  formData: { title: string; description: string; deadline: Date };
  setFormData: React.Dispatch<React.SetStateAction<{ title: string; description: string; deadline: Date }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  editingAssignment: any;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ formData, setFormData, onSubmit, onCancel, editingAssignment }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="title">Title</Label>
      <Input
        id="title"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        required
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        required
      />
    </div>
    
    <div className="space-y-2">
      <Label>Deadline</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !formData.deadline && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.deadline ? format(formData.deadline, 'PPP') : 'Select deadline'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formData.deadline}
            onSelect={(date) => date && setFormData(prev => ({ ...prev, deadline: date }))}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
    
    <div className="flex gap-2 pt-4">
      <Button type="submit" className="flex-1">
        {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
      </Button>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </form>
);

const AdminAssignments: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [formData, setFormData] = useState({ title: '', description: '', deadline: new Date() });
  const { toast } = useToast();

  const { data: assignmentsData, isLoading } = useAssignments();
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const assignments = assignmentsData?.data || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAssignment) {
        await updateMutation.mutateAsync({ id: editingAssignment._id, ...formData });
        toast({ title: 'Assignment Updated', description: 'Assignment has been updated successfully.' });
        setEditingAssignment(null);
      } else {
        await createMutation.mutateAsync(formData);
        toast({ title: 'Assignment Created', description: 'New assignment has been created successfully.' });
        setIsCreateOpen(false);
      }
      setFormData({ title: '', description: '', deadline: new Date() });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: 'Assignment Deleted', description: 'Assignment has been deleted successfully.' });
      } catch (error: any) {
        console.error('Delete error:', error);
        toast({ title: 'Error', description: error.message || 'Failed to delete assignment', variant: 'destructive' });
      }
    }
  };

  const openEditDialog = (assignment: any) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title,
      description: assignment.description,
      deadline: new Date(assignment.deadline)
    });
  };

  const handleCancel = () => {
    setIsCreateOpen(false);
    setEditingAssignment(null);
    setFormData({ title: '', description: '', deadline: new Date() });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading assignments...</p>
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
            <h1 className="text-2xl font-bold">Manage Assignments</h1>
            <p className="text-muted-foreground">Create and manage assignments for your class</p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <AssignmentForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                editingAssignment={editingAssignment}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {assignments.length > 0 ? (
            assignments.map((assignment: any) => (
              <Card key={assignment._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <AssignmentCard assignment={assignment} showDescription={true} />
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Dialog open={editingAssignment?._id === assignment._id} onOpenChange={(open) => !open && setEditingAssignment(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(assignment)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Assignment</DialogTitle>
                          </DialogHeader>
                          <AssignmentForm 
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            editingAssignment={editingAssignment}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(assignment._id, assignment.title)}
                        className="text-destructive hover:text-destructive"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No assignments yet</p>
                  <p className="text-sm">Create your first assignment to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminAssignments;