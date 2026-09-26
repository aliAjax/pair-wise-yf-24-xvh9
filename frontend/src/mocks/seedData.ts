const POLICY_V1 = `1. 我们收集的信息
1.1 我们收集您主动提供的注册信息，包括手机号、昵称。
1.2 我们收集设备日志信息，用于安全审计。
2. 信息的使用
2.1 我们仅将信息用于提供核心服务，不会用于其他目的。
3. 信息的共享
3.1 我们不会向任何第三方共享您的个人信息。
4. 信息的保存
4.1 我们仅在必要期间保存您的信息，到期后立即删除。
5. 您的权利
5.1 您可以随时查询、更正您的个人信息。
6. 联系我们
6.1 如有疑问，请通过邮箱 privacy@example.com 联系我们。`;

const POLICY_V2 = `1. 我们收集的信息
1.1 我们收集您主动提供的注册信息，包括手机号、昵称、头像。
1.2 我们收集设备日志信息，用于安全审计。
1.3 经您授权后，我们可能收集精确位置信息，用于附近服务推荐。
2. 信息的使用
2.1 我们仅将信息用于提供核心服务，不会用于其他目的。
3. 信息的共享与转让
3.1 我们可能向关联公司及第三方服务商共享您的个人信息，用于订单履约与数据分析。
4. 信息的保存
4.1 我们仅在必要期间保存您的信息，到期后立即删除。
5. 您的权利
5.1 您可以随时查询、更正您的个人信息。
5.2 您可以撤回授权或注销账号，我们将在十五个工作日内处理。
6. 联系我们
6.1 如有疑问，请通过邮箱 privacy@example.com 联系我们。`;

export const mockData = {
  "policyDocument": [
    {
      "id": 1,
      "title": "隐私政策",
      "version_label": "v1.0",
      "raw_text": POLICY_V1,
      "normalized_sections": "",
      "imported_at": "2026-06-11T09:00:00.000Z"
    },
    {
      "id": 2,
      "title": "隐私政策",
      "version_label": "v2.0",
      "raw_text": POLICY_V2,
      "normalized_sections": "",
      "imported_at": "2026-06-12T09:00:00.000Z"
    }
  ],
  "policySection": [] as unknown[],
  "diffResult": [] as unknown[],
  "reviewNote": [] as unknown[],
  "gateReview": [] as unknown[],
  "releaseSnapshot": [] as unknown[]
} as const;
