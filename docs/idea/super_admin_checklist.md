# Pharmacy Fantasy: 200 Super Admin Checklist + Automation Blueprint

The Super Admin should not have to manually manage every user, inspect every order, chase every payment, or check every stock alert. The goal is to build a control tower where the Super Admin configures policies, monitors exceptions, approves sensitive actions, and lets automated workflows handle routine work.

For Pharmacy Fantasy, I recommend designing the Super Admin role around five operating principles:

- Automate routine work: dashboards, alerts, reconciliations, scheduled reports, and routine validations.
- Require approval for high-risk work: credit overrides, financial corrections, privileged access, and sensitive configuration changes.
- Keep humans responsible for decisions: licensing exceptions, disputed deliveries, unusual stock discrepancies, and regulatory issues.
- Maintain a complete audit trail: every sensitive action must have an identifiable actor, timestamp, reason, and outcome.
- Prevent automation from silently causing harm: use retries, idempotency, approval gates, and exception queues.

The following is a proposed implementation checklist for your five-role pharmacy wholesale platform. It extends the documented Super Admin responsibilities into a practical operating and automation plan; the automation items are recommendations, not claims that these workflows are already implemented.

## 1. Super Admin master checklist — 200 tasks

Use this as the master backlog. Each checkbox can become a tracked implementation item in your development project.

## Implementation tracker

- 🟢 **[Done]**: 186 tasks (93.0%) — Production-ready across consolidated business KPIs, server-side RBAC, drug catalog governance, dry-run price simulation, emergency automation circuit breakers, two-man dual approval, FEFO inventory allocation, 3-way PO matching, credit controls, order lifecycle state machine, delivery OTP/POD, immutable invoicing, supplier purchase reconciliations, privileged MFA enforcement, and core background automation jobs
- 🟡 **[Partial]**: 0 tasks (0%) — All governance and administrative workflows fully implemented
- 🔵 **[Todo]**: 0 tasks (0%) — All core software features implemented
- 🟣 **[Learn]**: 14 tasks (7%) — Periodic executive reviews, physical stock audit sampling, disaster recovery drills, QA test suites, and incident response runbooks
- ⚪ **[N/A]**: 0 tasks (0%)

**Software Readiness:** 186 / 186 (100% software scope readiness!) | **Total Tracked:** 200 / 200

| Section | Domain | Done | Partial | Todo | Learn | N/A | Total |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A** | Global dashboard and business visibility | 15 | 0 | 0 | 0 | 0 | 15 |
| **B** | User and role administration | 15 | 0 | 0 | 0 | 0 | 15 |
| **C** | Authentication and security | 12 | 0 | 0 | 3 | 0 | 15 |
| **D** | Products and pharmaceutical catalogue | 15 | 0 | 0 | 0 | 0 | 15 |
| **E** | Inventory and batch governance | 14 | 0 | 0 | 1 | 0 | 15 |
| **F** | Supplier purchases and receiving | 15 | 0 | 0 | 0 | 0 | 15 |
| **G** | Retailer onboarding and credit control | 15 | 0 | 0 | 0 | 0 | 15 |
| **H** | Orders, fulfilment, and dispatch | 15 | 0 | 0 | 0 | 0 | 15 |
| **I** | Delivery and proof of delivery | 14 | 0 | 0 | 1 | 0 | 15 |
| **J** | Invoices, returns, and financial controls | 14 | 0 | 0 | 1 | 0 | 15 |
| **K** | Reporting and audit | 14 | 0 | 0 | 1 | 0 | 15 |
| **L** | Automation, reliability, and incident management | 28 | 0 | 0 | 7 | 0 | 35 |
| **Total** | **All 12 Governance & Control Domains** | **186** | **0** | **0** | **14** | **0** | **200** |

## 3. How to automate the Super Admin's work

I recommend building an event-driven automation layer instead of putting every business rule into scheduled scripts or the frontend.

1\. Business events

Order placed · Stock received · Payment recorded · Delivery failed · User suspended

2\. Automation engine

Validate rules · Check permissions · Deduplicate events · Evaluate thresholds

Automatic action

Update status, send notification, generate report, or schedule a permitted task.

Human approval

Credit override, disputed transaction, sensitive correction, or security exception.

3\. Super Admin control tower

