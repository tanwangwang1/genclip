使用说明
本模板适用场景
这是一个AI视频生成SaaS平台的定价方案模板，适用于：
- 支持多种AI视频生成模型（Sora、Veo、Wan、Seedance等）
- 基于积分的消费模式
- 订阅制 + 一次性购买混合模式
如何使用本模板
1. 确定你的基准模型 - 选择一个主要模型作为定价基准
2. 查询API成本 - 了解每个模型的实际API调用成本
3. 调整积分数量 - 根据你的成本模型修改积分数量
4. 设置目标毛利率 - 一般建议40-70%
5. 在Creem/Stripe创建产品 - 按照模板的产品结构创建
本示例假设
本模板基于以下假设（你需要根据自己的实际情况修改）：
- 基准模型: Veo 3.1 Fast Lite
- 基准消耗: 10积分/视频（固定）
- 进货价参考: Evolink.ai 约1积分 = ¥0.1（≈ $0.014）
- 基准成本: 约¥1.00/视频（≈ $0.14）= 10积分 × ¥0.1
- 目标毛利率: 50-70%
成本计算说明
进货价基于Evolink.ai: 1积分 ≈ ¥0.1（约$0.014）
如果一个视频消耗10积分，则成本 = 10 × ¥0.1 = ¥1.00（约$0.14）
售价倍数2.5x可获得约60%毛利率（$0.35 / $0.14 - 1 = 150%） 
假如毛利率是50%的话，应该是售价倍数2x, $0.28 / 0.14 - 1 = 100%
 
积分消耗规则（示例）
模型积分配置
模型
720p
1080p
说明
Veo 3.1 Fast Lite
10积分
10积分
固定价格（基准）
Sora 2 Lite
2积分
-
10秒固定
Wan 2.6
25积分 (5秒)
42积分 (5秒)
1.67x 乘数
Seedance 1.5 Pro
4积分/秒
8积分/秒
按秒计费
重要: 你需要根据自己的API成本重新计算积分消耗
积分计算公式
积分 = ceil(API成本(美元) × 10)
示例：
- 如果API成本是$0.96，则积分为ceil(0.96 × 10) = 10积分
- 如果API成本是$0.16，则积分为ceil(0.16 × 10) = 2积分
完整产品定价方案（最终版）
成本基础: $10 / 700积分 = $0.0143/积分，Veo 3.1成本$0.14/视频
一、月付订阅 (3个)
Product ID
名称
价格
积分/月
基准视频数*
单价/视频
毛利率**
basic_monthly
Basic
$9.90
350
~35
$0.282
50%
pro_monthly
Pro ⭐
$29.90
1420
~142
$0.21
48%
ultimate_monthly
Ultimate
$79.90
4000
~400
$0.20
45%
以基准模型（10积分/视频）计算 *假设基准模型API成本为$0.14/视频
二、年付订阅 (3个)
Product ID
名称
月付×12
年付价
积分/年
基准视频数
单价/视频
毛利率**
basic_yearly
Basic
$118.80
$99
4240
~424
$0.233
40%
pro_yearly
Pro ⭐
$358.80
$299
14950
~1495
$0.200
30%
ultimate_yearly
Ultimate
$958.80
$799
42950
~4295
$0.186
25%
年付优惠: 月付 × 10（买10送2，省2个月)
三、一次性积分包 (3个)
Product ID
名称
价格
积分
基准视频数
单价/视频
毛利率**
vs 月付
购买限制
starter_pack
Starter
$14.90
350
~35
$0.425
67%
同Basic
所有用户
standard_pack
Standard
$49.90
1420
~142
$0.351
60%
+33% vs Pro
订阅用户
pro_pack
Pro
$119.90
4000
~400
$0.297
55%
+25% vs Ultimate
订阅用户
有效期: 所有积分包1年有效
设计原则
- 年付 = 月付 × 10（省2个月）
- 积分包 > 月付 > 年付（价格递减）
- 积分包适合不想订阅的用户
- 积分越多的包优惠越大（22-34%）
- 积分包和对应月付套餐积分相同
产品汇总表
序号
Product ID
类型
价格
积分
基准视频数
单价/视频
有效期
积分包







1
starter_pack
One-time
$14.90
350
~35
$0.425
1年
2
standard_pack
One-time
$39.90
1420
~142
$0.416
1年
3
pro_pack
One-time
$119.90
4000
~400
$0.297
1年
月付订阅







