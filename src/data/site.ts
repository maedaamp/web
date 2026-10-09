export type NavItem = {
  readonly href: string;
  readonly label: string;
};

export type Service = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly details: readonly {
    readonly title: string;
    readonly description: string;
  }[];
};

export type CompanyField = {
  readonly label: string;
  readonly value: string;
};

export const site = {
  name: 'ＡＭパートナーズ合同会社',
  shortName: 'AM Partners',
  url: 'https://am-partners.org',
  email: 'info@am-partners.org',
  description:
    'ＡＭパートナーズ合同会社は、特許の活用・収益化支援、知財戦略の策定支援、先行技術調査を行う知財コンサルティング会社です。',
} as const;

export const nav: readonly NavItem[] = [
  { href: '/services/', label: '事業内容' },
  { href: '/about/', label: '会社概要' },
  { href: '/contact/', label: 'お問い合わせ' },
];

export const services: readonly Service[] = [
  {
    id: 'monetization',
    title: '特許の活用・収益化支援',
    summary: '保有特許の価値を見極め、ライセンスや譲渡などによる活用の方針づくりを支援します。',
    description: '保有している特許をどのように事業に活かせるか、現状の整理から活用方針の検討までを支援します。特許ごとの活用可能性を確認し、ライセンスや譲渡といった選択肢、活用候補先を検討するための材料を整理します。',
    details: [
      {
        title: '保有特許の棚卸しと活用可能性の評価',
        description: '保有特許の内容や権利範囲を整理し、どのような技術・事業との接点があるかを確認します。活用を検討する特許を見極めるための材料をまとめます。',
      },
      {
        title: 'ライセンス・譲渡などの活用方針の検討',
        description: '保有特許の内容と事業の方向性を踏まえ、ライセンスや譲渡などの活用方法を検討します。各選択肢を比較し、取り組みの方針を考えるお手伝いをします。',
      },
      {
        title: '活用候補先の調査',
        description: '特許に関連する技術や事業を調べ、ライセンスや譲渡の候補となる企業を検討します。候補先と特許との関係を整理し、活用方針の検討につなげます。',
      },
      {
        title: '交渉に向けた準備の支援',
        description: '活用方針や候補先の調査結果を踏まえ、特許の内容や検討事項を整理します。候補先との交渉に向けて、事前に確認・準備する事項の整理を支援します。',
      },
    ],
  },
  {
    id: 'strategy',
    title: '知財戦略の策定支援',
    summary: '事業計画と研究開発の方向性を踏まえ、特許ポートフォリオの設計を含む知財戦略づくりを支援します。',
    description: '事業や研究開発の方向性と、現在の知的財産との関係を整理し、今後の知財の取り組みを考えます。保有特許や競合他社の動向を踏まえ、どの技術について、どのような権利の確保を目指すかを検討します。',
    details: [
      {
        title: '事業・技術と知的財産の現状分析',
        description: '事業計画や研究開発の方向性を確認し、保有する知的財産とのつながりを整理します。現在の事業を支える技術と、今後の取り組みで検討すべき知財上の課題を把握します。',
      },
      {
        title: '特許ポートフォリオの設計',
        description: '複数の特許を事業・技術との関係から捉え、権利範囲を整理します。今後どの技術について出願を検討するかなど、事業の方向性に合った特許の構成と出願方針を考えます。',
      },
      {
        title: '競合他社の特許動向の分析',
        description: '競合他社の特許を調べ、出願している技術領域や権利の内容を整理します。自社の事業・技術と照らし合わせ、知財戦略や出願方針を検討するための材料とします。',
      },
    ],
  },
  {
    id: 'search',
    title: '先行技術調査・侵害予防調査',
    summary: '研究開発や事業化の判断材料として、関連する特許文献を調査し、結果をご報告します。',
    description: '出願前や研究開発段階、製品化・事業化前など、検討の段階に応じて関連する特許文献を調べます。調査の目的に沿って文献を抽出し、その内容を整理・報告することで、次の判断に必要な情報を提供します。',
    details: [
      {
        title: '出願前・研究開発段階の先行技術調査',
        description: '検討中の技術に関連する特許文献を調査し、すでに開示されている技術の内容を整理します。出願の検討や研究開発の方向性を考える際の判断材料として、調査結果をご報告します。',
      },
      {
        title: '製品化・事業化前の侵害予防調査',
        description: '製品や事業に関連する特許を抽出し、その内容を整理してご報告します。製品化・事業化に向けて、関連特許の存在や確認すべき点を把握するための調査です。',
      },
    ],
  },
];

export const company: readonly CompanyField[] = [
  { label: '商号', value: 'ＡＭパートナーズ合同会社' },
  { label: '代表社員', value: '前田 充宏' },
  { label: '所在地', value: '〒107-0061 東京都港区北青山1丁目3番1号 アールキューブ青山3階' },
  { label: '設立', value: '2025年（令和7年）9月4日' },
  { label: '資本金', value: '50万円' },
  { label: '事業内容', value: '知的財産に関するコンサルティング' },
  { label: 'お問い合わせ', value: site.email },
];

export type CloudService = {
  readonly name: string;
  readonly purpose: string;
  readonly providerCountry: string;
  readonly storageCountry: string;
};

// プライバシーポリシーの「外的環境の把握」に掲載する。
// 個人データを扱うサービスの利用を開始・変更したら、ここを更新する。
export const cloudServices: readonly CloudService[] = [
  {
    name: 'Google Workspace（Google LLC）',
    purpose: 'メールの送受信、文書・ファイルの作成および保存',
    providerCountry: '米国',
    storageCountry: '米国その他Google LLCがデータセンターを置く国',
  },
];