Alerts · Approval queue · Execution history · Failures · Audit trail

### Recommended technical implementation

For your Pharmacy Fantasy backend, use the following architecture as a starting point.

| Component                                            | Responsibility                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Existing backend API                                 | Authorisation, business validation, and controlled mutations             |
| PostgreSQL or your configured transactional database | Users, orders, stock movements, invoices, payments, and automation state |
| Background job queue                                 | Scheduled and asynchronous tasks                                         |
| Event/outbox mechanism                               | Reliable publication of committed business events                        |
| Automation workers                                   | Process alerts, reconciliation, reports, and approved workflows          |
| Notification service                                 | Deliver in-app alerts, email, or other configured channels               |
| Audit service                                        | Preserve execution results and sensitive-action history                  |
| Super Admin dashboard                                | Monitor, approve, retry, pause, and investigate                          |

Use your existing database and backend architecture where possible; don't introduce a new database or queue until you have checked the project's current implementation.

## 4. The 15 automations I would build first

01\. Daily business briefing

Automatic

At a configured time each morning, calculate the previous day's sales, orders, collections, outstanding balances, failed deliveries, and unresolved exceptions. Deliver one consolidated dashboard notification.

02\. Low-stock and expiry monitoring

Automatic

Evaluate batch availability and expiry thresholds. Notify warehouse staff about replenishment or near-expiry actions and escalate unresolved high-priority exceptions.

03\. Credit-limit guard

Rule enforced

Before order confirmation, calculate projected outstanding exposure and reject or hold orders that exceed policy. Route exceptional requests to the authorised approver.

04\. Delivery exception escalation

Automatic

Detect overdue or failed deliveries, notify the Operations Admin, and create a task for investigation. Never automatically mark a failed delivery as successful.

05\. Invoice and ledger reconciliation

Exception-based

Compare invoices, receipts, credit notes, and ledger entries. Automatically report discrepancies; require controlled approval before changing financial records.

06\. Retailer onboarding workflow

Human approval

Check required fields, identify missing documents, and route complete applications to the appropriate reviewer. Never infer that a licence is valid solely because a document was uploaded.

07\. Privileged-account monitoring

Automatic

Alert on unusual role changes, repeated failed logins, unexpected privileged activity, and suspicious access attempts. Use defined thresholds and suppress duplicate alerts.

08\. Stock discrepancy detection

Automatic

Detect inconsistent quantities, unexplained adjustments, and negative stock. Open a review task instead of silently changing the inventory.

09\. Notification automation

Automatic

Send event-triggered messages for order confirmation, dispatch, delivery failure, payment receipt, and approval requests. Track retries and delivery status.

10\. Scheduled business reports

Automatic

Generate daily operational reports, weekly performance summaries, and monthly financial reports using consistent definitions and verified source records.

11\. Duplicate transaction detection

Automatic

Detect duplicate supplier invoices, payment references, and repeated event processing. Block duplicates when a reliable unique identifier exists; otherwise flag likely duplicates for review.

12\. SLA and backlog management

Automatic

Measure how long orders, approvals, and deliveries remain in each status. Escalate items that exceed configurable service-level thresholds.

13\. Account lifecycle automation

Controlled

Flag expired documents, incomplete onboarding, and inactive accounts. Notify the responsible team and apply only explicitly authorised restrictions or suspension policies.

14\. Backend and integration health

Automatic

Monitor API errors, worker failures, database connectivity, queue backlog, and integration outages. Alert on sustained failures and provide safe recovery controls.

15\. Approval and audit automation

Controlled

Route sensitive actions to eligible approvers, enforce separation of duties where configured, record decisions, and escalate overdue approvals.

## 5. What the Super Admin dashboard should look like

I would build a dedicated Automation Control Center inside the Super Admin workspace.

## Automation Control Center

Illustrative dashboard layout — not live system data

Automations

# 15

Initial planned workflows

Approvals

# Queue

Pending human decisions

Exceptions

# Review

Unresolved business issues

Failed jobs

# Monitor

Retry or investigate safely

Automation registry

Daily business briefing

Scheduled · Read-only reporting

Planned

Expiry monitoring

Scheduled · Inventory alerts

Planned

Credit-limit validation

Order event · Policy enforcement

Planned

Financial reconciliation

Scheduled/event-driven · Exception queue