4
basic_monthly
Monthly
$9.90
350
~35
$0.282
1月
5
pro_monthly
Monthly
$29.90
1420
~142
$0.21
1月
6
ultimate_monthly
Monthly
$79.90
4000
~400
$0.2
1月
年付订阅







7
basic_yearly
Yearly
$99
4240
~424
$0.233
1年
8
pro_yearly
Yearly
$299
14950
~1495
$0.200
1年
9
ultimate_yearly
Yearly
$799
42950
~4295
$0.186
1年
总计: 9个产品
价格梯度分析
单价梯度（用户感知价值）
购买方式
单价/基准视频
vs Starter
毛利率
说明
Starter Pack
$0.425
-
67%
入门体验价，最贵
Standard Pack
$0.351
-22%
60%
订阅用户专属
Pro Pack
$0.297
-34%
55%
订阅用户，优惠最大
Basic 月付
$0.282
-33%
60%
比Starter便宜
Pro 月付
$0.21
-41%
55%
比Basic月付便宜12% ⭐
Ultimate 月付
$0.20
-47%
50%
比Basic月付便宜21% ⭐⭐
Basic 年付
$0.233
-45%
40%
比月付便宜17%
Pro 年付
$0.200
-51%
30%
比月付便宜20%
Ultimate 年付
$0.186
-56%
25%
最划算 ⭐⭐⭐
设计理念
- Basic 月付: 最贵（新人用，60% 毛利率）
- Pro 月付: 明显优惠（比Basic便宜12%，55% 毛利率）
- Ultimate 月付: 最划算（比Basic便宜21%，50% 毛利率）
- 年付: 统一省2个月（月付 × 10，40-53% 毛利率）
- 积分包: 适合不想订阅的用户，但单价更高（60-74% 毛利率）
核心逻辑
- ✅ 单价递减：Basic > Pro > Ultimate
- ✅ 订阅比积分包便宜33-56%
- ✅ 年付比月付便宜17-20%
- ✅ 积分包越大的越便宜（22-34%）
毛利率分析（示例）
假设基准模型API成本为$0.14/视频（¥1.00）：
产品
单价/视频
成本
毛利率
评价
Starter Pack
$0.425
$0.14
67%
✅ 很高
Standard Pack
$0.351
$0.14
60%
✅ 健康
Pro Pack
$0.297
$0.14
55%
✅ 健康
Basic 月付
$0.282
$0.14
60%
✅ 健康
Pro 月付
$0.21
$0.14
55%
✅ 健康
Ultimate 月付
$0.20
$0.14
50%
✅ 可接受
Basic 年付
$0.233
$0.14
40%
✅ 健康
Pro 年付
$0.200
$0.14
30%
✅ 可接受
Ultimate 年付
$0.186
$0.14
25%
⚠️ 策略性
结论
- 积分包和月付订阅保持50-74%健康毛利
- 年付订阅通过薄利多销获取长期客户（40-53%）
- Pro年付作为引流主力产品，毛利46%
重要: 以上基于Veo 3.1 Fast Lite成本约¥1.00（$0.14）/视频，你需要根据自己的实际API成本重新计算
支付平台产品配置
积分包示例
{
  "product_id": "starter_pack",
  "product_name": "AI Video Starter Pack",
  "description": "Get {credits} credits (~{videos} videos) for AI video generation. One-time purchase, valid for 1 year. Commercial license included.",
  "price": 14.90,
  "metadata": {
    "credits": 350,
    "valid_months": 12,
    "subscriber_only": false
  }
}
月付订阅示例
{
  "product_id": "basic_monthly",
  "product_name": "AI Video Basic Plan (Monthly)",
  "description": "Monthly subscription with {credits} credits (~{videos} videos) per month. Priority generation and commercial license included.",
  "price": 9.90,
  "interval": "month",
  "metadata": {
    "credits": 350,
    "valid_months": 1
  }
}
年付订阅示例
{
  "product_id": "basic_yearly",
  "product_name": "AI Video Basic Plan (Annual)",
  "description": "Annual subscription with {credits} credits (~{videos} videos) for the year. Pay for 10 months, get 12 months of credits. Priority generation and commercial license included.",
  "price": 99.00,
  "interval": "year",
  "metadata": {
    "credits": 4240,
    "valid_months": 12,
    "original_price": 118.80
  }
}
完整产品列表
序号
Product ID
类型
价格
积分
1
starter_pack
One-time
$14.90
350
2
standard_pack
One-time
$39.90
1420
3
pro_pack
One-time
$99.90
4000
4
basic_monthly
Monthly
$9.90
350
5
pro_monthly
Monthly
$29.90
1420
6
ultimate_monthly
Monthly
$79.90
4000
7
basic_yearly
Yearly
$99
4240
8
pro_yearly
Yearly
$299
14950
9
ultimate_yearly
Yearly
$799
42950
商品描述模板
积分包模板
Get {credits} credits (~{videos} videos) for AI video generation. One-time purchase, valid for 1 year. Commercial license included.
示例:
Starter: "Get 280 credits (~28 videos) for AI video generation. One-time purchase, valid for 1 year. Commercial license included."
月付订阅模板
Monthly subscription with {credits} credits (~{videos} videos) per month. Priority generation and commercial license included.
年付订阅模板（标准）
Annual subscription with {credits} credits (~{videos} videos) for the year. Pay for 10 months, get 12 months of credits. Priority generation and commercial license included.
年付订阅模板（限时优惠）
Annual subscription with {credits} credits (~{videos} videos) for the year. {Discount_Name} limited offer - {Discount}% OFF! Priority generation and commercial license included.
示例:
Pro 年付: "Annual subscription with 11,520 credits (~1,152 videos) for the year. 2026 New Year limited offer - 17% OFF! Priority generation and commercial license included."
定价策略指南
1. 确定基准模型
选择一个主要模型作为定价基准：
- 建议选择最常用的模型
- 或者选择成本中等的模型
- 确保该模型稳定可靠
2. 计算积分消耗
积分 = ceil(API成本(美元) × 倍数)
倍数建议：
- 保守策略: 10倍（毛利率高，约60%+）
- 平衡策略: 8-10倍（毛利率约50-60%）
- 激进策略: 5-8倍（毛利率约40-50%，快速获客）
示例计算（基于Evolink.ai进货价¥0.1/积分）:
假设基准模型（Veo 3.1 Fast Lite）消耗10积分/视频:
成本计算:
- 积分消耗: 10积分
- 进货价: 10 × ¥0.1 = ¥1.00 ≈ $0.14
- 这是纯API成本
定价策略（选择倍数）:
策略
倍数
售价
毛利
毛利率
适用场景
保守
10x
$1.40
$1.26
90%
高端市场，强调质量
平衡
7x
$0.98
$0.84
86%
推荐（本模板采用2.5x）
标准
5x
$0.70
$0.56
80%
竞争激烈市场
激进
2.5x
$0.35
$0.21
60%
本模板采用，平衡获客与利润
重要说明: 本模板采用2.5x倍数（约$0.35/视频），毛利率60%，这是基于:10积分 × ¥0.1 = $0.14成本；$0.35售价 = $0.14 × 2.5；毛利率 = ($0.35 - $0.14) / $0.35 = 60%
3. 设置订阅积分
月付积分建议：
- Basic: 30-50个基准视频
- Pro: 100-200个基准视频
- Ultimate: 300-600个基准视频
年付积分建议：
月付积分 × 12 × 1.2-1.5（赠送20-50%）
4. 设置积分包
积分包应该提供：
- 灵活性：不订阅也能使用
- 引导作用：引导用户转为订阅
- 价格梯度：明显的单价优势
建议比例：
- Starter: 0.5-1个月积分
- Standard: 1-2个月积分
- Pro: 2-4个月积分
5. 年付折扣策略
建议折扣：
- Basic: 15-20%（标准优惠）
- Pro: 25-35%（主力产品，可限时）
- Ultimate: 20-30%（大客户）
代码配置示例
pricing-user.ts 结构
// ============================================
// 一、基础设置
// ============================================
export const NEW_USER_GIFT = {
  enabled: true,
  credits: 10,  // 根据基准模型调整（建议 1-3 个视频）
  validDays: 30,
};
export const CREDIT_EXPIRATION = {
  subscriptionDays: 30,    // 订阅积分有效期（天）
  purchaseDays: 365,       // 一次性购买积分有效期（天）
  warnBeforeDays: 7,       // 过期提醒（天）
};
// ============================================
// 二、订阅产品配置
// ============================================
export const SUBSCRIPTION_PRODUCTS = [
  // 月付订阅
  {
    id: "basic_monthly",
    name: "Basic Plan",
    priceUsd: 9.9,
    credits: 350,  // 根据基准模型调整
    // 成本计算: 280 积分 × ¥0.1 = ¥28 ≈ $3.9
    // 售价: $9.9 → 毛利率约 60%
    period: "month" as const,
    popular: false,
    enabled: true,
