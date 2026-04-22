# Creem Product Checklist

## 需要在 Creem 创建的产品

### 月付订阅

#### 1. Basic Plan (Monthly)
- 产品类型: Subscription
- 产品名称: Basic Plan
- 描述: 350 credits/month (~35 videos) - Perfect for individuals
- 价格: $9.90 USD
- 计费周期: Monthly
- 元数据: `credits="350"`, `plan="basic"`, `period="month"`
- [ ] 已创建 Product ID: `prod_jsRIeZmqn3L9NN2fiFIn6`

#### 2. Pro Plan (Monthly)
- 产品类型: Subscription
- 产品名称: Pro Plan
- 描述: 1420 credits/month (~142 videos) - Most popular for creators
- 价格: $29.90 USD
- 计费周期: Monthly
- 元数据: `credits="1420"`, `plan="pro"`, `period="month"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq21zX2Z16`

#### 3. Ultimate Plan (Monthly)
- 产品类型: Subscription
- 产品名称: Ultimate Plan
- 描述: 4000 credits/month (~400 videos) - Best for teams and agencies
- 价格: $79.90 USD
- 计费周期: Monthly
- 元数据: `credits="4000"`, `plan="ultimate"`, `period="month"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq22zX2Z18`

### 年付订阅

#### 4. Basic Plan (Yearly)
- 产品类型: Subscription
- 产品名称: Basic Plan (Yearly)
- 描述: Annual subscription with 4,240 credits (~424 videos), pay for 10 months and get 12 months of credits
- 价格: $99 USD
- 计费周期: Yearly
- 元数据: `credits="4240"`, `plan="basic"`, `period="year"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq22zX2Z10`

#### 5. Pro Plan (Yearly)
- 产品类型: Subscription
- 产品名称: Pro Plan (Yearly)
- 描述: Annual subscription with 14,950 credits (~1,495 videos), pay for 10 months and get 12 months of credits
- 价格: $299 USD
- 计费周期: Yearly
- 元数据: `credits="14950"`, `plan="pro"`, `period="year"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq22zX2Z55`

#### 6. Ultimate Plan (Yearly)
- 产品类型: Subscription
- 产品名称: Ultimate Plan (Yearly)
- 描述: Annual subscription with 42,950 credits (~4,295 videos), pay for 10 months and get 12 months of credits
- 价格: $799 USD
- 计费周期: Yearly
- 元数据: `credits="42950"`, `plan="ultimate"`, `period="year"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq22zX2Z21`

### 一次性积分包

#### 7. Starter Pack
- 产品类型: One-time
- 产品名称: Starter Pack
- 描述: 350 credits one-time purchase (~35 videos), valid for 1 year
- 价格: $14.90 USD
- 元数据: `credits="350"`, `allowFreeUser="true"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq21zX2ZPO`

#### 8. Standard Pack
- 产品类型: One-time
- 产品名称: Standard Pack
- 描述: 1420 credits one-time purchase (~142 videos), valid for 1 year
- 价格: $49.90 USD
- 元数据: `credits="1420"`, `allowFreeUser="false"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq22zX2Z12`

#### 9. Pro Pack
- 产品类型: One-time
- 产品名称: Pro Pack
- 描述: 4000 credits one-time purchase (~400 videos), valid for 1 year
- 价格: $119.90 USD
- 元数据: `credits="4000"`, `allowFreeUser="false"`
- [ ] 已创建 Product ID: `prod_3tlZPSRNHZSaNq22zX2Z13`

## 回填 Product ID

创建完所有产品后，将 Product ID 回填到 `src/config/pricing-user.ts`：

1. 打开 `src/config/pricing-user.ts`
2. 找到对应产品，将 `id` 替换为 Creem 的 Product ID（`prod_xxx`）
3. 保存后重新部署

示例：

```ts
{
  id: "prod_4yNyvLWQ88n8AqJj35uOvK",
  name: "Basic Plan",
  priceUsd: 9.9,
  credits: 350,
  period: "month",
  enabled: true
}
```

## Webhook 配置

1. Creem Dashboard -> Webhooks -> Add Webhook
2. URL: `{NEXT_PUBLIC_APP_URL}/api/auth/creem/webhook`
3. Events:
   - `checkout.completed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `subscription.expired`
4. 复制 Secret 到 `.env.local` 的 `CREEM_WEBHOOK_SECRET`

## 验证清单

- [ ] 所有产品已在 Creem 创建
- [ ] Product ID 已回填到 `pricing-user.ts`
- [ ] `CREEM_API_KEY` 已配置
- [ ] `CREEM_WEBHOOK_SECRET` 已配置
- [ ] `/pricing` 页面价格、积分、折扣展示正确
- [ ] FAQ 四语言中的价格和积分数字一致
- [ ] 测试环境支付流程正常