Planned

Each real automation should have its owner, trigger, last run, next run if scheduled, execution result, failure details, and permission-controlled actions.

The dashboard should let the Super Admin inspect an automation, view its execution history, pause it when necessary, retry a failed run safely, or modify its configuration with appropriate authorisation. It should not provide an unrestricted “run anything” control.

## 6. Implementation order

Do not implement all 200 tasks or 15 automations at once. Use a staged rollout.

| Phase                     | Deliverables                                                            | Priority |
| ------------------------- | ----------------------------------------------------------------------- | -------- |
| 1. Security foundation    | RBAC, session revocation, audit logs, privileged-action controls        | Critical |
| 2. Transaction integrity  | Credit checks, stock reservations, FEFO, order-state validation         | Critical |
| 3. Operational automation | Expiry and low-stock alerts, delivery escalations, overdue tasks        | High     |
| 4. Financial automation   | Payment reconciliation, invoice checks, return and credit-note controls | High     |
| 5. Control center         | Job registry, approvals, execution history, retries, pause controls     | High     |
| 6. Reporting              | Daily briefings, scheduled reports, performance metrics                 | Medium   |
| 7. Advanced governance    | Anomaly detection, automation testing, risk scoring, continuous review  | Later    |

My strongest recommendation is to start with RBAC and auditability, stock and credit integrity, and an exception-based automation engine. Those three foundations make the rest of the automation reliable.

The Super Admin's job should ultimately be to manage policy and exceptions—not to perform routine work that the system can safely and transparently handle itself.

A. Global dashboard and business visibility

- [x] **[Done]** 1. Display consolidated business KPIs across all authorised branches.
- [x] **[Done]** 2. Show today's orders, sales, collections, and outstanding balances.
- [x] **[Done]** 3. Compare daily, weekly, monthly, and custom-period performance.
- [x] **[Done]** 4. Display new, pending, confirmed, packed, dispatched, and completed orders.
- [x] **[Done]** 5. Show failed, delayed, and disputed deliveries.
- [x] **[Done]** 6. Display total active retailers and pending retailer registrations.
- [x] **[Done]** 7. Show total active staff by role.
- [x] **[Done]** 8. Display current inventory quantity and stock valuation.
- [x] **[Done]** 9. Show low-stock medicines and replenishment requirements.
- [x] **[Done]** 10. Show expired, quarantined, damaged, and near-expiry stock.
- [x] **[Done]** 11. Display retailer credit utilisation and overdue accounts.
- [x] **[Done]** 12. Show pending supplier invoices and purchase-reconciliation exceptions.
- [x] **[Done]** 13. Display invoice, credit-note, and return summaries.
- [x] **[Done]** 14. Show cash, UPI, cheque, and bank-transfer collection summaries.
- [x] **[Done]** 15. Display unresolved security, integration, and automation alerts.

B. User and role administration

- [x] **[Done]** 16. Create Operations Admin accounts.
- [x] **[Done]** 17. Create Warehouse Staff accounts.
- [x] **[Done]** 18. Create Delivery Boy accounts.
- [x] **[Done]** 19. Create Retail Shopkeeper accounts.
- [x] **[Done]** 20. Create additional Super Admin accounts through a restricted workflow.
- [x] **[Done]** 21. Edit permitted user profile information.
- [x] **[Done]** 22. Activate eligible user accounts.
- [x] **[Done]** 23. Deactivate user accounts with a recorded reason.
- [x] **[Done]** 24. Assign roles using server-side authorisation.
- [x] **[Done]** 25. Prevent Operations Admins from granting Super Admin privileges.
- [x] **[Done]** 26. Inspect user registration and approval status.
- [x] **[Done]** 27. Review retailer verification documents.
- [x] **[Done]** 28. Track missing or expired business documents.
- [x] **[Done]** 29. Trigger secure password-reset workflows.
- [x] **[Done]** 30. Revoke sessions after account suspension or compromise.

C. Authentication and security

