#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    TotalSupply,
    Balance(Address),
    Allowance(Address, Address),
    Name,
    Symbol,
    Decimals,
    Minter,
}

fn get_balance(env: &Env, addr: &Address) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Balance(addr.clone()))
        .unwrap_or(0)
}

fn set_balance(env: &Env, addr: &Address, amount: i128) {
    env.storage()
        .persistent()
        .set(&DataKey::Balance(addr.clone()), &amount);
}

fn get_allowance(env: &Env, from: &Address, spender: &Address) -> i128 {
    env.storage()
        .persistent()
        .get(&DataKey::Allowance(from.clone(), spender.clone()))
        .unwrap_or(0)
}

fn require_minter(env: &Env, caller: &Address) {
    let minter: Address = env.storage().instance().get(&DataKey::Minter).unwrap();
    if *caller != minter {
        panic!("not authorized: only minter can call this");
    }
}

#[contract]
pub struct VaultToken;

#[contractimpl]
impl VaultToken {
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        decimals: u32,
        minter: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::Minter, &minter);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let minter: Address = env.storage().instance().get(&DataKey::Minter).unwrap();
        minter.require_auth();
        require_minter(&env, &minter);

        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total + amount));

        let bal = get_balance(&env, &to);
        set_balance(&env, &to, bal + amount);

        env.events()
            .publish((symbol_short!("mint"), to.clone()), amount);
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        let bal = get_balance(&env, &from);
        if bal < amount {
            panic!("insufficient balance");
        }
        set_balance(&env, &from, bal - amount);

        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total - amount));

        env.events()
            .publish((symbol_short!("burn"), from.clone()), amount);
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_bal = get_balance(&env, &from);
        if from_bal < amount {
            panic!("insufficient balance");
        }
        set_balance(&env, &from, from_bal - amount);
        let to_bal = get_balance(&env, &to);
        set_balance(&env, &to, to_bal + amount);

        env.events().publish(
            (symbol_short!("transfer"), from.clone(), to.clone()),
            amount,
        );
    }

    pub fn transfer_from(
        env: Env,
        spender: Address,
        from: Address,
        to: Address,
        amount: i128,
    ) {
        spender.require_auth();
        let allowance = get_allowance(&env, &from, &spender);
        if allowance < amount {
            panic!("insufficient allowance");
        }
        env.storage().persistent().set(
            &DataKey::Allowance(from.clone(), spender.clone()),
            &(allowance - amount),
        );

        let from_bal = get_balance(&env, &from);
        if from_bal < amount {
            panic!("insufficient balance");
        }
        set_balance(&env, &from, from_bal - amount);
        let to_bal = get_balance(&env, &to);
        set_balance(&env, &to, to_bal + amount);

        env.events().publish(
            (symbol_short!("transfer"), from.clone(), to.clone()),
            amount,
        );
    }

    pub fn approve(
        env: Env,
        from: Address,
        spender: Address,
        amount: i128,
        _expiration_ledger: u32,
    ) {
        from.require_auth();
        env.storage().persistent().set(
            &DataKey::Allowance(from.clone(), spender.clone()),
            &amount,
        );
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        get_balance(&env, &id)
    }

    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        get_allowance(&env, &from, &spender)
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap()
    }

    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap()
    }

    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap()
    }

    pub fn set_minter(env: Env, new_minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::Minter, &new_minter);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, Address, Address, Address, VaultTokenClient<'static>) {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, VaultToken);
        let client = VaultTokenClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let minter = Address::generate(&env);
        let user = Address::generate(&env);
        client.initialize(
            &admin,
            &String::from_str(&env, "VaultToken"),
            &String::from_str(&env, "VAULT"),
            &7u32,
            &minter,
        );
        (env, admin, minter, user, client)
    }

    #[test]
    fn test_mint_only_minter() {
        let (_env, _admin, _minter, _user, client) = setup();
        // mint should succeed (mocked auth)
        client.mint(&_user, &1000i128);
        assert_eq!(client.balance(&_user), 1000i128);
    }

    #[test]
    fn test_transfer_updates_balances() {
        let (env, _admin, _minter, _user, client) = setup();
        let recipient = Address::generate(&env);
        client.mint(&_user, &500i128);
        client.transfer(&_user, &recipient, &200i128);
        assert_eq!(client.balance(&_user), 300i128);
        assert_eq!(client.balance(&recipient), 200i128);
    }

    #[test]
    fn test_burn_reduces_supply() {
        let (_env, _admin, _minter, _user, client) = setup();
        client.mint(&_user, &1000i128);
        client.burn(&_user, &400i128);
        assert_eq!(client.balance(&_user), 600i128);
        assert_eq!(client.total_supply(), 600i128);
    }

    #[test]
    fn test_allowance_and_transfer_from() {
        let (env, _admin, _minter, _user, client) = setup();
        let spender = Address::generate(&env);
        let recipient = Address::generate(&env);
        client.mint(&_user, &1000i128);
        client.approve(&_user, &spender, &300i128, &9999u32);
        assert_eq!(client.allowance(&_user, &spender), 300i128);
        client.transfer_from(&spender, &_user, &recipient, &200i128);
        assert_eq!(client.balance(&recipient), 200i128);
        assert_eq!(client.allowance(&_user, &spender), 100i128);
    }

    #[test]
    #[should_panic(expected = "insufficient balance")]
    fn test_transfer_insufficient_balance() {
        let (env, _admin, _minter, _user, client) = setup();
        let recipient = Address::generate(&env);
        client.mint(&_user, &100i128);
        client.transfer(&_user, &recipient, &200i128);
    }
}
