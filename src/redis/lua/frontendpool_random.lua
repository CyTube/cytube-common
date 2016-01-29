-- KEYS[1]: Secure pool name
-- KEYS[2]: Non-secure pool name
-- ARGV[1]: Hash code (or random number) for selecting config
-- ARGV[2]: Current timestamp minus timeout period
-- return: possibly empty list of JSON objects representing connection config

local expiration = tonumber(ARGV[2])

local function getConfigs(pool)
  local response = redis.call('hgetall', pool)
  local configs = {}
  for i = 1, #response, 2 do
    local uuid = response[i]
    local entry = response[i+1]
    local decoded = cjson.decode(entry)
    local timestamp = decoded['lastUpdated']
    if timestamp < expiration then
      -- Expired, remove from pool
      redis.call('hdel', pool, uuid)
    else
      decoded['lastUpdated'] = nil
      configs[#configs + 1] = decoded
    end
  end
  return configs
end

local secureConfigs = getConfigs(KEYS[1])
local insecureConfigs = getConfigs(KEYS[2])
local combined = {}
local hashCode = tonumber(ARGV[1])
if #secureConfigs > 0 then
  combined[#combined + 1] = secureConfigs[hashCode % #secureConfigs + 1]
end
if #insecureConfigs > 0 then
  combined[#combined + 1] = insecureConfigs[hashCode % #insecureConfigs + 1]
end
return cjson.encode(combined)
