# Arclion SME Marketing SaaS — 新功能規格書

## 更新日期: 2026-04-23

---

## 功能 1: 聯盟行銷 (Affiliate Marketing)

### 概述
合作夥伴申請成為聯盟營銷夥伴，獲得專屬推廣連結，每當透過連結有用户註冊並充值，合作夥伴可獲得 10% 佣金（以 credits 形式發放）。

### 商業邏輯
- 佣金基準：被推薦用戶充值金額的 10%（以 credits 計算）
- 佣金以 credits 形式發放到聯盟夥伴帳號
- 結算方式：月結 / 手動審批發放
- 申請方式：申請制（需管理員審批）

### 數據模型

```prisma
model AffiliatePartner {
  id            String    @id @default(cuid())
  userId        String    // Clerk user ID
  status        String    // pending | approved | rejected
  commission    Float     @default(0.10) // 10%
  referralCode  String    @unique
  referralUrl   String
  totalEarnings Int       @default(0) // 累計佣金 (credits)
  pendingBalance Int       @default(0) // 待發放佣金 (credits)
  paidOut       Int       @default(0) // 已發放佣金 (credits)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model AffiliateCommission {
  id            String    @id @default(cuid())
  partnerId     String
  referredUserId String   // 被推薦用戶 ID
  transactionId String?   // 充值記錄 ID (如有關聯)
  amount        Int       // 充值金額 (credits)
  commission    Int       // 佣金金額 (credits) = amount * 10%
  status        String    // pending | approved | paid
  createdAt     DateTime  @default(now())
}
```

### 頁面

| 頁面 | 路徑 | 功能 |
|---|---|---|
| 聯盟申請 | /dashboard/affiliate | 申請成為合作夥伴 |
| 聯盟 Dashboard | /dashboard/affiliate/dashboard | 查看佣金、推廣連結、邀請碼 |
| Boss 審批 | /boss/affiliates | 審批申請、設定佣金比例 |

### API Routes

| Method | 路徑 | 功能 |
|---|---|---|
| GET | /api/affiliates/me | 獲取我的聯盟狀態 |
| POST | /api/affiliates/apply | 申請成為合作夥伴 |
| GET | /api/affiliates/commissions | 獲取佣金記錄 |
| POST | /api/affiliates/payout | Boss: 發放佣金 |
| GET | /api/affiliates/partners | Boss: 列出所有合作夥伴 |
| PATCH | /api/affiliates/partners/:id | Boss: 審批/拒絕申請 |

---

## 功能 2: 邀請朋友 (Referral Program)

### 概述
現有用戶分享邀請連結給朋友，朋友註冊後每次充值，邀請人可即時獲得 10% 充值金額的 credits 回贈。

### 商業邏輯
- 回贈比例：10%（每次朋友充值都有）
- 回贈發放：即時發放到邀請人帳號
- 邀請碼：每個用戶有專屬邀請碼
- 追蹤：用 referral_code 追蹤每一個被邀請的用戶

### 數據模型

```prisma
model User {
  // 現有欄位...
  referralCode      String?   @unique  // 用戶專屬邀請碼 e.g. "ABC123"
  referredBy       String?   // 邀請人用戶 ID
  referralCount    Int       @default(0) // 已成功邀請人數
  totalReferralEarnings Int @default(0) // 累計獲得的回贈 credits
}

model ReferralCredit {
  id              String    @id @default(cuid())
  referrerId      String    // 邀請人 ID
  referredUserId  String    // 被邀請人 ID
  rechargeAmount  Int       // 朋友充值金額 (credits)
  creditAwarded   Int       // 發放的回贈 credits = rechargeAmount * 10%
  createdAt       DateTime  @default(now())
}
```

### 頁面

| 頁面 | 路徑 | 功能 |
|---|---|---|
| 邀請朋友 | /dashboard/referral | 分享邀請連結、查看邀請記錄和回贈 |

### API Routes

| Method | 路徑 | 功能 |
|---|---|---|
| GET | /api/referrals/me | 獲取我的邀請碼和連結 |
| GET | /api/referrals/credits | 獲取回贈記錄 |
| POST | /api/referrals/credits | (內部) 發放回贈 credits |
| GET | /api/referrals/stats | 獲取邀請統計 |

---

## 共享邏輯

### 充值觸發回贈（Referral）
當 /api/credits 的 POST 充值邏輯完成後：
1. 檢查被充值用戶是否有 referredBy
2. 如果有，計算 rechargeAmount * 10%
3. 寫入 ReferralCredit 記錄
4. 更新 referrer 的 credits 餘額
5. 更新 referrer.totalReferralEarnings

### 充值觸發聯盟佣金（Affiliate）
當 /api/credits 的 POST 充值邏輯完成後：
1. 檢查被充值用戶是否由 AffiliatePartner 連結引入
2. 如果有，計算 amount * 10%
3. 寫入 AffiliateCommission 記錄（status: pending）
4. 更新 partner.pendingBalance

---

## 實現順序

1. Prisma Schema 更新（User, AffiliatePartner, AffiliateCommission, ReferralCredit）
2. /api/credits 更新（加入充值後觸發 referral + affiliate 邏輯）
3. 聯盟行銷功能（申請頁面、審批頁面）
4. 邀請朋友功能（邀請頁面）
5. Build + Deploy

---

## 行業模板（已實作）
- E-commerce (耳機)
- Restaurant (火鍋)

## 三個 Agent Skills（已實作）
- Product Analysis (Steps 1-3)
- Ad Strategy (Step 5)
- Creative Content (Step 6)
