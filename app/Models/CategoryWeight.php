<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryWeight extends Model
{
    use HasFactory;

    protected $table = 'category_weights';

    protected $fillable = [
        'h_t_e_id',
        'category_id',
        'weight',
    ];

    public function hte(): BelongsTo
    {
        return $this->belongsTo(HTE::class, 'h_t_e_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
