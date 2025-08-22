<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\StudentMatch;
use App\Models\Internship;
use App\Models\StudentScore;
use App\Models\SubcategoryWeight;
use App\Models\Placement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\MatchingService;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $students = Student::select([
            'id',
            'student_number',
            'first_name',
            'middle_name',
            'last_name',
            'section',
            'specialization',
            'is_active'
        ])
        ->where('is_active', true)
        ->orderBy('last_name')
        ->orderBy('first_name')
        ->paginate(10);

        return Inertia::render('admin/student/list', ['students' => $students]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Student $student)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Student $student)
    {
        return Inertia::render('admin/student/edit', ['student' => $student]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:50',
            'middle_name' => 'nullable|string|max:50',
            'last_name' => 'required|string|max:50',
            'student_number' => 'required|string|max:20',
            'section' => 'required|string|max:10',
            'specialization' => 'required|string|max:10',
        ]);

        $student->update($validated);

        return redirect()->route('student-list')->with('success', 'Student updated successfully');
    }

    /**
     * Archive the specified student (soft delete by setting is_active to false).
     */
    public function archive(Student $student)
    {
        $student->update(['is_active' => false]);
        
        return redirect()->route('student-list')->with('success', 'Student archived successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Student $student)
    {
        //
    }

    /**
     * Get matched students with their highest compatibility scores
     */
    public function getMatchedStudents()
    {
        // Get students who have submitted assessments
        $matchedStudents = Student::with(['user', 'scores.subcategory'])
            ->where('is_submit', true)
            ->where('is_active', true)
            ->get()
            ->map(function ($student) {
                // Get all active internships
                $activeInternships = Internship::with(['hte:id,company_name', 'subcategoryWeights.subcategory'])
                    ->where('is_active', true)
                    ->where('slot_count', '>', 0)
                    ->get();

                $bestMatch = null;
                $highestScore = 0;

                // Calculate compatibility score for each internship
                foreach ($activeInternships as $internship) {
                    $compatibilityScore = $this->calculateCompatibilityScore($student, $internship);
                    
                    if ($compatibilityScore > $highestScore) {
                        $highestScore = $compatibilityScore;
                        $bestMatch = [
                            'internship' => $internship,
                            'compatibility_score' => $compatibilityScore,
                        ];
                    }
                }

                return [
                    'id' => $student->id,
                    'student_number' => $student->student_number,
                    'first_name' => $student->first_name,
                    'last_name' => $student->last_name,
                    'middle_name' => $student->middle_name,
                    'section' => $student->section,
                    'specialization' => $student->specialization,
                    'best_match' => $bestMatch,
                    'has_matches' => $bestMatch !== null,
                ];
            })
            ->filter(function ($student) {
                // Only include students who have at least one match
                return $student['has_matches'];
            })
            ->sortByDesc(function ($student) {
                // Sort by compatibility score (highest first)
                return $student['best_match']['compatibility_score'];
            })
            ->values();

        return Inertia::render('admin/student/matched', [
            'matchedStudents' => $matchedStudents
        ]);
    }

    /**
     * Calculate compatibility score between a student and an internship
     */
    private function calculateCompatibilityScore($student, $internship): float
    {
        $totalScore = 0;
        $totalWeight = 0;

        // Get the weights for this internship
        $weights = $internship->subcategoryWeights;

        foreach ($weights as $weight) {
            $subcategoryId = $weight->subcategory_id;
            $weightValue = $weight->weight;
            
            // Get student's score for this subcategory
            $studentScore = $student->scores->where('sub_category_id', $subcategoryId)->first();
            
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
     * Get student details with assessment scores and internship criteria
     */
    public function getStudentDetails(Student $student)
    {
        $student->load([
            'scores.subcategory.category',
            'user'
        ]);

        // Get the best matching internship
        $activeInternships = Internship::with(['hte:id,company_name', 'subcategoryWeights.subcategory.category'])
            ->where('is_active', true)
            ->where('slot_count', '>', 0)
            ->get();

        $bestMatch = null;
        $highestScore = 0;

        foreach ($activeInternships as $internship) {
            $compatibilityScore = $this->calculateCompatibilityScore($student, $internship);
            
            if ($compatibilityScore > $highestScore) {
                $highestScore = $compatibilityScore;
                $bestMatch = [
                    'internship' => $internship,
                    'compatibility_score' => $compatibilityScore,
                ];
            }
        }

        // Get detailed scores breakdown
        $scoresBreakdown = $student->scores->map(function ($score) {
            return [
                'category' => $score->subcategory->category->name,
                'subcategory' => $score->subcategory->name,
                'score' => $score->score,
                'score_percentage' => ($score->score / 5) * 100,
            ];
        });

        return response()->json([
            'student' => [
                'id' => $student->id,
                'student_number' => $student->student_number,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'middle_name' => $student->middle_name,
                'section' => $student->section,
                'specialization' => $student->specialization,
            ],
            'best_match' => $bestMatch,
            'scores_breakdown' => $scoresBreakdown,
        ]);
    }

    /**
     * Approve student placement
     */
    public function approvePlacement(Request $request, Student $student)
    {
        // Debug logging
        Log::info('Placement approval request received', [
            'student_id' => $student->id,
            'request_data' => $request->all(),
            'headers' => $request->headers->all()
        ]);

        $validated = $request->validate([
            'internship_id' => 'required|exists:internships,id',
            'compatibility_score' => 'required|numeric|min:0|max:100',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        // Check if student already has a placement
        $existingPlacement = Placement::where('student_id', $student->id)->first();
        if ($existingPlacement) {
            return response()->json([
                'message' => 'Student already has a placement'
            ], 400);
        }

        try {
            // Create placement record
            $placement = Placement::create([
                'student_id' => $student->id,
                'internship_id' => $validated['internship_id'],
                'status' => 'approved',
                'compatibility_score' => $validated['compatibility_score'],
                'admin_notes' => $validated['admin_notes'],
                'placement_date' => now(),
            ]);

            Log::info('Placement created successfully', ['placement_id' => $placement->getAttributes()]);

            // Update student status
            $student->update(['is_placed' => true]);
            Log::info('Student status updated');

            // Decrease internship slot count
            $internship = Internship::find($validated['internship_id']);
            $internship->decrement('slot_count');
            Log::info('Internship slot count decreased', ['new_count' => $internship->slot_count]);

        } catch (\Exception $e) {
            Log::error('Error in placement approval', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error creating placement: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'Student placement approved successfully',
            'placement' => $placement
        ]);
    }

    /**
     * Reject student placement
     */
    public function rejectPlacement(Request $request, Student $student)
    {
        $validated = $request->validate([
            'internship_id' => 'required|exists:internships,id',
            'compatibility_score' => 'required|numeric|min:0|max:100',
            'admin_notes' => 'required|string|max:500',
        ]);

        // Check if student already has a placement
        $existingPlacement = Placement::where('student_id', $student->id)->first();
        if ($existingPlacement) {
            return response()->json([
                'message' => 'Student already has a placement'
            ], 400);
        }

        // Create placement record with rejected status
        $placement = Placement::create([
            'student_id' => $student->id,
            'internship_id' => $validated['internship_id'],
            'status' => 'rejected',
            'compatibility_score' => $validated['compatibility_score'],
            'admin_notes' => $validated['admin_notes'],
        ]);

        return response()->json([
            'message' => 'Student placement rejected',
            'placement' => $placement
        ]);
    }
}
