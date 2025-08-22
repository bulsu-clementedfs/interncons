import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
    UserIcon, 
    Building2Icon, 
    BriefcaseIcon, 
    TargetIcon,
    CheckCircleIcon,
    XCircleIcon,
    AlertCircleIcon
} from 'lucide-react';

interface StudentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
    onApprove: (data: { internship_id: number; compatibility_score: number; admin_notes?: string }) => void;
    onReject: (data: { internship_id: number; compatibility_score: number; admin_notes: string }) => void;
    isLoading?: boolean;
}

export default function StudentDetailsModal({
    isOpen,
    onClose,
    student,
    onApprove,
    onReject,
    isLoading = false
}: StudentDetailsModalProps) {
    const [adminNotes, setAdminNotes] = useState('');
    const [showActionButtons, setShowActionButtons] = useState(false);

    const handleApprove = () => {
        if (!student?.best_match?.internship) return;
        
        onApprove({
            internship_id: student.best_match.internship.id,
            compatibility_score: student.best_match.compatibility_score,
            admin_notes: adminNotes.trim() || undefined,
        });
    };

    const handleReject = () => {
        if (!student?.best_match?.internship || !adminNotes.trim()) return;
        
        onReject({
            internship_id: student.best_match.internship.id,
            compatibility_score: student.best_match.compatibility_score,
            admin_notes: adminNotes.trim(),
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        return 'Fair';
    };

    if (!student) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5" />
                        Student Details: {student.student?.first_name} {student.student?.last_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Student Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Student Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Student Number</label>
                                    <p className="text-sm">{student.student?.student_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Section</label>
                                    <p className="text-sm">{student.student?.section}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Specialization</label>
                                    <p className="text-sm">{student.student?.specialization || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Middle Name</label>
                                    <p className="text-sm">{student.student?.middle_name || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Best Match Information */}
                    {student.best_match && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TargetIcon className="h-5 w-5" />
                                    Best Match - {student.best_match.internship.position_title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Company</label>
                                            <p className="text-sm font-medium">{student.best_match.internship.hte.company_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Department</label>
                                            <p className="text-sm">{student.best_match.internship.department}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Position</label>
                                            <p className="text-sm font-medium">{student.best_match.internship.position_title}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Compatibility Score</label>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getScoreColor(student.best_match.compatibility_score)}>
                                                    {student.best_match.compatibility_score}%
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                    {getScoreLabel(student.best_match.compatibility_score)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Assessment Scores Breakdown */}
                    {student.scores_breakdown && student.scores_breakdown.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Assessment Scores Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {student.scores_breakdown.map((score: any, index: number) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{score.category}</h4>
                                                    <p className="text-sm text-gray-500">{score.subcategory}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {score.score}/5
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {score.score_percentage}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full" 
                                                    style={{ width: `${score.score_percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admin Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Admin Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Add notes about this placement decision..."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                rows={3}
                            />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isLoading || !adminNotes.trim()}
                            className="flex items-center gap-2"
                        >
                            <XCircleIcon className="h-4 w-4" />
                            Reject Placement
                        </Button>
                        
                        <Button
                            onClick={handleApprove}
                            disabled={isLoading}
                            className="flex items-center gap-2"
                        >
                            <CheckCircleIcon className="h-4 w-4" />
                            Approve Placement
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
