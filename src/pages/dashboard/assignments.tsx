"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

type EnrollmentPlan = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  stages_count: number;
};

type EnrollmentStage = {
  id: string;
  stage_name: string;
  stage_description: string;
  start_time: string;
  end_time: string;
  stage_order: number;
};

type Assignment = {
  id: string;
  stage_id: string;
  assigned_to: string;
  assignment_details: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at: string;
  completed_at: string | null;
};

export default function AssignmentsPage() {
  const [plans, setPlans] = useState<EnrollmentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [stages, setStages] = useState<EnrollmentStage[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isAddStageDialogOpen, setIsAddStageDialogOpen] = useState(false);
  const [isAddAssignmentDialogOpen, setIsAddAssignmentDialogOpen] = useState(false);
  const router = useRouter();

  // Fetch enrollment plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/enrollment-plans');
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load enrollment plans",
          variant: "destructive",
        });
      }
    };
    fetchPlans();
  }, []);

  // Fetch stages when a plan is selected
  useEffect(() => {
    if (selectedPlan) {
      const fetchStages = async () => {
        try {
          const response = await fetch(`/api/enrollment-plans/${selectedPlan}/stages`);
          if (!response.ok) throw new Error('Failed to fetch stages');
          const data = await response.json();
          setStages(data);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load enrollment stages",
            variant: "destructive",
          });
        }
      };
      fetchStages();
    }
  }, [selectedPlan]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Enrollment Plans Management</h1>
      
      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{plan.description}</p>
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  plan.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                  plan.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {plan.status}
                </span>
                <span className="text-sm text-gray-500">{plan.stages_count} stages</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stages and Assignments Section */}
      {selectedPlan && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Enrollment Stages</h2>
            <Button onClick={() => setIsAddStageDialogOpen(true)}>
              Add New Stage
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Stage Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Timeline</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stages.map((stage) => (
                <TableRow key={stage.id}>
                  <TableCell>{stage.stage_order}</TableCell>
                  <TableCell>{stage.stage_name}</TableCell>
                  <TableCell>{stage.stage_description}</TableCell>
                  <TableCell>
                    {new Date(stage.start_time).toLocaleString()} - 
                    {new Date(stage.end_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddAssignmentDialogOpen(true)}
                    >
                      Assign Task
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Stage Dialog */}
      <Dialog open={isAddStageDialogOpen} onOpenChange={setIsAddStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stage</DialogTitle>
            <DialogDescription>
              Create a new stage for the selected enrollment plan
            </DialogDescription>
          </DialogHeader>
          {/* Add stage form will go here */}
        </DialogContent>
      </Dialog>

      {/* Add Assignment Dialog */}
      <Dialog open={isAddAssignmentDialogOpen} onOpenChange={setIsAddAssignmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
            <DialogDescription>
              Assign a task to a teacher for this stage
            </DialogDescription>
          </DialogHeader>
          {/* Add assignment form will go here */}
        </DialogContent>
      </Dialog>
    </div>
  );
}
