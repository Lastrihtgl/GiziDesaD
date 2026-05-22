<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Membatasi akses route berdasarkan role pengguna yang sedang login.
     *
     * Contoh:
     * role:admin_desa
     * role:kader
     * role:bidan
     * role:admin_desa,bidan
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $userRole = $this->normalizeRole($user->role ?? null);

        $allowedRoles = array_map(function ($role) {
            return $this->normalizeRole($role);
        }, $roles);

        if (!in_array($userRole, $allowedRoles, true)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk menggunakan fitur ini.',
            ], 403);
        }

        return $next($request);
    }

    private function normalizeRole(?string $role): string
    {
        if (!$role) {
            return '';
        }

        $value = strtolower(trim($role));

        $roleMap = [
            'admin' => 'admin_desa',
            'admin_desa' => 'admin_desa',

            'kader' => 'kader',
            'kader_desa' => 'kader',
            'kader_posyandu' => 'kader',

            'bidan' => 'bidan',
            'bidan_desa' => 'bidan',
        ];

        return $roleMap[$value] ?? $value;
    }
}