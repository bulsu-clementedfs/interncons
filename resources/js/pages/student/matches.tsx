import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
    Building, 
    MapPin, 
    Users, 
    Target,
    TrendingUp,
    Award,
    Calendar
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'SIP Matches',
        href: '/student/matches',
    },
];

interface Internship {
    id: number;
    position_title: string;
    department: string;
    slot_count: number;
    hte: {
        company_name: string;
        company_address: string;
    };
}

interface StudentMatch {
    id: number;
    rank: number;
    compatibility_score: number;
    internship: Internship;
}

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
    section: string | null;
    specialization: string | null;
}

interface Props {
    student: Student;
    matches: StudentMatch[];
}

export default function StudentMatches({ student, matches }: Props) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent Match';
        if (score >= 60) return 'Good Match';
        return 'Fair Match';
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Award className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Award className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 text-amber-600" />;
            default:
                return <Target className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const averageScore = matches.length > 0 
        ? Math.round(matches.reduce((sum, match) => sum + match.compatibility_score, 0) / matches.length)
        : 0;

    const topMatches = matches.filter(match => match.compatibility_score >= 80).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SIP Matches" />
            
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">SIP Matches</h1>
                        <p className="text-muted-foreground">
                            Your internship compatibility matches based on assessment scores
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{matches.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Available opportunities
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${
                                averageScore >= 80 ? 'text-green-600' : 
                                averageScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                                {averageScore}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Overall compatibility
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Top Matches</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{topMatches}</div>
                            <p className="text-xs text-muted-foreground">
                                80%+ compatibility
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Best Rank</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {matches.length > 0 ? matches[0].rank : 'N/A'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Your top match
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Matches Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Your Internship Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {matches.length === 0 ? (
                            <div className="text-center py-8">
                                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Found</h3>
                                <p className="text-muted-foreground">
                                    You need to complete your skills assessment to generate matches.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Rank</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Position</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Company</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Department</th>
                                            <th className="text-left py-3 px-4 font-semibold text-sm">Slots</th>
                                            <th className="text-center py-3 px-4 font-semibold text-sm">Compatibility</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matches.map((match) => (
                                            <tr key={match.id} className="border-b hover:bg-gray-50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {getRankIcon(match.rank)}
                                                        <span className="font-medium">#{match.rank}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="font-medium">
                                                        {match.internship.position_title}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        <span>{match.internship.hte.company_name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{match.internship.department}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-muted-foreground" />
                                                        <span>{match.internship.slot_count} available</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge 
                                                        className={getScoreColor(match.compatibility_score)}
                                                    >
                                                        {match.compatibility_score}%
                                                    </Badge>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {getScoreLabel(match.compatibility_score)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
