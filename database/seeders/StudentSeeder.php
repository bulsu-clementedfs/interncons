<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = [
            [
                'student_number' => '2021-0001',
                'first_name' => 'Juan',
                'middle_name' => 'Santos',
                'last_name' => 'Dela Cruz',
                'phone' => '09123456789',
                'section' => 'BSIT-4A',
                'specialization' => 'Web Dev',
                'address' => '123 Main St, Manila',
                'birth_date' => '2000-05-15',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0002',
                'first_name' => 'Maria',
                'middle_name' => 'Garcia',
                'last_name' => 'Santos',
                'phone' => '09123456790',
                'section' => 'BSIT-4B',
                'specialization' => 'Mobile Dev',
                'address' => '456 Oak Ave, Quezon City',
                'birth_date' => '2000-08-20',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0003',
                'first_name' => 'Pedro',
                'middle_name' => 'Lopez',
                'last_name' => 'Gonzales',
                'phone' => '09123456791',
                'section' => 'BSIT-4A',
                'specialization' => 'Data',
                'address' => '789 Pine St, Makati',
                'birth_date' => '2000-03-10',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0004',
                'first_name' => 'Ana',
                'middle_name' => 'Reyes',
                'last_name' => 'Martinez',
                'phone' => '09123456792',
                'section' => 'BSIT-4C',
                'specialization' => 'Cyber',
                'address' => '321 Elm St, Taguig',
                'birth_date' => '2000-11-25',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0005',
                'first_name' => 'Carlos',
                'middle_name' => 'Torres',
                'last_name' => 'Fernandez',
                'phone' => '09123456793',
                'section' => 'BSIT-4B',
                'specialization' => 'AI',
                'address' => '654 Maple St, Pasig',
                'birth_date' => '2000-07-05',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
        ];

        foreach ($students as $studentData) {
            // Create a user account for each student
            $user = User::create([
                'username' => strtolower($studentData['first_name']) . '.' . strtolower($studentData['last_name']),
                'email' => strtolower($studentData['first_name']) . '.' . strtolower($studentData['last_name']) . '@student.edu',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'verified',
            ]);

            // Assign student role
            $user->assignRole('student');

            // Create student record
            Student::create([
                'user_id' => $user->id,
                'student_number' => $studentData['student_number'],
                'first_name' => $studentData['first_name'],
                'middle_name' => $studentData['middle_name'],
                'last_name' => $studentData['last_name'],
                'phone' => $studentData['phone'],
                'section' => $studentData['section'],
                'specialization' => $studentData['specialization'],
                'address' => $studentData['address'],
                'birth_date' => $studentData['birth_date'],
                'is_active' => $studentData['is_active'],
                'is_submit' => $studentData['is_submit'],
                'is_placed' => $studentData['is_placed'],
            ]);
        }
    }
}
