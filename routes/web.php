<?php

use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AdviserController;
use App\Http\Controllers\HTEController;
use App\Models\Question;
use App\Models\SubCategory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/about', function () {
    return Inertia::render('about');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
    Route::get('student', function () {
        return redirect()->route('student-list');
    })->name('student');
    Route::get('student/list', [StudentController::class, 'index'])->name('student-list');
    Route::get('student/{student}/edit', [StudentController::class, 'edit'])->name('student.edit');
    Route::put('student/{student}', [StudentController::class, 'update'])->name('student.update');
    Route::patch('student/{student}/archive', [StudentController::class, 'archive'])->name('student.archive');

    Route::get('student/matched', [StudentController::class, 'getMatchedStudents'])->name('student-matched');
    
    Route::get('student/{student}/details', [StudentController::class, 'getStudentDetails'])->name('student.details');
    Route::post('student/{student}/approve-placement', [StudentController::class, 'approvePlacement'])->name('student.approve-placement');
    Route::post('student/{student}/reject-placement', [StudentController::class, 'rejectPlacement'])->name('student.reject-placement');

    Route::get('student/placed', function () {
        $placedStudents = \App\Models\Placement::with(['student', 'internship.hte'])
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('admin/student/placed', [
            'placedStudents' => $placedStudents
        ]);
    })->name('student-placed');

    Route::get('hte', function () {
        return Inertia::render('admin/hte');
    })->name('hte');

    Route::get('placement', function () {
        return Inertia::render('admin/placement');
    })->name('placement');

    Route::get('report', function () {
        return Inertia::render('admin/report');
    })->name('report');
});

Route::middleware(['auth', 'verified', 'role:hte'])->group(function () {
    Route::get('form', [App\Http\Controllers\HTEController::class, 'showForm'])->name('form');
    Route::post('hte/submit', [App\Http\Controllers\HTEController::class, 'submit'])->name('hte.submit');
    Route::get('hte/categories', [App\Http\Controllers\HTEController::class, 'getCategoriesForCriteria'])->name('hte.categories');
    Route::get('hte/profile', [App\Http\Controllers\HTEController::class, 'profile'])->name('hte.profile');
    Route::get('hte/dashboard', [App\Http\Controllers\HTEController::class, 'dashboard'])->name('hte.dashboard');
    Route::get('hte/check-existing', [App\Http\Controllers\HTEController::class, 'checkExistingHTE'])->name('hte.check-existing');
    
    // Add Internship routes (only accessible after HTE form submission)
    Route::get('hte/add-internship', [App\Http\Controllers\HTEController::class, 'showAddInternship'])->name('hte.add-internship');
    Route::post('hte/add-internship', [App\Http\Controllers\HTEController::class, 'storeInternship'])->name('hte.store-internship');
    
    // Edit Internship routes
    Route::get('hte/edit-internship/{id}', [App\Http\Controllers\HTEController::class, 'showEditInternship'])->name('hte.edit-internship');
    Route::put('hte/edit-internship/{id}', [App\Http\Controllers\HTEController::class, 'updateInternship'])->name('hte.update-internship');
    
    // Toggle Internship Status
    Route::patch('hte/internship/{id}/toggle-status', [App\Http\Controllers\HTEController::class, 'toggleInternshipStatus'])->name('hte.toggle-internship-status');

    // View Internship Details
    Route::get('hte/internship/{id}', [App\Http\Controllers\HTEController::class, 'showInternship'])->name('hte.internship-profile');

});



Route::middleware(['auth', 'verified', 'role:adviser'])->group(function () {
    Route::get('adviser/dashboard', [AdviserController::class, 'dashboard'])->name('adviser.dashboard');
    Route::get('students', [AdviserController::class, 'getStudents'])->name('students');
    Route::get('application', [AdviserController::class, 'index'])->name('application');
    Route::post('application/approve', [AdviserController::class, 'approveStudents'])->name('application.approve');
    Route::post('application/reject', [AdviserController::class, 'rejectStudents'])->name('application.reject');
    Route::post('application/remove-access', [AdviserController::class, 'removeStudentAccess'])->name('application.remove-access');
    Route::post('application/undo', [AdviserController::class, 'undoAction'])->name('application.undo');
});