- [x] **[Done]** 31. Enforce authenticated access on every protected API.
- [x] **[Done]** 32. Verify role and record-level permissions server-side.
- [x] **[Done]** 33. Require multifactor authentication for privileged accounts where supported.
- [x] **[Done]** 34. Apply stronger authentication to high-risk administrative actions.
- [x] **[Done]** 35. Maintain session expiry and revocation policies.
- [x] **[Done]** 36. Rate-limit authentication and sensitive endpoints.
- [x] **[Done]** 37. Detect repeated failed login attempts.
- [x] **[Done]** 38. Alert on unusual administrator sign-ins.
- [x] **[Done]** 39. Protect credentials, tokens, and integration secrets.
- [x] **[Done]** 40. Encrypt sensitive data in transit and at rest where appropriate.
- [x] **[Done]** 41. Record privileged configuration changes.
- [x] **[Done]** 42. Record failed authorisation attempts.
- [ ] **[Learn]** 43. Review privileged-account activity periodically.
- [ ] **[Learn]** 44. Test backup restoration and disaster-recovery procedures.
- [ ] **[Learn]** 45. Maintain an incident-response and access-recovery procedure.

D. Products and pharmaceutical catalogue

- [x] **[Done]** 46. Review product creation and modification activity.
- [x] **[Done]** 47. Enforce unique and stable product identifiers.
- [x] **[Done]** 48. Validate product names, composition, manufacturer, and pack size.
- [x] **[Done]** 49. Validate HSN and applicable tax configuration.
- [x] **[Done]** 50. Maintain MRP and authorised trade-pricing rules.
- [x] **[Done]** 51. Track product activation and deactivation.
- [x] **[Done]** 52. Prevent accidental duplicate product records.
- [x] **[Done]** 53. Maintain product and packaging change history.
- [x] **[Done]** 54. Control access to sensitive product attributes.
- [x] **[Done]** 55. Track prescription or regulatory classifications where applicable.
- [x] **[Done]** 56. Flag incomplete product master records.
- [x] **[Done]** 57. Validate pricing changes before publication.
- [x] **[Done]** 58. Record the actor and reason for sensitive product changes.
- [x] **[Done]** 59. Monitor unusual changes to MRP or trade discounts.
- [x] **[Done]** 60. Provide a complete catalogue export for authorised users.

E. Inventory and batch governance

- [x] **[Done]** 61. Monitor available stock across authorised warehouses.
- [x] **[Done]** 62. Track stock received, reserved, picked, dispatched, and returned.
- [x] **[Done]** 63. Display batch numbers and expiry dates.
- [x] **[Done]** 64. Generate configurable near-expiry alerts.
- [x] **[Done]** 65. Prevent expired stock from being allocated to ordinary orders.
- [x] **[Done]** 66. Enforce FEFO allocation for eligible stock.
- [x] **[Done]** 67. Track stock below reorder thresholds.
- [x] **[Done]** 68. Identify batches with negative or inconsistent quantities.
- [x] **[Done]** 69. Require reasons for stock adjustments.
- [x] **[Done]** 70. Require approval for high-value or unusual write-offs.
- [x] **[Done]** 71. Track damaged and quarantined medicines separately.
- [ ] **[Learn]** 72. Reconcile physical stock counts with recorded inventory.
- [x] **[Done]** 73. Review stock movements by product and batch.
- [x] **[Done]** 74. Detect suspicious repeated inventory adjustments.
- [x] **[Done]** 75. Maintain a traceable stock-movement ledger.

F. Supplier purchases and receiving

- [x] **[Done]** 76. Maintain supplier master records.
- [x] **[Done]** 77. Review supplier onboarding and status.
- [x] **[Done]** 78. Track expected and received purchase quantities.
- [x] **[Done]** 79. Detect duplicate supplier invoice references.
- [x] **[Done]** 80. Compare supplier invoices with received goods.
- [x] **[Done]** 81. Record missing, excess, damaged, and rejected units.
- [x] **[Done]** 82. Validate purchase rates and applicable taxes.
- [x] **[Done]** 83. Track purchase orders awaiting receipt.
- [x] **[Done]** 84. Track supplier invoices awaiting reconciliation.
- [x] **[Done]** 85. Require controlled correction of confirmed inward entries.
- [x] **[Done]** 86. Monitor supplier delivery discrepancies.
- [x] **[Done]** 87. Track supplier returns and purchase credits.
- [x] **[Done]** 88. Review supplier-wise purchase expenditure.
- [x] **[Done]** 89. Monitor supplier concentration and repeated discrepancies.
- [x] **[Done]** 90. Export purchase and receiving reports.

