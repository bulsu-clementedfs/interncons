<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MatchingService;

class RecalculateCompatibilityScores extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scores:recalculate {--student-id= : Recalculate for specific student only}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate and store all compatibility scores for students';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $matchingService = new MatchingService();
        
        if ($studentId = $this->option('student-id')) {
            $student = \App\Models\Student::find($studentId);
            
            if (!$student) {
                $this->error("Student with ID {$studentId} not found.");
                return 1;
            }
            
            if (!$student->is_submit) {
                $this->error("Student {$student->first_name} {$student->last_name} has not submitted assessment.");
                return 1;
            }
            
            $this->info("Recalculating compatibility scores for student: {$student->first_name} {$student->last_name}");
            $scores = $matchingService->calculateAndStoreCompatibilityScores($student);
            $this->info("Successfully stored {$scores->count()} compatibility scores for {$student->first_name} {$student->last_name}");
            
        } else {
            $this->info('Starting compatibility score recalculation for all students...');
            $matchingService->recalculateAllStudentScores();
            $this->info('Successfully recalculated all compatibility scores!');
        }
        
        return 0;
    }
}