Route::group(['middleware' => ['auth', 'verified', 'role:student']], function () {
        Route::get('student/matches', function () {
            $user = Auth::user();
            $student = $user->student;
            
            if (!$student) {
                return Inertia::render('student/matches', [
                    'student' => null,
                    'matches' => []
                ]);
            }

            // Get student's matches with internships
            $matches = \App\Models\StudentMatch::where('student_id', $student->id)
                ->with(['internship.hte:id,company_name,company_address'])
                ->orderBy('rank', 'asc')
                ->get();

            return Inertia::render('student/matches', [
                'student' => $student,
                'matches' => $matches
            ]);
        })->name('student.matches');

        Route::get('dashboard', function () {
        $user = Auth::user();
        $student = $user->student;
        
        if (!$student) {
            return Inertia::render('student/dashboard', [
                'student' => null,
                'performance' => null,
                'possibleInternships' => [],
                'currentMatch' => null,
                'hasSubmitted' => false
            ]);
        }

        // Check if student has submitted the assessment
        if (!$student->is_submit) {
            return Inertia::render('student/dashboard', [
                'student' => $student,
                'performance' => null,
                'possibleInternships' => [],
                'currentMatch' => null,
                'hasSubmitted' => false
            ]);
        }

        // Get student's scores by category
        $categories = \App\Models\Category::with(['subCategories' => function ($query) use ($student) {
            $query->with(['studentScores' => function ($scoreQuery) use ($student) {
                $scoreQuery->where('student_id', $student->id);
            }]);
        }])->get();

        // Calculate overall performance metrics
        $totalScore = 0;
        $totalQuestions = 0;
        $categoryScores = [];

        foreach ($categories as $category) {
            $categoryScore = 0;
            $categoryQuestions = 0;
            
            foreach ($category->subCategories as $subcategory) {
                $score = $subcategory->studentScores->first();
                if ($score) {
                    $categoryScore += $score->score;
                    $categoryQuestions++;
                    $totalScore += $score->score;
                    $totalQuestions++;
                }
            }
            
            if ($categoryQuestions > 0) {
                $categoryScores[] = [
                    'name' => $category->category_name,
                    'average_score' => round($categoryScore / $categoryQuestions, 2),
                    'questions_count' => $categoryQuestions
                ];
            }
        }

        $overallAverage = $totalQuestions > 0 ? round($totalScore / $totalQuestions, 2) : 0;

        // Get possible internships with compatibility scores
        $matchingService = new \App\Services\MatchingService();
        $possibleInternships = $matchingService->getTopCompatibleInternships($student);
        
        $possibleInternships = $possibleInternships->map(function ($item) {
            $internship = $item['internship'];
            return [
                'id' => $internship->id,
                'position_title' => $internship->position_title,
                'company_name' => $internship->hte->company_name,
                'department' => $internship->department,
                'slot_count' => $internship->slot_count,
                'is_active' => $internship->is_active,
                'compatibility_score' => $item['compatibility_score'],
            ];
        });

        // Get student's match status
        $studentMatch = \App\Models\StudentMatch::where('student_id', $student->id)
            ->with(['internship.hte:id,company_name'])
            ->first();

        $currentMatch = $studentMatch ? [
            'id' => $studentMatch->id,
            'internship' => [
                'position_title' => $studentMatch->internship->position_title,
                'company_name' => $studentMatch->internship->hte->company_name,
            ],
            'match_score' => $studentMatch->compatibility_score ?? 0,
            'status' => $studentMatch->status ?? 'pending',
        ] : null;

        return Inertia::render('student/dashboard', [
            'student' => $student,
            'performance' => [
                'overall_average' => $overallAverage,
                'total_questions' => $totalQuestions,
                'category_scores' => $categoryScores,
            ],
            'possibleInternships' => $possibleInternships,
            'currentMatch' => $currentMatch,
            'hasSubmitted' => true
        ]);
    })->name('student.dashboard');

    Route::get('assessment', function () {
        $subcategories = SubCategory::with(['questions' => function ($query) {
            $query->where('access', 'student');
        }])->get();

        // Check if the authenticated user's student record has already submitted the assessment
        $student = Auth::user()->student;
        $hasSubmitted = $student ? $student->is_submit : false;

//        $questions = Question::all()->where('access', 'student');
        return Inertia::render('student/assessment', [
            'subcategories' => $subcategories,
            'hasSubmitted' => $hasSubmitted
        ]);
    })->name('assessment');

    Route::get('student-profile', function () {
        $user = Auth::user();
        $student = $user->student;
        
        if (!$student) {
            return Inertia::render('student/profile', [
                'student' => null,
                'categories' => []
            ]);
        }

        // Check if student has submitted the assessment
        if (!$student->is_submit) {
            return Inertia::render('student/profile', [
                'student' => $student,
                'categories' => [],
                'hasSubmitted' => false
            ]);
        }

        // Get all categories with their subcategories and scores
        $categories = \App\Models\Category::with(['subCategories' => function ($query) use ($student) {
            $query->with(['studentScores' => function ($scoreQuery) use ($student) {
                $scoreQuery->where('student_id', $student->id);
            }]);
        }])->get();

        // Transform the data to match frontend expectations
        $transformedCategories = $categories->map(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->category_name,
                'subcategories' => $category->subCategories->map(function ($subcategory) {
                    $score = $subcategory->studentScores->first();
                    return [
                        'id' => $subcategory->id,
                        'name' => $subcategory->subcategory_name,
                        'score' => $score ? round($score->score, 2) : 0,
                    ];
                })->toArray()
            ];
        })->toArray();

        return Inertia::render('student/profile', [
            'student' => $student,
            'categories' => $transformedCategories,
            'hasSubmitted' => true
        ]);
    })->name('profile');

    Route::post('assessment', [AssessmentController::class, 'store'])->name('assessment.store');
    Route::get('assessment/language-proficiency', [AssessmentController::class, 'getLanguageProficiency'])->name('assessment.language-proficiency');
    Route::get('assessment/technical-skills', [AssessmentController::class, 'getTechnicalSkills'])->name('assessment.technical-skills');
    Route::get('assessment/soft-skills', [AssessmentController::class, 'getSoftSkills'])->name('assessment.soft-skills');
});

Route::get('/api/categories-with-subcategories', function () {
    $categories = \App\Models\Category::with(['subCategories.questions' => function($query) {
        $query->where('is_active', true);
    }])->get();
    
    return response()->json($categories);
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
