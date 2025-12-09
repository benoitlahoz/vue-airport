# Performance Benchmarks

**Date:** 2025-12-09

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
  "fullName": "user-0",
  "stats": {
    "score": 0
  },
  "tags": [
    "a",
    "b",
    "c"
  ],
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
  "fullName": "USER-0",
  "stats": {
    "score": 0,
    "level": 1
  },
  "processedAt": "2025-12-06"
}
```
</details>

---

## Results

### Current Results (vs 2025-12-09 and baseline)

| Name | Ops/sec (Hz) | Mean (ms) | P99 (ms) | Samples | vs Previous | vs Baseline |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Scaling: Small (10 items) | 64161.12 | 0.0156 | 0.0224 | 32081 | ⚪ +1.5% | 🔴 -83.9% |
| Scaling: Medium (1,000 items) | 638.90 | 1.5652 | 2.3223 | 320 | ⚪ +0.9% | 🔴 -84.7% |
| Scaling: Large (10,000 items) | 62.73 | 15.9420 | 19.0860 | 32 | ⚪ +2.2% | 🔴 -84.9% |
| Complexity: Simple | 62.50 | 16.0013 | 19.4815 | 32 | ⚪ +1.4% | 🔴 -85.0% |
| Complexity: Structural | 85.67 | 11.6734 | 15.1001 | 43 | ⚪ +2.9% | 🔴 -50.1% |
| Complexity: Conditional | 64.53 | 15.4967 | 18.4885 | 33 | ⚪ +1.6% | 🔴 -86.5% |
| Complexity: Heavy | 48.93 | 20.4360 | 28.0361 | 25 | ⚪ +3.3% | 🔴 -57.9% |

### Previous Results

<details>
<summary>View previous benchmark results</summary>

**Date:** 2025-12-09

| Name | Ops/sec (Hz) | Mean (ms) | P99 (ms) | Samples |
| :--- | :--- | :--- | :--- | :--- |
| Scaling: Small (10 items) | 63230.50 | 0.0158 | 0.0233 | 31616 |
| Scaling: Medium (1,000 items) | 633.26 | 1.5791 | 2.2690 | 317 |
| Scaling: Large (10,000 items) | 61.39 | 16.2906 | 19.3817 | 31 |
| Complexity: Simple | 61.63 | 16.2250 | 19.6753 | 31 |
| Complexity: Structural | 83.23 | 12.0154 | 25.0125 | 42 |
| Complexity: Conditional | 63.48 | 15.7523 | 18.6425 | 32 |
| Complexity: Heavy | 47.36 | 21.1128 | 28.1714 | 24 |

</details>

### Baseline Reference

<details>
<summary>View baseline benchmark results</summary>

**Date:** 2025-12-06
**Version:** v2.0.0
**Description:** Baseline performance (Recipe v2.0.0 with operations)

| Name | Ops/sec (Hz) | Mean (ms) | P99 (ms) | Samples |
| :--- | :--- | :--- | :--- | :--- |
| Scaling: Small (10 items) | 397319.54 | 0.0025 | 0.0034 | 198660 |
| Scaling: Medium (1,000 items) | 4175.12 | 0.2395 | 0.3737 | 2088 |
| Scaling: Large (10,000 items) | 414.78 | 2.4109 | 2.8942 | 208 |
| Complexity: Simple | 417.81 | 2.3934 | 2.7787 | 209 |
| Complexity: Structural | 171.63 | 5.8265 | 10.5822 | 86 |
| Complexity: Conditional | 477.95 | 2.0923 | 2.5957 | 239 |
| Complexity: Heavy | 116.29 | 8.5995 | 12.8735 | 59 |

</details>

## Performance Comparison

**Scaling: Small (10 items)** is the fastest.

- **100.43x** faster than *Scaling: Medium (1,000 items)*
- **748.98x** faster than *Complexity: Structural*
- **994.29x** faster than *Complexity: Conditional*
- **1022.86x** faster than *Scaling: Large (10,000 items)*
- **1026.66x** faster than *Complexity: Simple*
- **1311.20x** faster than *Complexity: Heavy*
