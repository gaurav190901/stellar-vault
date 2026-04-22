#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    VaultToken,
    PaymentToken,
    Tier(u32),
    Subscription(Address, u32),
    TierCount,
    TotalSubscribers,
    RewardRate,
}

#[contracttype]
#[derive(Clone)]
pub struct TierConfig {
    pub price: i128,
    pub duration_ledgers: u32,
    pub name: String,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub struct SubscriptionRecord {
    pub subscriber: Address,
    pub tier_id: u32,
    pub start_ledger: u32,
    pub expiry_ledger: u32,
    pub active: bool,
}

mod vault_token_iface {
    use soroban_sdk::{contractclient, Address, Env};
    #[contractclient(name = "VaultTokenClient")]
    pub trait VaultToken {
        fn mint(env: Env, to: Address, amount: i128);
    }
}

#[contract]
pub struct SubscriptionManager;

#[contractimpl]
impl SubscriptionManager {
    pub fn initialize(
        env: Env,
        admin: Address,
        vault_token: Address,
        payment_token: Address,
        reward_rate: i128,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::VaultToken, &vault_token);
        env.storage().instance().set(&DataKey::PaymentToken, &payment_token);
        env.storage().instance().set(&DataKey::RewardRate, &reward_rate);
        env.storage().instance().set(&DataKey::TierCount, &0u32);
        env.storage().instance().set(&DataKey::TotalSubscribers, &0u32);
    }

    pub fn create_tier(env: Env, name: String, price: i128, duration_ledgers: u32) -> u32 {
        let count: u32 = env.storage().instance().get(&DataKey::TierCount).unwrap_or(0);
        let tier = TierConfig { price, duration_ledgers, name, active: true };
        env.storage().persistent().set(&DataKey::Tier(count), &tier);
        env.storage().instance().set(&DataKey::TierCount, &(count + 1));
        count
    }

    pub fn update_tier(env: Env, tier_id: u32, price: i128, duration_ledgers: u32, active: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let mut tier: TierConfig = env
            .storage().persistent().get(&DataKey::Tier(tier_id))
            .expect("tier not found");
        tier.price = price;
        tier.duration_ledgers = duration_ledgers;
        tier.active = active;
        env.storage().persistent().set(&DataKey::Tier(tier_id), &tier);
    }

