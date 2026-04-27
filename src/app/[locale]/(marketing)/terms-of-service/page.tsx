import type { Locale } from "@/config/i18n-config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const alternates = buildAlternates("/terms-of-service", locale);
  const isZh = locale.startsWith("zh");

  return {
    title: isZh ? "服务条款" : "Terms of Service",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const isZh = locale.startsWith("zh");

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-3">
        {isZh ? "服务条款" : "Terms of Service"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {isZh ? "生效日期：2026-04-21" : "Effective date: 2026-04-21"}
      </p>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          {isZh
            ? "本服务条款适用于你对 Genclip 网站、应用、API 及相关服务的访问与使用。你访问或使用本服务即表示同意受本条款约束。"
            : "These Terms of Service govern your use of Genclip websites, applications, APIs, and related services. By accessing or using the service, you agree to these Terms."}
        </p>

        <h2>{isZh ? "1. 资格与账户" : "1. Eligibility and Account"}</h2>
        <ul>
          <li>
            {isZh
              ? "你必须具备签订具有法律约束力协议的行为能力。"
              : "You must have legal capacity to enter into a binding agreement."}
          </li>
          <li>
            {isZh
              ? "你需对账户凭据、API Key 及账户下的全部活动负责。"
              : "You are responsible for account credentials, API keys, and all activities under your account."}
          </li>
          <li>
            {isZh
              ? "你需提供准确的注册与计费信息，并及时更新。"
              : "You must provide accurate registration and billing information and keep it up to date."}
          </li>
        </ul>

        <h2>{isZh ? "2. 服务范围" : "2. Service Scope"}</h2>
        <p>
          {isZh
            ? "Genclip 提供 AI 视频/媒体生成工具，包括文生视频、图生视频、参考素材工作流，以及相关账户和计费功能。"
            : "Genclip provides AI generation tooling for video/media creation, including text-to-video, image-to-video, reference workflows, and related account and billing functionality."}
        </p>

        <h2>{isZh ? "3. 合法与可接受使用" : "3. Acceptable Use"}</h2>
        <ul>
          <li>
            {isZh
              ? "不得用于违法、滥用、欺诈或侵犯他人权利的行为。"
              : "No unlawful, abusive, deceptive, or rights-infringing use."}
          </li>
          <li>
            {isZh
              ? "严禁使用本平台生成、请求、上传、传播或推广 NSFW、色情、裸露、成人、性暗示或其他性相关内容（包括文本、图像、视频及其变体）。"
              : "You must not generate, request, upload, distribute, or promote NSFW, pornographic, nude, adult, sexually explicit, or sexually suggestive content (including text, images, videos, and derivatives)."}
          </li>
          <li>
            {isZh
              ? "不得绕过限制、抓取受限数据或干扰服务稳定性。"
              : "No attempts to bypass limits, scrape restricted data, or disrupt service."}
          </li>
          <li>
            {isZh
              ? "你不得上传无权使用、授权或处理的内容。"
              : "You must not upload content you do not have rights to use, license, or process."}
          </li>
        </ul>

        <h2>{isZh ? "4. 用户内容与生成结果" : "4. User Content and Outputs"}</h2>
        <ul>
          <li>
            {isZh
              ? "你对合法输入与输出保有相应权利，但需授予我们提供与改进服务所必需的许可。"
              : "You retain rights in your lawful inputs and outputs, subject to licenses needed for us to provide and improve the service."}
          </li>
          <li>
            {isZh
              ? "你授予 Genclip 非独占许可，以便在运营服务所必需范围内托管、处理和传输相关内容。"
              : "You grant Genclip a non-exclusive license to host, process, and transmit content as required to operate the service."}
          </li>
          <li>
            {isZh
              ? "你对提交内容的合法性、适当性及生成结果的后续使用承担全部责任。"
              : "You are solely responsible for the legality and suitability of submitted content and downstream use of generated outputs."}
          </li>
        </ul>

        <h2>{isZh ? "5. 套餐、积分与计费" : "5. Plans, Credits, and Billing"}</h2>
        <ul>
          <li>
            {isZh
              ? "付费订阅与一次性积分包按结算页面展示价格计费。"
              : "Paid plans and one-time credit packages are billed as displayed at checkout."}
          </li>
          <li>
            {isZh
              ? "订阅默认可能自动续费；如不续费，请在续费日前取消。你可在账户中管理计费设置。"
              : "Subscriptions may auto-renew unless cancelled before renewal. You can manage billing in your account settings."}
          </li>
          <li>
            {isZh
              ? "积分数额、有效期与价格以你选择的套餐及当前产品配置为准。"
              : "Credits, expiration policies, and pricing are governed by your selected plan and current product configuration."}
          </li>
        </ul>

        <h2>{isZh ? "6. 退款" : "6. Refunds"}</h2>
        <p>
          {isZh
            ? "除非适用法律另有要求或购买时另有明确说明，一旦服务开始提供或积分被消耗，已支付费用通常不予退还。"
            : "Unless required by applicable law or explicitly stated at purchase time, payments are non-refundable after consumption or service delivery begins."}
        </p>

        <h2>{isZh ? "7. 暂停与终止" : "7. Suspension and Termination"}</h2>
        <p>
          {isZh
            ? "如发生违反条款、法律要求、滥用、欺诈或安全风险，我们可暂停或终止访问权限。你也可随时停止使用服务。"
            : "We may suspend or terminate access for violations of these Terms, legal requirements, abuse, fraud, or security risks. You may stop using the service at any time."}
        </p>

        <h2>{isZh ? "8. 免责声明" : "8. Disclaimers"}</h2>
        <p>
          {isZh
            ? "本服务按“现状”与“可用”基础提供。我们不保证服务不间断、无错误或输出完全准确，模型结果可能存在差异。"
            : "The service is provided on an “as is” and “as available” basis. We do not guarantee uninterrupted, error-free, or fully accurate output, and model outputs may vary."}
        </p>

        <h2>{isZh ? "9. 责任限制" : "9. Limitation of Liability"}</h2>
        <p>
          {isZh
            ? "在法律允许的最大范围内，Genclip 对因使用服务引起的间接、附带、特殊、后果性或惩罚性损害，以及利润、数据或业务中断损失不承担责任。"
            : "To the maximum extent permitted by law, Genclip is not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, data, or business interruption arising from use of the service."}
        </p>

        <h2>{isZh ? "10. 赔偿责任" : "10. Indemnification"}</h2>
        <p>
          {isZh
            ? "对于因你的内容、你的使用行为或你违反本条款而引发的索赔，你同意对 Genclip 及其关联方进行赔偿并使其免受损失。"
            : "You agree to indemnify and hold Genclip harmless from claims arising out of your content, your use of the service, or your violation of these Terms."}
        </p>

        <h2>{isZh ? "11. 法律适用与争议处理" : "11. Governing Law and Disputes"}</h2>
        <p>
          {isZh
            ? "本条款适用法律以 Genclip 在服务文档或商业协议中约定的规则为准；争议按当时有效的法律条款中载明的程序处理。"
            : "These Terms are governed by applicable laws identified by Genclip in service documentation and commercial agreements. Disputes are resolved according to the dispute process stated in the then-current legal terms."}
        </p>

        <h2>{isZh ? "12. 条款更新" : "12. Changes to Terms"}</h2>
        <p>
          {isZh
            ? "我们可能不时更新本条款。更新生效后你继续使用服务，即视为接受更新后的条款。"
            : "We may update these Terms from time to time. Continued use after updates become effective constitutes acceptance of the revised Terms."}
        </p>

        <h2>{isZh ? "13. 联系方式" : "13. Contact"}</h2>
        <p>
          {isZh ? "条款与法务咨询：" : "Terms and legal inquiries: "}{" "}
          <a href="mailto:legal@genclip.studio">legal@genclip.studio</a>
          <br />
          {isZh ? "支持邮箱：" : "Support: "}{" "}
          <a href="mailto:support@genclip.studio">support@genclip.studio</a>
        </p>
      </div>
    </div>
  );
}
