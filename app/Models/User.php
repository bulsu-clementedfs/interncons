<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'status',
        'email_verification_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function student(): HasOne|User
    {
        return $this->hasOne(Student::class);
    }

    public function academeAccounts(): HasMany
    {
        return $this->hasMany(AcademeAccount::class);
    }

    public function studentAcademeAccounts(): HasMany
    {
        return $this->hasMany(AcademeAccount::class)->whereHas('user.roles', function($q) {
            $q->where('name', 'student');
        });
    }

    public function hte(): HasOne
    {
        return $this->hasOne(HTE::class, 'user_id');
    }

    public function adviser(): HasOne
    {
        return $this->hasOne(Adviser::class);
    }

    /**
     * Check if the user is a student
     */
    public function isStudent(): bool
    {
        return $this->hasRole('student');
    }

    /**
     * Check if the user requires email verification
     * Only students require email verification
     */
    public function requiresEmailVerification(): bool
    {
        return $this->isStudent();
    }
}
