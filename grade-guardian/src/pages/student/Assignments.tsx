import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssignmentCard from '@/components/AssignmentCard';
import { useAssignments, useMarkAssignmentComplete } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Check } from 'lucide-react';
import { isBefore } from 'date-fns';

const StudentAssignments: React.FC = () => {
  const { data: assignmentsData, isLoading } = useAssignments();
  const markCompleteMutation = useMarkAssignmentComplete();
  const { toast } = useToast();
  const assignments = assignmentsData?.data || [];

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

  const handleMarkComplete = async (assignmentId: string, title: string) => {
    try {
      await markCompleteMutation.mutateAsync(assignmentId);
      toast({
        title: 'Assignment Completed',
        description: `"${title}" has been marked as completed.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark assignment as completed',
        variant: 'destructive',
      });
    }
  };

  const upcomingAssignments = assignments.filter((a: any) => {
    const deadline = new Date(a.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline >= today && !a.isCompleted;
  });

  const completedAssignments = assignments.filter((a: any) => a.isCompleted);

  const missedAssignments = assignments.filter((a: any) => {
    const deadline = new Date(a.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today && !a.isCompleted;
  });

  const AssignmentList = ({ assignments, showCompleteButton = false, emptyMessage }: { 
    assignments: any[], 
    showCompleteButton?: boolean,
    emptyMessage: string 
  }) => (
    <div className="space-y-3">
      {assignments.length > 0 ? (
        assignments.map((assignment: any) => (
          <Card key={assignment._id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <AssignmentCard assignment={assignment} showDescription={true} />
                </div>
                {showCompleteButton && (
                  <Button
                    onClick={() => handleMarkComplete(assignment._id, assignment.title)}
                    disabled={markCompleteMutation.isPending}
                    className="ml-4 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Assignments</h1>
          <p className="text-muted-foreground">Track your assignments and mark them as completed</p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming" className="relative">
              Upcoming
              {upcomingAssignments.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {upcomingAssignments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Completed
              {completedAssignments.length > 0 && (
                <span className="ml-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {completedAssignments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="missed" className="relative">
              Missed
              {missedAssignments.length > 0 && (
                <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {missedAssignments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignmentList 
                  assignments={upcomingAssignments} 
                  showCompleteButton={true}
                  emptyMessage="No upcoming assignments" 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Completed Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignmentList 
                  assignments={completedAssignments} 
                  emptyMessage="No completed assignments yet" 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missed">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Missed Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <AssignmentList 
                  assignments={missedAssignments} 
                  emptyMessage="No missed assignments" 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {assignments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No assignments available</p>
                <p className="text-sm">Check back later for new assignments</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default StudentAssignments;