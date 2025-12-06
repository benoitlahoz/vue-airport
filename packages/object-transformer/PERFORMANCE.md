# Performance Benchmarks

**Date:** 2025-12-06

## Benchmark Scenarios & Outputs

### Simple
Basic value transformations (uppercase, add).

<details>
<summary>View Input Data</summary>

```json
{
  "id": 0,
  "name": "user-0",
  "stats": {
    "score": 0,
    "level": 1
  },
  "tags": [
    "a",
    "b",
    "c"
  ]
}
```
</details>

<details>
<summary>View Output Data</summary>

```json
{
  "id": 0,
  "name": "USER-0",
  "stats": {
    "score": 10,
    "level": 1
  },
  "tags": [
    "a",
    "b",
    "c"
  ]
}
```
</details>

---

### Structural
Renaming keys, deleting keys, adding static values.

<details>
<summary>View Input Data</summary>

```json
{
  "id": 0,
  "name": "user-0",
  "stats": {
    "score": 0,
    "level": 1
  },
  "tags": [
    "a",
    "b",
    "c"
  ]
}
```
</details>

<details>
<summary>View Output Data</summary>

```json
{
  "id": 0,
  "stats": {
    "score": 0
  },
  "tags": [
    "a",
    "b",
    "c"
  ],
  "fullName": "user-0",
  "processed": true
}
```
</details>

---

### Conditional
Applying transforms only if a condition is met (e.g. score > 500).

<details>
<summary>View Input Data</summary>

```json
{
  "id": 0,
  "name": "user-0",
  "stats": {
    "score": 0,
    "level": 1
  },
  "tags": [
    "a",
    "b",
    "c"
  ]
}
```
</details>

<details>
<summary>View Output Data</summary>

```json
{
  "id": 0,
  "name": "user-0",
  "stats": {
    "score": 0,
    "level": 1
  },
  "tags": [
    "a",
    "b",
    "c"
  ]
}
```
</details>

---

### Heavy
Combination of all above: rename, transform, delete, conditional, add.

<details>
<summary>View Input Data</summary>

```json
{
  "id": 0,
  "name": "user-0",
  "stats": {
    "score": 0,
    "level": 1
  },
  "tags": [
    "a",
    "b",
    "c"
  ]
}
```
</details>

<details>
<summary>View Output Data</summary>

```json
{
  "id": 0,
  "stats": {
    "score": 0,
    "level": 1
  },
  "fullName": "USER-0",
  "processedAt": "2025-12-06"
}
```
</details>

---

### Structural Complex
Advanced structural changes: splitting strings into multiple keys and flattening objects.

<details>
<summary>View Input Data</summary>

```json
{
  "id": 0,
  "name": "user-0",
  "stats": {
    "score": 0,
    "level": 1
  },
  "tags": [
    "a",
    "b",
    "c"
  ]
}
```
</details>

<details>
<summary>View Output Data</summary>

```json
{
  "id": 0,
  "tags": [
    "a",
    "b",
    "c"
  ],
  "name_0": "user",
  "name_1": "0",
  "stats_score": 0,
  "stats_level": 1
}
```
</details>

---

### Extreme (Deep Nested)
Deeply nested object flattening, multiple renames, splits, and deletions.

<details>
<summary>View Input Data</summary>

```json
{
  "id": "user-0",
  "profile": {
    "personal": {
      "firstName": "John0",
      "lastName": "Doe0",
      "age": 20
    },
    "contact": {
      "email": "john0@example.com",
      "address": {
        "street": "0 Main St",
        "city": "New York",
        "country": "USA",
        "zip": "10000"
      }
    }
  },
  "orders": {
    "lastOrder": {
      "id": "ord-0",
      "total": 100
    },
    "totalSpent": 0
  },
  "metadata": {
    "created": "2023-01-01",
    "tags": "vip,active,premium"
  }
}
```
</details>

<details>
<summary>View Output Data</summary>

```json
{
  "id": "user-0",
  "orders": {
    "lastOrder": {
      "id": "ord-0",
      "total": 100
    },
    "totalSpent": 0
  },
  "metadata": {
    "tags_0": "vip",
    "tags_1": "active",
    "tags_2": "premium"
  },
  "migratedAt": "2025-12-06T19:41:54.158Z"
}
```
</details>

---

## Results

| Name | Ops/sec (Hz) | Mean (ms) | P99 (ms) | Samples |
| :--- | :--- | :--- | :--- | :--- |
| Scaling: Small (10 items) | 399971.23 | 0.0025 | 0.0033 | 199986 |
| Scaling: Medium (1,000 items) | 4353.23 | 0.2297 | 0.3537 | 2177 |
| Scaling: Large (10,000 items) | 426.49 | 2.3447 | 2.7326 | 214 |
| Complexity: Simple | 429.96 | 2.3258 | 2.6736 | 216 |
| Complexity: Structural | 174.23 | 5.7395 | 10.1391 | 88 |
| Complexity: Conditional | 462.30 | 2.1631 | 5.7533 | 232 |
| Complexity: Heavy | 118.85 | 8.4141 | 13.1120 | 60 |
| Complexity: Structural Complex | 74.35 | 13.4507 | 17.6076 | 38 |
| Complexity: Extreme (Deep Nested) | 24.28 | 41.1883 | 45.5224 | 13 |

## Performance Comparison

**Scaling: Small (10 items)** is the fastest.

- **91.88x** faster than *Scaling: Medium (1,000 items)*
- **865.18x** faster than *Complexity: Conditional*
- **930.26x** faster than *Complexity: Simple*
- **937.83x** faster than *Scaling: Large (10,000 items)*
- **2295.62x** faster than *Complexity: Structural*
- **3365.38x** faster than *Complexity: Heavy*
- **5379.87x** faster than *Complexity: Structural Complex*
- **16474.12x** faster than *Complexity: Extreme (Deep Nested)*
