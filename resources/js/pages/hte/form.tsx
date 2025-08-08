import FormStepCounter from '@/components/form/form-step-counter';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { Path, useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Trash2, Plus } from 'lucide-react';
import CriteriaStep from '@/components/form/hte/criteria-step';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'HTE Form',
        href: '/hte/form',
    },
];

// Internship slot schema
const InternshipSlotSchema = z.object({
    position: z.string().min(1, 'Position is required'),
    department: z.string().min(1, 'Department is required'),
    slotCount: z.string().min(1, 'Number of slots is required'),
    placementDescription: z.string().min(1, 'Placement description is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
});

// Form validation schema
const FormSchema = z.object({
    // Basic Information
    companyName: z.string().min(1, 'Company name is required'),
    contactPerson: z.string().min(1, 'Contact person is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    
    // Internship Offered - Array of internship slots
    internships: z.array(InternshipSlotSchema).min(1, 'At least one internship slot is required'),
    
    // Criteria
    minimumGPA: z.string().min(1, 'Minimum GPA is required'),
    requiredSkills: z.string().min(1, 'Required skills are required'),
    preferredMajors: z.string().optional(),
    additionalRequirements: z.string().optional(),
    
    // Weight assignments
    categoryWeights: z.record(z.number(), z.number()).optional(),
    subcategoryWeights: z.record(z.number(), z.record(z.number(), z.number())).optional(),
});

type FormData = z.infer<typeof FormSchema>;

export default function HTEForm() {
    const { flash, categories } = usePage<{ 
        flash: { success?: string; error?: string };
        categories: any[];
    }>().props;
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debug logging
    console.log('HTE Form - Categories:', categories);

    // Check for success message on mount
    useEffect(() => {
        if (flash?.success) {
            setIsSubmitted(true);
        }
    }, [flash?.success]);

    const steps = [
        { id: 'Step 1', name: 'Basic Information' },
        { id: 'Step 2', name: 'Internship Offered' },
        { id: 'Step 3', name: 'Criteria' },
        { id: 'Step 4', name: 'Submission' },
    ];

    const form = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        mode: 'onChange',
        defaultValues: {
            companyName: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            internships: [
                {
                    position: '',
                    department: '',
                    slotCount: '',
                    placementDescription: '',
                    startDate: '',
                    endDate: '',
                }
            ],
            minimumGPA: '',
            requiredSkills: '',
            preferredMajors: '',
            additionalRequirements: '',
            categoryWeights: {},
            subcategoryWeights: {},
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'internships',
    });

    function onSubmit(values: FormData) {
        setIsSubmitting(true);
        router.post('/hte/submit', values, {
            onSuccess: () => {
                setIsSubmitted(true);
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    }

    const [currentStep, setCurrentStep] = useState(0);

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const next = async () => {
        let fieldsToValidate: Path<FormData>[] = [];
        
        switch (currentStep) {
            case 0: // Basic Information
                fieldsToValidate = ['companyName', 'contactPerson', 'email', 'phone', 'address'];
                break;
            case 1: // Internship Offered
                // Validate all internship fields
                const internshipFields = fields.flatMap((_, index) => [
                    `internships.${index}.position`,
                    `internships.${index}.department`,
                    `internships.${index}.slotCount`,
                    `internships.${index}.placementDescription`,
                    `internships.${index}.startDate`,
                    `internships.${index}.endDate`,
                ] as Path<FormData>[]);
                fieldsToValidate = internshipFields;
                break;
            case 2: // Criteria
                fieldsToValidate = ['minimumGPA', 'requiredSkills'];
                // Note: Weight validation will be handled in the component
                break;
        }

        if (fieldsToValidate.length > 0) {
            const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });
            if (isValid) {
                setCurrentStep((prev) => prev + 1);
            }
        } else {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const addInternshipSlot = () => {
        append({
            position: '',
            department: '',
            slotCount: '',
            placementDescription: '',
            startDate: '',
            endDate: '',
        });
    };

    const removeInternshipSlot = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    // If form is submitted, show success state
    if (isSubmitted) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="HTE Form" />
                <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                    <div className="flex justify-center">
                        <FormStepCounter steps={steps} currentStep={steps.length - 1} />
                    </div>
                    <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                        <div className="p-4">
                            <div className="text-center space-y-6">
                                <div className="space-y-4">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">HTE Form Submitted Successfully!</h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Thank you for submitting your HTE form. Your internship opportunities have been recorded and will be available for student matching.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HTE Form" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="flex justify-center">
                    <FormStepCounter steps={steps} currentStep={currentStep} />
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="p-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                {currentStep === 0 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold">Basic Information</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Company Name</label>
                                                <input
                                                    {...form.register('companyName')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter company name"
                                                />
                                                {form.formState.errors.companyName && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.companyName.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Contact Person</label>
                                                <input
                                                    {...form.register('contactPerson')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter contact person name"
                                                />
                                                {form.formState.errors.contactPerson && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.contactPerson.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Email</label>
                                                <input
                                                    {...form.register('email')}
                                                    type="email"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter email address"
                                                />
                                                {form.formState.errors.email && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Phone</label>
                                                <input
                                                    {...form.register('phone')}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter phone number"
                                                />
                                                {form.formState.errors.phone && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2">Address</label>
                                                <textarea
                                                    {...form.register('address')}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter company address"
                                                />
                                                {form.formState.errors.address && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.address.message}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-xl font-semibold">Internship Offered</h2>
                                            <Button
                                                type="button"
                                                onClick={addInternshipSlot}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Slot
                                            </Button>
                                        </div>
                                        
                                        {form.formState.errors.internships && (
                                            <p className="text-red-500 text-sm">{form.formState.errors.internships.message}</p>
                                        )}

                                        <div className="space-y-6">
                                            {fields.map((field, index) => (
                                                <div key={field.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-medium">Internship Slot {index + 1}</h3>
                                                        {fields.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                onClick={() => removeInternshipSlot(index)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Position Title *</label>
                                                            <input
                                                                {...form.register(`internships.${index}.position`)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Enter position title"
                                                            />
                                                            {form.formState.errors.internships?.[index]?.position && (
                                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.internships[index]?.position?.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Department *</label>
                                                            <input
                                                                {...form.register(`internships.${index}.department`)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Enter department"
                                                            />
                                                            {form.formState.errors.internships?.[index]?.department && (
                                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.internships[index]?.department?.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Number of Slots *</label>
                                                            <input
                                                                {...form.register(`internships.${index}.slotCount`)}
                                                                type="number"
                                                                min="1"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Enter number of slots"
                                                            />
                                                            {form.formState.errors.internships?.[index]?.slotCount && (
                                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.internships[index]?.slotCount?.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">Start Date *</label>
                                                            <input
                                                                {...form.register(`internships.${index}.startDate`)}
                                                                type="date"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            {form.formState.errors.internships?.[index]?.startDate && (
                                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.internships[index]?.startDate?.message}</p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium mb-2">End Date *</label>
                                                            <input
                                                                {...form.register(`internships.${index}.endDate`)}
                                                                type="date"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            {form.formState.errors.internships?.[index]?.endDate && (
                                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.internships[index]?.endDate?.message}</p>
                                                            )}
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium mb-2">Placement Description *</label>
                                                            <textarea
                                                                {...form.register(`internships.${index}.placementDescription`)}
                                                                rows={3}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Describe the internship placement, responsibilities, and learning opportunities"
                                                            />
                                                            {form.formState.errors.internships?.[index]?.placementDescription && (
                                                                <p className="text-red-500 text-sm mt-1">{form.formState.errors.internships[index]?.placementDescription?.message}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold">Criteria</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Minimum GPA</label>
                                                <input
                                                    {...form.register('minimumGPA')}
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="4"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g., 2.5"
                                                />
                                                {form.formState.errors.minimumGPA && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.minimumGPA.message}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2">Required Skills</label>
                                                <textarea
                                                    {...form.register('requiredSkills')}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="List required technical skills, software, software, etc."
                                                />
                                                {form.formState.errors.requiredSkills && (
                                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.requiredSkills.message}</p>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2">Preferred Majors (Optional)</label>
                                                <textarea
                                                    {...form.register('preferredMajors')}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="List preferred majors or fields of study"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium mb-2">Additional Requirements (Optional)</label>
                                                <textarea
                                                    {...form.register('additionalRequirements')}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Any additional requirements or preferences"
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Weight Assignment Section */}
                                        <div className="mt-8">
                                            {categories && Array.isArray(categories) ? (
                                                <CriteriaStep form={form} categories={categories} />
                                            ) : (
                                                <div className="text-amber-600 bg-amber-50 p-4 rounded border">
                                                    Loading categories...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <h2 className="text-xl font-semibold">Review and Submit</h2>
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <h3 className="font-medium mb-4">Form Summary</h3>
                                            <div className="space-y-3 text-sm">
                                                <div><strong>Company:</strong> {form.watch('companyName')}</div>
                                                <div><strong>Contact Person:</strong> {form.watch('contactPerson')}</div>
                                                <div><strong>Email:</strong> {form.watch('email')}</div>
                                                <div><strong>Phone:</strong> {form.watch('phone')}</div>
                                                <div><strong>Number of Internship Slots:</strong> {form.watch('internships')?.length || 0}</div>
                                                <div><strong>Minimum GPA:</strong> {form.watch('minimumGPA')}</div>
                                            </div>
                                            
                                            {/* Display internship slots summary */}
                                            {form.watch('internships') && form.watch('internships').length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-medium mb-2">Internship Slots:</h4>
                                                    <div className="space-y-2">
                                                        {form.watch('internships').map((internship, index) => (
                                                            <div key={index} className="text-sm bg-white p-2 rounded border">
                                                                <div><strong>Slot {index + 1}:</strong> {internship.position} - {internship.department}</div>
                                                                <div>Slots: {internship.slotCount} | Duration: {internship.startDate} to {internship.endDate}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full">
                                            {isSubmitting ? 'Submitting...' : 'Submit HTE Form'}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </Form>
                    </div>
                    <div className="mt-4 flex justify-between items-center p-4">
                        <div className="text-sm text-gray-600">
                            {currentStep < steps.length - 1 && (
                                <span>Please complete all required fields before proceeding</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={prev} disabled={currentStep === 0} variant="outline">
                                Previous
                            </Button>
                            <Button onClick={next} disabled={currentStep === steps.length - 1}>
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
