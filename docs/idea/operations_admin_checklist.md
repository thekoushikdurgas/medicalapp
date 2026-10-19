# Pharmacy Fantasy — Operations Admin: 200-Point Checklist & Automation Blueprint

The Operations Admin is the daily business control manager of Pharmacy Fantasy. The Super Admin governs the entire platform; the Operations Admin ensures that the business runs smoothly across retailers, warehouse staff, inventory, orders, deliveries, and collections.

The goal is to make the Operations Admin dashboard an operational command centre: it should identify problems, assign work, track progress, and automatically escalate unresolved issues rather than requiring the Admin to check every screen manually.

## 1. Operations Admin responsibilities at a glance

[Logistics Coordinator Course Certificate | Free & Fast Course](https://images.openai.com/static-rsc-4/-mLl4A1WCd98gCTlzonAW7OEEe31r5ZbtkePeYwrUUXgr4pemUoqq4pXe1Po5FDb8A8gD88IIM353WUs18Ddybn7Hdsdi0tB7qwkawZ6TjVWMCo1btl1x1UjOwb01j77LKG4W9FcBbnn6kWcBHJunJU7ClIrLNYKaZgRGLJ7tII?purpose=inline)

Business operations

Monitor orders, stock availability, fulfilment queues, deliveries, and daily performance.

[Doing some stocktaking around the dispensary](https://images.openai.com/static-rsc-4/QfeJyvXYGLYEEPQo4hJGNTZHT6grfq1X0Sq9V0W8aPmep1G4iRO0jbcDZrVXhCbBfLDr_m6oaGHGiU7i4lNvH0CX9dcTSJUMXxWcRnjL281Y6pS8PkjdpBwbjKEZKAb7Bbzw6xh4nnawcFIzjXiWy7wG7q-B77Yr4pBBUU0OcupVcSUALXF_NPKhmZr48l8b?purpose=inline)

Retailer management

Review onboarding, verify required business documents, manage account status, and oversee credit approvals.

[Welcome to Shifaa Pharmacy | Shifaa Pharmacy](https://images.openai.com/static-rsc-4/4x5JdbxeU8be_s6srtFH8OdNbDEwqUCzuo35xXIKMS0hBti5cuMvTAhyeCzSOSrgH8gSoOTNAHtRsutR0MLBq-79EwYGmpSq0vSS0kHCezgZtWl0ngaoYhwjK3FCUh7_v3Jm11crnW6svDrr4uLL_0llPSHlyLT6Ep-oACAzrpE?purpose=inline)

Staff and fulfilment supervision

Manage permitted staff accounts, monitor workload, coordinate warehouse activity, and assign delivery personnel.

[What is Reconciliation in Accounting? | FloQast](https://images.openai.com/static-rsc-4/noX4s0yTOlNlHkHZyjLDBHI9bsXEbHavFQOjw-1_yT_HITWbnVRnDnhUhKdEVT_9uXI-_dKXvq5BsNV9SqNjxr55HV7H0FZY6myCvtekolkq2tq8QdHNqHt2cnQopDQk3y0Qmof1edOu4S-59_WsYIDR_R49Z72ZhRqOSljuiHk?purpose=inline)

Financial and operational control

Monitor credit exposure, overdue accounts, payment discrepancies, returns, invoices, and performance reports.

Permission boundary: The Operations Admin can manage permitted operational users and workflows, but must not create, promote, or assign the Super Admin role. Credit overrides and other sensitive actions should follow explicit approval and audit policies.

The checklist below is a proposed implementation plan aligned with the Pharmacy Fantasy role and workflow documentation. It does not imply that every listed feature is already implemented.

## 2. The 200-item Operations Admin checklist

The checklist is divided into 10 operational domains, with 20 tasks in each domain. It covers the existing documented responsibilities—staff management, retailer credit and verification, delivery assignment, analytics, collections, stock movement, and reporting—plus recommended controls and automation tasks.

## Operations Admin task tracker

**Status Breakdown across 200 items:**

- 🟢 **[Done]**: 177 tasks (88.5%) — Production-ready in admin dashboard, order supervision, credit controls, KYC review, ledger, claims, automation tower, incident center, work queue balancing, and security audit logs
- 🟡 **[Partial]**: 0 tasks (0%) — All operational workflows fully integrated
- 🔵 **[Todo]**: 0 tasks (0%) — All planned software features implemented
- 🟣 **[Learn]**: 23 tasks (11.5%) — Administrative governance, legal verification, operational reviews, and dispute resolution
- ⚪ **[N/A]**: 0 tasks (0%)

**Software Readiness:** 177 / 177 (100% software scope readiness) | **Total Tracked:** 200 / 200

| Section | Domain | Done | Partial | Todo | Learn | N/A | Total |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A** | Dashboard and daily operations | 19 | 0 | 0 | 1 | 0 | 20 |
| **B** | Staff and user administration | 19 | 0 | 0 | 1 | 0 | 20 |
| **C** | Retailer onboarding and verification | 18 | 0 | 0 | 2 | 0 | 20 |
| **D** | Credit control and retailer accounts | 19 | 0 | 0 | 1 | 0 | 20 |
| **E** | Product and inventory oversight | 18 | 0 | 0 | 2 | 0 | 20 |
| **F** | Orders and warehouse fulfilment | 19 | 0 | 0 | 1 | 0 | 20 |
| **G** | Delivery and logistics supervision | 17 | 0 | 0 | 3 | 0 | 20 |
| **H** | Invoices, returns, and payments | 19 | 0 | 0 | 1 | 0 | 20 |
| **I** | Reports, compliance, and staff performance | 16 | 0 | 0 | 4 | 0 | 20 |
| **J** | Automation, security, and incident handling | 13 | 0 | 0 | 7 | 0 | 20 |
| **Total** | **All 10 Operational Domains** | **177** | **0** | **0** | **23** | **0** | **200** |

&#x20;Copy all 200 checklist items

## 3. How to automate the Operations Admin's work

The key design principle is to automate detection, routine validation, reminders, routing, and reporting while keeping sensitive decisions under authorised human control.

### Recommended automation architecture

1\. Detect business events

New retailer · New order · Stock shortage · Failed delivery · Payment received

2\. Evaluate business rules

Validate permissions, thresholds, deadlines, record ownership, and current status.

Automatic processing

Notify, validate, assign a task, update an eligible status, or generate a report.

Admin approval

Credit exceptions, sensitive account decisions, financial corrections, and unusual cases.

3\. Operations Admin control centre

Prioritised tasks · Approval queue · SLA alerts · Resolution tracking · Audit history

### Suggested implementation with your existing stack

Your Pharmacy Fantasy documentation specifies Next.js, Apollo Client, FastAPI, Strawberry GraphQL, PostgreSQL, and Redis. Those components are sufficient to establish the initial automation architecture.&#x20;

PROJECT.md

| Component                    | Recommended responsibility                                                    |
| ---------------------------- | ----------------------------------------------------------------------------- |
| Next.js Admin dashboard      | Display work queues, alerts, approvals, and reports.                          |
| FastAPI + Strawberry GraphQL | Enforce permissions and business rules.                                       |
| PostgreSQL                   | Store operational records, tasks, approval decisions, and audit events.       |
| Redis                        | Support caching, event distribution, and queue coordination where configured. |
| Background workers           | Process scheduled checks, notifications, and reconciliation tasks.            |
| Notification service         | Send in-app, email, or other configured alerts.                               |
| Automation registry          | Store rules, owners, thresholds, run history, and failure details.            |

Use a durable job queue and transactional outbox if your current Redis setup does not already provide reliable event processing. Redis should not be treated as the only permanent record of a financial or business event.

## 4. Fifteen automations for the Operations Admin

01\. Morning operations briefing

Automatic

Generate a daily summary of new orders, fulfilment backlog, sales, outstanding credit, delayed deliveries, stock alerts, and unresolved exceptions. Show changes since the previous business day.

02\. Retailer onboarding assistant

Review required

Check application completeness, flag missing documents, detect possible duplicate registrations, and route applications to an authorised reviewer. Do not automatically declare a drug licence valid based solely on uploaded data.

03\. Credit-limit enforcement

Automatic validation

Recalculate available credit when an order is placed or confirmed. Block or hold orders that breach the configured policy and route exceptions to the appropriate approver.

04\. Stockout prevention

Automatic

Monitor available stock against reorder thresholds and outstanding demand. Create a replenishment task for Warehouse Staff rather than allowing the Admin to discover shortages manually.

05\. Order SLA escalation

Automatic

Detect orders stuck in confirmation, picking, packing, or dispatch beyond configured deadlines. Notify the responsible team first, then escalate unresolved cases to the Operations Admin.

06\. Delivery assignment suggestions

Assisted automation

Suggest available drivers based on assigned workload, delivery area, and shipment readiness. Require an authorised assignment operation and prevent duplicate active assignments.

07\. Failed-delivery follow-up

Automatic

When a delivery fails, create a case with the failure reason, notify the Admin, and recommend the next permitted action. Do not automatically reassign a disputed shipment without the required checks.

08\. Collection reconciliation

Exception-based

Compare recorded cash and UPI collections with available payment evidence and warehouse handover records. Flag missing or mismatched amounts for investigation.

09\. Invoice and return exception monitoring

Exception-based

Detect missing invoice references, duplicate payment references, inconsistent return quantities, and credit-note mismatches. Route the case to the authorised operator.

10\. Retailer notifications

Automatic

Notify retailers about order confirmation, dispatch, delivery exceptions, invoice availability, payment receipts, and account restrictions through configured channels.

11\. Workload balancing

Assisted automation

Show staff workload, overdue tasks, and available capacity. Suggest reallocation where permitted, preserving a record of the assignment and the person who approved it.

12\. Scheduled performance reports

Automatic

Generate daily sales and fulfilment reports, weekly delivery and collection summaries, and monthly business performance reports using consistent definitions.

13\. Operational anomaly detection

Review required

Flag repeated failed deliveries, unusual stock adjustments, unexpected credit-limit changes, and suspicious collection discrepancies. Treat anomalies as investigation signals, not proof of misconduct.

14\. Background-job and integration monitoring

Automatic

Monitor job failures, stale queues, notification errors, API health, and database connectivity. Retry transient failures safely and escalate persistent failures.

15\. Approval and escalation manager

Controlled

Route requests to the correct approver, track deadlines, notify the responsible person, and escalate overdue approvals. Enforce the Operations Admin's authority limits.

## 5. Operations Admin automation rules

Every automation should have a defined trigger, action, escalation path, and safety condition.

| Trigger                              | Automated action                                      | Admin involvement                           |
| ------------------------------------ | ----------------------------------------------------- | ------------------------------------------- |
| Retailer registers                   | Validate fields and create a review task if needed    | Review exceptions and approve when required |
| Order exceeds credit                 | Hold or reject according to policy                    | Review authorised exception requests        |
| Stock falls below threshold          | Create replenishment task and notify warehouse        | Monitor unresolved shortages                |
| Order exceeds fulfilment SLA         | Alert responsible staff and escalate                  | Resolve bottlenecks                         |
| Delivery fails                       | Create exception case and notify operations           | Decide permitted next steps                 |
| Collection mismatch                  | Create reconciliation case                            | Investigate and authorise correction        |
| Licence document approaches expiry   | Send reminders and flag account for review            | Verify and decide restrictions              |
| Duplicate payment reference detected | Flag or block according to validated uniqueness rules | Review ambiguous matches                    |
| Daily schedule triggers              | Generate operational summary                          | Review critical exceptions                  |
| Background job repeatedly fails      | Stop repeated retries and raise an incident           | Investigate or escalate                     |

### Automation safety rules

- Idempotency: Reprocessing an event must not create a second payment, invoice, delivery assignment, or credit adjustment.
- Transactional integrity: Update related financial and inventory records consistently.
- Server-side permissions: Validate every action using the authenticated user and authorised scope.
- Audit trail: Record who initiated, approved, or executed a sensitive action.
- Bounded retries: Retry transient failures, but stop and alert when failures persist.
- Human approval: Keep sensitive financial adjustments, unusual credit overrides, and disputed business decisions behind appropriate approval gates.

## 6. What to build in the Operations Admin dashboard

## Operations Control Center

Illustrative design specification, not live operational data.

Order backlog

Orders requiring action

Delivery exceptions

Delayed or failed shipments

Credit and collections

Overdue accounts and discrepancies

Retailer approvals

Pending verification and review

Priority work queue

Critical exceptions

Stock inconsistency, overdue delivery, payment discrepancy, or a security escalation.

Tasks approaching deadline

Orders awaiting fulfilment, pending reviews, and unresolved cases.

Completed automated work

Reports generated, notifications delivered, and checks completed successfully.

The Admin should be able to open any alert, inspect the underlying records, assign responsibility, add a resolution note, and close the case. Closing a case should not erase its history.

## 7. Recommended implementation phases

| Phase | Build                                                                            | Priority |
| ----- | -------------------------------------------------------------------------------- | -------- |
| 1     | Role permissions, retailer management, credit validation, audit logging          | Critical |
| 2     | Operational dashboard, order backlog, delivery assignment and exception tracking | Critical |
| 3     | Low-stock alerts, expiry alerts, SLA escalation, notifications                   | High     |
| 4     | Collection reconciliation, invoice exceptions, retailer account reporting        | High     |
| 5     | Background-job monitoring, automated reports, workload suggestions               | High     |
| 6     | Anomaly detection, advanced approval workflows, automation performance analytics | Later    |

Final recommendation: Make the Operations Admin responsible for exceptions and decisions, while the system handles routine detection, validation, notifications, and reporting. That will reduce manual checking, improve fulfilment speed, and provide stronger accountability across Pharmacy Fantasy.

The permission boundaries and core workflows above follow the uploaded role and screen specifications.&#x20;

ROLES.md

pages.md
A. Dashboard and daily operations

- [x] **[Done]** 1. Review daily sales turnover.
- [x] **[Done]** 2. Review total orders placed today.
- [x] **[Done]** 3. Review orders awaiting confirmation.
- [x] **[Done]** 4. Review orders currently being picked.
- [x] **[Done]** 5. Review packed orders awaiting dispatch.
- [x] **[Done]** 6. Review deliveries in progress.
- [x] **[Done]** 7. Review failed and overdue deliveries.
- [x] **[Done]** 8. Review aggregate retailer outstanding balances.
- [x] **[Done]** 9. Review low-stock alerts.
- [x] **[Done]** 10. Review near-expiry inventory alerts.
- [x] **[Done]** 11. Review new retailer registrations.
- [x] **[Done]** 12. Review pending licence and GSTIN verification.
- [x] **[Done]** 13. Review staff availability and workload.
- [x] **[Done]** 14. Review unresolved customer complaints.
- [x] **[Done]** 15. Review pending approvals.
- [x] **[Done]** 16. Review payment collection summaries.
- [x] **[Done]** 17. Review inventory movement summaries.
- [x] **[Done]** 18. Review order fulfilment performance.
- [x] **[Done]** 19. Review critical system alerts.
- [ ] **[Learn]** 20. Set operational priorities for the shift.

B. Staff and user administration

- [x] **[Done]** 21. Create Warehouse Staff accounts.
- [x] **[Done]** 22. Create Delivery Boy accounts.
- [x] **[Done]** 23. Create Retail Shopkeeper accounts.
- [x] **[Done]** 24. Create Operations Admin accounts where authorised.
- [x] **[Done]** 25. Edit permitted user profile details.
- [x] **[Done]** 26. Assign permitted operational roles.
- [x] **[Done]** 27. Prevent assignment of the Super Admin role.
- [x] **[Done]** 28. Activate eligible staff accounts.
- [x] **[Done]** 29. Deactivate accounts with a recorded reason.
- [x] **[Done]** 30. Review user account status.
- [x] **[Done]** 31. Review staff contact information.
- [x] **[Done]** 32. Validate required profile fields.
- [x] **[Done]** 33. Assign warehouse staff to permitted work queues.
- [x] **[Done]** 34. Review delivery personnel availability.
- [x] **[Done]** 35. Review assigned delivery workloads.
- [x] **[Done]** 36. Resolve duplicate or conflicting user records.
- [x] **[Done]** 37. Trigger secure password-reset workflows.
- [x] **[Done]** 38. Revoke access for deactivated accounts.
- [x] **[Done]** 39. Review role changes and account history.
- [ ] **[Learn]** 40. Escalate privileged-access problems to Super Admin.

C. Retailer onboarding and verification

- [x] **[Done]** 41. Review newly registered pharmacies.
- [x] **[Done]** 42. Check mandatory retailer profile fields.
- [x] **[Done]** 43. Review submitted drug licence details.
- [x] **[Done]** 44. Review GSTIN information where applicable.
- [x] **[Done]** 45. Check required business documents for completeness.
- [x] **[Done]** 46. Record verification outcomes.
- [x] **[Done]** 47. Request missing documents.
- [x] **[Done]** 48. Return incomplete applications for correction.
- [x] **[Done]** 49. Record rejection reasons.
- [x] **[Done]** 50. Approve eligible retailers within delegated authority.
- [x] **[Done]** 51. Maintain retailer contact information.
- [x] **[Done]** 52. Maintain shop address and delivery area.
- [x] **[Done]** 53. Review duplicate pharmacy registrations.
- [ ] **[Learn]** 54. Track licence expiry dates where available.
- [x] **[Done]** 55. Flag expired or unverifiable documents.
- [x] **[Done]** 56. Restrict accounts when policy requires it.
- [x] **[Done]** 57. Notify retailers about onboarding decisions.
- [x] **[Done]** 58. Separate verification from credit approval.
- [x] **[Done]** 59. Track pending retailer review time.
- [ ] **[Learn]** 60. Escalate complex or suspicious cases.

D. Credit control and retailer accounts

- [x] **[Done]** 61. Review retailer credit limits.
- [x] **[Done]** 62. Review current outstanding balances.
- [x] **[Done]** 63. Calculate remaining credit headroom.
- [x] **[Done]** 64. Review orders exceeding available credit.
- [x] **[Done]** 65. Apply configured credit rules at order confirmation.
- [x] **[Done]** 66. Review requests for increased credit limits.
- [x] **[Done]** 67. Approve permitted credit changes.
- [x] **[Done]** 68. Record reasons for credit-limit changes.
- [x] **[Done]** 69. Record previous and new credit limits.
- [x] **[Done]** 70. Escalate overrides beyond delegated authority.
- [x] **[Done]** 71. Identify retailers approaching credit ceilings.
- [x] **[Done]** 72. Identify overdue invoices.
- [x] **[Done]** 73. Review repeated late-payment patterns.
- [x] **[Done]** 74. Review advance receipts and their allocation.
- [x] **[Done]** 75. Review credit notes affecting retailer balances.
- [x] **[Done]** 76. Investigate unusual balance movements.
- [x] **[Done]** 77. Send authorised payment reminders.
- [x] **[Done]** 78. Review retailer account restrictions.
- [x] **[Done]** 79. Generate retailer-wise outstanding reports.
- [ ] **[Learn]** 80. Escalate disputed or unreconciled balances.

E. Product and inventory oversight

- [x] **[Done]** 81. Review newly created product SKUs.
- [x] **[Done]** 82. Check required product master fields.
- [x] **[Done]** 83. Review medicine names and pack sizes.
- [x] **[Done]** 84. Review HSN and tax configuration exceptions.
- [x] **[Done]** 85. Review authorised trade-pricing changes.
- [x] **[Done]** 86. Monitor product activation and deactivation.
- [x] **[Done]** 87. Review low-stock medicines.
- [x] **[Done]** 88. Review batch expiry alerts.
- [x] **[Done]** 89. Review expired stock exceptions.
- [x] **[Done]** 90. Review quarantined and damaged inventory.
- [x] **[Done]** 91. Monitor unusual stock adjustments.
- [x] **[Done]** 92. Review stock movement reports.
- [ ] **[Learn]** 93. Compare recorded stock with physical-count results.
- [x] **[Done]** 94. Identify negative or inconsistent quantities.
- [x] **[Done]** 95. Monitor slow-moving medicines.
- [x] **[Done]** 96. Review fast-moving medicines.
- [x] **[Done]** 97. Prepare replenishment requests for approval.
- [x] **[Done]** 98. Review warehouse stock discrepancy reports.
- [x] **[Done]** 99. Escalate unusual write-offs.
- [ ] **[Learn]** 100. Coordinate inventory corrections with warehouse staff.

F. Orders and warehouse fulfilment

- [x] **[Done]** 101. Monitor new wholesale orders.
- [x] **[Done]** 102. Review orders waiting for stock allocation.
- [x] **[Done]** 103. Monitor FEFO allocation exceptions.
- [x] **[Done]** 104. Review stock shortages affecting orders.
- [x] **[Done]** 105. Track picking backlog.
- [x] **[Done]** 106. Track packing backlog.
- [x] **[Done]** 107. Review order fulfilment delays.
- [ ] **[Learn]** 108. Coordinate work with warehouse staff.
- [x] **[Done]** 109. Review packed quantities against order quantities.
- [x] **[Done]** 110. Monitor partially fulfilled orders.
- [x] **[Done]** 111. Review cancellation requests within permitted stages.
- [x] **[Done]** 112. Ensure cancellation reverses stock reservations.
- [x] **[Done]** 113. Review orders blocked by credit rules.
- [x] **[Done]** 114. Resolve authorised order exceptions.
- [x] **[Done]** 115. Monitor delivery-challan readiness.
- [x] **[Done]** 116. Check dispatch queue completeness.
- [x] **[Done]** 117. Review missing dispatch information.
- [x] **[Done]** 118. Escalate orders exceeding configured SLAs.
- [x] **[Done]** 119. Review order-status transition errors.
- [x] **[Done]** 120. Maintain an operational backlog for the next shift.

G. Delivery and logistics supervision

- [x] **[Done]** 121. Review delivery personnel availability.
- [x] **[Done]** 122. Assign eligible drivers to packed orders.
- [x] **[Done]** 123. Verify the assignment matches the correct shipment.
- [x] **[Done]** 124. Review delivery addresses and contact details.
- [x] **[Done]** 125. Review carton counts before dispatch.
- [x] **[Done]** 126. Monitor pickup confirmation.
- [x] **[Done]** 127. Monitor deliveries in transit.
- [x] **[Done]** 128. Identify overdue delivery assignments.
- [x] **[Done]** 129. Review failed-delivery reasons.
- [x] **[Done]** 130. Coordinate reassignment where permitted.
- [x] **[Done]** 131. Review partial-delivery exceptions.
- [x] **[Done]** 132. Review proof-of-delivery completeness.
- [x] **[Done]** 133. Escalate missing signatures or required evidence.
- [x] **[Done]** 134. Review repeated delivery failures.
- [x] **[Done]** 135. Track delivery completion times.
- [x] **[Done]** 136. Monitor cash collection obligations.
- [x] **[Done]** 137. Monitor UPI collection evidence.
- [ ] **[Learn]** 138. Reconcile driver handovers with warehouse records.
- [ ] **[Learn]** 139. Investigate missing cash or unresolved collections.
- [ ] **[Learn]** 140. Close delivery exceptions after documented resolution.

H. Invoices, returns, and payments

- [x] **[Done]** 141. Monitor invoice-generation queues.
- [x] **[Done]** 142. Review invoice numbering exceptions.
- [x] **[Done]** 143. Check invoice-to-order references.
- [x] **[Done]** 144. Review GST calculation exceptions.
- [x] **[Done]** 145. Review delivery-challan records.
- [x] **[Done]** 146. Monitor pre-invoice challan returns.
- [x] **[Done]** 147. Monitor post-invoice return requests.
- [x] **[Done]** 148. Verify return approvals and inspection outcomes.
- [x] **[Done]** 149. Review credit-note references.
- [x] **[Done]** 150. Ensure returned goods receive the correct stock disposition.
- [x] **[Done]** 151. Monitor advance payment receipt records.
- [x] **[Done]** 152. Review payment reference duplicates.
- [x] **[Done]** 153. Reconcile payment records against available evidence.
- [x] **[Done]** 154. Investigate missing payment confirmations.
- [x] **[Done]** 155. Review retailer ledger discrepancies.
- [x] **[Done]** 156. Monitor delivery cash handover discrepancies.
- [x] **[Done]** 157. Review refund or credit adjustment requests.
- [x] **[Done]** 158. Escalate financial corrections beyond delegated authority.
- [x] **[Done]** 159. Prepare payment collection summaries.
- [ ] **[Learn]** 160. Maintain traceable resolution records for financial disputes.

I. Reports, compliance, and staff performance

- [x] **[Done]** 161. Generate daily sales summaries.
- [x] **[Done]** 162. Generate weekly sales summaries.
- [x] **[Done]** 163. Generate monthly performance summaries.
- [x] **[Done]** 164. Review sales by retailer.
- [x] **[Done]** 165. Review sales by product.
- [x] **[Done]** 166. Review sales by category.
- [x] **[Done]** 167. Review stock movement reports.
- [x] **[Done]** 168. Review fast- and slow-moving medicine reports.
- [x] **[Done]** 169. Review fulfilment time reports.
- [x] **[Done]** 170. Review delivery success and failure rates.
- [x] **[Done]** 171. Review payment collection performance.
- [x] **[Done]** 172. Review outstanding credit reports.
- [x] **[Done]** 173. Prepare authorised GST reporting exports.
- [x] **[Done]** 174. Review missing or inconsistent reporting data.
- [x] **[Done]** 175. Compare reports with source transactions.
- [x] **[Done]** 176. Review staff workload distribution.
- [ ] **[Learn]** 177. Review repeated operational errors.
- [ ] **[Learn]** 178. Track resolution time for exceptions.
- [ ] **[Learn]** 179. Maintain records of operational decisions.
- [ ] **[Learn]** 180. Share approved reports with authorised stakeholders.

J. Automation, security, and incident handling

- [x] **[Done]** 181. Review the automation job registry.
- [x] **[Done]** 182. Review failed background jobs.
- [x] **[Done]** 183. Monitor stale or delayed work queues.
- [x] **[Done]** 184. Review duplicate event-processing alerts.
- [x] **[Done]** 185. Monitor notification delivery failures.
- [x] **[Done]** 186. Review overdue approval requests.
- [x] **[Done]** 187. Monitor repeated authentication failures.
- [ ] **[Learn]** 188. Escalate suspected account compromise.
- [x] **[Done]** 189. Review sensitive role changes.
- [x] **[Done]** 190. Ensure restricted actions remain server-authorised.
- [x] **[Done]** 191. Review audit events for critical operations.
- [x] **[Done]** 192. Monitor integration and API health alerts.
- [ ] **[Learn]** 193. Pause an unsafe workflow when authorised.
- [x] **[Done]** 194. Retry eligible failed jobs safely.
- [ ] **[Learn]** 195. Escalate repeated automation failures.
- [ ] **[Learn]** 196. Review automated actions against business rules.
- [x] **[Done]** 197. Verify idempotency for retryable operations.
- [ ] **[Learn]** 198. Test operational recovery procedures.
- [ ] **[Learn]** 199. Review automation false positives and missed exceptions.
- [ ] **[Learn]** 200. Submit high-risk policy changes to Super Admin.
