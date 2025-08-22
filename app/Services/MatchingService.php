<?php

namespace App\Services;

use App\Models\Student;
use App\Models\Internship;
use App\Models\StudentScore;
use App\Models\SubcategoryWeight;
use Illuminate\Support\Collection;

class MatchingService
{
    /**
     * Calculate compatibility scores for a student with all available internships
     */
    public function calculateCompatibilityScores(Student $student): Collection
    {
        // Get all active internships with available slots
        $internships = Internship::with(['hte:id,company_name', 'subcategoryWeights.subcategory'])
            ->where('is_active', true)
            ->where('slot_count', '>', 0)
            ->get();

        // Get student's scores
        $studentScores = $student->scores()->with('subcategory')->get()->keyBy('sub_category_id');

        $compatibilityScores = collect();

        foreach ($internships as $internship) {
            $score = $this->calculateInternshipCompatibility($studentScores, $internship);
            
            $compatibilityScores->push([
                'internship' => $internship,
                'compatibility_score' => $score,
            ]);
        }

        // Sort by compatibility score (highest first) and take top 5
        return $compatibilityScores
            ->sortByDesc('compatibility_score')
            ->take(5)
            ->values();
    }

    /**
     * Calculate compatibility score for a specific internship
     */
    private function calculateInternshipCompatibility(Collection $studentScores, Internship $internship): float
    {
        $totalScore = 0;
        $totalWeight = 0;

        // Get the weights for this internship
        $weights = $internship->subcategoryWeights;

        foreach ($weights as $weight) {
            $subcategoryId = $weight->subcategory_id;
            $weightValue = $weight->weight;
            
            // Get student's score for this subcategory
            $studentScore = $studentScores->get($subcategoryId);
            
            if ($studentScore) {
                // Convert student score (1-5 scale) to percentage (0-100)
                $scorePercentage = ($studentScore->score / 5) * 100;
                
                // Apply weight to the score
                $weightedScore = $scorePercentage * ($weightValue / 100);
                
                $totalScore += $weightedScore;
                $totalWeight += $weightValue;
            }
        }

        // Calculate final compatibility score
        if ($totalWeight > 0) {
            return round(($totalScore / $totalWeight) * 100, 2);
        }

        return 0;
    }

    /**
     * Get top 5 compatible internships for a student
     */
    public function getTopCompatibleInternships(Student $student): Collection
    {
        return $this->calculateCompatibilityScores($student);
    }
}
