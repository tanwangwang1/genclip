import type { Locale } from "@/config/i18n-config";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const alternates = buildAlternates("/privacy-policy", locale);
  const isZh = locale.startsWith("zh");

  return {
    title: isZh ? "隐私政策" : "Privacy Policy",
    alternates: {
      canonical: alternates.canonical,
      languages: alternates.languages,
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const isZh = locale.startsWith("zh");

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-3">
        {isZh ? "隐私政策" : "Privacy Policy"}
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        {isZh ? "生效日期：2026-04-21" : "Effective date: 2026-04-21"}
      </p>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          {isZh
            ? "本隐私政策说明当你使用 Genclip 网站、应用、API 及相关服务时，我们如何收集、使用、存储和披露个人信息。"
            : "This Privacy Policy explains how Genclip collects, uses, stores, and discloses personal information when you use our website, applications, APIs, and related services."}
        </p>

        <h2>{isZh ? "1. 我们收集的信息" : "1. Information We Collect"}</h2>
        <ul>
          <li>
            <strong>{isZh ? "账户与资料数据：" : "Account and profile data:"}</strong>{" "}
            {isZh
              ? "姓名、邮箱、头像、认证标识。"
              : "name, email address, avatar, authentication identifiers."}
          </li>
          <li>
            <strong>{isZh ? "计费与交易数据：" : "Billing and transaction data:"}</strong>{" "}
            {isZh
              ? "订阅与购买记录、支付状态、发票、积分历史。"
              : "subscription and purchase records, payment status, invoices, and credit history."}
          </li>
          <li>
            <strong>{isZh ? "使用与设备数据：" : "Usage and device data:"}</strong>{" "}
            {isZh
              ? "IP 地址、浏览器与设备元数据、访问页面、交互日志和诊断信息。"
              : "IP address, browser and device metadata, pages visited, interaction logs, and diagnostics."}
          </li>
          <li>
            <strong>{isZh ? "用户内容：" : "User content:"}</strong>{" "}
            {isZh
              ? "提示词、上传图片/视频、生成结果、项目元数据及可选反馈。"
              : "prompts, uploaded images/videos, generated outputs, project metadata, and optional feedback."}
          </li>
          <li>
            <strong>{isZh ? "支持沟通信息：" : "Support communications:"}</strong>{" "}
            {isZh
              ? "你联系支持时提交的消息、附件与问题详情。"
              : "messages, attachments, and issue details when you contact us."}
          </li>
        </ul>

        <h2>{isZh ? "2. 我们如何使用信息" : "2. How We Use Information"}</h2>
        <ul>
          <li>
            {isZh
              ? "提供并运行账户、生成、存储和计费功能。"
              : "Provide and operate account, generation, storage, and billing features."}
          </li>
          <li>
            {isZh
              ? "维护服务安全、识别滥用、防止欺诈并执行平台规则。"
              : "Maintain service security, detect abuse, prevent fraud, and enforce policies."}
          </li>
          <li>
            {isZh
              ? "改进模型路由、产品质量、可靠性和用户体验。"
              : "Improve model routing, product quality, reliability, and user experience."}
          </li>
          <li>
            {isZh
              ? "发送服务通知、收据、支持回复和法律通知。"
              : "Send service notifications, receipts, support responses, and legal notices."}
          </li>
          <li>
            {isZh
              ? "履行适用法律义务及合法请求。"
              : "Comply with applicable legal obligations and lawful requests."}
          </li>
        </ul>

        <h2>
          {isZh ? "3. 处理依据（适用时）" : "3. Legal Bases (where applicable)"}
        </h2>
        <p>
          {isZh
            ? "根据你的司法辖区，我们会基于以下一种或多种法律依据处理个人数据：履行合同、合法利益、法律义务，以及在需要时的同意。"
            : "Depending on your jurisdiction, we process personal data under one or more legal bases: contract performance, legitimate interests, legal obligations, and consent (where required)."}
        </p>

        <h2>{isZh ? "4. 共享与披露" : "4. Sharing and Disclosure"}</h2>
        <p>{isZh ? "我们可能将信息披露给：" : "We may disclose information to:"}</p>
        <ul>
          <li>
            <strong>{isZh ? "服务提供商" : "Service providers"}</strong>{" "}
            {isZh
              ? "（托管、分析、邮件、支付与基础设施合作方），并受合同保障约束。"
              : "(hosting, analytics, email, payment, and infrastructure partners) under contractual safeguards."}
          </li>
          <li>
            <strong>{isZh ? "AI 与处理合作方" : "AI and processing partners"}</strong>{" "}
            {isZh
              ? "用于履行你发起的生成请求。"
              : "to fulfill generation requests you initiate."}
          </li>
          <li>
            <strong>
              {isZh ? "监管机构或法律接收方" : "Authorities or legal recipients"}
            </strong>{" "}
            {isZh
              ? "在法律要求或为保护权利、安全与服务完整性时。"
              : "when required by law or to protect rights, safety, and integrity of the service."}
          </li>
          <li>
            <strong>
              {isZh ? "公司交易相关方" : "Corporate transaction parties"}
            </strong>{" "}
            {isZh
              ? "在并购、融资、收购或类似交易中，并受保密措施约束。"
              : "in merger, financing, acquisition, or similar events, subject to confidentiality controls."}
          </li>
        </ul>

        <h2>
          {isZh ? "5. Cookie 与类似技术" : "5. Cookies and Similar Technologies"}
        </h2>
        <p>
          {isZh
            ? "我们使用 Cookie 及类似技术用于身份验证、会话管理、安全、性能与分析。你可通过浏览器设置管理 Cookie 偏好；禁用必要 Cookie 可能导致部分功能不可用。"
            : "We use cookies and similar technologies for authentication, session management, security, performance, and analytics. You can manage cookie preferences through browser settings. Some features may not function properly if essential cookies are disabled."}
        </p>

        <h2>{isZh ? "6. 数据保留" : "6. Data Retention"}</h2>
        <p>
          {isZh
            ? "我们仅在提供服务、安全保障、法律合规、争议处理和合理业务记录所需期限内保留个人信息。具体保留期限会因数据类型与地区要求而不同。"
            : "We retain personal information only as long as needed for service delivery, security, legal compliance, dispute resolution, and legitimate business records. Retention periods vary by data type and jurisdiction."}
        </p>

        <h2>{isZh ? "7. 跨境传输" : "7. International Transfers"}</h2>
        <p>
          {isZh
            ? "你的信息可能在你所在国家/地区之外被处理。在适用情况下，我们会采取适当的跨境传输保障措施。"
            : "Your information may be processed in countries different from your own. Where required, we implement appropriate transfer safeguards."}
        </p>

        <h2>{isZh ? "8. 你的权利" : "8. Your Rights"}</h2>
        <p>
          {isZh
            ? "根据你所在地区，你可能享有访问、更正、删除、限制处理、反对处理、数据可携带等权利；在以同意为处理依据时，你也可撤回同意。"
            : "Depending on your location, you may have rights to access, correct, delete, restrict, object, and port your personal data, and to withdraw consent where consent is the basis for processing."}
        </p>
        <p>
          {isZh ? "如需行使权利，请联系：" : "To exercise rights, contact: "}{" "}
          <a href="mailto:privacy@genclip.studio">privacy@genclip.studio</a>
        </p>

        <h2>{isZh ? "9. 未成年人" : "9. Children"}</h2>
        <p>
          {isZh
            ? "我们的服务不面向你所在司法辖区规定年龄以下的未成年人。如你认为未成年人向我们提供了个人数据，请联系我们，我们将采取适当处理措施。"
            : "Our services are not intended for children under the applicable age threshold in your jurisdiction. If you believe a child has provided personal data, contact us and we will take appropriate action."}
        </p>

        <h2>{isZh ? "10. 安全" : "10. Security"}</h2>
        <p>
          {isZh
            ? "我们采取技术与组织措施保护个人信息。但任何网络传输都无法保证绝对安全。"
            : "We implement technical and organizational measures designed to protect personal information. No internet transmission is completely secure, and we cannot guarantee absolute security."}
        </p>

        <h2>{isZh ? "11. 政策更新" : "11. Policy Updates"}</h2>
        <p>
          {isZh
            ? "我们可能不时更新本隐私政策。若有重大更新，我们将发布并更新生效日期。"
            : "We may update this Privacy Policy from time to time. Material updates will be posted with a revised effective date."}
        </p>

        <h2>{isZh ? "12. 联系我们" : "12. Contact"}</h2>
        <p>
          {isZh ? "隐私咨询：" : "Privacy inquiries: "}{" "}
          <a href="mailto:privacy@genclip.studio">privacy@genclip.studio</a>
          <br />
          {isZh ? "通用支持：" : "General support: "}{" "}
          <a href="mailto:support@genclip.studio">support@genclip.studio</a>
        </p>
      </div>
    </div>
  );
}
