<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ExtendedStudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define additional students with diverse backgrounds
        $additionalStudents = [
            [
                'student_number' => '2021-0006',
                'first_name' => 'Alex',
                'middle_name' => 'Ming',
                'last_name' => 'Chen',
                'phone' => '09123456794',
                'section' => 'BSIT-4A',
                'specialization' => 'Web Dev',
                'address' => '123 Tech Street, Quezon City',
                'birth_date' => '2003-05-15',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0007',
                'first_name' => 'Maria',
                'middle_name' => 'Clara',
                'last_name' => 'Santos',
                'phone' => '09123456795',
                'section' => 'BSIT-4B',
                'specialization' => 'Mobile Dev',
                'address' => '456 Innovation Ave, Makati City',
                'birth_date' => '2002-08-22',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0008',
                'first_name' => 'James',
                'middle_name' => 'Robert',
                'last_name' => 'Wilson',
                'phone' => '09123456796',
                'section' => 'BSIT-4C',
                'specialization' => 'Data',
                'address' => '789 Data Drive, Taguig City',
                'birth_date' => '2003-03-10',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0009',
                'first_name' => 'Sophia',
                'middle_name' => 'Isabella',
                'last_name' => 'Garcia',
                'phone' => '09123456797',
                'section' => 'BSIT-4A',
                'specialization' => 'Cyber',
                'address' => '321 Creative Lane, Pasig City',
                'birth_date' => '2002-11-18',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0010',
                'first_name' => 'David',
                'middle_name' => 'Joon',
                'last_name' => 'Kim',
                'phone' => '09123456798',
                'section' => 'BSIT-4B',
                'specialization' => 'AI',
                'address' => '654 Security Blvd, Mandaluyong City',
                'birth_date' => '2003-01-25',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0011',
                'first_name' => 'Emma',
                'middle_name' => 'Carmen',
                'last_name' => 'Rodriguez',
                'phone' => '09123456799',
                'section' => 'BSIT-4C',
                'specialization' => 'Web Dev',
                'address' => '987 Design Court, San Juan City',
                'birth_date' => '2002-07-14',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0012',
                'first_name' => 'Michael',
                'middle_name' => 'Andrew',
                'last_name' => 'Thompson',
                'phone' => '09123456800',
                'section' => 'BSIT-4A',
                'specialization' => 'Mobile Dev',
                'address' => '147 Analytics Way, Marikina City',
                'birth_date' => '2003-09-30',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0013',
                'first_name' => 'Isabella',
                'middle_name' => 'Sofia',
                'last_name' => 'Martinez',
                'phone' => '09123456801',
                'section' => 'BSIT-4B',
                'specialization' => 'Data',
                'address' => '258 Cloud Street, Caloocan City',
                'birth_date' => '2002-12-05',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0014',
                'first_name' => 'Christopher',
                'middle_name' => 'Min',
                'last_name' => 'Lee',
                'phone' => '09123456802',
                'section' => 'BSIT-4C',
                'specialization' => 'Cyber',
                'address' => '369 Mobile Road, Malabon City',
                'birth_date' => '2003-04-12',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0015',
                'first_name' => 'Olivia',
                'middle_name' => 'Grace',
                'last_name' => 'Brown',
                'phone' => '09123456803',
                'section' => 'BSIT-4A',
                'specialization' => 'AI',
                'address' => '741 Game Avenue, Navotas City',
                'birth_date' => '2002-06-28',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0016',
                'first_name' => 'Daniel',
                'middle_name' => 'William',
                'last_name' => 'Taylor',
                'phone' => '09123456804',
                'section' => 'BSIT-4B',
                'specialization' => 'Web Dev',
                'address' => '852 Blockchain Drive, Valenzuela City',
                'birth_date' => '2003-02-17',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0017',
                'first_name' => 'Ava',
                'middle_name' => 'Rose',
                'last_name' => 'Anderson',
                'phone' => '09123456805',
                'section' => 'BSIT-4C',
                'specialization' => 'Mobile Dev',
                'address' => '963 IoT Lane, Parañaque City',
                'birth_date' => '2002-10-08',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0018',
                'first_name' => 'Ethan',
                'middle_name' => 'James',
                'last_name' => 'Jackson',
                'phone' => '09123456806',
                'section' => 'BSIT-4A',
                'specialization' => 'Data',
                'address' => '159 Pipeline Road, Las Piñas City',
                'birth_date' => '2003-07-19',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0019',
                'first_name' => 'Mia',
                'middle_name' => 'Elizabeth',
                'last_name' => 'White',
                'phone' => '09123456807',
                'section' => 'BSIT-4B',
                'specialization' => 'Cyber',
                'address' => '357 Frontend Street, Muntinlupa City',
                'birth_date' => '2002-05-03',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ],
            [
                'student_number' => '2021-0020',
                'first_name' => 'Andrew',
                'middle_name' => 'Thomas',
                'last_name' => 'Harris',
                'phone' => '09123456808',
                'section' => 'BSIT-4C',
                'specialization' => 'AI',
                'address' => '486 Backend Boulevard, Pasay City',
                'birth_date' => '2003-08-26',
                'is_active' => true,
                'is_submit' => false,
                'is_placed' => false,
            ]
        ];

        // Create additional students
        foreach ($additionalStudents as $studentData) {
            // Check if student already exists
            $existingStudent = Student::where('student_number', $studentData['student_number'])->first();
            
            if (!$existingStudent) {
                // Create a user account for each student
                $user = User::create([
                    'username' => 'ext_' . strtolower($studentData['first_name']) . '.' . strtolower($studentData['last_name']) . '_' . $studentData['student_number'],
                    'email' => 'ext_' . strtolower($studentData['first_name']) . '.' . strtolower($studentData['last_name']) . '@student.edu',
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

        $this->command->info('Extended student data seeded successfully!');
    }
}
