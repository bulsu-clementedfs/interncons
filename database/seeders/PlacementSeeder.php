<?php

namespace Database\Seeders;

use App\Models\Placement;
use App\Models\Student;
use App\Models\Internship;
use Illuminate\Database\Seeder;

class PlacementSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some students and internships for sample placements
        $students = Student::where('is_submit', true)->take(3)->get();
        $internships = Internship::where('is_active', true)->take(3)->get();

        foreach ($students as $index => $student) {
            if (isset($internships[$index])) {
                Placement::create([
                    'student_id' => $student->id,
                    'internship_id' => $internships[$index]->id,
                    'status' => 'pending',
                    'compatibility_score' => rand(70, 95),
                    'admin_notes' => 'Sample placement for testing',
                ]);
            }
        }
    }
}
