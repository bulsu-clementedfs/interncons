import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';

type Props = {
    isSubmitting: boolean;
};

export default function ReviewAndSubmit({ isSubmitting }: Props) {
    const { watch } = useFormContext();
    const formData = watch();

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">Review and Submit</h2>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-4">Form Summary</h3>
                <div className="space-y-3 text-sm">
                    <div><strong>Company:</strong> {formData.companyName}</div>
                    <div><strong>Contact Person:</strong> {formData.contactPerson}</div>
                    <div><strong>Email:</strong> {formData.email}</div>
                    <div><strong>Phone:</strong> {formData.phone}</div>
                    <div><strong>Address:</strong> {formData.address}</div>
                    <div><strong>Position:</strong> {formData.position}</div>
                    <div><strong>Department:</strong> {formData.department}</div>
                    <div><strong>Duration:</strong> {formData.duration}</div>
                    <div><strong>Number of Interns:</strong> {formData.numberOfInterns}</div>
                    <div><strong>Start Date:</strong> {formData.startDate}</div>
                    <div><strong>End Date:</strong> {formData.endDate}</div>
                    <div><strong>Minimum GPA:</strong> {formData.minimumGPA}</div>
                    <div><strong>Required Skills:</strong> {formData.requiredSkills}</div>
                    {formData.preferredMajors && (
                        <div><strong>Preferred Majors:</strong> {formData.preferredMajors}</div>
                    )}
                    {formData.additionalRequirements && (
                        <div><strong>Additional Requirements:</strong> {formData.additionalRequirements}</div>
                    )}
                </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Submitting...' : 'Submit HTE Form'}
            </Button>
        </div>
    );
}
