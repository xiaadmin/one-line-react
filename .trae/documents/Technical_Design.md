# 技术方案文档

## 1. 技术选型

### 前端框架
- **React + TypeScript**
- **Vite** 作为构建工具

### 路由
- **React Router**

### 状态管理
- 轻量方案优先：
  - **Zustand**

### 样式方案
- **Tailwind CSS + 少量 CSS 动画**

### 动画
- **Framer Motion**
- 棋盘连线动画可用 Canvas/SVG 实现

### 音频
- 原生 HTMLAudioElement 或 **Howler.js** 管理 BGM / SFX

### 存储
- **localStorage**

### 部署
- **Vercel / Netlify**

---

## 2. 项目目录规划

```bash
one-line-react/
├── public/
│   ├── audio/
│   ├── images/
│   └── levels/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── game/
│   │   └── ui/
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LevelSelectPage.tsx
│   │   ├── GamePage.tsx
│   │   ├── DailyChallengePage.tsx
│   │   └── SettingsPage.tsx
│   ├── store/
│   │   ├── gameStore.ts
│   │   └── settingsStore.ts
│   ├── hooks/
│   │   ├── usePointerLine.ts
│   │   ├── useAudio.ts
│   │   └── useLevelProgress.ts
│   ├── engine/
│   │   ├── levelGenerator.ts
│   │   ├── pathValidator.ts
│   │   ├── gameRules.ts
│   │   └── dailyChallenge.ts
│   ├── data/
│   │   ├── campaignLevels.ts
│   │   └── dailyTemplates.ts
│   ├── types/
│   │   └── game.ts
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── README.md
```

---

## 3. 核心模块设计

### 3.1 关卡数据模块
负责管理：
- 100 关静态数据
- 难度标签
- 起点坐标
- 可走节点列表
- 标准答案/校验逻辑

### 3.2 连线输入模块
负责：
- 鼠标拖动
- 触摸拖动
- 实时路径记录
- 节点吸附
- 非法移动拦截

### 3.3 判题模块
负责：
- 是否覆盖全部目标节点
- 是否重复经过
- 是否形成合法路径
- 成功/失败状态返回

### 3.4 进度模块
负责：
- 解锁逻辑
- 当前关卡
- 剩余机会
- 本地存档

### 3.5 音频模块
负责：
- 背景音乐
- 音效播放
- 音量控制
- 页面切换时状态保持

### 3.6 每日挑战模块
负责：
- 按日期生成挑战关卡
- 时间限制
- 次数限制
- 当日完成记录

---

## 4. 数据结构设计

### 4.1 关卡类型
```ts
type Cell = {
  x: number;
  y: number;
};

type LevelData = {
  id: number;
  mode: 'campaign' | 'daily';
  width: number;
  height: number;
  walkableCells: Cell[];
  startCell: Cell;
  endCell?: Cell;
  difficulty: number;
  maxAttempts: number;
  timeLimit?: number;
  hintPath?: Cell[];
};
```

### 4.2 玩家进度
```ts
type PlayerProgress = {
  unlockedLevel: number;
  completedLevels: number[];
  bestRecords: Record<number, {
    time: number;
    attemptsLeft: number;
  }>;
  dailyChallenge: {
    date: string;
    completed: boolean;
    attemptsLeft: number;
  };
};
```

---

## 5. 连线实现方案

### 方案建议：SVG + Pointer Events
原因：
- 移动端兼容好
- 路径渲染清晰
- 易做动画
- 比纯 DOM 更稳定

### 连线流程
1. 玩家按下起点
2. 开始记录路径
3. 拖动时检测指针所在最近合法节点
4. 若与上一个节点相邻且未访问，则加入路径
5. 实时渲染折线
6. 覆盖全部目标节点则成功

### 邻接规则
默认仅允许：
- 上下左右四方向移动

---

## 6. 关卡难度生成策略

### 固定关卡优先
首版建议：**先做 100 个静态关卡**

### 每日挑战
可使用：
- 固定高难模板池
- 按日期 hash 选择当日关卡

---

## 7. 页面流程

### 首页
`/`
- Logo
- 当前进度
- 开始闯关
- 每日挑战
- 设置

### 关卡页
`/levels`
- 展示 1~100
- 未解锁置灰

### 游戏页
`/game/:levelId`
- 棋盘
- 尝试次数
- 提示/重置/返回

### 每日挑战页
`/daily`
- 倒计时
- 剩余次数
- 挑战入口

---

## 8. 动画与反馈方案

### 连线时
- 路径绘制动画
- 节点高亮

### 错误时
- 红色闪烁
- 按钮抖动
- 错误音效

### 通关时
- 棋盘发光
- 粒子特效
- “通关成功 / 升级成功”弹层
- 自动解锁下一关