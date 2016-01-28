export const FRONTEND_POOL = 'frontend-hosts';
export const FRONTEND_POOL_SECURE = 'frontend-hosts-secure';

class FrontendPool {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
}

export FrontendPool
