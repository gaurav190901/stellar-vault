#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Vec,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Splits,
    TotalRouted,
    Caller, // authorized caller (SubscriptionManager)
}

#[contract]
pub struct RevenueRouter;

#[contractimpl]
impl RevenueRouter {
    pub fn initialize(
        env: Env,
        admin: Address,
        splits: Vec<(Address, u32)>,
        caller: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        validate_splits(&splits);
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Splits, &splits);
        env.storage().instance().set(&DataKey::TotalRouted, &0i128);
        env.storage().instance().set(&DataKey::Caller, &caller);
    }

    pub fn update_splits(env: Env, splits: Vec<(Address, u32)>) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        validate_splits(&splits);
        env.storage().instance().set(&DataKey::Splits, &splits);
    }

    pub fn update_caller(env: Env, caller: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Caller, &caller);
    }

    pub fn route(env: Env, token_address: Address, amount: i128) {
        let authorized_caller: Address =
            env.storage().instance().get(&DataKey::Caller).unwrap();
        authorized_caller.require_auth();

        let splits: Vec<(Address, u32)> =
            env.storage().instance().get(&DataKey::Splits).unwrap();
        validate_splits(&splits);

        let token_client = token::Client::new(&env, &token_address);

        for i in 0..splits.len() {
            let (recipient, basis_points) = splits.get(i).unwrap();
            let share = amount * (basis_points as i128) / 10000i128;
            if share > 0 {
                token_client.transfer(
                    &env.current_contract_address(),
                    &recipient,
                    &share,
                );
            }
        }

        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalRouted)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalRouted, &(total + amount));

        env.events().publish(
            (symbol_short!("routed"), token_address.clone()),
            (amount, splits),
        );
    }

    pub fn get_splits(env: Env) -> Vec<(Address, u32)> {
        env.storage().instance().get(&DataKey::Splits).unwrap()
    }

    pub fn get_total_routed(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalRouted)
            .unwrap_or(0)
    }
}

fn validate_splits(splits: &Vec<(Address, u32)>) {
    let mut total: u32 = 0;
    for i in 0..splits.len() {
        let (_, bp) = splits.get(i).unwrap();
        total += bp;
    }
    if total != 10000 {
        panic!("splits must sum to 10000 basis points");
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{
        testutils::Address as _,
        token::{Client as TokenClient, StellarAssetClient},
        Env, Vec,
    };

    fn setup_token(env: &Env, admin: &Address) -> Address {
        let token_id = env.register_stellar_asset_contract_v2(admin.clone());
        token_id.address()
    }

    fn setup_router(
        env: &Env,
        admin: &Address,
        splits: Vec<(Address, u32)>,
        caller: &Address,
    ) -> RevenueRouterClient<'static> {
        let contract_id = env.register_contract(None, RevenueRouter);
        let client = RevenueRouterClient::new(env, &contract_id);
        client.initialize(admin, &splits, caller);
        client
    }

    #[test]
    fn test_correct_splits() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let caller = Address::generate(&env);
        let r1 = Address::generate(&env);
        let r2 = Address::generate(&env);
        let mut splits = Vec::new(&env);
        splits.push_back((r1.clone(), 6000u32));
        splits.push_back((r2.clone(), 4000u32));
        let client = setup_router(&env, &admin, splits, &caller);
        assert_eq!(client.get_splits().len(), 2);
    }

    #[test]
    #[should_panic(expected = "splits must sum to 10000 basis points")]
    fn test_invalid_splits_panic() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let caller = Address::generate(&env);
        let r1 = Address::generate(&env);
        let mut splits = Vec::new(&env);
        splits.push_back((r1.clone(), 5000u32));
        setup_router(&env, &admin, splits, &caller);
    }

    #[test]
    fn test_route_distributes_correctly() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let caller = Address::generate(&env);
        let r1 = Address::generate(&env);
        let r2 = Address::generate(&env);

        let token_addr = setup_token(&env, &admin);
        let token_client = TokenClient::new(&env, &token_addr);
        let sac = StellarAssetClient::new(&env, &token_addr);

        let mut splits = Vec::new(&env);
        splits.push_back((r1.clone(), 6000u32));
        splits.push_back((r2.clone(), 4000u32));
        let client = setup_router(&env, &admin, splits, &caller);

        // Fund the router contract
        sac.mint(&client.address, &1000i128);

        client.route(&token_addr, &1000i128);

        assert_eq!(token_client.balance(&r1), 600i128);
        assert_eq!(token_client.balance(&r2), 400i128);
        assert_eq!(client.get_total_routed(), 1000i128);
    }

    #[test]
    fn test_update_splits() {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let caller = Address::generate(&env);
        let r1 = Address::generate(&env);
        let r2 = Address::generate(&env);
        let r3 = Address::generate(&env);

        let mut splits = Vec::new(&env);
        splits.push_back((r1.clone(), 5000u32));
        splits.push_back((r2.clone(), 5000u32));
        let client = setup_router(&env, &admin, splits, &caller);

        let mut new_splits = Vec::new(&env);
        new_splits.push_back((r1.clone(), 3000u32));
        new_splits.push_back((r2.clone(), 3000u32));
        new_splits.push_back((r3.clone(), 4000u32));
        client.update_splits(&new_splits);
        assert_eq!(client.get_splits().len(), 3);
    }
}
