import Promise from 'bluebird';
import net from 'net';
import ipUtil from 'ip';

const REPUTATIONS_TABLE = 'ip_reputation';

const REPUTATION_DEFAULT = 'DEFAULT';
const REPUTATION_BLACKLISTED = 'BLACKLISTED';
const REPUTATION_WHITELISTED = 'WHITELISTED';
const VALID_REPUTATIONS = [
    REPUTATION_DEFAULT,
    REPUTATION_WHITELISTED,
    REPUTATION_BLACKLISTED
];

const ADDRESS_WIDTH_IPV4 = 32;
const ADDRESS_WIDTH_IPV6 = 128;
const IPV4_OFFSET = 17 - 4;
const IPV6_OFFSET = 17 - 16;

function convertIPToBinary(ip) {
    const buf = new Buffer(17);
    buf.fill(0);
    const family = net.isIP(ip);

    if (family === 4) {
        ipUtil.toBuffer(ip, buf, IPV4_OFFSET);
    } else if (family === 6) {
        ipUtil.toBuffer(ip, buf, IPV6_OFFSET);
    } else {
        throw new Error(`Invalid IP address "${ip}"`);
    }

    buf[0] = family;

    return buf;
}

function createDefault(binaryIP) {
    const now = new Date();
    return {
        ip_start: binaryIP,
        ip_end: binaryIP,
        subnet_width: binaryIP[0] === 6 ? ADDRESS_WIDTH_IPV6 : ADDRESS_WIDTH_IPV4,
        reputation: REPUTATION_DEFAULT,
        first_seen: now,
        last_seen: now,
        auto_delete: true,
        _new: true
    };
}

module.exports = function ipReputationInit(knex) {
    return {
        lookupIP: function lookupIP(ip) {
            const binaryIP = convertIPToBinary(ip);
            return knex(REPUTATIONS_TABLE)
                    .where('ip_start', '<=', binaryIP)
                    .where('ip_end',   '>=', binaryIP)
                    .orderBy('subnet_width', 'desc')
                    .limit(1)
                    .select()
                    .then(rows => {
                if (rows.length === 0) {
                    return createDefault(binaryIP);
                } else {
                    return rows[0];
                }
            });
        },

        createForCIDR: function createForCIDR(cidr, options) {
            const cidrSubnet = ipUtil.cidrSubnet(cidr);
            const startAddress = convertToBinary(cidrSubnet.networkAddress);
            const endAddress = convertToBinary(cidrSubnet.broadcastAddress);
            const subnetWidth = cidrSubnet.subnetMaskLength;
            const reputation = createDefault(startAddress);
            reputation.ip_end = endAddress;
            reputation.subnet_width = subnetWidth;
            Object.assign(reputation, options);

            return reputation;
        },

        checkEnum: function checkEnum(value) {
            if (VALID_REPUTATIONS.indexOf(value) < 0) {
                return Promise.reject(new Error(`Invalid reputation "${value}"`));
            } else {
                return Promise.resolve();
            }
        },

        save: function save(reputation) {
            return this.checkEnum(reputation.reputation)
                    .then(() => {
                const insert = Boolean(reputation._new);
                if (reputation._new) {
                    delete reputation._new;
                    return this.insert(reputation);
                } else {
                    return this.update(reputation);
                }
            });
        },

        insert: function insert(reputation) {
            reputation.last_seen = reputation.first_seen = new Date();
            return knex(REPUTATIONS_TABLE)
                    .insert(reputation)
                    .then(() => {
                return reputation;
            });
        },

        update: function update(reputation) {
            const query = knex(REPUTATIONS_TABLE)
                    .where({
                        ip_start: reputation.ip_start,
                        ip_end: reputation.ip_end
                    });
            const lastSeen = new Date();
            return query.update({
                reputation: reputation.reputation,
                last_seen: lastSeen
            }).then(() => {
                reputation.last_seen = lastSeen;
                return reputation;
            });
        },

        REPUTATION_DEFAULT: REPUTATION_DEFAULT,
        REPUTATION_BLACKLISTED: REPUTATION_BLACKLISTED,
        REPUTATION_WHITELISTED: REPUTATION_WHITELISTED
    }
};
