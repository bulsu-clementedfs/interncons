<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'student_number',
        'first_name',
        'last_name',
        'middle_name',
        'phone',
        'section',
        'specialization',
        'address',
        'birth_date',
        'is_submit',
        'is_active',
        'is_placed',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(StudentScore::class);
    }

    public function matches(): HasMany
    {
        return $this->hasMany(StudentMatch::class);
    }

    public function placement(): HasMany
    {
        return $this->hasMany(Placement::class);
    }
}