    pub fn subscribe(env: Env, subscriber: Address, tier_id: u32) {
        subscriber.require_auth();
        let tier: TierConfig = env
            .storage().persistent().get(&DataKey::Tier(tier_id))
            .expect("tier not found");
        if !tier.active { panic!("tier is not active"); }

        let payment_token: Address = env.storage().instance().get(&DataKey::PaymentToken).unwrap();
        let vault_token_addr: Address = env.storage().instance().get(&DataKey::VaultToken).unwrap();
        let reward_rate: i128 = env.storage().instance().get(&DataKey::RewardRate).unwrap_or(1);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();

        // Direct transfer: subscriber pays admin directly. No router, no intermediate balance.
        token::Client::new(&env, &payment_token).transfer(&subscriber, &admin, &tier.price);

        // Mint VAULT reward tokens to subscriber
        let reward_amount = tier.price * reward_rate / 10_000_000i128;
        if reward_amount > 0 {
            vault_token_iface::VaultTokenClient::new(&env, &vault_token_addr)
                .mint(&subscriber, &reward_amount);
        }

        let current_ledger = env.ledger().sequence();
        let expiry_ledger = current_ledger + tier.duration_ledgers;
        let record = SubscriptionRecord {
            subscriber: subscriber.clone(),
            tier_id,
            start_ledger: current_ledger,
            expiry_ledger,
            active: true,
        };
        let key = DataKey::Subscription(subscriber.clone(), tier_id);
        env.storage().persistent().set(&key, &record);
        env.storage().persistent().extend_ttl(&key, tier.duration_ledgers, tier.duration_ledgers * 2);
        let total: u32 = env.storage().instance().get(&DataKey::TotalSubscribers).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSubscribers, &(total + 1));
        env.events().publish((symbol_short!("subbed"), subscriber.clone()), (tier_id, expiry_ledger));
    }

    pub fn renew(env: Env, subscriber: Address, tier_id: u32) {
        subscriber.require_auth();
        let tier: TierConfig = env
            .storage().persistent().get(&DataKey::Tier(tier_id))
            .expect("tier not found");
        if !tier.active { panic!("tier is not active"); }
        let payment_token: Address = env.storage().instance().get(&DataKey::PaymentToken).unwrap();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        token::Client::new(&env, &payment_token).transfer(&subscriber, &admin, &tier.price);
        let key = DataKey::Subscription(subscriber.clone(), tier_id);
        let mut record: SubscriptionRecord = env
            .storage().persistent().get(&key)
            .expect("subscription not found");
        let current_ledger = env.ledger().sequence();
        let base = if record.expiry_ledger > current_ledger { record.expiry_ledger } else { current_ledger };
        record.expiry_ledger = base + tier.duration_ledgers;
        record.active = true;
        env.storage().persistent().set(&key, &record);
        env.storage().persistent().extend_ttl(&key, tier.duration_ledgers, tier.duration_ledgers * 2);
        env.events().publish((symbol_short!("renewed"), subscriber.clone()), (tier_id, record.expiry_ledger));
    }

    pub fn cancel(env: Env, subscriber: Address, tier_id: u32) {
        subscriber.require_auth();
        let key = DataKey::Subscription(subscriber.clone(), tier_id);
        let mut record: SubscriptionRecord = env
            .storage().persistent().get(&key)
            .expect("subscription not found");
        record.active = false;
        env.storage().persistent().set(&key, &record);
        env.events().publish((symbol_short!("cancelled"), subscriber.clone()), tier_id);
    }

    pub fn is_active(env: Env, subscriber: Address, tier_id: u32) -> bool {
        let key = DataKey::Subscription(subscriber.clone(), tier_id);
        match env.storage().persistent().get::<DataKey, SubscriptionRecord>(&key) {
            Some(r) => r.active && r.expiry_ledger >= env.ledger().sequence(),
            None => false,
        }
    }

    pub fn get_subscription(env: Env, subscriber: Address, tier_id: u32) -> SubscriptionRecord {
        env.storage().persistent()
            .get(&DataKey::Subscription(subscriber, tier_id))
            .expect("subscription not found")
    }

    pub fn get_tier(env: Env, tier_id: u32) -> TierConfig {
        env.storage().persistent().get(&DataKey::Tier(tier_id)).expect("tier not found")
    }

    pub fn get_tier_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TierCount).unwrap_or(0)
    }

    pub fn get_total_subscribers(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalSubscribers).unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        token::StellarAssetClient,
        Env, String,
    };

    #[soroban_sdk::contract]
    pub struct MockVault;
    #[soroban_sdk::contractimpl]
    impl MockVault {
        pub fn mint(_env: Env, _to: Address, _amount: i128) {}
    }

    fn setup() -> (Env, Address, Address, SubscriptionManagerClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let subscriber = Address::generate(&env);
        let vault_id = env.register_contract(None, MockVault);
        let payment_addr = env.register_stellar_asset_contract_v2(admin.clone()).address();
        StellarAssetClient::new(&env, &payment_addr).mint(&subscriber, &1_000_000_000i128);
        let sm_id = env.register_contract(None, SubscriptionManager);
        let client = SubscriptionManagerClient::new(&env, &sm_id);
        client.initialize(&admin, &vault_id, &payment_addr, &100i128);
        (env, admin, subscriber, client)
    }

    #[test]
    fn test_create_tier() {
        let (env, _, _, client) = setup();
        let id = client.create_tier(&String::from_str(&env, "Basic"), &10_000_000i128, &17280u32);
        assert_eq!(id, 0u32);
        assert_eq!(client.get_tier_count(), 1u32);
    }

    #[test]
    fn test_subscribe_flow() {
        let (env, _, subscriber, client) = setup();
        client.create_tier(&String::from_str(&env, "Basic"), &10_000_000i128, &17280u32);
        client.subscribe(&subscriber, &0u32);
        assert!(client.is_active(&subscriber, &0u32));
        assert_eq!(client.get_total_subscribers(), 1u32);
    }

    #[test]
    fn test_expired_inactive() {
        let (env, _, subscriber, client) = setup();
        client.create_tier(&String::from_str(&env, "Basic"), &10_000_000i128, &10u32);
        client.subscribe(&subscriber, &0u32);
        env.ledger().with_mut(|l| { l.sequence_number += 100; });
        assert!(!client.is_active(&subscriber, &0u32));
    }

    #[test]
    fn test_renew_extends() {
        let (env, _, subscriber, client) = setup();
        client.create_tier(&String::from_str(&env, "Basic"), &10_000_000i128, &17280u32);
        client.subscribe(&subscriber, &0u32);
        let before = client.get_subscription(&subscriber, &0u32).expiry_ledger;
        client.renew(&subscriber, &0u32);
        assert!(client.get_subscription(&subscriber, &0u32).expiry_ledger > before);
    }

    #[test]
    fn test_cancel() {
        let (env, _, subscriber, client) = setup();
        client.create_tier(&String::from_str(&env, "Basic"), &10_000_000i128, &17280u32);
        client.subscribe(&subscriber, &0u32);
        client.cancel(&subscriber, &0u32);
        assert!(!client.get_subscription(&subscriber, &0u32).active);
    }

    #[test]
    #[should_panic(expected = "tier not found")]
    fn test_bad_tier() {
        let (_, _, subscriber, client) = setup();
        client.subscribe(&subscriber, &99u32);
    }
}