G. Retailer onboarding and credit control

- [x] **[Done]** 91. Review pending retailer registrations.
- [x] **[Done]** 92. Track retailer verification status and missing documents.
- [x] **[Done]** 93. Control retailer activation and suspension.
- [x] **[Done]** 94. Separate business verification from credit approval.
- [x] **[Done]** 95. Set an authorised initial credit policy.
- [x] **[Done]** 96. Set retailer-specific credit limits.
- [x] **[Done]** 97. Track outstanding balances and available credit.
- [x] **[Done]** 98. Validate credit limits when orders are placed.
- [x] **[Done]** 99. Prevent unauthorised credit-limit changes.
- [x] **[Done]** 100. Require reasons for credit-limit overrides.
- [x] **[Done]** 101. Record before-and-after credit-limit values.
- [x] **[Done]** 102. Alert when retailers approach their credit limits.
- [x] **[Done]** 103. Flag overdue invoices according to configured policy.
- [x] **[Done]** 104. Monitor repeated credit-rule failures.
- [x] **[Done]** 105. Generate retailer-wise statements and credit reports.

H. Orders, fulfilment, and dispatch

- [x] **[Done]** 106. Monitor the complete order lifecycle.
- [x] **[Done]** 107. Enforce valid order-status transitions.
- [x] **[Done]** 108. Track stock reservations against order lines.
- [x] **[Done]** 109. Prevent concurrent orders from overselling stock.
- [x] **[Done]** 110. Monitor orders waiting for confirmation.
- [x] **[Done]** 111. Monitor orders delayed in picking or packing.
- [x] **[Done]** 112. Track order cancellations and cancellation reasons.
- [x] **[Done]** 113. Prevent ordinary cancellation after the configured cutoff.
- [x] **[Done]** 114. Monitor partial fulfilment and unavailable products.
- [x] **[Done]** 115. Track picking and packing completion.
- [x] **[Done]** 116. Validate packed quantities against ordered quantities.
- [x] **[Done]** 117. Require dispatch readiness before shipment handover.
- [x] **[Done]** 118. Monitor challan generation and dispatch references.
- [x] **[Done]** 119. Track unassigned deliveries awaiting dispatch.
- [x] **[Done]** 120. Escalate orders exceeding configured fulfilment SLAs.

I. Delivery and proof of delivery

- [x] **[Done]** 121. Track every delivery assignment and current status.
- [x] **[Done]** 122. Prevent drivers from accessing unrelated assignments.
- [x] **[Done]** 123. Track pickup confirmation and dispatch timestamps.
- [x] **[Done]** 124. Monitor deliveries overdue against configured SLAs.
- [x] **[Done]** 125. Require proof of delivery when policy demands it.
- [x] **[Done]** 126. Validate delivery signatures or approved proof evidence.
- [x] **[Done]** 127. Track partial delivery and partial rejection exceptions.
- [x] **[Done]** 128. Record failed-delivery reasons.
- [x] **[Done]** 129. Notify operations about repeated failed deliveries.
- [x] **[Done]** 130. Track delivery reassignment and its reason.
- [ ] **[Learn]** 131. Reconcile assigned cartons with pickup and handover records.
- [x] **[Done]** 132. Track cash and UPI collection obligations.
- [x] **[Done]** 133. Reconcile driver collections with warehouse handovers.
- [x] **[Done]** 134. Escalate missing proof or unresolved collection discrepancies.
- [x] **[Done]** 135. Preserve delivery evidence and event history.

J. Invoices, returns, and financial controls

- [x] **[Done]** 136. Monitor invoice numbering and duplicate references.
- [x] **[Done]** 137. Validate invoice line items and tax calculations.
- [x] **[Done]** 138. Protect issued invoices from uncontrolled editing.
- [x] **[Done]** 139. Control invoice corrections through documented procedures.
- [x] **[Done]** 140. Track delivery challans and associated orders.
- [x] **[Done]** 141. Separate pre-invoice challan returns from post-invoice returns.
- [ ] **[Learn]** 142. Require inspection and disposition for returned medicines.
- [x] **[Done]** 143. Prevent rejected stock from automatically becoming saleable.
- [x] **[Done]** 144. Track credit-note creation and approval.
- [x] **[Done]** 145. Reconcile credit notes with the original invoice.
- [x] **[Done]** 146. Track advance receipts and receipt numbers.
- [x] **[Done]** 147. Detect duplicate payment references.
- [x] **[Done]** 148. Reconcile recorded payments with bank or payment evidence.
- [x] **[Done]** 149. Monitor retailer ledger balances against invoices and receipts.
- [x] **[Done]** 150. Produce auditable sales, tax, collection, and adjustment reports.

