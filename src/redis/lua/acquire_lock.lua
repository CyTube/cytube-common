-- KEYS = { lockKey }
-- ARGV = { lockValue, expiration }
-- Returns: { was the lock key overwritten, old value in the lock }
-- Retrieve the current value in the lock key, then attempt to overwrite it.
-- If it was overwritten, or if the value matches the lock value, then update
-- the expiration.
local oldValue = redis.call('get', KEYS[1])
local changed = redis.call('setnx', KEYS[1], ARGV[1])

if changed or oldValue == ARGV[1] then
    redis.call('expire', KEYS[1], ARGV[2])
end

return { changed, oldValue }
