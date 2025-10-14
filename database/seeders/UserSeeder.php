<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Super User',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'image' => 'default.png',
            'role' => 'admin',
            'is_active' => 'true',
            'member_number' => 'M0001',
            'full_name' => 'Super Admin',
            'address' => 'Jl. Super Admin No. 1',
            'phone' => '081234567890',
            'join_date' => now(),
            'note' => 'This is a super admin user',

        ]);

        // Create 50 regular users
        for ($i = 1; $i <= 40; $i++) {
            $faker = \Faker\Factory::create('id_ID');
            $genders = ['L', 'P'];
            $gender = $faker->randomElement($genders);
            $firstName = $gender === 'L' ? $faker->firstNameMale : $faker->firstNameFemale;
            $lastName = $faker->lastName;
            $firstName = $gender === 'L' ? $faker->firstNameMale : $faker->firstNameFemale;
            $lastName = $faker->lastName;

            User::create([
                'name' => $firstName.' '.$lastName,
                'email' => 'user'.$i.'@santrimu.com',
                'password' => Hash::make('inipasswordnya'),
                'image' => 'default.png',
                'role' => 'user',
                'is_active' => 'true',
                'member_number' => 'M'.str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'full_name' => $firstName.' '.$lastName,
                'address' => $faker->address,
                'phone' => $faker->phoneNumber,
                'join_date' => $faker->date(),
                'note' => 'This is user number '.$i,
            ]);
        }

    }
}
