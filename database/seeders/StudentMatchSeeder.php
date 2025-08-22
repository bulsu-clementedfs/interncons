<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\Internship;
use App\Models\StudentMatch;
use App\Models\StudentScore;
use App\Models\SubcategoryWeight;
use Illuminate\Database\Seeder;
use App\Services\MatchingService;

class StudentMatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all students who have submitted assessments
        $students = Student::where('is_submit', true)->get();
        
        // Get all active internships
        $internships = Internship::where('is_active', true)->get();
        
        if ($students->isEmpty() || $internships->isEmpty()) {
            $this->command->info('No students with assessments or active internships found. Skipping StudentMatchSeeder.');
            return;
        }

        $this->command->info('Creating student-internship matches...');
        
        $matchingService = new MatchingService();
        $createdMatches = 0;

        foreach ($students as $student) {
            // Get top compatible internships for this student
            $compatibleInternships = $matchingService->getTopCompatibleInternships($student);
            
            // Create matches for top 3 compatible internships
            $rank = 1;
            foreach (array_slice($compatibleInternships->toArray(), 0, 3) as $matchData) {
                $internship = $matchData['internship'];
                $compatibilityScore = $matchData['compatibility_score'];
                
                // Check if match already exists
                $existingMatch = StudentMatch::where('student_id', $student->id)
                    ->where('internship_id', $internship->id)
                    ->first();
                
                if (!$existingMatch) {
                    StudentMatch::create([
                        'student_id' => $student->id,
                        'internship_id' => $internship->id,
                        'rank' => $rank,
                        'compatibility_score' => $compatibilityScore,
                    ]);
                    
                    $createdMatches++;
                    $rank++;
                }
            }
        }

        $this->command->info("Created {$createdMatches} student-internship matches successfully!");
    }
}
