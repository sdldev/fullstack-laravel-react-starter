<?php

use App\Services\CacheService;

test('cache_service helper returns CacheService instance', function () {
    $cacheService = cache_service();

    expect($cacheService)->toBeInstanceOf(CacheService::class);
});

test('cache_service helper returns the same instance on multiple calls', function () {
    $instance1 = cache_service();
    $instance2 = cache_service();

    expect($instance1)->toBe($instance2);
});

test('cache_service helper provides access to CacheService methods', function () {
    $cacheService = cache_service();

    // Check that key methods are available
    expect($cacheService)->toHaveMethod('supportsTags');
    expect($cacheService)->toHaveMethod('usersListKey');
    expect($cacheService)->toHaveMethod('rememberUsersList');
    expect($cacheService)->toHaveMethod('clearUsersList');
});

test('cache_service can generate users list key', function () {
    $key = cache_service()->usersListKey(1, 15);

    expect($key)->toBe('users_list_page_1_per_15');
});

test('cache_service supportsTags method returns boolean', function () {
    $result = cache_service()->supportsTags();

    expect($result)->toBeBool();
});
