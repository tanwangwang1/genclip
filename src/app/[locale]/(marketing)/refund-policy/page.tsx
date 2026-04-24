import type { Locale } from "@/config/i18n-config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const alternates = buildAlternates("/refund-policy", locale);
  const isZh = locale.startsWith("zh");

  return {
    title: isZh ? "退款政策" : "Refund Policy",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function RefundPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const isZh = locale.startsWith("zh");

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-3">
        {isZh ? "退款政策" : "Refund Policy"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {isZh ? "最后更新：2026-04-21" : "Last updated: 2026-04-21"}
      </p>

      <div className="prose dark:prose-invert max-w-none">
        <h2>{isZh ? "1. 政策说明" : "1. Introduction"}</h2>
        <p>
          {isZh
            ? "我们致力于提供稳定、透明的 AI 视频生成服务。如你对购买结果不满意，可按本退款政策提交申请。"
            : "We aim to provide reliable and transparent AI video generation services. If your purchase does not meet expectations, you may request a refund under this policy."}
        </p>

        <h2>{isZh ? "2. 订阅退款" : "2. Subscription Refunds"}</h2>
        <h3>{isZh ? "退款资格" : "Eligibility Requirements"}</h3>
        <ul>
          <li>
            {isZh
              ? "需在首次订阅购买后 3 天内提交退款申请。"
              : "The request must be submitted within 3 days of the initial subscription purchase."}
          </li>
          <li>
            {isZh
              ? "申请时该订阅周期内累计消耗积分不超过 20。"
              : "Total credits consumed during the subscription period must be 20 credits or fewer at the time of request."}
          </li>
          <li>
            {isZh
              ? "需通过官方支持渠道提交完整订单信息。"
              : "The request must be submitted through official support channels with complete order details."}
          </li>
        </ul>

        <h3>{isZh ? "处理费用" : "Processing Fees"}</h3>
        <p>
          {isZh
            ? "符合退款条件的订单将扣除 8% 支付处理费后退回。该费用用于覆盖支付通道及退款处理成本。"
            : "For eligible subscription refunds, an 8% processing fee will be deducted. This fee covers payment processing and refund transaction costs."}
        </p>

        <h2>{isZh ? "3. 积分包退款" : "3. Credit Purchases"}</h2>
        <p>
          {isZh
            ? "一次性积分包（所有 credit packages）默认不支持退款。购买前请根据需求选择合适档位。"
            : "One-time credit purchases (all credit packages) are non-refundable by default. Please choose your package carefully before purchase."}
        </p>

        <h2>{isZh ? "4. 年付改月付规则" : "4. Annual-to-Monthly Plan Changes"}</h2>
        <ul>
          <li>
            {isZh
              ? "可申请将年付方案改为月付方案。"
              : "You may request a change from an annual plan to a monthly plan."}
          </li>
          <li>
            {isZh
              ? "将扣除一个月订阅费及适用处理费用。"
              : "One month of subscription fees plus applicable processing fees will be deducted."}
          </li>
          <li>
            {isZh
              ? "剩余金额将原路退回。"
              : "The remaining balance will be refunded to your original payment method."}
          </li>
          <li>
            {isZh
              ? "退款通常在 5-7 个工作日内到账。"
              : "Approved refunds are typically processed within 5-7 business days."}
          </li>
        </ul>

        <h2>{isZh ? "5. 不可退款项目" : "5. Non-Refundable Items"}</h2>
        <ul>
          <li>{isZh ? "所有一次性积分包。" : "All one-time credit purchases."}</li>
          <li>
            {isZh
              ? "已消耗或已过服务期间对应的费用。"
              : "Subscription time or service value already consumed."}
          </li>
          <li>
            {isZh
              ? "支付处理费与交易手续费。"
              : "Processing fees and transaction charges."}
          </li>
          <li>
            {isZh
              ? "超过 3 天申请窗口的订阅订单。"
              : "Subscriptions beyond the 3-day refund request window."}
          </li>
          <li>
            {isZh
              ? "积分消耗超过 20 的订阅订单。"
              : "Subscriptions where usage exceeds 20 credits."}
          </li>
        </ul>

        <h2>{isZh ? "6. 退款申请流程" : "6. Refund Process"}</h2>
        <ol>
          <li>
            {isZh
              ? "发送邮件至支持团队：support@genclip.studio"
              : "Contact support at support@genclip.studio."}
          </li>
          <li>
            {isZh
              ? "请附上账户邮箱、订单号/交易号、退款原因。"
              : "Include your account email, order/transaction ID, and reason for the request."}
          </li>
          <li>
            {isZh
              ? "我们通常会在 24-48 小时内完成初步审核。"
              : "Our team typically reviews requests within 24-48 hours."}
          </li>
          <li>
            {isZh
              ? "通过审核后，退款将在 5-7 个工作日内原路退回。"
              : "If approved, refunds are processed within 5-7 business days to the original payment method."}
          </li>
        </ol>

        <h2>{isZh ? "7. 特殊情况处理" : "7. Special Circumstances"}</h2>
        <p>
          {isZh
            ? "如你认为存在特殊情况（例如重复扣费、明显服务故障等），可提交详细说明，我们将进行个案评估。"
            : "If you believe special circumstances apply (for example, duplicate charges or material service failure), please provide detailed information for case-by-case review."}
        </p>

        <h2>{isZh ? "8. 政策更新" : "8. Policy Updates"}</h2>
        <p>
          {isZh
            ? "我们可能不时更新本退款政策。更新版本发布后立即生效；继续使用服务视为你接受更新内容。"
            : "We may update this refund policy from time to time. Updates take effect upon posting, and continued use of the service constitutes acceptance."}
        </p>

        <h2>{isZh ? "9. 用户确认" : "9. Customer Acknowledgment"}</h2>
        <p>
          {isZh
            ? "使用 Genclip 服务即表示你已阅读、理解并同意本退款政策。建议在购买前完整阅读。"
            : "By using Genclip services, you acknowledge that you have read, understood, and agreed to this refund policy. We recommend reviewing it before purchase."}
        </p>

        <h2>{isZh ? "10. 联系方式" : "10. Contact Us"}</h2>
        <p>
          {isZh ? "如你对退款政策有疑问，请联系：" : "If you have questions about this refund policy, contact us at:"}{" "}
          <a href="mailto:support@genclip.studio">support@genclip.studio</a>
        </p>
      </div>
    </div>
  );
}