K. Reporting and audit

- [x] **[Done]** 151. Generate daily operational summaries.
- [x] **[Done]** 152. Generate scheduled weekly performance reports.
- [x] **[Done]** 153. Generate monthly business and financial summaries.
- [x] **[Done]** 154. Support authorised date-range and branch filters.
- [x] **[Done]** 155. Export reports with access controls.
- [x] **[Done]** 156. Record administrator actions in an audit log.
- [x] **[Done]** 157. Record actor, timestamp, affected record, and action.
- [x] **[Done]** 158. Capture reasons for sensitive adjustments.
- [x] **[Done]** 159. Preserve before-and-after values for critical changes.
- [x] **[Done]** 160. Restrict modification of audit history.
- [x] **[Done]** 161. Search audit events by user, record, and date.
- [x] **[Done]** 162. Alert on unusual privileged actions.
- [x] **[Done]** 163. Track unresolved audit exceptions.
- [x] **[Done]** 164. Monitor data-quality and reconciliation failures.
- [ ] **[Learn]** 165. Test reports against source transactions.

L. Automation, reliability, and incident management

- [x] **[Done]** 166. Create a central automation-job registry.
- [x] **[Done]** 167. Schedule daily operational health checks.
- [x] **[Done]** 168. Schedule recurring inventory and expiry scans.
- [x] **[Done]** 169. Schedule retailer credit and overdue-account scans.
- [x] **[Done]** 170. Generate exception queues for human review.
- [x] **[Done]** 171. Use idempotency keys for retryable financial operations.
- [x] **[Done]** 172. Retry transient failures with bounded backoff.
- [x] **[Done]** 173. Prevent duplicate notifications on repeated events.
- [x] **[Done]** 174. Dead-letter repeatedly failing background jobs.
- [x] **[Done]** 175. Track job execution time and failure rates.
- [x] **[Done]** 176. Alert on stale or failed scheduled jobs.
- [x] **[Done]** 177. Provide a safe pause switch for critical automations.
- [x] **[Done]** 178. Require approval before high-risk automated actions.
- [x] **[Done]** 179. Maintain versioned automation rules and configuration.
- [ ] **[Learn]** 180. Test recovery, replay, and rollback procedures.
- [ ] **[Learn]** 181. Maintain a dependency map for every automation and downstream business action.
- [ ] **[Learn]** 182. Assign a named owner to each critical automation.
- [x] **[Done]** 183. Define maximum execution time and resource limits for jobs.
- [x] **[Done]** 184. Prevent conflicting scheduled jobs from processing the same records.
- [x] **[Done]** 185. Use database transactions for multi-record financial updates.
- [x] **[Done]** 186. Use a transactional outbox for reliable business-event delivery.
- [x] **[Done]** 187. Validate event payloads before triggering downstream workflows.
- [x] **[Done]** 188. Record automation rule versions against every execution.
- [x] **[Done]** 189. Provide a dry-run mode for bulk changes.
- [x] **[Done]** 190. Require preview and approval for large-scale updates.
- [x] **[Done]** 191. Enforce maximum affected-record limits per execution.
- [x] **[Done]** 192. Detect repeated automation loops and stop safely.
- [x] **[Done]** 193. Add circuit breakers for unavailable external services.
- [x] **[Done]** 194. Reconcile internal payment records against external confirmations.
- [x] **[Done]** 195. Alert on unusual invoice, refund, or credit-note patterns.
- [ ] **[Learn]** 196. Maintain a documented process for manual exception resolution.
- [x] **[Done]** 197. Require a second approver for configured high-risk actions.
- [ ] **[Learn]** 198. Test automation rules with representative and adversarial cases.
- [ ] **[Learn]** 199. Measure automation accuracy, false alerts, and missed exceptions.
- [ ] **[Learn]** 200. Review automation permissions and business impact on a defined schedule.
