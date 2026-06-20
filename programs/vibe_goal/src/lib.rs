use anchor_lang::prelude::*;

declare_id!("9VfRKuNCy8mNHnWYq8N3C9a4sPaJ98szckyf3vVHRzGu");

#[program]
pub mod vibe_goal {
    use super::*;

    // =========================
    // 1. CREATE MATCH (ADMIN)
    // =========================
    pub fn create_match(ctx: Context<CreateMatch>, match_id: u64) -> Result<()> {
        let m = &mut ctx.accounts.match_account;

        m.match_id = match_id;
        m.admin = ctx.accounts.admin.key();
        m.home_score = None;
        m.away_score = None;

        Ok(())
    }

    // =========================
    // 2. USER SUBMITS PREDICTION
    // =========================
    pub fn submit_prediction(
        ctx: Context<SubmitPrediction>,
        match_id: u64,
        home_pred: u8,
        away_pred: u8,
    ) -> Result<()> {
        let p = &mut ctx.accounts.prediction;

        p.user = ctx.accounts.user.key();
        p.match_id = match_id;
        p.home_pred = home_pred;
        p.away_pred = away_pred;
        p.is_correct = false;

        Ok(())
    }

    // =========================
    // 3. ADMIN SETS FINAL SCORE
    // =========================
    pub fn set_result(
        ctx: Context<SetResult>,
        home_score: u8,
        away_score: u8,
    ) -> Result<()> {
        let m = &mut ctx.accounts.match_account;

        require!(
            m.admin == ctx.accounts.admin.key(),
            ErrorCode::NotAdmin
        );

        m.home_score = Some(home_score);
        m.away_score = Some(away_score);

        Ok(())
    }

    // =========================
    // 4. CHECK IF PREDICTION IS CORRECT
    // (called by each user)
    // =========================
    pub fn check_prediction(ctx: Context<CheckPrediction>) -> Result<()> {
        let m = &ctx.accounts.match_account;
        let p = &mut ctx.accounts.prediction;

        require!(m.home_score.is_some(), ErrorCode::MatchNotSet);
        require!(m.away_score.is_some(), ErrorCode::MatchNotSet);

        let actual_home = m.home_score.unwrap();
        let actual_away = m.away_score.unwrap();

        p.is_correct =
            p.home_pred == actual_home &&
            p.away_pred == actual_away;

        Ok(())
    }
}

//////////////////////////////////////////////////////
// ACCOUNTS
//////////////////////////////////////////////////////

#[derive(Accounts)]
pub struct CreateMatch<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + 8 + 32 + 2 + 2
    )]
    pub match_account: Account<'info, MatchAccount>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(match_id: u64)]
pub struct SubmitPrediction<'info> {
    #[account(
        init,
        payer = user,
        seeds = [b"pred", user.key().as_ref(), &match_id.to_le_bytes()],
        bump,
        space = 8 + 32 + 8 + 1 + 1 + 1
    )]
    pub prediction: Account<'info, Prediction>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetResult<'info> {
    #[account(mut)]
    pub match_account: Account<'info, MatchAccount>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct CheckPrediction<'info> {
    pub match_account: Account<'info, MatchAccount>,
    #[account(mut)]
    pub prediction: Account<'info, Prediction>,
}

//////////////////////////////////////////////////////
// DATA STRUCTURES
//////////////////////////////////////////////////////

#[account]
pub struct MatchAccount {
    pub match_id: u64,
    pub admin: Pubkey,
    pub home_score: Option<u8>,
    pub away_score: Option<u8>,
}

#[account]
pub struct Prediction {
    pub user: Pubkey,
    pub match_id: u64,
    pub home_pred: u8,
    pub away_pred: u8,
    pub is_correct: bool,
}

//////////////////////////////////////////////////////
// ERRORS
//////////////////////////////////////////////////////

#[error_code]
pub enum ErrorCode {
    #[msg("You are not admin")]
    NotAdmin,

    #[msg("Match result not set yet")]
    MatchNotSet,
}
