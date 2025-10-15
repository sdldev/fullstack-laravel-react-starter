<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Demo: Support flash messages via query parameter for testing
        if ($request->has('demo_flash')) {
            $type = $request->get('demo_flash');
            $messages = [
                'success' => 'Success! The operation completed successfully.',
                'error' => 'Error! Something went wrong.',
                'info' => 'Info: Here is some important information.',
                'warning' => 'Warning: Please be careful with this action.',
            ];

            if (isset($messages[$type])) {
                return redirect()->route('admin.dashboard')
                    ->with($type, $messages[$type]);
            }
        }

        return Inertia::render('admin/dashboard', [
            'breadcrumbs' => [
                ['title' => 'Dashboard', 'href' => route('admin.dashboard')],
            ],
        ]);
    }
}
