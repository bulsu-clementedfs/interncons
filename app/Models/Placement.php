<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Placement extends Model
{
    use HasFactory;

    // Configure for composite primary key
    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'student_id',
        'internship_id',
        'status',
        'compatibility_score',
        'admin_notes',
        'placement_date',
    ];

    protected $casts = [
        'placement_date' => 'datetime',
        'compatibility_score' => 'decimal:2',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class);
    }
}
