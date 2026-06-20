# Claude Code 接 New API 中转踩坑笔记

> 场景：用 claude-cli (Claude Code) 通过别人的 New API 中转（`https://muyuan.do`）调模型，一路报错排查记录。

## 一、报错演进时间线

| 阶段 | 报错 | HTTP | 真实原因 |
|---|---|---|---|
| 1 | `This channel does not allow the current client (detected: claude-cli/2.1.183 (external, cli))` + `Please run /login` | 403 | 表象是"客户端被拦"，实际是请求的模型在该分组下无可用渠道 |
| 2 | `No available channel for model claude-sonnet-4-5 under group default` | 503 | default 分组里没有接 Claude 上游 |
| 3（换分组后） | `No available channel for model claude-sonnet-4-5 under group 测试分组1` | 503 | 中转有 Claude，但**没有 `claude-sonnet-4-5` 这个名字**，只有 `claude-sonnet-4-6` |
| 4（用对模型名） | `预扣费额度失败, 用户剩余额度: $2278, 需要预扣费额度: $15959.998404` | 403 | 模型/渠道全部匹配，卡在计费：模型单价虚高导致预扣费爆表 |

---

## 二、核心知识点

### 1. New API 的三层结构

- **令牌（Token）**：分给用户的 `sk-xxx`，用来鉴权。
- **渠道（Channel）**：中转后面接的真实上游（一个 OpenAI key / 一个 Claude key / 一个 GLM key…）。一个渠道只能出它接的那类模型。
- **分组（Group）**：把若干渠道打包成组，令牌绑定到某个组。`default` 是默认组。

**调用逻辑**：令牌请求某模型 → 在令牌所属分组里找一个能出该模型的渠道 → 找不到就报 `No available channel for model xxx under group yyy`。

> 换分组 = 换了一批可用渠道。本例中从 `default`（无 Claude）换到 `测试分组1`（有 Claude），就是这个道理。

### 2. `403 external, cli` 的真相

这条报错最有迷惑性——它让你以为是"claude-cli 客户端被禁了"，并提示 `Please run /login`。

**实际上**：claude-cli 默认请求 `claude-sonnet-4-5`，而中转该分组下根本没有这个模型，New API 在渠道筛选阶段拒绝，套了一层"客户端不被允许"的文案。

**结论**：重新登录没用，问题不在凭证，在模型名 / 渠道匹配。

### 3. 怎么知道中转到底支持哪些模型（关键技巧）

不要猜，直接问中转的模型列表接口（OpenAI 标准，New API 实现了）：

```bash
curl -s https://muyuan.do/v1/models \
  -H "Authorization: Bearer sk-xxx"
```

返回里每个模型带 `supported_endpoint_types`，**这是能不能给 claude-cli 用的关键**：

- `["anthropic","openai"]` → claude-cli 能用（claude-cli 走 anthropic 格式）
- `["openai"]` → 只能用 OpenAI SDK / OpenAI 格式调，**claude-cli 用不了**

本例 `测试分组1` 实际可用模型：

| 模型 id | 接口 | 上游 |
|---|---|---|
| `claude-opus-4-8` | anthropic+openai | custom |
| `claude-opus-4-7` | anthropic+openai | vertex-ai |
| `claude-opus-4-6` | anthropic+openai | vertex-ai |
| `claude-sonnet-4-6` | anthropic+openai | vertex-ai |
| `claude-haiku-4-5-20251001` | anthropic+openai | vertex-ai |
| `gpt-5.4` / `gpt-5.4-mini` / `gpt-5.4-openai-compact` | 仅 openai | codex |

⚠️ 没有 `claude-sonnet-4-5`，只有 `claude-sonnet-4-6`。**模型名必须和列表里完全一致**。

### 4. "预扣费额度失败"是什么

```
用户剩余额度: $2278, 需要预扣费额度: $15959.998404
```

- **预扣费**：New API 在请求发出前，按 `max_tokens × 单价` 预估押一笔钱，请求完再按实际用量结算退差。
- 这里一个 `max_tokens:32` 的小请求要预扣 $15959 → **明显是该模型在中转后台单价/倍率配置虚高（或配错）**，不是用法问题。
- 解法：换便宜模型（如 haiku）验证，或找中转商核对模型倍率。

---

## 三、排查 SOP（下次直接照做）

```bash
# 1. 先看这个令牌+分组到底有哪些模型，以及支不支持 anthropic
curl -s https://中转地址/v1/models -H "Authorization: Bearer sk-xxx"

# 2. 挑一个 supported_endpoint_types 含 "anthropic" 的模型，用 anthropic 接口测通
curl -s -w "\nHTTP %{http_code}\n" https://中转地址/v1/messages \
  -H "x-api-key: sk-xxx" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"列表里真实存在的模型名","max_tokens":32,"messages":[{"role":"user","content":"hi"}]}'

# 3. 根据返回判断：
#    - model_not_found / No available channel → 模型名错 or 分组无此渠道
#    - 预扣费额度失败 → 余额不够 or 单价虚高，换便宜模型或找中转商
#    - 正常返回 content → 通了
```

---

## 四、报错 → 病因速查表

| 看到这个 | 病因 | 下一步 |
|---|---|---|
| `external, cli` + `Please run /login` | 模型在该分组无渠道（伪装成客户端拦截） | 别去重登，查模型名/分组 |
| `No available channel for model X under group Y` | 分组 Y 没有能出模型 X 的渠道 | 换分组 / 改模型名 / 让中转商接渠道 |
| `model_not_found` | 模型名拼错或中转没这个名字 | 用 `/v1/models` 核对准确名字 |
| `预扣费额度失败` | 余额不足 or 该模型单价虚高 | 换便宜模型 / 找中转商查倍率 |
| `supported_endpoint_types` 只有 `openai` | 该模型不支持 anthropic 格式 | claude-cli 用不了，换支持 anthropic 的模型 |

---

## 五、claude-cli 走中转的配置参考

```bash
export ANTHROPIC_BASE_URL="https://中转地址"
export ANTHROPIC_AUTH_TOKEN="sk-xxx"
export ANTHROPIC_MODEL="列表里支持 anthropic 的真实模型名"   # 如 claude-opus-4-8
export ANTHROPIC_SMALL_FAST_MODEL="claude-haiku-4-5-20251001"
claude
```

> 不同版本 claude-cli 认的环境变量名可能不同，也可用 `claude --model xxx` 或写进 `~/.claude/settings.json`。

---

## 六、一句话总结

> **claude-cli 接 New API 中转，90% 的报错不是"客户端被禁"，而是：模型名不对、分组里没接对应渠道、或模型单价配置虚高。先 `curl /v1/models` 看清楚有什么、支不支持 anthropic、名字怎么拼，再谈调用。**
