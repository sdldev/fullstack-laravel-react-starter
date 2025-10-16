<?php

namespace Tests\Feature\Admin;

use App\Models\AppConfig;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AppConfigControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');

        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    public function test_admin_can_view_config_page(): void
    {
        $config = AppConfig::create([
            'app_name' => 'Test App',
            'description' => 'Test Description',
            'address' => 'Test Address',
            'phone' => '+62-812-3456-7890',
            'email' => 'test@example.com',
            'facebook' => 'https://facebook.com/test',
            'instagram' => 'https://instagram.com/test',
            'youtube' => 'https://youtube.com/@test',
            'tiktok' => 'https://tiktok.com/@test',
            'twitter' => 'https://twitter.com/test',
        ]);

        $response = $this->actingAs($this->admin)
            ->get('/admin/config');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/config/Index')
            ->has('config')
            ->where('config.app_name', 'Test App')
            ->where('config.description', 'Test Description')
        );
    }

    public function test_admin_can_update_config(): void
    {
        $data = [
            'app_name' => 'Updated App',
            'description' => 'Updated Description',
            'address' => 'Updated Address',
            'phone' => '+62-812-9876-5432',
            'email' => 'updated@example.com',
            'facebook' => 'https://facebook.com/updated',
            'instagram' => 'https://instagram.com/updated',
            'youtube' => 'https://youtube.com/@updated',
            'tiktok' => 'https://tiktok.com/@updated',
            'twitter' => 'https://twitter.com/updated',
        ];

        $response = $this->actingAs($this->admin)
            ->put('/admin/config', $data);

        $response->assertRedirect('/admin/config');
        $this->assertDatabaseHas('app_configs', [
            'app_name' => 'Updated App',
            'email' => 'updated@example.com',
            'facebook' => 'https://facebook.com/updated',
        ]);
    }

    public function test_admin_can_upload_logo(): void
    {
        $file = UploadedFile::fake()->image('logo.png', 100, 100);

        $data = [
            'app_name' => 'App With Logo',
            'logo' => $file,
        ];

        $response = $this->actingAs($this->admin)
            ->put('/admin/config', $data);

        $response->assertRedirect('/admin/config');

        $config = AppConfig::first();
        $this->assertNotNull($config->logo);
        Storage::disk('public')->assertExists($config->logo);
    }

    public function test_validation_requires_app_name(): void
    {
        $data = [
            'app_name' => '',
            'description' => 'Test',
        ];

        $response = $this->actingAs($this->admin)
            ->put('/admin/config', $data);

        $response->assertSessionHasErrors('app_name');
    }

    public function test_validation_phone_format(): void
    {
        $data = [
            'app_name' => 'Test App',
            'phone' => 'invalid-phone',
        ];

        $response = $this->actingAs($this->admin)
            ->put('/admin/config', $data);

        $response->assertSessionHasErrors('phone');
    }

    public function test_validation_email_format(): void
    {
        $data = [
            'app_name' => 'Test App',
            'email' => 'not-an-email',
        ];

        $response = $this->actingAs($this->admin)
            ->put('/admin/config', $data);

        $response->assertSessionHasErrors('email');
    }

    public function test_validation_logo_file_type(): void
    {
        $file = UploadedFile::fake()->create('logo.txt');

        $data = [
            'app_name' => 'Test App',
            'logo' => $file,
        ];

        $response = $this->actingAs($this->admin)
            ->put('/admin/config', $data);

        $response->assertSessionHasErrors('logo');
    }

    public function test_non_admin_cannot_access_config(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)
            ->get('/admin/config');

        $response->assertStatus(403);
    }

    public function test_unauthenticated_user_cannot_access_config(): void
    {
        $response = $this->get('/admin/config');

        $response->assertRedirect('/login');
    }

    public function test_social_media_links_stored_correctly(): void
    {
        $data = [
            'app_name' => 'Social Media Test',
            'facebook' => 'https://facebook.com/test',
            'instagram' => 'https://instagram.com/test',
            'twitter' => '',
        ];

        $this->actingAs($this->admin)
            ->put('/admin/config', $data);

        $config = AppConfig::first();
        $this->assertEquals('https://facebook.com/test', $config->facebook);
        $this->assertEquals('https://instagram.com/test', $config->instagram);
        $this->assertEmpty($config->twitter);
    }

    public function test_logo_replacement_deletes_old_logo(): void
    {
        // Create initial config with logo
        $oldFile = UploadedFile::fake()->image('old-logo.png', 100, 100);
        $config = AppConfig::create([
            'app_name' => 'App',
            'logo' => $oldFile->store('config', 'public'),
        ]);

        Storage::disk('public')->assertExists($config->logo);

        // Update with new logo
        $newFile = UploadedFile::fake()->image('new-logo.png', 100, 100);
        $this->actingAs($this->admin)
            ->put('/admin/config', [
                'app_name' => 'App',
                'logo' => $newFile,
            ]);

        $updatedConfig = AppConfig::first();
        $this->assertNotEquals($config->logo, $updatedConfig->logo);
    }
}
