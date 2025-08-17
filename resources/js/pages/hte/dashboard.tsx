import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { 
    Building2Icon, 
    UsersIcon, 
    BriefcaseIcon, 
    TrendingUpIcon
} from 'lucide-react';
import { 
    StatsCard, 
    CompanyInfoCard, 
    InternshipsListCard, 
    CategoryWeightsCard, 
    QuickActionsCard 
} from '@/components/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/hte/dashboard',
    },
];

interface HTEDashboardProps {
    hte: {
        id: number;
        company_name: string;
        company_address: string;
        company_email: string;
        cperson_fname: string;
        cperson_lname: string;
        cperson_position: string;
        cperson_contactnum: string;
        is_active: boolean;
        created_at: string;
        internships: Array<{
            id: number;
            position_title: string;
            department: string;
            placement_description: string;
            slot_count: number;
            is_active: boolean;
            created_at: string;
            subcategory_weights: Array<{
                id: number;
                weight: number;
                subcategory: {
                    id: number;
                    subcategory_name: string;
                };
            }>;
        }>;
    };
    stats: {
        totalInternships: number;
        activeInternships: number;
        totalSlots: number;
        internshipSlots: Array<{
            id: number;
            position_title: string;
            slot_count: number;
            is_active: boolean;
            created_at: string;
        }>;
        companyName: string;
        contactPerson: string;
        email: string;
        phone: string;
        address: string;
    };
    [key: string]: any;
}

export default function HTEDashboardPage() {
    const { hte, stats } = usePage<HTEDashboardProps>().props;

    // Add defensive programming to handle missing data
    if (!hte) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="HTE Dashboard" />
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                    <div className="text-center py-8 text-muted-foreground">
                        <p>HTE dashboard not found.</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HTE Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's an overview of your company and internship opportunities.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatsCard
                        title="Total Internships"
                        value={stats.totalInternships}
                        description="Created internships"
                        icon={BriefcaseIcon}
                    />
                    <StatsCard
                        title="Active Internships"
                        value={stats.activeInternships}
                        description="Currently active"
                        icon={TrendingUpIcon}
                    />
                    <StatsCard
                        title="Total Slots"
                        value={stats.totalSlots}
                        description="Available positions"
                        icon={UsersIcon}
                        internshipSlots={stats.internshipSlots}
                    />
                    <StatsCard
                        title="Status"
                        value={
                            <Badge variant={hte.is_active ? "default" : "secondary"}>
                                {hte.is_active ? "Active" : "Inactive"}
                            </Badge>
                        }
                        description="Company status"
                        icon={Building2Icon}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Company Information */}
                    <CompanyInfoCard
                        companyName={stats.companyName}
                        address={stats.address}
                        email={stats.email}
                        phone={stats.phone}
                        contactPerson={stats.contactPerson}
                    />

                    {/* All Internships */}
                    <InternshipsListCard internships={hte.internships} />
                </div>

                {/* Category Weights Overview */}
                <CategoryWeightsCard internships={hte.internships} />

                {/* Quick Actions */}
                <QuickActionsCard />
            </div>
        </AppLayout>
    );
}
