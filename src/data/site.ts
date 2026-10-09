export type NavItem = {
  readonly href: string;
  readonly label: string;
};

export type Service = {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly details: readonly string[];
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
    details: [
      '保有特許の棚卸しと活用可能性の評価',
      'ライセンス・譲渡などの活用方針の検討',
      '活用候補先の調査',
      '交渉に向けた準備の支援',
    ],
  },
  {
    id: 'strategy',
    title: '知財戦略の策定支援',
    summary: '事業計画と研究開発の方向性を踏まえ、特許ポートフォリオの設計を含む知財戦略づくりを支援します。',
    details: [
      '事業・技術と知的財産の現状分析',
      '特許ポートフォリオの設計（権利範囲の整理、出願方針の検討）',
      '競合他社の特許動向の分析',
    ],
  },
  {
    id: 'search',
    title: '先行技術調査・侵害予防調査',
    summary: '研究開発や事業化の判断材料として、関連する特許文献を調査し、結果をご報告します。',
    details: [
      '出願前・研究開発段階の先行技術調査',
      '製品化・事業化前の侵害予防調査（関連特許の抽出と調査結果の報告）',
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
